import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // If the user is logged in but has no role, redirect to role selection
    if (!profile || !profile.role) {
      redirect('/role-selection')
    } else {
      // If the user has a role, redirect to the dashboard
      redirect('/dashboard')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Welcome to the Partner Portal</h1>
        <p className="text-xl text-gray-600">Please <a href="/login" className="text-blue-600 hover:underline">log in</a> to continue.</p>
      </div>
    </main>
  )
}
