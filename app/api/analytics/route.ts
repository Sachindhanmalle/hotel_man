import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 })
    }

    const endDate = new Date()
    const startDate = subDays(endDate, days)

    // Get orders for the period
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: { not: 'CANCELLED' }
      },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        },
        payment: true
      }
    })

    // Calculate daily sales
    const dailySales = []
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(endDate, i)
      const dayOrders = orders.filter(o => 
        new Date(o.createdAt).toDateString() === date.toDateString()
      )
      
      dailySales.push({
        date: format(date, 'MMM dd'),
        sales: dayOrders.reduce((acc, o) => acc + o.totalAmount, 0),
        orders: dayOrders.length
      })
    }

    // Calculate total stats
    const totalSales = orders.reduce((acc, o) => acc + o.totalAmount, 0)
    const totalOrders = orders.length
    const avgOrderValue = totalOrders ? totalSales / totalOrders : 0

    // Get popular items
    const itemSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {}
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (!itemSales[item.menuItemId]) {
          itemSales[item.menuItemId] = {
            name: item.menuItem.name,
            quantity: 0,
            revenue: 0
          }
        }
        itemSales[item.menuItemId].quantity += item.quantity
        itemSales[item.menuItemId].revenue += item.subtotal
      })
    })

    const popularItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    // Calculate peak hours
    const hourlyOrders: { [key: number]: number } = {}
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours()
      hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1
    })

    const peakHours = Object.entries(hourlyOrders)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Payment method stats
    const paymentMethods: { [key: string]: { count: number; amount: number } } = {}
    orders.forEach(order => {
      const method = order.payment?.method || 'CASH'
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, amount: 0 }
      }
      paymentMethods[method].count += 1
      paymentMethods[method].amount += order.totalAmount
    })

    // Generate AI insights
    const insights = generateInsights(orders, dailySales, popularItems, peakHours)

    // Sales predictions (simple moving average)
    const predictions = generatePredictions(dailySales, popularItems)

    return NextResponse.json({
      summary: {
        totalSales,
        totalOrders,
        avgOrderValue,
        conversionRate: 100 // Since all created orders are counted
      },
      dailySales,
      popularItems,
      peakHours,
      paymentMethods,
      insights,
      predictions
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

function generateInsights(orders: any[], dailySales: any[], popularItems: any[], peakHours: any[]) {
  const insights = []

  // Sales trend
  if (dailySales.length >= 7) {
    const lastWeek = dailySales.slice(-7).reduce((a, b) => a + b.sales, 0)
    const prevWeek = dailySales.slice(-14, -7).reduce((a, b) => a + b.sales, 0)
    
    if (lastWeek > prevWeek * 1.1) {
      insights.push(`📈 Sales increased by ${Math.round(((lastWeek - prevWeek) / prevWeek) * 100)}% compared to last week`)
    } else if (lastWeek < prevWeek * 0.9) {
      insights.push(`📉 Sales decreased by ${Math.round(((prevWeek - lastWeek) / prevWeek) * 100)}% compared to last week`)
    }
  }

  // Popular item insight
  if (popularItems.length > 0) {
    insights.push(`🍽️ ${popularItems[0].name} is your best seller with ${popularItems[0].quantity} orders`)
  }

  // Peak hour insight
  if (peakHours.length > 0) {
    const peakHour = peakHours[0].hour
    const timeLabel = peakHour < 12 ? `${peakHour} AM` : `${peakHour - 12 || 12} PM`
    insights.push(`⏰ Peak ordering time is around ${timeLabel} with ${peakHours[0].count} orders`)
  }

  // Weekend insight
  const weekendOrders = orders.filter(o => {
    const day = new Date(o.createdAt).getDay()
    return day === 0 || day === 6
  }).length
  const weekdayOrders = orders.length - weekendOrders
  
  if (weekendOrders > weekdayOrders / 5 * 2) {
    insights.push(`🎉 Weekend sales are ${Math.round((weekendOrders / (weekdayOrders / 5 * 2)) * 100)}% higher than weekdays`)
  }

  // Average order value insight
  const avgOrderValue = orders.reduce((a, b) => a + b.totalAmount, 0) / orders.length
  if (avgOrderValue > 500) {
    insights.push(`💰 High average order value of ₹${Math.round(avgOrderValue)} indicates good upselling`)
  }

  return insights
}

function generatePredictions(dailySales: any[], popularItems: any[]) {
  const predictions = []
  
  // Simple moving average for tomorrow's prediction
  if (dailySales.length >= 3) {
    const last3Days = dailySales.slice(-3)
    const avgSales = last3Days.reduce((a, b) => a + b.sales, 0) / 3
    predictions.push({
      type: 'DAILY_SALES',
      label: "Tomorrow's Expected Sales",
      value: `₹${Math.round(avgSales)}`,
      confidence: 75,
      description: 'Based on last 3 days average'
    })
  }

  // Weekend prediction
  const today = new Date().getDay()
  if (today === 5 || today === 6) {
    predictions.push({
      type: 'WEEKEND_RUSH',
      label: 'Weekend Rush Expected',
      value: '+40% orders',
      confidence: 85,
      description: 'Prepare extra staff for high demand'
    })
  }

  // Item demand prediction
  if (popularItems.length > 0) {
    predictions.push({
      type: 'ITEM_DEMAND',
      label: `${popularItems[0].name} Demand`,
      value: `${Math.round(popularItems[0].quantity * 1.2)} orders`,
      confidence: 80,
      description: 'Ensure sufficient ingredients'
    })
  }

  return predictions
}
