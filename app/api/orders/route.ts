import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const status = searchParams.get('status')
    const tableId = searchParams.get('tableId')

    const where: any = {}
    if (restaurantId) where.restaurantId = restaurantId
    if (status) where.status = status
    if (tableId) where.tableId = tableId

    const orders = await prisma.order.findMany({
      where,
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: true
          }
        },
        payment: true,
        feedback: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tableId, restaurantId, items, specialInstructions } = body

    // Calculate totals
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      })
      
      if (!menuItem || !menuItem.isAvailable) {
        return NextResponse.json(
          { error: `Item ${item.menuItemId} not found or unavailable` },
          { status: 400 }
        )
      }

      const subtotal = menuItem.price * item.quantity
      totalAmount += subtotal

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        subtotal
      })
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        tableId,
        restaurantId,
        totalAmount,
        status: 'RECEIVED',
        paymentStatus: 'PENDING',
        specialInstructions,
        orderItems: {
          create: orderItems
        }
      },
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    })

    // Create notification for kitchen
    await prisma.notification.create({
      data: {
        restaurantId,
        type: 'NEW_ORDER',
        title: 'New Order Received',
        message: `Table ${order.table.tableNumber} - ₹${totalAmount}`,
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
