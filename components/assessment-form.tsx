'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Question {
  question: string;
  type: 'multiple-choice' | 'text';
  options?: string[];
}

interface AssessmentFormProps {
  questions: Question[];
  userId: string;
}

export default function AssessmentForm({ questions, userId }: AssessmentFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const router = useRouter()
  const supabase = createClient()

  const handleAnswerChange = (question: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [question]: value }))
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    const { error } = await supabase
      .from('assessments')
      .upsert(
        { user_id: userId, answers, submitted_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )

    if (!error) {
      router.push('/planner') // Redirect to the planner page
    } else {
      console.error('Error submitting assessment:', error)
      const msg = (error as any)?.message || (error as any)?.details || 'Unknown error'
      alert(`There was an error submitting your assessment: ${msg}`)
    }
  }

  const currentQuestion = questions[currentStep]

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-dark-gray-900 mb-4">{currentQuestion.question}</h3>
        {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => {
              const letter = option.trim().charAt(0).toUpperCase()
              return (
                <label key={option} className="flex items-center p-3 rounded-lg bg-light-gray-100 hover:bg-gray-200 cursor-pointer">
                  <input
                    type="radio"
                    name={currentQuestion.question}
                    value={letter}
                    checked={answers[currentQuestion.question] === letter}
                    onChange={(e) => handleAnswerChange(currentQuestion.question, e.target.value)}
                    className="form-radio h-5 w-5 text-secondary-blue"
                  />
                  <span className="ml-3 text-dark-gray-900">{option}</span>
                </label>
              )
            })}
          </div>
        )}
        {currentQuestion.type === 'text' && (
          <textarea
            value={answers[currentQuestion.question] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.question, e.target.value)}
            className="w-full px-4 py-2 text-dark-gray-900 bg-light-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-blue"
            rows={4}
          />
        )}
      </div>
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-6 py-2 font-semibold text-white bg-gray-600 rounded-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {currentStep < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 font-semibold text-white bg-secondary-blue rounded-md hover:opacity-90"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 font-semibold text-white bg-primary-orange rounded-md hover:opacity-90"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  )
}
