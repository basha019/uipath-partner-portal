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

  const handleConfirmAndSend = async () => {
    if (!user) return;

    // Save training plan to database
    const { error: saveError } = await supabase
      .from('training_plans')
      .upsert(
        {
          user_id: user.id,
          plan_details: {
            recommendedTrainings,
            hoursPerDay,
            includeWeekends,
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
          trainingPlan: recommendedTrainings,
          hoursPerDay,
          includeWeekends,
        }),
      });

      if (response.ok) {
        alert('Training plan saved and sent to your email successfully!');
      } else {
        alert('Training plan saved, but failed to send email. Please check your email settings.');
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
        <h1 className="text-3xl font-bold text-center text-dark-gray-900">Your Personalized Training Plan</h1>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-dark-gray-900">Recommended Trainings:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {recommendedTrainings.map((training) => (
              <li key={training.title}>
                {training.title} ({training.duration} hours)
              </li>
            ))}
          </ul>
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
            className="w-full px-6 py-3 font-semibold text-white bg-primary-orange rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange"
          >
            Confirm & Send Plan
          </button>
        </div>
      </div>
    </div>
  )
}
