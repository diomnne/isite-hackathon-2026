import { generateText, Output } from 'ai'
import { z } from 'zod'

const worldMapSchema = z.object({
  title: z.string().describe('A creative RPG-style title for this learning adventure'),
  concepts: z.array(z.object({
    name: z.string().describe('The concept name'),
    description: z.string().describe('A concise description of what the learner needs to understand'),
    difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty based on concept complexity'),
    location: z.string().describe('A creative fantasy location name related to the concept'),
    xpReward: z.number().describe('XP reward: 50 for easy, 100 for medium, 200 for hard'),
  })).describe('5-8 key concepts extracted from the content'),
})

export async function POST(req: Request) {
  try {
    const { content, title } = await req.json()

    if (!content || typeof content !== 'string') {
      return Response.json({ error: 'Content is required' }, { status: 400 })
    }

    if (content.length < 100) {
      return Response.json({ error: 'Content too short' }, { status: 400 })
    }

    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      output: Output.object({
        schema: worldMapSchema,
      }),
      system: `You are an expert educator who transforms learning content into engaging RPG-style adventures.

Your task is to analyze educational content and extract the 5-8 most important concepts that a learner must understand.

For each concept:
1. Give it a clear, educational name
2. Write a concise description of what needs to be understood
3. Assign difficulty based on complexity (easy, medium, hard)
4. Create a creative fantasy location name that relates to the concept (e.g., "The Mitochondria Forge" for cellular energy, "The Valley of Variables" for programming variables)
5. Set XP reward: 50 for easy, 100 for medium, 200 for hard

Create a compelling adventure title that captures the subject matter in an exciting way.

Focus on concepts that are:
- Core to understanding the material
- Testable through explanation
- Progressive in difficulty when possible`,
      prompt: `${title ? `Suggested title: ${title}\n\n` : ''}Analyze this educational content and create a World Map of key concepts:

${content.slice(0, 8000)}`,
    })

    return Response.json(result.output)
  } catch (error) {
    console.error('World generation error:', error)
    return Response.json(
      { error: 'Failed to generate world map' },
      { status: 500 }
    )
  }
}
