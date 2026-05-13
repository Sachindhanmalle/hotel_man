import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const table = await prisma.table.findUnique({
      where: { id: params.id },
      include: {
        restaurant: {
          include: {
            menuItems: {
              where: { isAvailable: true },
              orderBy: { category: 'asc' }
            }
          }
        }
      }
    })

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    return NextResponse.json(table)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch table' }, { status: 500 })
  }
}
