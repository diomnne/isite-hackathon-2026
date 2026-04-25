import { InputForm } from '@/components/input-form'
import { RecentAdventures } from '@/components/recent-adventures'
import { XpBar } from '@/components/xp-bar'
import { BookOpen, Swords, Crown, Shield, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration - subtle gold radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--gold)]/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[var(--gold)]/10 border-2 border-[var(--gold-dim)] mb-6 gold-glow">
              <Shield className="h-8 w-8 text-[var(--gold)]" />
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 text-balance">
              <span className="text-[var(--gold)] drop-shadow-[0_0_30px_rgba(255,215,0,0.3)]">Study</span>{' '}
              <span className="text-[var(--parchment)]">Buddy</span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--parchment-dark)] max-w-2xl mx-auto text-pretty leading-relaxed">
              Transform any lecture into an epic RPG adventure. Face challenges, prove your knowledge, and ascend to mastery.
            </p>
          </div>

          {/* XP Bar */}
          <div className="mb-10 max-w-2xl mx-auto">
            <XpBar />
          </div>

          {/* How it works */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="flex flex-col items-center text-center p-5 rounded-lg stone-texture">
              <div className="h-12 w-12 rounded-full bg-[var(--gold)]/10 border border-[var(--gold-dim)] flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-[var(--gold)]" />
              </div>
              <h3 className="font-serif font-semibold text-[var(--gold)] mb-1">1. Inscribe Knowledge</h3>
              <p className="text-sm text-[var(--parchment-dark)]">
                Paste any transcript or sacred text
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-5 rounded-lg stone-texture">
              <div className="h-12 w-12 rounded-full bg-[var(--gold)]/10 border border-[var(--gold-dim)] flex items-center justify-center mb-4">
                <Swords className="h-6 w-6 text-[var(--gold)]" />
              </div>
              <h3 className="font-serif font-semibold text-[var(--gold)] mb-1">2. Face the Trials</h3>
              <p className="text-sm text-[var(--parchment-dark)]">
                The Dungeon Master tests your wisdom
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-5 rounded-lg stone-texture">
              <div className="h-12 w-12 rounded-full bg-[var(--gold)]/10 border border-[var(--gold-dim)] flex items-center justify-center mb-4">
                <Crown className="h-6 w-6 text-[var(--gold)]" />
              </div>
              <h3 className="font-serif font-semibold text-[var(--gold)] mb-1">3. Ascend in Power</h3>
              <p className="text-sm text-[var(--parchment-dark)]">
                Earn XP and become a Grand Archmage
              </p>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <InputForm />
            </div>
            <div className="lg:col-span-1">
              <RecentAdventures />
            </div>
          </div>

          {/* Footer tagline */}
          <div className="mt-12 text-center">
            <p className="text-sm text-[var(--muted-foreground)] flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--gold-dim)]" />
              Learning is an adventure
              <Sparkles className="h-4 w-4 text-[var(--gold-dim)]" />
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
