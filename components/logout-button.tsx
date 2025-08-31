'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try { await supabase.auth.signOut() } catch {}
    try { await fetch('/auth/signout', { method: 'GET', cache: 'no-store' }) } catch {}
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="px-3.5 py-1.5 text-base font-semibold text-white bg-primary-orange rounded-md hover:opacity-90"
    >
      Logout
    </button>
  )
}
