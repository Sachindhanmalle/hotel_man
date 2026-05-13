import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, method, upiId, amount } = body

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        method,
        upiId,
        amount,
        status: 'COMPLETED',
        paidAt: new Date(),
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      }
    })

    // Update order payment status
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'COMPLETED' }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}
