'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Scroll, Sparkles, Feather } from 'lucide-react'
import { saveWorldMap } from '@/lib/storage'
import type { WorldMap, Concept } from '@/lib/types'

export function InputForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError('Please paste a text transcript or YouTube link to transform into an adventure')
      return
    }

    const isUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(content.trim())
    if (!isUrl && content.trim().length < 100) {
      setError('Content is too short. Please paste at least a paragraph of text, or a valid YouTube link.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          title: title.trim() || undefined
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate world map')
      }

      const data = await response.json()

      const worldMap: WorldMap = {
        id: crypto.randomUUID(),
        title: data.title || title || 'Untitled Adventure',
        sourceText: content.trim(),
        concepts: data.concepts.map((c: Omit<Concept, 'id' | 'completed'>) => ({
          ...c,
          id: crypto.randomUUID(),
          completed: false,
        })),
        createdAt: new Date().toISOString(),
      }

      saveWorldMap(worldMap)
      router.push(`/adventure?id=${worldMap.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="parchment-texture rounded-xl overflow-hidden animate-border-glow">
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--gold)]/10 border-2 border-[var(--gold-dim)] gold-glow">
            <Scroll className="h-10 w-10 text-[var(--gold)]" />
          </div>
          <h2 className="font-serif text-3xl text-[var(--gold)] font-bold mb-2">
            Ancient Scroll of Knowledge
          </h2>
          <p className="text-[var(--parchment-dark)] max-w-md mx-auto">
            Inscribe your sacred texts or paste a crystal vision (YouTube link) below to transform them into an epic learning adventure
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold text-[var(--gold-dim)] uppercase tracking-wider flex items-center gap-2">
              <Feather className="h-4 w-4" />
              Quest Title (optional)
            </label>
            <Input
              id="title"
              placeholder="e.g., The Mysteries of Cell Biology"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 bg-[var(--input)] border-[var(--gold-dim)]/30 text-[var(--parchment)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold)]/50 font-serif"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-semibold text-[var(--gold-dim)] uppercase tracking-wider flex items-center gap-2">
              <Scroll className="h-4 w-4" />
              Sacred Text or Crystal Vision (YouTube Link)
            </label>
            <Textarea
              id="content"
              placeholder="Paste your lecture transcript, article, or a YouTube link here...

Example: 'https://youtube.com/watch?v=...'"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[220px] bg-[var(--input)] border-[var(--gold-dim)]/30 text-[var(--parchment)] placeholder:text-[var(--muted-foreground)]/60 resize-none focus:border-[var(--gold)]/50 leading-relaxed"
            />
            <div className="flex justify-between text-xs">
              <span className="text-[var(--muted-foreground)]">
                {content.length} characters
              </span>
              {content.length > 0 && content.length < 100 && !/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(content.trim()) && (
                <span className="text-[var(--health)]">
                  Minimum 100 characters required for text
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-[var(--health)]/10 border border-[var(--health)]/30 text-[var(--health)] text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-14 text-lg font-serif font-semibold gap-3 bg-[var(--gold)] hover:bg-[var(--gold-dim)] text-black gold-glow"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="h-5 w-5" />
                Conjuring World Map...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Begin Adventure
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
