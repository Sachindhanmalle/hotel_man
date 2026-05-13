'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ShoppingCart, Plus, Minus, ArrowLeft, Check, Clock, CreditCard, Star } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string | null
  isAvailable: boolean
  isVeg: boolean
  preparationTime: number
}

interface CartItem extends MenuItem {
  quantity: number
}

interface Table {
  id: string
  tableNumber: string
  restaurant: {
    id: string
    name: string
    menuItems: MenuItem[]
  }
}

interface Recommendation {
  id: string
  name: string
  price: number
  isVeg: boolean
  confidence: number
}

export default function MenuPage() {
  const params = useParams()
  const tableId = params.tableId as string

  const [table, setTable] = useState<Table | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [showCart, setShowCart] = useState(false)
  const [orderStatus, setOrderStatus] = useState<'idle' | 'placing' | 'success'>('idle')
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<{[key: string]: Recommendation[]}>({})

  useEffect(() => {
    fetchTableData()
  }, [tableId])

  const fetchTableData = async () => {
    try {
      const response = await fetch(`/api/tables/${tableId}`)
      if (response.ok) {
        const data = await response.json()
        setTable(data)
      }
    } catch (error) {
      console.error('Error fetching table:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendations = async (itemId: string) => {
    if (recommendations[itemId]) return
    
    try {
      const response = await fetch(`/api/recommendations?itemId=${itemId}&restaurantId=${table?.restaurant.id}`)
      if (response.ok) {
        const data = await response.json()
        setRecommendations(prev => ({ ...prev, [itemId]: data.recommendations }))
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
  }

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    fetchRecommendations(item.id)
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId)
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i)
      }
      return prev.filter(i => i.id !== itemId)
    })
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const categories = table?.restaurant.menuItems 
    ? ['ALL', ...Array.from(new Set(table.restaurant.menuItems.map(item => item.category)))]
    : ['ALL']

  const filteredItems = selectedCategory === 'ALL'
    ? table?.restaurant.menuItems.filter(item => item.isAvailable)
    : table?.restaurant.menuItems.filter(item => item.category === selectedCategory && item.isAvailable)

  const placeOrder = async () => {
    if (cart.length === 0) return

    setOrderStatus('placing')

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: table?.id,
          restaurantId: table?.restaurant.id,
          items: cart.map(item => ({ menuItemId: item.id, quantity: item.quantity })),
        })
      })

      if (response.ok) {
        const order = await response.json()
        setCurrentOrder(order)
        setOrderStatus('success')
        setCart([])
      }
    } catch (error) {
      console.error('Error placing order:', error)
      setOrderStatus('idle')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (orderStatus === 'success' && currentOrder) {
    return <OrderSuccess order={currentOrder} tableNumber={table?.tableNumber || ''} />
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{table?.restaurant.name}</h1>
              <p className="text-sm text-gray-500">Table {table?.tableNumber}</p>
            </div>
            <button 
              onClick={() => setShowCart(true)}
              className="relative p-2 bg-primary-100 rounded-lg"
            >
              <ShoppingCart className="w-6 h-6 text-primary-600" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {CATEGORIES[category as keyof typeof CATEGORIES]?.label || category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid gap-4">
          {filteredItems?.map(item => (
            <MenuItemCard 
              key={item.id} 
              item={item} 
              cartItem={cart.find(c => c.id === item.id)}
              onAdd={() => addToCart(item)}
              onRemove={() => removeFromCart(item.id)}
              recommendations={recommendations[item.id] || []}
              onAddRecommended={(rec) => {
                const menuItem = table?.restaurant.menuItems.find(m => m.id === rec.id)
                if (menuItem) addToCart(menuItem)
              }}
            />
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <CartSidebar
          cart={cart}
          onClose={() => setShowCart(false)}
          onAdd={addToCart}
          onRemove={removeFromCart}
          total={cartTotal}
          onPlaceOrder={placeOrder}
          isPlacing={orderStatus === 'placing'}
        />
      )}

      {/* Bottom Bar */}
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">{cartCount} items</p>
              <p className="text-xl font-bold text-gray-900">{formatPrice(cartTotal)}</p>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
            >
              View Cart
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItemCard({ 
  item, 
  cartItem, 
  onAdd, 
  onRemove,
  recommendations,
  onAddRecommended
}: { 
  item: MenuItem
  cartItem?: CartItem
  onAdd: () => void
  onRemove: () => void
  recommendations: Recommendation[]
  onAddRecommended: (rec: Recommendation) => void
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-3xl">{item.isVeg ? '🟢' : '🔴'}</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{item.preparationTime} min</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">{formatPrice(item.price)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Frequently bought together:</p>
            <div className="flex gap-2 flex-wrap">
              {recommendations.map(rec => (
                <button
                  key={rec.id}
                  onClick={() => onAddRecommended(rec)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full hover:bg-green-100"
                >
                  <Plus className="w-3 h-3" />
                  {rec.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        {cartItem ? (
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-1">
            <button 
              onClick={onRemove}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-semibold">{cartItem.quantity}</span>
            <button 
              onClick={onAdd}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onAdd}
            className="w-full py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  )
}

function CartSidebar({
  cart,
  onClose,
  onAdd,
  onRemove,
  total,
  onPlaceOrder,
  isPlacing
}: {
  cart: CartItem[]
  onClose: () => void
  onAdd: (item: MenuItem) => void
  onRemove: (itemId: string) => void
  total: number
  onPlaceOrder: () => void
  isPlacing: boolean
}) {
  const [showPayment, setShowPayment] = useState(false)
  const [upiId, setUpiId] = useState('')

  const handlePayment = async () => {
    // Simulate UPI payment
    await new Promise(resolve => setTimeout(resolve, 1500))
    onPlaceOrder()
  }

  if (showPayment) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
        <div className="w-full max-w-md bg-white h-full p-6">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => setShowPayment(false)}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold">Payment</h2>
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-500">Total Amount</p>
            <p className="text-3xl font-bold">{formatPrice(total)}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="input"
              />
            </div>

            <button
              onClick={handlePayment}
              disabled={!upiId || isPlacing}
              className="w-full py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPlacing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay with UPI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full overflow-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Your cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button 
                    onClick={() => onAdd(item)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-semibold w-20 text-right">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            <div className="flex justify-between text-lg">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrice(total)}</span>
            </div>
            <button
              onClick={() => setShowPayment(true)}
              className="w-full py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700"
            >
              Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderSuccess({ order, tableNumber }: { order: any; tableNumber: string }) {
  const [status, setStatus] = useState(order.status)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  useEffect(() => {
    // Poll for order status updates
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders?id=${order.id}`)
        if (response.ok) {
          const orders = await response.json()
          if (orders[0]) {
            setStatus(orders[0].status)
          }
        }
      } catch (error) {
        console.error('Error polling order:', error)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [order.id])

  const submitFeedback = async () => {
    if (rating === 0) return

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          restaurantId: order.restaurantId,
          rating,
          review
        })
      })
      setFeedbackSubmitted(true)
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  const getStatusStep = (status: string) => {
    const steps = ['RECEIVED', 'PREPARING', 'READY', 'DELIVERED']
    return steps.indexOf(status)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-600 mb-6">
          Table {tableNumber} • Order #{order.id.slice(-6)}
        </p>

        {/* Order Status */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {['Received', 'Preparing', 'Ready', 'Delivered'].map((step, idx) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full mb-1 ${
                  idx <= getStatusStep(status) ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span className={`text-xs ${
                  idx <= getStatusStep(status) ? 'text-green-600 font-medium' : 'text-gray-400'
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 rounded-full">
            <div 
              className="h-1 bg-green-500 rounded-full transition-all"
              style={{ width: `${(getStatusStep(status) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="space-y-2">
            {order.orderItems.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.menuItem.name}</span>
                <span>₹{item.subtotal}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Feedback */}
        {!feedbackSubmitted ? (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold mb-4">How was your experience?</h3>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your feedback (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm mb-4"
              rows={3}
            />
            <button
              onClick={submitFeedback}
              disabled={rating === 0}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              Submit Feedback
            </button>
          </div>
        ) : (
          <div className="border-t border-gray-200 pt-6">
            <p className="text-green-600 font-medium">Thank you for your feedback!</p>
          </div>
        )}
      </div>
    </div>
  )
}
