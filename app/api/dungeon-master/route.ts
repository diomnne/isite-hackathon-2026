import { UIMessage } from 'ai'

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

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL_DUNGEON_MASTER || 'http://localhost:5678/webhook/dungeon-master'

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, concept, worldTitle }),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook failed with status: ${response.status}`)
    }

    // Assuming a blocking JSON response from n8n for simplicity,
    // though n8n could be configured to stream SSE.
    const data = await response.json()
    const text = data.output || data.response || data.text || (typeof data === 'string' ? data : JSON.stringify(data))

    // Format the response to be compatible with Vercel AI SDK's useChat data stream protocol
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`))
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1'
      }
    })
  } catch (error) {
    console.error('Dungeon Master error:', error)
    return Response.json(
      { error: 'Failed to get response from Dungeon Master via n8n' },
      { status: 500 }
    )
  }
}
