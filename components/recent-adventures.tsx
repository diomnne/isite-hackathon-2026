'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Map, Trash2, CheckCircle2, Scroll, ChevronRight } from 'lucide-react'
import { loadWorldMaps, deleteWorldMap } from '@/lib/storage'
import type { WorldMap } from '@/lib/types'

export function RecentAdventures() {
  const [worldMaps, setWorldMaps] = useState<WorldMap[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setWorldMaps(loadWorldMaps())
  }, [])

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    deleteWorldMap(id)
    setWorldMaps(loadWorldMaps())
  }

  if (!mounted || worldMaps.length === 0) {
    return (
      <div className="parchment-texture rounded-xl p-6 animate-border-glow">
        <div className="flex items-center gap-3 mb-4">
          <Map className="h-5 w-5 text-[var(--gold)]" />
          <h2 className="font-serif text-lg text-[var(--gold)]">Recent Quests</h2>
        </div>
        <div className="text-center py-8">
          <Scroll className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
          <p className="text-sm text-[var(--parchment-dark)]">
            No adventures yet. Begin your first quest!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="parchment-texture rounded-xl p-5 animate-border-glow">
      <div className="flex items-center gap-3 mb-4">
        <Map className="h-5 w-5 text-[var(--gold)]" />
        <h2 className="font-serif text-lg text-[var(--gold)]">Recent Quests</h2>
      </div>
      <div className="space-y-2">
        {worldMaps.slice(0, 5).map((worldMap) => {
          const completedCount = worldMap.concepts.filter(c => c.completed).length
          const totalCount = worldMap.concepts.length
          const isComplete = completedCount === totalCount && totalCount > 0
          const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

          return (
            <Link
              key={worldMap.id}
              href={`/adventure?id=${worldMap.id}`}
              className="block group"
            >
              <div className="relative p-3 rounded-lg bg-black/20 border border-[var(--gold-dim)]/20 hover:border-[var(--gold-dim)]/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[var(--parchment)] truncate text-sm">
                        {worldMap.title}
                      </h3>
                      {isComplete && (
                        <CheckCircle2 className="h-4 w-4 text-[var(--success)] flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold)] transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--gold-dim)]">
                        {completedCount}/{totalCount}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--muted-foreground)] hover:text-[var(--health)] hover:bg-[var(--health)]/10"
                      onClick={(e) => handleDelete(worldMap.id, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-[var(--gold-dim)] group-hover:text-[var(--gold)] transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
