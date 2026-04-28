import { UIMessage } from 'ai'

export async function POST(req: Request) {
  try {
    const { messages, concept, worldTitle, video_url } = await req.json() as {
      messages: UIMessage[]
      concept: any
      worldTitle: string
      video_url: string
    }

    if (!concept) {
      return Response.json({ error: 'Concept is required' }, { status: 400 })
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL_DUNGEON_MASTER || 'http://localhost:5678/webhook/dungeon-master'

    // Get the latest user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop() as any
    let user_message = ''
    if (lastUserMessage) {
      if (lastUserMessage.content) {
        user_message = lastUserMessage.content
      } else if (Array.isArray(lastUserMessage.parts)) {
        user_message = lastUserMessage.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('')
      }
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Match the exact schema expected by n8n
      body: JSON.stringify({ 
        video_url: video_url || concept.sourceText, 
        user_message, 
        user_id: 'local-session-123' 
      }),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook failed with status: ${response.status}`)
    }

    const data = await response.json()
    
    // Extract narrative and XP from n8n response
    let text = data.dm_narrative || data.output || data.response || data.text || (typeof data === 'string' ? data : JSON.stringify(data))
    
    if (data.xp_reward && data.xp_reward > 0) {
      text = `[XP_AWARDED:${data.xp_reward}]\n${text}`
    }

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
