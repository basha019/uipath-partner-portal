import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard-client' // This component will be created next

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

  return (
    <div className="min-h-screen bg-light-gray-100">
      <header className="bg-primary-blue shadow-md">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <DashboardClient assessment={assessment} trainingPlan={trainingPlan} />
        </div>
      </main>
    </div>
  )
}
