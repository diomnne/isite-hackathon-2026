import { generateText, Output } from 'ai'
import { z } from 'zod'

const evaluationSchema = z.object({
  passed: z.boolean().describe('Whether the learner demonstrated sufficient understanding'),
  feedback: z.string().describe('Encouraging, specific feedback on their explanation'),
  correctPoints: z.array(z.string()).describe('Key points they got right'),
  missedPoints: z.array(z.string()).describe('Important points they missed or got wrong'),
  comprehensionLevel: z.enum(['none', 'partial', 'full']).describe('Level of understanding shown'),
})

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

    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      output: Output.object({
        schema: evaluationSchema,
      }),
      system: `You are an educational evaluator assessing whether a learner understands a concept.

Your job is to:
1. Determine if they demonstrated genuine understanding (not just memorization)
2. Be encouraging but honest
3. Identify specific correct and incorrect points
4. Award appropriate credit:
   - "full" comprehension = they understand the core concept and can explain it
   - "partial" comprehension = they have some understanding but missed key points
   - "none" = they don't demonstrate understanding

Be lenient on exact wording - accept valid explanations even if phrased differently.
Focus on conceptual understanding, not perfect terminology.`,
      prompt: `Evaluate this learner's understanding of:

CONCEPT: ${concept.name}
EXPECTED UNDERSTANDING: ${concept.description}

CONVERSATION CONTEXT:
${conversationContext.map(m => `${m.role}: ${m.content}`).join('\n\n')}

LEARNER'S EXPLANATION TO EVALUATE:
${userExplanation}

Assess their understanding and provide constructive feedback.`,
    })

    const evaluation = result.output

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
      correctPoints: evaluation.correctPoints,
      missedPoints: evaluation.missedPoints,
      xpAwarded,
    })
  } catch (error) {
    console.error('Evaluation error:', error)
    return Response.json(
      { error: 'Failed to evaluate response' },
      { status: 500 }
    )
  }
}
