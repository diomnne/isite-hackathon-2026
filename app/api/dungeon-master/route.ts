import { streamText, convertToModelMessages, UIMessage } from 'ai'

export async function POST(req: Request) {
  try {
    const { messages, concept, worldTitle } = await req.json() as {
      messages: UIMessage[]
      concept: {
        name: string
        description: string
        location: string
        difficulty: string
      }
      worldTitle: string
    }

    if (!concept) {
      return Response.json({ error: 'Concept is required' }, { status: 400 })
    }

    const systemPrompt = `You are a wise and engaging Dungeon Master guiding a learner through "${worldTitle}".

Current Location: ${concept.location}
Concept to Master: ${concept.name}
Description: ${concept.description}
Difficulty: ${concept.difficulty}

YOUR ROLE:
- Create immersive, narrative challenges that test understanding of the concept
- Be encouraging but maintain educational rigor
- Use the fantasy setting to make learning engaging
- Ask follow-up questions if the learner's explanation is vague or incomplete
- Provide hints when asked, but don't give away the answer
- Keep responses concise (2-4 paragraphs max)

FIRST MESSAGE STYLE:
If this is the start of a challenge, create an engaging scenario where the learner must demonstrate their knowledge. For example:
"You approach ${concept.location}. A guardian blocks your path and says: 'To pass, you must explain [specific aspect of ${concept.name}]...'"

EVALUATION STYLE:
When evaluating an answer, acknowledge what they got right, gently correct misconceptions, and ask clarifying questions if needed. Only tell them they've mastered the concept when they demonstrate true understanding.

Remember: You're testing their UNDERSTANDING, not memorization. Accept valid explanations even if worded differently than expected.`

    const result = streamText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Dungeon Master error:', error)
    return Response.json(
      { error: 'Failed to get response from Dungeon Master' },
      { status: 500 }
    )
  }
}
