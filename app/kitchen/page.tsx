'use client'

import { useState, useEffect } from 'react'
import { ChefHat, Clock, CheckCircle, AlertCircle, ArrowRight, Volume2 } from 'lucide-react'
import { formatRelativeTime, formatPrice } from '@/lib/utils'
import { ORDER_STATUS } from '@/lib/constants'

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'pending' | 'preparing' | 'ready'>('pending')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastOrderCount, setLastOrderCount] = useState(0)

  // For demo, using first restaurant
  const RESTAURANT_ID = 'demo-restaurant-id'

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Play sound when new orders arrive
    const pendingCount = orders.filter(o => o.status === 'RECEIVED').length
    if (soundEnabled && pendingCount > lastOrderCount && lastOrderCount > 0) {
      playNotificationSound()
    }
    setLastOrderCount(pendingCount)
  }, [orders, soundEnabled])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?restaurantId=${RESTAURANT_ID}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status } : o
        ))
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const pendingOrders = orders.filter(o => o.status === 'RECEIVED')
  const preparingOrders = orders.filter(o => o.status === 'PREPARING')
  const readyOrders = orders.filter(o => o.status === 'READY')

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'pending': return pendingOrders
      case 'preparing': return preparingOrders
      case 'ready': return readyOrders
      default: return pendingOrders
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <ChefHat className="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Kitchen Dashboard</h1>
              <p className="text-sm text-gray-500">SmartDine Restaurant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg ${soundEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-gray-200 px-6 py-3">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">
                {pendingOrders.length} New Orders
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="text-sm font-medium text-gray-700">
                {preparingOrders.length} Preparing
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-sm font-medium text-gray-700">
                {readyOrders.length} Ready
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 px-6">
          <div className="flex gap-1">
            {[
              { id: 'pending', label: 'New Orders', count: pendingOrders.length, color: 'bg-red-100 text-red-700 border-red-200' },
              { id: 'preparing', label: 'Preparing', count: preparingOrders.length, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
              { id: 'ready', label: 'Ready', count: readyOrders.length, color: 'bg-green-100 text-green-700 border-green-200' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? `border-orange-500 ${tab.color}`
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${tab.color}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Orders Grid */}
      <main className="p-6">
        {getFilteredOrders().length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders in this section</h3>
            <p className="text-gray-500">Orders will appear here when they arrive</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredOrders().map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateStatus={updateOrderStatus}
                activeTab={activeTab}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function OrderCard({ 
  order, 
  onUpdateStatus,
  activeTab
}: { 
  order: any
  onUpdateStatus: (id: string, status: string) => void
  activeTab: string
}) {
  const totalItems = order.orderItems.reduce((acc: number, item: any) => acc + item.quantity, 0)
  
  const getActionButton = () => {
    switch (activeTab) {
      case 'pending':
        return (
          <button
            onClick={() => onUpdateStatus(order.id, 'PREPARING')}
            className="w-full py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5" />
            Start Preparing
          </button>
        )
      case 'preparing':
        return (
          <button
            onClick={() => onUpdateStatus(order.id, 'READY')}
            className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Mark Ready
          </button>
        )
      case 'ready':
        return (
          <button
            onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            Mark Delivered
          </button>
        )
    }
  }

  const getTimeColor = () => {
    const minutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60))
    if (minutes < 5) return 'text-green-600'
    if (minutes < 15) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMinutesElapsed = () => {
    return Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60))
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-primary-700">{order.table.tableNumber}</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Table {order.table.tableNumber}</h3>
              <p className={`text-sm font-medium ${getTimeColor()}`}>
                {getMinutesElapsed()} min ago
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
            <p className="text-sm text-gray-500">{totalItems} items</p>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-2 mb-4">
          {order.orderItems.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                  {item.quantity}
                </span>
                <span className="text-gray-900">{item.menuItem.name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {item.menuItem.preparationTime} min
              </span>
            </div>
          ))}
        </div>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Special Instructions:</p>
                <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {getActionButton()}
      </div>
    </div>
  )
}
