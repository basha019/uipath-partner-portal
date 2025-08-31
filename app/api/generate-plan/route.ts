import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'

function heuristicPlan(persona: string) {
  const base: any = {
    recommendedTrainings: [] as Array<{ title: string; duration: number; rationale?: string }>,
    planSummary: '',
  }
  // Leadership
  if (/(leadership|ceo|cto|cxo|practice\s*lead|head\s*of\s*alliances|alliances)/i.test(persona)) {
    base.recommendedTrainings = [
      { title: 'Automation Strategy and Operating Model', duration: 6, rationale: 'Define vision, funding, operating model, and accountability.' },
      { title: 'Building and Scaling a Center of Excellence', duration: 5, rationale: 'Establish governance, roles, standards, and enablement at scale.' },
      { title: 'Value Realization and ROI for Automation', duration: 4, rationale: 'Track benefits, align to business KPIs, and communicate outcomes.' },
      { title: 'Governance, Risk, and Compliance in Automation', duration: 4, rationale: 'Mitigate risk and ensure compliant scaling across the enterprise.' },
      { title: 'Executive Stakeholder Alignment and Change Management', duration: 3, rationale: 'Drive adoption and stakeholder buy‑in across functions.' },
      { title: 'Partner and Ecosystem Co‑Selling Best Practices', duration: 3, rationale: 'Leverage alliances to accelerate value and reach.' },
    ]
    base.planSummary = 'Leadership focus on strategy, CoE, governance, and measurable value realization.'
  // Delivery / Project Manager
  } else if (/(delivery|project\s*manager|program\s*manager|\bpm\b)/i.test(persona)) {
    base.recommendedTrainings = [
      { title: 'Agile Delivery for Automation Projects', duration: 5, rationale: 'Apply Scrum/Kanban practices tailored for automation teams.' },
      { title: 'Backlog and Pipeline Management', duration: 4, rationale: 'Prioritize, groom, and track demand from discovery to delivery.' },
      { title: 'Estimation, Capacity and Resource Planning', duration: 3, rationale: 'Forecast throughput and balance workload across squads.' },
      { title: 'Risk, Issue and Dependency Management', duration: 3, rationale: 'Proactively manage cross‑team risks and dependencies.' },
      { title: 'Testing, Release and Change Management with UiPath', duration: 4, rationale: 'Orchestrate quality gates, releases, and rollback plans.' },
      { title: 'Value Realization and KPI Reporting', duration: 3, rationale: 'Measure adoption and outcomes, report program health.' },
    ]
    base.planSummary = 'Delivery emphasis: agile execution, risk/dependency control, and value tracking.'
  // Sales / Presales / Business Development
  } else if (/(sales|pre-sales|presales|business\s*development)/i.test(persona)) {
    base.recommendedTrainings = [
      { title: 'UiPath Value Selling Fundamentals', duration: 6, rationale: 'Strengthen discovery, objection handling, and ROI articulation.' },
      { title: 'Positioning UiPath Platform End-to-End', duration: 5, rationale: 'Confidently tell the full UiPath story tailored to customer outcomes.' },
      { title: 'Industry Use Cases for Automation', duration: 4, rationale: 'Map common automation scenarios to verticals and business value.' },
      { title: 'Demonstrations That Win Deals', duration: 3, rationale: 'Build short, outcome-first demos; avoid deep technical setup.' },
      { title: 'Competitive Landscape and Battlecards', duration: 3, rationale: 'Handle competitive positioning with clarity.' },
      { title: 'Partner Co‑Selling Best Practices', duration: 3, rationale: 'Collaborate effectively with UiPath field teams.' },
    ]
    base.planSummary = 'Commercial focus, minimal technical depth, strong discovery and demo excellence.'
  // Solution Architect / Developers
  } else if (/(architect|developer|solution\s*architect|technical)/i.test(persona)) {
    base.recommendedTrainings = [
      { title: 'UiPath Automation Developer Associate', duration: 12, rationale: 'Solidify development fundamentals and best practices.' },
      { title: 'REFramework Advanced Patterns', duration: 8, rationale: 'Harden solutions for scale, retries, and exception handling.' },
      { title: 'Orchestrator at Scale (Cloud/Hybrid)', duration: 6, rationale: 'Design for multi-tenant, security, and observability.' },
      { title: 'Document Understanding and AI Center', duration: 6, rationale: 'Infuse AI into end-to-end automations.' },
      { title: 'Solution Architecture and Governance', duration: 6, rationale: 'Blueprints, standards, and Center of Excellence.' },
      { title: 'Testing and CI/CD with UiPath', duration: 4, rationale: 'Shift-left quality and automated deployments.' },
    ]
    base.planSummary = 'Technical depth across architecture, REFramework, Orchestrator, and AI.'
  } else {
    base.recommendedTrainings = [
      { title: 'UiPath Platform Overview', duration: 4, rationale: 'Understand core capabilities and value.' },
      { title: 'Process Discovery to Delivery', duration: 4, rationale: 'End-to-end methodology from idea to impact.' },
      { title: 'Key UiPath Products and Use Cases', duration: 4, rationale: 'Map features to outcomes across roles.' },
      { title: 'Governance and Security Basics', duration: 3, rationale: 'Safeguard scale and compliance.' },
      { title: 'UiPath Academy Learning Paths', duration: 3, rationale: 'Select role-based courses to continue.' },
    ]
    base.planSummary = 'Balanced introduction with practical outcomes.'
  }
  return base
}

