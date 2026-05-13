import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, paymentStatus } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: true
          }
        },
        restaurant: true
      }
    })

    // Create notifications based on status change
    if (status === 'READY') {
      await prisma.notification.create({
        data: {
          restaurantId: order.restaurantId,
          type: 'ORDER_READY',
          title: 'Order Ready',
          message: `Table ${order.table.tableNumber} order is ready for delivery`,
        }
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
