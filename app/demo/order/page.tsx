'use client'

import { useState } from 'react'
import Link from 'next/link'
import { QrCode, ArrowLeft, Loader2 } from 'lucide-react'

export default function DemoOrderPage() {
  const [loading, setLoading] = useState(false)

  const handleDemoOrder = () => {
    setLoading(true)
    // Redirect to first table's menu
    window.location.href = '/menu/demo-table-1'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-10 h-10 text-primary-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Demo Ordering</h1>
          <p className="text-gray-600 mb-6">
            Experience the customer ordering flow with a sample table QR code.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">Demo Table</p>
            <p className="font-bold text-gray-900">Table T01</p>
            <p className="text-sm text-gray-500">4 People Capacity</p>
          </div>

          <button
            onClick={handleDemoOrder}
            disabled={loading}
            className="w-full py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              'Start Demo Order'
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4">
            This will redirect you to the menu page for Table T01
          </p>
        </div>
      </div>
    </div>
  )
}
