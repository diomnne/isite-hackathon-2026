'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { loadProgress } from '@/lib/storage'
import { getXpProgress, getLevelTitle } from '@/lib/xp'
import { Shield, Star, Crown } from 'lucide-react'
import type { UserProgress } from '@/lib/types'
import { cn } from '@/lib/utils'

interface XpBarProps {
  progress?: UserProgress | null
  showTitle?: boolean
  compact?: boolean
}

export function XpBar({ progress: externalProgress, showTitle = true, compact = false }: XpBarProps) {
  const [progress, setProgress] = useState<UserProgress | null>(externalProgress || null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!externalProgress) {
      setProgress(loadProgress())
    }
  }, [externalProgress])

  useEffect(() => {
    if (externalProgress) {
      setProgress(externalProgress)
    }
  }, [externalProgress])

  if (!mounted || !progress) {
    return (
      <div className={`${compact ? 'h-10' : 'h-20'} animate-pulse bg-[var(--muted)]/30 rounded-lg`} />
    )
  }

  const { currentLevel, currentLevelXp, nextLevelXp, progressPercent } = getXpProgress(progress.totalXp)
  const xpIntoLevel = progress.totalXp - currentLevelXp
  const xpNeeded = nextLevelXp - currentLevelXp

  if (compact) {
    return (
      <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-black/30 border border-[var(--gold-dim)]/30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[var(--gold)]/20 border border-[var(--gold-dim)] flex items-center justify-center">
            <Shield className="h-4 w-4 text-[var(--gold)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--gold-dim)]">{getLevelTitle(currentLevel)}</p>
            <p className="text-sm font-serif font-semibold text-[var(--gold)]">Lv.{currentLevel}</p>
          </div>
        </div>
        <div className="flex-1 min-w-[120px]">
          <div className="h-3 bg-[var(--muted)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[var(--gold-dim)] via-[var(--gold)] to-[var(--gold-dim)] transition-all duration-500 rounded-full relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 animate-shimmer" />
            </div>
          </div>
        </div>
        <span className="text-sm font-mono text-[var(--gold)] whitespace-nowrap">
          {xpIntoLevel}/{xpNeeded} XP
        </span>
      </div>
    )
  }

  return (
    <div className="p-5 rounded-xl parchment-texture animate-border-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full bg-[var(--gold)]/20 border-2 border-[var(--gold)] flex items-center justify-center gold-glow">
              <Crown className="h-7 w-7 text-[var(--gold)]" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[var(--card)] border border-[var(--gold-dim)] flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--gold)]">{currentLevel}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-[var(--gold)]">
                Level {currentLevel}
              </span>
            </div>
            {showTitle && (
              <p className="text-sm text-[var(--parchment-dark)]">
                {getLevelTitle(currentLevel)}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="h-3.5 w-3.5 text-[var(--gold)]" />
              <span className="text-xs text-[var(--gold-dim)]">
                {progress.totalXp.toLocaleString()} Total XP
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono font-semibold text-[var(--gold)]">
            {xpIntoLevel} / {xpNeeded}
          </p>
          <p className="text-xs text-[var(--parchment-dark)]">
            XP to Level {currentLevel + 1}
          </p>
        </div>
      </div>
      <div className="relative h-4 bg-[var(--muted)] rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[var(--gold-dim)] via-[var(--gold)] to-[var(--gold-dim)] transition-all duration-500 rounded-full relative"
          style={{ width: `${progressPercent}%` }}
        >
          {progressPercent > 0 && (
            <div className="absolute inset-0 animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  )
}
