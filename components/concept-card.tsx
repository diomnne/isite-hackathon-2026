'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, MapPin, Star, Swords, Lock } from 'lucide-react'
import type { Concept } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ConceptCardProps {
  concept: Concept
  onClick: () => void
  index: number
}

const difficultyConfig = {
  easy: {
    label: 'Novice',
    stars: 1,
  },
  medium: {
    label: 'Adept',
    stars: 2,
  },
  hard: {
    label: 'Master',
    stars: 3,
  },
}

export function ConceptCard({ concept, onClick, index }: ConceptCardProps) {
  const config = difficultyConfig[concept.difficulty]
  const isCompleted = concept.completed

  return (
    <Card 
      className={cn(
        'group relative cursor-pointer transition-all duration-300 overflow-hidden',
        'border-2 hover:scale-[1.02]',
        isCompleted 
          ? 'bg-[var(--success)]/5 border-[var(--success)]/40 hover:border-[var(--success)]/60' 
          : 'stone-texture hover:border-[var(--gold)]'
      )}
      onClick={onClick}
    >
      {/* Glow effect on hover */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
        isCompleted 
          ? 'bg-gradient-to-br from-[var(--success)]/10 to-transparent'
          : 'bg-gradient-to-br from-[var(--gold)]/10 to-transparent'
      )} />
      
      {/* Completion indicator */}
      {isCompleted && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-[var(--success)]/20 border-2 border-[var(--success)]/60 gold-glow">
            <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
          </div>
        </div>
      )}

      <CardContent className="p-5">
        {/* Location header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={cn(
            'flex items-center justify-center h-10 w-10 rounded-lg flex-shrink-0',
            isCompleted 
              ? 'bg-[var(--success)]/20 border border-[var(--success)]/40' 
              : 'bg-[var(--gold)]/10 border border-[var(--gold-dim)]/50'
          )}>
            <MapPin className={cn(
              'h-5 w-5',
              isCompleted ? 'text-[var(--success)]' : 'text-[var(--gold)]'
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--gold-dim)] uppercase tracking-wider mb-0.5 font-sans">
              Location {index + 1}
            </p>
            <h3 className={cn(
              'font-serif text-lg font-semibold leading-tight',
              isCompleted ? 'text-[var(--success)]' : 'text-[var(--gold)]'
            )}>
              {concept.location}
            </h3>
          </div>
        </div>

        {/* Concept name */}
        <h4 className="font-semibold text-[var(--parchment)] mb-2 line-clamp-2">
          {concept.name}
        </h4>

        {/* Description preview */}
        <p className="text-sm text-[var(--parchment-dark)] line-clamp-2 mb-4 leading-relaxed">
          {concept.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--gold-dim)]/20">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  'h-4 w-4 transition-colors',
                  i < config.stars 
                    ? 'fill-[var(--gold)] text-[var(--gold)]' 
                    : 'text-[var(--muted-foreground)]'
                )} 
              />
            ))}
            <span className="ml-1.5 text-xs text-[var(--parchment-dark)]">
              {config.label}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 text-sm">
            {isCompleted ? (
              <span className="text-[var(--success)] font-semibold">
                +{concept.xpReward} XP
              </span>
            ) : (
              <>
                <Swords className="h-4 w-4 text-[var(--gold)]" />
                <span className="text-[var(--gold)] font-semibold">
                  {concept.xpReward} XP
                </span>
              </>
            )}
          </div>
        </div>

        {/* Battle prompt on hover */}
        {!isCompleted && (
          <div className="absolute inset-x-0 bottom-0 h-12 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm font-semibold text-[var(--gold)] flex items-center gap-2 drop-shadow-lg">
              <Swords className="h-4 w-4" />
              Enter the Challenge
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