function extractJson(text: string): any | null {
  try {
    // Remove code fences if present
    const cleaned = text.replace(/^```[\s\S]*?\n|```$/g, '')
    const first = cleaned.indexOf('{')
    const last = cleaned.lastIndexOf('}')
    if (first >= 0 && last >= 0) {
      const slice = cleaned.slice(first, last + 1)
      return JSON.parse(slice)
    }
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  try {
    const { data: userRes } = await supabase.auth.getUser()
    const user = userRes.user
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { hoursPerDay = 2, includeWeekends = false } = await req.json()

    // Persona
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const persona = profile?.role || 'General'

    // Latest assessment answers
    const { data: assessment } = await supabase
      .from('assessments')
      .select('answers, submitted_at')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()

    const answers = assessment?.answers || {}

    // Build contextual info via Perplexity (optional)
    let context = ''
    const perplexityKey = process.env.PERPLEXITY_API_KEY
    if (perplexityKey) {
      const searchPrompt = `Provide a concise list of UiPath Academy courses or learning paths suitable for a ${persona} persona. Consider the following self-reported strengths/gaps: ${JSON.stringify(
        answers
      ).slice(0, 2000)}. Output short bullet points with course names/topics only.`
      const px = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${perplexityKey}`,
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content:
                'You retrieve concise, factual context about UiPath courses and topics. Prefer UiPath Academy resources.',
            },
            { role: 'user', content: searchPrompt },
          ],
        }),
      })
      if (px.ok) {
        const data = await px.json()
        context = data?.choices?.[0]?.message?.content || ''
      }
    }

    // Synthesize plan via Gemini (optional)
    let plan = heuristicPlan(persona)
    const geminiKey = process.env.GEMINI_API_KEY
    if (geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const prompt = `You are designing a role-based, response-aware UiPath training plan.
Persona: ${persona}
Assessment Answers (JSON): ${JSON.stringify(answers).slice(0, 6000)}
Daily hours available: ${hoursPerDay}
Include weekends: ${includeWeekends}

Context from retriever (optional, may be empty):
${context}

Return STRICT JSON only with this schema:
{
  "planSummary": string,
  "recommendedTrainings": [
    { "title": string, "duration": number, "rationale": string }
  ]
}

Rules:
- Optimize the list for the persona: Sales/Pre-Sales should emphasize discovery, demos, objections, value. Limit deep technical content.
- Technical Architect should emphasize REFramework, Orchestrator, CI/CD, AI Center, security and scale.
- Leadership should emphasize strategy and operating model, CoE, governance/risk/compliance, stakeholder alignment, and value realization.
- Delivery/Project Manager should emphasize agile delivery practices, backlog and estimation, risk/dependency management, testing and release/change management, and KPI reporting.
- 5–8 items. Duration estimates in hours, realistic for self-paced learning. Sum of durations should be feasible given hoursPerDay; stagger heavier items accordingly.
- Use UiPath terminology and neutral language. No marketing fluff.
- JSON only, no code fences.`

      const result = await model.generateContent(prompt)
      const text = (await result.response).text()
      const parsed = extractJson(text)
      if (parsed?.recommendedTrainings?.length) {
        plan = parsed
      }
    }

    return NextResponse.json({
      persona,
      hoursPerDay,
      includeWeekends,
      ...plan,
      source: { usedPerplexity: !!perplexityKey, usedGemini: !!geminiKey },
    })
  } catch (e) {
    console.error('generate-plan error:', e)
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 })
  }
}
