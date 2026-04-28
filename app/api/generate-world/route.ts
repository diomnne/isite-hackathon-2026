export async function POST(req: Request) {
  try {
    const { content, title } = await req.json()

    if (!content || typeof content !== 'string') {
      return Response.json({ error: 'Content is required' }, { status: 400 })
    }

    const isUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(content.trim())
    if (!isUrl && content.length < 100) {
      return Response.json({ error: 'Content too short' }, { status: 400 })
    }

    // Forward to n8n webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL_GENERATE_WORLD || 'http://localhost:5678/webhook/generate-world'
    
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: content, title }),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook failed with status: ${response.status}`)
    }

    const responseText = await response.text()
    let result;
    try {
      const parsed = JSON.parse(responseText)
      // Map n8n's Ollama schema to our Next.js frontend schema
      result = {
        title: parsed.world_name || title,
        concepts: (parsed.regions || []).map((r: any) => ({
          name: r.name,
          location: r.location,
          description: r.description,
          difficulty: r.difficulty || 'medium',
          xpReward: r.xpReward || r.xp_reward || 100,
          landmarks: r.landmarks || []
        }))
      }
    } catch (parseError) {
      console.error('Failed to parse n8n response as JSON. Raw response:', responseText)
      throw new Error(`Invalid JSON from n8n. Raw response: ${responseText.substring(0, 100)}...`)
    }

    return Response.json(result)
  } catch (error: any) {
    console.error('World generation error:', error)
    return Response.json(
      { error: error.message || 'Failed to generate world map via n8n' },
      { status: 500 }
    )
  }
}
