'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

// Placeholder training data
const recommendedTrainings = [
  { title: 'UiPath Automation Developer Associate Training', duration: 20 },
  { title: 'Advanced REFramework Concepts', duration: 15 },
  { title: 'UiPath AI Center Deep Dive', duration: 10 },
  { title: 'Effective Solution Architecture', duration: 12 },
]

export default function PlannerPage() {
  const [user, setUser] = useState<User | null>(null)
  const [hoursPerDay, setHoursPerDay] = useState(2)
  const [includeWeekends, setIncludeWeekends] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // New: local plan state from AI
  // Start with an empty list so we don't show a placeholder plan while generating
  const [planTrainings, setPlanTrainings] = useState<any[]>([])
  const [planSummary, setPlanSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUser(data.user)
      } else {
        router.push('/login')
      }
    }
    getUser()
  }, [supabase, router])

  // New: generate plan via API
  const generatePlan = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoursPerDay, includeWeekends }),
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || 'Failed to generate plan')
      }
      const data = await res.json()
      setPlanTrainings(Array.isArray(data.recommendedTrainings) ? data.recommendedTrainings : [])
      setPlanSummary(typeof data.planSummary === 'string' ? data.planSummary : null)
    } catch (e: any) {
      setError(e?.message || 'Failed to generate plan')
      // Do not show placeholder plan on error
      setPlanTrainings([])
      setPlanSummary(null)
    } finally {
      setLoading(false)
    }
  }

  // Generate once when user is available
  useEffect(() => {
    if (user) {
      generatePlan()
    }
  }, [user])

  const handleConfirmAndSend = async () => {
    if (!user) return;

    // Snapshot current values to avoid race conditions with async state updates
    const planToSave = Array.isArray(planTrainings) ? [...planTrainings] : []
    const planSummaryToSave = planSummary
    const hoursToSave = hoursPerDay
    const includeWeekendsToSave = includeWeekends

    // Save training plan to database
    const { error: saveError } = await supabase
      .from('training_plans')
      .upsert(
        {
          user_id: user.id,
          plan_details: {
            recommendedTrainings: planToSave,
            hoursPerDay: hoursToSave,
            includeWeekends: includeWeekendsToSave,
            ...(planSummaryToSave ? { planSummary: planSummaryToSave } : {}),
          },
          generated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (saveError) {
      console.error('Error saving training plan:', saveError);
      return;
    }

    // Send email with training plan
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          trainingPlan: planToSave,
          hoursPerDay: hoursToSave,
          includeWeekends: includeWeekendsToSave,
          planSummary: planSummaryToSave,
        }),
      });

      if (response.ok) {
        alert('Training plan saved and sent to your email successfully!');
      } else {
        let details: any = null
        try { details = await response.json() } catch {}
        console.error('Email API failed', { status: response.status, details })
        const msg = details?.errorMessage || details?.details || details?.error || details?.errorData?.message || 'Please check your email settings.'
        if (!details?.errorMessage && !details?.details && !details?.error && !details?.errorData?.message) {
          try { alert(`Training plan saved, but failed to send email. ${JSON.stringify(details)}`); return } catch {}
        }
        alert(`Training plan saved, but failed to send email. ${msg}`)
      }
    } catch (error) {
      console.error('Email sending error:', error);
      alert('Training plan saved, but failed to send email. Please try again later.');
    }

    // Redirect to dashboard
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-light-gray-100 flex items-center justify-center">
      <div className="w-full max-w-3xl p-8 space-y-8 bg-white rounded-lg shadow-xl">
        <div className="flex justify-end gap-2">
          <button
            onClick={generatePlan}
            disabled={loading}
            className="px-3 py-1 text-sm font-medium text-white bg-secondary-blue rounded-md hover:opacity-90 disabled:opacity-70"
          >
            {loading ? 'Generating…' : 'Regenerate with AI'}
          </button>
          <a href="/dashboard" className="px-3 py-1 text-sm font-medium text-white bg-gray-700 rounded-md hover:opacity-90">Close</a>
        </div>
        <h1 className="text-3xl font-bold text-center text-dark-gray-900">Your Personalized Training Plan</h1>
        {error && (
          <div className="text-sm text-red-600 text-center">{error}</div>
        )}
        {!loading && planSummary && (
          <p className="text-center text-gray-700">{planSummary}</p>
        )}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-dark-gray-900">Recommended Trainings:</h2>
          {loading ? (
            <div className="text-sm text-gray-500">Generating your plan…</div>
          ) : planTrainings.length > 0 ? (
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {planTrainings.map((training: any) => (
                <li key={training.title}>
                  {training.title} ({training.duration} hours)
                  {training.rationale && (
                    <div className="text-sm text-gray-500">{training.rationale}</div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">No plan yet. Click "Regenerate with AI" to try again.</div>
          )}
        </div>
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <label htmlFor="hours" className="text-lg text-dark-gray-900">How many hours can you commit per day?</label>
            <input
              type="number"
              id="hours"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-24 px-3 py-2 text-center text-dark-gray-900 bg-light-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-blue"
              min="1"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="weekends"
              checked={includeWeekends}
              onChange={(e) => setIncludeWeekends(e.target.checked)}
              className="h-5 w-5 text-secondary-blue border-gray-300 rounded focus:ring-secondary-blue"
            />
            <label htmlFor="weekends" className="ml-3 text-lg text-dark-gray-900">Include weekends in my plan</label>
          </div>
        </div>
        <div className="text-center pt-6">
          <button
            onClick={handleConfirmAndSend}
            disabled={loading || planTrainings.length === 0}
            className="w-full px-6 py-3 font-semibold text-white bg-primary-orange rounded-md hover:opacity-90 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange"
          >
            {loading ? 'Please wait…' : 'Confirm & Send Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}
