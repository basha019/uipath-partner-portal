import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { assessmentQuestions } from '@/lib/questions'
import AssessmentForm from '@/components/assessment-form' // This component will be created next

export default async function AssessmentPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role) {
    redirect('/role-selection')
  }

  const questions = (assessmentQuestions as any)[profile.role] || []

  return (
    <div className="min-h-screen bg-light-gray-100 flex items-center justify-center">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-dark-gray-900">Partner Assessment</h1>
        <h2 className="text-xl text-center text-gray-600">Role: {profile.role}</h2>
        <AssessmentForm questions={questions} userId={user.id} />
      </div>
    </div>
  )
}
