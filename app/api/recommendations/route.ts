import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    const restaurantId = searchParams.get('restaurantId')

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    // Get recommendations for the item
    const recommendations = await prisma.recommendation.findMany({
      where: { baseItemId: itemId },
      orderBy: { confidence: 'desc' },
      take: 3
    })

    // Get full menu item details
    const recommendedItems = await Promise.all(
      recommendations.map(async (rec) => {
        const item = await prisma.menuItem.findUnique({
          where: { id: rec.recommendedItemId }
        })
        return item ? { ...item, confidence: rec.confidence } : null
      })
    )

    // Filter out nulls and unavailable items
    const validRecommendations = recommendedItems.filter(
      item => item && item.isAvailable
    )

    // If no recommendations found, suggest popular items from same category
    if (validRecommendations.length === 0 && restaurantId) {
      const baseItem = await prisma.menuItem.findUnique({
        where: { id: itemId }
      })

      if (baseItem) {
        const categoryItems = await prisma.menuItem.findMany({
          where: {
            restaurantId,
            category: baseItem.category,
            id: { not: itemId },
            isAvailable: true
          },
          take: 3
        })

        return NextResponse.json({
          recommendations: categoryItems,
          frequentlyBought: false
        })
      }
    }

    return NextResponse.json({
      recommendations: validRecommendations,
      frequentlyBought: true
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
