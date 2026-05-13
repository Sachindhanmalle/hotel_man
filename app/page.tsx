import Link from 'next/link'
import { Utensils, QrCode, BarChart3, ChefHat, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SmartDine AI</span>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/admin/login" 
              className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              Admin Login
            </Link>
            <Link 
              href="/kitchen" 
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Kitchen Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Restaurant
            <span className="text-primary-600"> Management System</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transform your restaurant with QR code ordering, real-time analytics, 
            AI-powered insights, and seamless kitchen management.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/demo/order" 
              className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 flex items-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              Try Demo Order
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/admin/login" 
              className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-xl font-semibold hover:bg-primary-50 flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <QrCode className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">QR Code Ordering</h3>
            <p className="text-gray-600">
              Customers scan table QR codes to browse menus, place orders, and pay via UPI seamlessly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI Analytics</h3>
            <p className="text-gray-600">
              Get intelligent insights on sales trends, popular items, peak hours, and customer preferences.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <ChefHat className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Kitchen Dashboard</h3>
            <p className="text-gray-600">
              Real-time order queue for kitchen staff with status updates and preparation tracking.
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Experience the System</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Journey</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    Scan QR code on table
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Browse digital menu with images
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Add items to cart with smart recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    Pay securely via UPI
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                    Track order status in real-time
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Admin Features</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Live order management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Menu item CRUD operations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Table management with QR codes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Sales reports & analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Customer feedback & sentiment
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-8 py-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Default login: admin@smartdine.com / admin123
            </p>
            <Link 
              href="/admin/login"
              className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
