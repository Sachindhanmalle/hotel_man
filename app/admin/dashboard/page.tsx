'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Utensils, 
  Table, 
  ShoppingCart, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  LogOut,
  Bell,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Download
} from 'lucide-react'
import { formatPrice, formatDate, formatRelativeTime } from '@/lib/utils'
import { ORDER_STATUS, PAYMENT_STATUS } from '@/lib/constants'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#eab308', '#ef4444']

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [restaurant, setRestaurant] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [feedback, setFeedback] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // For demo, using first restaurant
  const RESTAURANT_ID = 'demo-restaurant-id'

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [ordersRes, menuRes, analyticsRes, feedbackRes] = await Promise.all([
        fetch('/api/orders?restaurantId=' + RESTAURANT_ID),
        fetch('/api/restaurants/' + RESTAURANT_ID),
        fetch('/api/analytics?restaurantId=' + RESTAURANT_ID),
        fetch('/api/feedback?restaurantId=' + RESTAURANT_ID)
      ])

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }

      if (menuRes.ok) {
        const restaurantData = await menuRes.json()
        setRestaurant(restaurantData)
        setMenuItems(restaurantData.menuItems || [])
        setTables(restaurantData.tables || [])
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData)
      }

      if (feedbackRes.ok) {
        const feedbackData = await feedbackRes.json()
        setFeedback(feedbackData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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

  const logout = () => {
    router.push('/admin/login')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab analytics={analytics} orders={orders} feedback={feedback} />
      case 'orders':
        return <OrdersTab orders={orders} onUpdateStatus={updateOrderStatus} />
      case 'menu':
        return <MenuTab menuItems={menuItems} restaurantId={RESTAURANT_ID} onUpdate={fetchDashboardData} />
      case 'tables':
        return <TablesTab tables={tables} />
      case 'analytics':
        return <AnalyticsTab analytics={analytics} />
      case 'feedback':
        return <FeedbackTab feedback={feedback} />
      default:
        return <DashboardTab analytics={analytics} orders={orders} feedback={feedback} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">SmartDine</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="px-4 pb-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: orders.filter(o => o.status === 'RECEIVED').length },
            { id: 'menu', label: 'Menu Items', icon: Utensils },
            { id: 'tables', label: 'Tables', icon: Table },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'feedback', label: 'Feedback', icon: MessageSquare },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                activeTab === item.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="border-t border-gray-200 my-4"></div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <p className="text-sm text-gray-500">{restaurant?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-semibold">A</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Manager</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

function DashboardTab({ analytics, orders, feedback }: { analytics: any, orders: any[], feedback: any }) {
  const stats = [
    { 
      label: 'Total Sales', 
      value: formatPrice(analytics?.summary?.totalSales || 0), 
      change: '+12%', 
      icon: DollarSign,
      color: 'bg-green-100 text-green-600'
    },
    { 
      label: 'Total Orders', 
      value: analytics?.summary?.totalOrders || 0, 
      change: '+8%', 
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      label: 'Avg Order Value', 
      value: formatPrice(analytics?.summary?.avgOrderValue || 0), 
      change: '+5%', 
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-600'
    },
    { 
      label: 'Customer Rating', 
      value: feedback?.stats?.averageRating || '0.0', 
      change: '+0.3', 
      icon: Users,
      color: 'bg-purple-100 text-purple-600'
    },
  ]

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">Sales Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.dailySales?.slice(-7) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatPrice(value as number)} />
                <Bar dataKey="sales" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <Link href="/admin/dashboard?tab=orders" className="text-primary-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Table {order.table.tableNumber}</p>
                  <p className="text-sm text-gray-500">{order.orderItems.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.color || 'bg-gray-100'
                  }`}>
                    {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label || order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {analytics?.insights && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-lg">AI</span>
            </div>
            <h3 className="font-bold text-gray-900">Smart Insights</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {analytics.insights.map((insight: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-600 mt-0.5">💡</span>
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OrdersTab({ orders, onUpdateStatus }: { orders: any[], onUpdateStatus: (id: string, status: string) => void }) {
  const [filter, setFilter] = useState('ALL')

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === filter)

  const statusOptions = ['RECEIVED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'ALL' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          All Orders
        </button>
        {statusOptions.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === status ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {ORDER_STATUS[status as keyof typeof ORDER_STATUS]?.label || status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Table</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="px-4 py-3 text-sm font-medium">#{order.id.slice(-6)}</td>
                  <td className="px-4 py-3 text-sm">{order.table.tableNumber}</td>
                  <td className="px-4 py-3 text-sm">{order.orderItems.length} items</td>
                  <td className="px-4 py-3 text-sm font-semibold">{formatPrice(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.color
                    }`}>
                      {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatRelativeTime(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {ORDER_STATUS[status as keyof typeof ORDER_STATUS]?.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MenuTab({ menuItems, restaurantId, onUpdate }: { menuItems: any[], restaurantId: string, onUpdate: () => void }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search menu items..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map(item => (
          <div key={item.id} className="card group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.isVeg ? '🟢' : '🔴'}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <button 
                onClick={() => setEditingItem(item)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-primary-600">{formatPrice(item.price)}</span>
              <span className="text-sm text-gray-500">{item.preparationTime} min</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TablesTab({ tables }: { tables: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-900">Table Management</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-4 h-4" />
          Add Table
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {tables.map(table => (
          <div key={table.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-primary-700">{table.tableNumber}</span>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                table.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {table.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Table {table.tableNumber}</h3>
            <p className="text-sm text-gray-500 mb-3">Capacity: {table.capacity} people</p>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">QR Code</p>
              <p className="text-xs font-mono truncate">{table.qrCode}</p>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50">
                Print QR
              </button>
              <button className="flex-1 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsTab({ analytics }: { analytics: any }) {
  if (!analytics) return <div className="text-center py-8">Loading analytics...</div>

  const paymentData = Object.entries(analytics.paymentMethods || {}).map(([method, data]: [string, any]) => ({
    name: method,
    value: data.count
  }))

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">Daily Sales Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.dailySales || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatPrice(value as number)} />
                <Line type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">Payment Methods</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {paymentData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Items & Peak Hours */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">Top Selling Items</h3>
          <div className="space-y-3">
            {(analytics.popularItems || []).slice(0, 5).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.quantity} orders</p>
                  <p className="text-sm text-gray-500">{formatPrice(item.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">Peak Ordering Hours</h3>
          <div className="space-y-3">
            {(analytics.peakHours || []).map((hour: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-12 text-sm font-medium">
                  {hour.hour < 12 ? `${hour.hour} AM` : `${hour.hour - 12 || 12} PM`}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div 
                    className="bg-primary-500 h-full rounded-full transition-all"
                    style={{ width: `${(hour.count / (analytics.peakHours[0]?.count || 1)) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-sm text-gray-600">{hour.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Predictions */}
      {analytics.predictions && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">AI</span>
            </div>
            <h3 className="font-bold text-gray-900">Sales Forecasting</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {analytics.predictions.map((prediction: any, idx: number) => (
              <div key={idx} className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">{prediction.label}</p>
                <p className="text-2xl font-bold text-gray-900">{prediction.value}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-blue-600">{prediction.confidence}% confidence</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{prediction.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FeedbackTab({ feedback }: { feedback: any }) {
  if (!feedback) return <div className="text-center py-8">Loading feedback...</div>

  const sentimentData = [
    { name: 'Positive', value: feedback.stats.positive, color: '#22c55e' },
    { name: 'Neutral', value: feedback.stats.neutral, color: '#eab308' },
    { name: 'Negative', value: feedback.stats.negative, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm text-gray-500">Average Rating</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-gray-900">{feedback.stats.averageRating}</span>
            <span className="text-yellow-500">★</span>
          </div>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Reviews</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{feedback.stats.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Positive %</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{feedback.stats.positivePercentage}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Negative %</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{feedback.stats.negativePercentage}%</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sentiment Chart */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">Sentiment Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {sentimentData.map(entry => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">Recent Reviews</h3>
          <div className="space-y-4 max-h-80 overflow-auto">
            {feedback.feedbacks.slice(0, 10).map((item: any) => (
              <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">{'★'.repeat(item.rating)}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      item.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-700' :
                      item.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{formatRelativeTime(item.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700">{item.review || 'No written review'}</p>
                <p className="text-xs text-gray-500 mt-1">Table {item.order.table.tableNumber}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
