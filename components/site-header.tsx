'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/logout-button'

export default function SiteHeader() {
  const pathname = usePathname()

  // Hide header on the login/signup page
  if (pathname?.startsWith('/login') || pathname?.startsWith('/auth')) {
    return null
  }

  return (
    <header className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto py-1 px-3 sm:px-4 lg:px-6">
        <div className="grid grid-cols-3 items-center">
          {/* Left: Dashboard link */}
          <div className="justify-self-start">
            <Link href="/dashboard" className="text-gray-900 font-semibold text-base sm:text-lg hover:opacity-90">
              Dashboard
            </Link>
          </div>

          {/* Center: Logo */}
          <div className="justify-self-center">
            <Link href="/dashboard" aria-label="Go to Dashboard" className="inline-flex items-center">
              <Image
                src="/images/uipath-agentic-automation.jpg"
                alt="UiPath Agentic Automation"
                width={100}
                height={50}
                priority
              />
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="justify-self-end flex items-center gap-2">
            <Link
              href="/assessment"
              className="px-3.5 py-1.5 text-base font-medium text-black bg-primary-orange rounded-md hover:opacity-90"
            >
              Retake Assessment
            </Link>
            <Link
              href="/planner"
              className="px-3.5 py-1.5 text-base font-medium text-black bg-secondary-blue rounded-md hover:opacity-90"
            >
              Regenerate Plan
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
