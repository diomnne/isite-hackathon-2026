'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { 
  X, 
  Send, 
  Lightbulb, 
  CheckCircle2, 
  Star,
  Scroll,
  User,
  Swords,
  Shield,
  Heart,
  Sparkles,
  FlaskConical,
  ShieldCheck
} from 'lucide-react'
import type { Concept, WorldMap, EvaluationResult } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ChallengeModalProps {
  concept: Concept
  worldMap: WorldMap
  onClose: () => void
  onComplete: (conceptId: string, xpAwarded: number) => void
}

function getMessageText(parts: Array<{ type: string; text?: string }> | undefined): string {
  if (!parts || !Array.isArray(parts)) return ''
  return parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text' && typeof p.text === 'string')
    .map(p => p.text)
    .join('')
}

export function ChallengeModal({ concept, worldMap, onClose, onComplete }: ChallengeModalProps) {
  const [input, setInput] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [health, setHealth] = useState(100)
  const [showXpFloat, setShowXpFloat] = useState(false)
  const [floatXp, setFloatXp] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(180) // 3 minutes
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoStartRef = useRef(false)

  const maxHints = 3
  const maxShields = 1
  const [shieldsUsed, setShieldsUsed] = useState(0)

  const { messages, sendMessage, status } = useChat({
    id: `challenge-${concept.id}`,
    transport: new DefaultChatTransport({
      api: '/api/dungeon-master',
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages,
          concept: {
            name: concept.name,
            description: concept.description,
            location: concept.location,
            difficulty: concept.difficulty,
            sourceText: worldMap.sourceText,
          },
          worldTitle: worldMap.title,
          video_url: worldMap.sourceText,
        },
      }),
    }),
  })

  const isStreaming = status === 'streaming'
  const isReady = status === 'ready' || !status

  // Timer countdown
  useEffect(() => {
    if (evaluationResult) return
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [evaluationResult])

  // Auto-start the challenge
  useEffect(() => {
    if (messages.length === 0 && !autoStartRef.current) {
      autoStartRef.current = true
      sendMessage({ text: 'I approach this location and am ready to face the challenge.' })
    }
  }, [messages.length, sendMessage])

  // Watch for XP awards from n8n
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && !isStreaming) {
      const text = getMessageText(lastMsg.parts);
      const xpMatch = text.match(/\[XP_AWARDED:(\d+)\]\n/);
      if (xpMatch && !evaluationResult) {
        const xp = parseInt(xpMatch[1], 10);
        
        // Apply health/hint penalties to XP
        const healthPenalty = health < 100 ? Math.floor((100 - health) / 20) * 5 : 0;
        const finalXp = Math.max(0, xp - healthPenalty);
        
        setEvaluationResult({
          passed: true,
          feedback: text.replace(xpMatch[0], ''), // The DM's narrative becomes the feedback
          correctPoints: ['You have proven your knowledge to the Dungeon Master!'],
          missedPoints: [],
          xpAwarded: finalXp,
        });

        if (finalXp > 0) {
          setFloatXp(finalXp);
          setShowXpFloat(true);
          setTimeout(() => setShowXpFloat(false), 1500);
        }
      } else if (!xpMatch && !evaluationResult && text) {
        // If they got it wrong, the DM gave a hint/response. We deduct health.
        // We only do this if the response didn't just start and they actually answered.
        if (messages.length > 2) {
          // Deduct a tiny bit of health for a wrong answer
          setHealth(prev => Math.max(0, prev - 5));
        }
      }
    }
  }, [messages, isStreaming, evaluationResult, health]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isStreaming || isEvaluating) return
    sendMessage({ text: input.trim() })
    setInput('')
  }

  const handleHint = () => {
    if (isStreaming || isEvaluating || hintsUsed >= maxHints) return
    setHintsUsed(prev => prev + 1)
    setHealth(prev => Math.max(0, prev - 10)) // Using hints costs health
    sendMessage({ text: 'I need a hint to help me understand this concept better.' })
  }

  const handleShield = () => {
    if (shieldsUsed >= maxShields || health >= 100) return
    setShieldsUsed(prev => prev + 1)
    setHealth(prev => Math.min(100, prev + 30))
  }

  const handleEvaluate = async () => {
    if (isStreaming || isEvaluating || messages.length < 2) return

    setIsEvaluating(true)
    try {
      const userMessages = messages
        .filter(m => m.role === 'user')
        .map(m => getMessageText(m.parts))
        .join('\n')

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: {
            name: concept.name,
            description: concept.description,
            xpReward: concept.xpReward,
          },
          userExplanation: userMessages,
          conversationContext: messages.map(m => ({
            role: m.role,
            content: getMessageText(m.parts),
          })),
        }),
      })

      if (!response.ok) throw new Error('Evaluation failed')

      const result: EvaluationResult = await response.json()
      
      // Apply health/hint penalties to XP
      const healthPenalty = health < 100 ? Math.floor((100 - health) / 20) * 5 : 0
      const finalXp = Math.max(0, result.xpAwarded - healthPenalty)
      result.xpAwarded = finalXp
      
      setEvaluationResult(result)
      
      // Show floating XP
      if (finalXp > 0) {
        setFloatXp(finalXp)
        setShowXpFloat(true)
        setTimeout(() => setShowXpFloat(false), 1500)
      }
      
      // Reduce health if failed
      if (!result.passed) {
        setHealth(prev => Math.max(0, prev - 20))
      }
    } catch {
      setEvaluationResult({
        passed: false,
        feedback: 'Something went wrong during evaluation. Please try again.',
        correctPoints: [],
        missedPoints: [],
        xpAwarded: 0,
      })
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleComplete = () => {
    if (evaluationResult) {
      onComplete(concept.id, evaluationResult.xpAwarded)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const timerPercent = (timeRemaining / 180) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      {/* Floating XP animation */}
      {showXpFloat && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
          <span className="animate-xp-float text-4xl font-serif font-bold text-[var(--gold)] drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">
            +{floatXp} XP
          </span>
        </div>
      )}

      <div className="w-full max-w-4xl max-h-[95vh] flex gap-4">
        {/* Main Quest Area */}
        <div className="flex-1 flex flex-col parchment-texture rounded-lg overflow-hidden animate-border-glow">
          {/* Timer Bar */}
          <div className="h-1.5 bg-[var(--muted)] relative overflow-hidden">
            <div 
              className="h-full timer-bar transition-all duration-1000 ease-linear"
              style={{ width: `${timerPercent}%` }}
            />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-[var(--gold-dim)]/30">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg stone-texture">
                <Swords className="h-6 w-6 text-[var(--gold)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--gold-dim)] uppercase tracking-wider font-sans">
                  Sacred Riddle
                </p>
                <h2 className="font-serif text-xl text-[var(--gold)] font-semibold">
                  {concept.location}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: concept.difficulty === 'easy' ? 1 : concept.difficulty === 'medium' ? 2 : 3 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
                    ))}
                  </div>
                  <span className="text-xs text-[var(--parchment-dark)]">
                    {concept.xpReward} XP Reward
                  </span>
                  <span className="text-xs text-[var(--gold-dim)]">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="h-10 w-10 text-[var(--parchment-dark)] hover:text-[var(--gold)] hover:bg-[var(--gold)]/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Health Bar */}
          <div className="px-4 py-2 bg-black/20">
            <div className="flex items-center gap-3">
              <Heart className={cn(
                "h-4 w-4",
                health <= 30 ? "text-[var(--health)] animate-health-pulse" : "text-[var(--health)]"
              )} />
              <div className="flex-1 h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                <div 
                  className="h-full health-bar transition-all duration-500 rounded-full"
                  style={{ width: `${health}%` }}
                />
              </div>
              <span className="text-xs font-mono text-[var(--parchment-dark)]">{health}/100</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[250px]">
            {messages.filter(m => m.role !== 'user' || getMessageText(m.parts) !== 'I approach this location and am ready to face the challenge.').map((message) => {
              let text = getMessageText(message.parts)
              if (!text) return null
              
              // Hide the XP tag from the user
              text = text.replace(/\[XP_AWARDED:\d+\]\n/, '')

              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <div className={cn(
                    'flex items-center justify-center h-10 w-10 rounded-lg flex-shrink-0',
                    message.role === 'user' 
                      ? 'stone-texture' 
                      : 'bg-[var(--gold)]/10 border border-[var(--gold-dim)]/50'
                  )}>
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-[var(--gold)]" />
                    ) : (
                      <Scroll className="h-5 w-5 text-[var(--gold)]" />
                    )}
                  </div>
                  <div className={cn(
                    'max-w-[80%] rounded-lg px-4 py-3',
                    message.role === 'user'
                      ? 'stone-texture text-[var(--parchment)]'
                      : 'bg-[var(--parchment-bg)] border border-[var(--gold-dim)]/30 text-[var(--parchment)]'
                  )}>
                    <p className={cn(
                      "text-sm whitespace-pre-wrap leading-relaxed",
                      message.role === 'assistant' && "font-serif"
                    )}>
                      {text}
                    </p>
                  </div>
                </div>
              )
            })}
            
            {isStreaming && (
              <div className="flex gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--gold)]/10 border border-[var(--gold-dim)]/50 flex-shrink-0">
                  <Scroll className="h-5 w-5 text-[var(--gold)]" />
                </div>
                <div className="bg-[var(--parchment-bg)] border border-[var(--gold-dim)]/30 rounded-lg px-4 py-3">
                  <Spinner className="h-4 w-4 text-[var(--gold)]" />
                </div>
              </div>
            )}

            {/* Evaluation Result */}
            {evaluationResult && (
              <div className={cn(
                'p-5 rounded-lg border-2',
                evaluationResult.passed 
                  ? 'bg-[var(--success)]/10 border-[var(--success)]/50'
                  : 'bg-[var(--gold)]/5 border-[var(--gold-dim)]/50'
              )}>
                <div className="flex items-center gap-3 mb-4">
                  {evaluationResult.passed ? (
                    <Sparkles className="h-7 w-7 text-[var(--gold)]" />
                  ) : (
                    <Shield className="h-7 w-7 text-[var(--gold-dim)]" />
                  )}
                  <div>
                    <span className="font-serif text-xl font-semibold text-[var(--gold)]">
                      {evaluationResult.passed ? 'Victory!' : 'Partial Victory'}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-[var(--gold)] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                        +{evaluationResult.xpAwarded} XP
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[var(--parchment)] mb-4 font-serif leading-relaxed">
                  {evaluationResult.feedback}
                </p>
                
                {evaluationResult.correctPoints.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-[var(--success)] font-semibold mb-2 uppercase tracking-wide">
                      Knowledge Gained
                    </p>
                    <ul className="text-sm text-[var(--parchment-dark)] space-y-1">
                      {evaluationResult.correctPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[var(--success)] mt-0.5 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {evaluationResult.missedPoints.length > 0 && (
                  <div>
                    <p className="text-xs text-[var(--gold-dim)] font-semibold mb-2 uppercase tracking-wide">
                      Wisdom to Seek
                    </p>
                    <ul className="text-sm text-[var(--parchment-dark)] space-y-1">
                      {evaluationResult.missedPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-[var(--gold-dim)] mt-0.5 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-[var(--gold-dim)]/30 bg-black/20">
            {evaluationResult ? (
              <Button 
                className="w-full h-14 text-lg font-serif font-semibold gap-3 bg-[var(--gold)] hover:bg-[var(--gold-dim)] text-black gold-glow" 
                onClick={handleComplete}
              >
                <Sparkles className="h-5 w-5" />
                Claim {evaluationResult.xpAwarded} XP and Continue
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Speak your wisdom to the Dungeon Master..."
                    className="min-h-[80px] resize-none bg-[var(--input)] border-[var(--gold-dim)]/30 text-[var(--parchment)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold)]/50"
                    disabled={isStreaming || isEvaluating}
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!input.trim() || isStreaming || isEvaluating}
                    className="h-auto min-w-[50px] bg-[var(--gold)] hover:bg-[var(--gold-dim)] text-black gold-glow"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-[var(--health)] text-[var(--health)] hover:bg-[var(--health)]/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Flee Quest
                  </Button>
                  <Button
                    onClick={handleEvaluate}
                    disabled={isStreaming || isEvaluating || messages.length < 2}
                    className="bg-[var(--gold)] hover:bg-[var(--gold-dim)] text-black font-semibold gold-glow gap-2"
                  >
                    {isEvaluating ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Casting Spell...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Cast Spell (Submit)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Sidebar */}
        <div className="w-48 flex-shrink-0 hidden lg:flex flex-col gap-4">
          {/* Avatar */}
          <div className="parchment-texture rounded-lg p-4 text-center animate-border-glow">
            <div className="w-16 h-16 mx-auto rounded-full bg-[var(--gold)]/20 border-2 border-[var(--gold-dim)] flex items-center justify-center mb-2">
              <Shield className="h-8 w-8 text-[var(--gold)]" />
            </div>
            <p className="text-xs text-[var(--gold-dim)] uppercase tracking-wider">Scholar</p>
            <p className="font-serif text-[var(--gold)] text-sm">Level 1</p>
          </div>

          {/* Inventory */}
          <div className="parchment-texture rounded-lg p-4 flex-1 animate-border-glow">
            <h3 className="font-serif text-sm text-[var(--gold)] mb-4 text-center uppercase tracking-wider">
              Inventory
            </h3>
            
            {/* Hint Potions */}
            <div className="mb-4">
              <button
                onClick={handleHint}
                disabled={hintsUsed >= maxHints || isStreaming || isEvaluating}
                className={cn(
                  "w-full p-3 rounded-lg border-2 transition-all",
                  hintsUsed < maxHints
                    ? "border-[var(--gold-dim)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 cursor-pointer"
                    : "border-[var(--muted)] opacity-50 cursor-not-allowed"
                )}
              >
                <FlaskConical className={cn(
                  "h-8 w-8 mx-auto mb-2",
                  hintsUsed < maxHints ? "text-[var(--gold)]" : "text-[var(--muted-foreground)]"
                )} />
                <p className="text-xs text-[var(--parchment-dark)]">Hint Potion</p>
                <p className="text-xs text-[var(--gold-dim)]">{maxHints - hintsUsed}/{maxHints}</p>
              </button>
            </div>

            {/* Second Chance Shield */}
            <div>
              <button
                onClick={handleShield}
                disabled={shieldsUsed >= maxShields || health >= 100}
                className={cn(
                  "w-full p-3 rounded-lg border-2 transition-all",
                  shieldsUsed < maxShields && health < 100
                    ? "border-[var(--gold-dim)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 cursor-pointer"
                    : "border-[var(--muted)] opacity-50 cursor-not-allowed"
                )}
              >
                <ShieldCheck className={cn(
                  "h-8 w-8 mx-auto mb-2",
                  shieldsUsed < maxShields ? "text-[var(--gold)]" : "text-[var(--muted-foreground)]"
                )} />
                <p className="text-xs text-[var(--parchment-dark)]">Health Shield</p>
                <p className="text-xs text-[var(--gold-dim)]">{maxShields - shieldsUsed}/{maxShields}</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
