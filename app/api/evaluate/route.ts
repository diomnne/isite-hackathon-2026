export async function POST(req: Request) {
  try {
    const { concept, userExplanation, conversationContext } = await req.json() as {
      concept: {
        name: string
        description: string
        xpReward: number
      }
      userExplanation: string
      conversationContext: Array<{ role: string; content: string }>
    }

    if (!concept || !userExplanation) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL_EVALUATE || 'http://localhost:5678/webhook/evaluate'
    
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ concept, userExplanation, conversationContext }),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook failed with status: ${response.status}`)
    }

    const evaluation = await response.json()

    // Calculate XP based on comprehension level
    let xpAwarded = 0
    if (evaluation.comprehensionLevel === 'full') {
      xpAwarded = concept.xpReward
    } else if (evaluation.comprehensionLevel === 'partial') {
      xpAwarded = Math.floor(concept.xpReward * 0.5)
    }

    return Response.json({
      passed: evaluation.passed,
      feedback: evaluation.feedback,
      correctPoints: evaluation.correctPoints || [],
      missedPoints: evaluation.missedPoints || [],
      xpAwarded,
    })
  } catch (error) {
    console.error('Evaluation error:', error)
    return Response.json(
      { error: 'Failed to evaluate response via n8n' },
      { status: 500 }
    )
  }
}
