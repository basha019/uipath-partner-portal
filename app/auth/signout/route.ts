import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const supabase = createClient()
  try {
    await supabase.auth.signOut()
  } catch (e) {
    console.error('Server signout error:', e)
  }
  const url = new URL('/login', request.url)
  return NextResponse.redirect(url)
}
