import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      include: {
        tables: {
          orderBy: { tableNumber: 'asc' }
        },
        menuItems: {
          orderBy: { category: 'asc' }
        },
      }
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch restaurant' }, { status: 500 })
  }
}
