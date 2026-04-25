'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { WorldMap } from '@/components/world-map'
import { XpBar } from '@/components/xp-bar'
import { ChallengeModal } from '@/components/challenge-modal'
import { ArrowLeft, Map, Scroll, Sparkles, CheckCircle2 } from 'lucide-react'
import { getWorldMapById, loadProgress, saveWorldMap, addXpAndUpdateProgress } from '@/lib/storage'
import type { WorldMap as WorldMapType, Concept, UserProgress } from '@/lib/types'

function AdventureContent() {
  const searchParams = useSearchParams()
  const worldMapId = searchParams.get('id')
  
  const [worldMap, setWorldMap] = useState<WorldMapType | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (worldMapId) {
      const map = getWorldMapById(worldMapId)
      setWorldMap(map)
    }
    setProgress(loadProgress())
  }, [worldMapId])

  const handleConceptComplete = useCallback((conceptId: string, xpAwarded: number) => {
    if (!worldMap) return

    // Update world map with completed concept
    const updatedConcepts = worldMap.concepts.map(c =>
      c.id === conceptId ? { ...c, completed: true } : c
    )
    const updatedWorldMap = { ...worldMap, concepts: updatedConcepts }
    setWorldMap(updatedWorldMap)
    saveWorldMap(updatedWorldMap)

    // Update XP and progress
    const newProgress = addXpAndUpdateProgress(xpAwarded, conceptId)
    setProgress(newProgress)

    // Close modal
    setSelectedConcept(null)
  }, [worldMap])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--gold-dim)] font-serif">Loading adventure...</div>
      </div>
    )
  }

  if (!worldMap) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
        <div className="h-20 w-20 rounded-full bg-[var(--muted)] border-2 border-[var(--gold-dim)]/30 flex items-center justify-center">
          <Map className="h-10 w-10 text-[var(--muted-foreground)]" />
        </div>
        <h1 className="text-2xl font-serif font-semibold text-[var(--gold)]">Adventure Not Found</h1>
        <p className="text-[var(--parchment-dark)] text-center max-w-md">
          This ancient map has been lost to time or never existed in the first place.
        </p>
        <Link href="/">
          <Button variant="outline" className="gap-2 border-[var(--gold-dim)] text-[var(--gold)] hover:bg-[var(--gold)]/10">
            <ArrowLeft className="h-4 w-4" />
            Return to Sanctuary
          </Button>
        </Link>
      </div>
    )
  }

  const completedCount = worldMap.concepts.filter(c => c.completed).length
  const totalCount = worldMap.concepts.length
  const allCompleted = completedCount === totalCount

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--gold-dim)]/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-[var(--gold-dim)] hover:text-[var(--gold)] hover:bg-[var(--gold)]/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-[var(--gold)]/10 border border-[var(--gold-dim)]/50 flex items-center justify-center">
                  <Scroll className="h-6 w-6 text-[var(--gold)]" />
                </div>
                <div>
                  <h1 className="font-serif text-xl sm:text-2xl font-bold text-[var(--gold)]">
                    {worldMap.title}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-[var(--parchment-dark)]">
                    {allCompleted ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                        <span className="text-[var(--success)]">Quest Complete!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-[var(--gold-dim)]" />
                        <span>{completedCount}/{totalCount} challenges conquered</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <XpBar progress={progress} compact />
        </div>
      </header>

      {/* Progress indicator */}
      <div className="h-1 bg-[var(--muted)]">
        <div 
          className="h-full bg-gradient-to-r from-[var(--gold-dim)] via-[var(--gold)] to-[var(--gold-dim)] transition-all duration-500"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* World Map */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {allCompleted && (
          <div className="mb-8 p-6 rounded-xl parchment-texture animate-border-glow text-center">
            <Sparkles className="h-12 w-12 text-[var(--gold)] mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-[var(--gold)] mb-2">
              Quest Complete!
            </h2>
            <p className="text-[var(--parchment-dark)] mb-4">
              You have conquered all challenges and proven your mastery of this realm.
            </p>
            <Link href="/">
              <Button className="bg-[var(--gold)] hover:bg-[var(--gold-dim)] text-black font-semibold gold-glow">
                <Sparkles className="h-4 w-4 mr-2" />
                Begin New Adventure
              </Button>
            </Link>
          </div>
        )}
        <WorldMap
          concepts={worldMap.concepts}
          onSelectConcept={setSelectedConcept}
        />
      </div>

      {/* Challenge Modal */}
      {selectedConcept && worldMap && (
        <ChallengeModal
          concept={selectedConcept}
          worldMap={worldMap}
          onClose={() => setSelectedConcept(null)}
          onComplete={handleConceptComplete}
        />
      )}
    </main>
  )
}

export default function AdventurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--gold-dim)] font-serif">Loading adventure...</div>
      </div>
    }>
      <AdventureContent />
    </Suspense>
  )
}
