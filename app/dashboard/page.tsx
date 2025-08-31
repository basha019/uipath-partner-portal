import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard-client' // This component will be created next
import { assessmentQuestions } from '@/lib/questions'

export const dynamic = 'force-dynamic'
// Alternatively: export const revalidate = 0

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the latest assessment
  const { data: assessment } = await supabase
    .from('assessments')
    .select('answers')
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch the latest training plan
  const { data: trainingPlan } = await supabase
    .from('training_plans')
    .select('plan_details')
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch persona (role)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const persona = profile?.role || 'Unknown'

  // Scoring for Persona 1 – Leadership
  function getLeadingLetter(option: string | undefined) {
    if (!option) return undefined
    const m = option.trim().match(/^([A-D])\)/i)
    return m ? (m[1] as string).toUpperCase() : undefined
  }

  type Rec = { title: string; rationale: string }

  let scorecard: null | {
    persona: string
    total: number
    correct: number
    percent: number
    breakdown: Array<{ question: string; correct: boolean; userAnswer?: string; correctAnswer: string }>
    recommendations: Rec[]
  } = null

  if (assessment?.answers) {
    // Robust answer normalization
    const answersRaw = assessment.answers as Record<string, string>
    const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
    const answerMap = new Map<string, string>()
    Object.keys(answersRaw || {}).forEach((k) => {
      answerMap.set(normalize(k), answersRaw[k])
    })

    const buildScore = (
      questionsKey: string,
      correctByQuestion: Record<string, 'A' | 'B' | 'C' | 'D'>,
      personaLabel: string
    ) => {
      const qs: Array<{ question: string; type: string; options?: string[] }> = (assessmentQuestions as any)[
        questionsKey
      ] || []
      const mcQuestions = qs.filter((q) => q.type === 'multiple-choice')
      const toLetter = (ans: string | undefined, q: { options?: string[] }) => {
        if (!ans) return undefined
        const l1 = getLeadingLetter(ans)
        if (l1) return l1 as 'A' | 'B' | 'C' | 'D'
        const m2 = ans.trim().match(/^[A-D]$/i)
        if (m2) return ans.trim().toUpperCase() as 'A' | 'B' | 'C' | 'D'
        const idx = (q.options || []).findIndex((opt) => opt === ans)
        if (idx >= 0 && idx < 4) return String.fromCharCode(65 + idx) as 'A' | 'B' | 'C' | 'D'
        return undefined
      }
      const breakdown = mcQuestions.map((q) => {
        const userAnswer = answersRaw[q.question] ?? answerMap.get(normalize(q.question))
        const expectedLetter = correctByQuestion[q.question]
        const userLetter = toLetter(userAnswer, q)
        const correct = !!expectedLetter && userLetter === expectedLetter
        const correctAnswer = (q.options || []).find((opt) => getLeadingLetter(opt) === expectedLetter) || ''
        return { question: q.question, correct, userAnswer, correctAnswer }
      })
      const total = breakdown.length
      const correctCount = breakdown.filter((b) => b.correct).length
      const percent = total ? Math.round((correctCount / total) * 100) : 0
      return { persona: personaLabel, total, correct: correctCount, percent, breakdown, recommendations: [] as Rec[] }
    }

    const p = persona.toLowerCase()

    // Leadership (existing)
    if (/leadership|ceo|cto|cxo|practice\s*lead|alliances/.test(p)) {
      const key = 'Leadership (CEO, CTO, Practice Lead, Head of Alliances)'
      const correctByQuestion: Record<string, 'A' | 'B' | 'C' | 'D'> = {
        'Scenario: Your organization is considering a significant investment in a new Agentic Automation practice. A key client asks, “How will Agentic Automation fundamentally change our business operations and competitive landscape over the next 3–5 years, beyond just cost savings?” How would you respond?': 'C',
        'Scenario: A competitor is pitching to one of your top accounts, claiming their AI automation platform is “more future-ready” than UiPath. How do you respond?': 'B',
        'How would you ensure your team can deliver multiple large Agentic Automation projects at the same time?': 'B',
        'Which is the most strategic way to measure the success of your Agentic Automation practice?': 'C',
        'Scenario: Some senior managers believe Agentic Automation will disrupt existing revenue streams from traditional RPA. How do you address this?': 'B',
        'When presenting to an industry audience, what’s the most effective way to position UiPath’s Agentic Automation?': 'B',
        'If your team requests a large budget for UiPath training and certifications, what’s the best approach?': 'B',
        'Scenario: You are co-presenting with UiPath’s CEO at a global conference. What’s the best way to prepare?': 'B',
      }
      scorecard = buildScore(key, correctByQuestion, persona)
    }

    // Solution Architect / Developers
    else if (/(solution\s*architect|developer|technical\s*architect)/.test(p)) {
      const key = 'Solution Architect/ Developers'
      const correctByQuestion: Record<string, 'A' | 'B' | 'C' | 'D'> = {
        'Scenario: A client wants to process large volumes of unstructured documents using UiPath. What’s your best first step?': 'B',
        'Scenario: You’ve developed an industry-specific accelerator. How do you ensure it stays aligned with UiPath’s product roadmap?': 'B',
        'A client fears your UiPath solution won’t scale globally. How do you address this?': 'B',
        'When a developer suggests skipping UiPath best practices to meet a deadline, you:': 'B',
        'How do you prepare your team for integrating UiPath with AI/ML and cloud systems?': 'B',
        'Scenario: You’re asked to present technical progress to a client’s C-suite. How do you prepare?': 'B',
        'A bot’s performance drops after go-live. You:': 'B',
      }
      scorecard = buildScore(key, correctByQuestion, persona)
    }

    // Sales / Presales / Business Development
    else if (/(^|\s)(sales|pre\s*sales|presales|business\s*development|bd)(\s|$)/.test(p)) {
      const key = 'Sales/ Presales/ Business Development'
      const correctByQuestion: Record<string, 'A' | 'B' | 'C' | 'D'> = {
        'Scenario: A client says, “We’ve already tried RPA. Why bother with Agentic Automation?”': 'B',
        'A client doubts the ROI. You:': 'B',
        'Scenario: Your pipeline is weak. How do you find strong Agentic Automation prospects?': 'B',
        'When facing a direct competitor in a deal:': 'B',
        'You’ve been assigned to sell AI-heavy solutions but lack experience.': 'B',
        'Scenario: You need C-suite access in a strategic account.': 'B',
        'Your delivery team prefers old RPA approaches.': 'B',
      }
      scorecard = buildScore(key, correctByQuestion, persona)
    }

    // Delivery / Project Manager
    else if (/(delivery|project\s*manager|\bpm\b)/.test(p)) {
      const key = 'Delivery / Project Manager'
      const correctByQuestion: Record<string, 'A' | 'B' | 'C' | 'D'> = {
        'Scenario: Midway through deployment, an autonomous UiPath Agent identifies a new process variant with high ROI potential.': 'B',
        'When managing a program with multiple autonomous agents handling different processes:': 'B',
        'How do you explain Agentic Automation value to business leaders?': 'B',
        'When an autonomous agent starts making incorrect decisions:': 'B',
        'Your Agentic Automation rollout is part of a wider digital transformation.': 'B',
        'If your project needs AI-specialist input mid-stream:': 'B',
        'Post–go-live, your autonomous agents are stable. What’s next?': 'B',
        'When delivery teams are hesitant about AI-led work allocation:': 'B',
        'Scenario: Client complains that autonomous agents aren’t prioritizing tasks as expected.': 'B',
      }
      scorecard = buildScore(key, correctByQuestion, persona)
    }
  }

  return (
    <div className="min-h-screen bg-light-gray-100">
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <DashboardClient assessment={assessment} trainingPlan={trainingPlan} scorecard={scorecard} />
        </div>
      </main>
    </div>
  )
}
