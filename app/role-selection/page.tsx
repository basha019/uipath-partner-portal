'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function RoleSelectionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      console.log('Fetching user data...') // Debug log
      const { data: { user } } = await supabase.auth.getUser()
      console.log('User data:', user) // Debug log
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const handleRoleSelect = async (role: string) => {
    console.log('Role selected:', role) // Debug log
    console.log('Current user:', user) // Debug log
    
    if (!user) {
      console.error('User not found, redirecting to login.')
      router.push('/login')
      return
    }

    console.log('Updating user profile with role:', role) // Debug log
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, role: role })

    if (error) {
      console.error('Error updating role:', error)
    } else {
      console.log('Role updated successfully, redirecting...') // Debug log
      router.push('/')
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-800">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-red-600">No user found. Please log in.</p>
        <button 
          onClick={() => router.push('/login')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Select Your Role</h1>
        <p className="text-lg text-gray-600 mb-12">This will help us personalize your assessment and training plan.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={() => handleRoleSelect('Leadership (CEO, CTO, Practice Lead, Head of Alliances)')} 
            className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <h2 className="text-2xl font-semibold text-blue-900">Leadership (CEO, CTO, Practice Lead, Head of Alliances)</h2>
          </button>
          <button 
            onClick={() => handleRoleSelect('Solution Architect/ Developers')} 
            className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <h2 className="text-2xl font-semibold text-blue-600">Solution Architect/ Developers</h2>
          </button>
          <button 
            onClick={() => handleRoleSelect('Sales/ Presales/ Business Development')} 
            className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <h2 className="text-2xl font-semibold text-orange-500">Sales/ Presales/ Business Development</h2>
          </button>
          <button 
            onClick={() => handleRoleSelect('Delivery / Project Manager')} 
            className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <h2 className="text-2xl font-semibold text-emerald-600">Delivery / Project Manager</h2>
          </button>
        </div>
      </div>
    </div>
  )
}
