import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple sentiment analysis function
function analyzeSentiment(rating: number, review: string): string {
  if (rating >= 4) return 'POSITIVE'
  if (rating <= 2) return 'NEGATIVE'
  
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'delicious', 'perfect', 'wonderful', 'tasty']
  const negativeWords = ['bad', 'poor', 'terrible', 'worst', 'hate', 'awful', 'disgusting', 'cold', 'slow', 'rude']
  
  const lowerReview = review.toLowerCase()
  const posCount = positiveWords.filter(w => lowerReview.includes(w)).length
  const negCount = negativeWords.filter(w => lowerReview.includes(w)).length
  
  if (posCount > negCount) return 'POSITIVE'
  if (negCount > posCount) return 'NEGATIVE'
  return 'NEUTRAL'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, restaurantId, rating, review } = body

    const sentiment = analyzeSentiment(rating, review || '')

    const feedback = await prisma.feedback.create({
      data: {
        orderId,
        restaurantId,
        rating,
        review,
        sentiment,
      }
    })

    // Create notification
    await prisma.notification.create({
      data: {
        restaurantId,
        type: 'FEEDBACK_RECEIVED',
        title: `New ${sentiment.toLowerCase()} feedback received`,
        message: `Rating: ${rating}/5 - ${review?.substring(0, 50) || 'No review'}`,
      }
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    const where: any = {}
    if (restaurantId) where.restaurantId = restaurantId

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        order: {
          include: {
            table: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate sentiment statistics
    const total = feedbacks.length
    const positive = feedbacks.filter(f => f.sentiment === 'POSITIVE').length
    const negative = feedbacks.filter(f => f.sentiment === 'NEGATIVE').length
    const neutral = feedbacks.filter(f => f.sentiment === 'NEUTRAL').length
    const avgRating = feedbacks.reduce((acc, f) => acc + f.rating, 0) / total || 0

    return NextResponse.json({
      feedbacks,
      stats: {
        total,
        positive,
        negative,
        neutral,
        positivePercentage: total ? Math.round((positive / total) * 100) : 0,
        negativePercentage: total ? Math.round((negative / total) * 100) : 0,
        averageRating: avgRating.toFixed(1)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}
