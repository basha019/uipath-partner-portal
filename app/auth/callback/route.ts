import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM || 'UiPath Partner Portal <onboarding@resend.dev>'
const TEST_RECIPIENT = process.env.RESEND_TEST_RECIPIENT
const provider = process.env.EMAIL_PROVIDER || 'resend'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const type = searchParams.get('type')
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      try {
        if (type === 'signup') {
          const userEmail = (data as any)?.user?.email || (data as any)?.session?.user?.email
          if (!userEmail) {
            console.error('Could not determine user email after signup confirmation')
          } else {
            if (provider === 'smtp') {
              if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
                console.error('SMTP not configured for welcome email')
              } else {
                const transporter = nodemailer.createTransport({
                  host: process.env.SMTP_HOST,
                  port: Number(process.env.SMTP_PORT || '465'),
                  secure: process.env.SMTP_SECURE !== 'false',
                  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
                })
                const from = process.env.SMTP_FROM || process.env.SMTP_USER!
                await transporter.sendMail({
                  from,
                  to: [userEmail],
                  cc: ['fatha.basha@gmail.com'],
                  subject: 'Welcome to the UiPath Partner Enablement Portal',
                  html: `
                    <h2>Welcome to the UiPath Partner Enablement Portal</h2>
                    <p>Your account has been confirmed successfully.</p>
                    <p>You can now sign in and start your partner assessment and training journey.</p>
                    <p>Best regards,<br/>The UiPath Partner Team</p>
                  `,
                })
              }
            } else {
              if (!process.env.RESEND_API_KEY) {
                console.error('RESEND_API_KEY is not configured (auth/callback)')
              } else {
                const to = TEST_RECIPIENT ? [TEST_RECIPIENT] : [userEmail]
                const cc = TEST_RECIPIENT ? undefined : ['fatha.basha@gmail.com']
                await resend.emails.send({
                  from: FROM,
                  to,
                  ...(cc ? { cc } : {}),
                  subject: 'Welcome to the UiPath Partner Enablement Portal',
                  html: `
                    <h2>Welcome to the UiPath Partner Enablement Portal</h2>
                    <p>Your account has been confirmed successfully.</p>
                    <p>You can now sign in and start your partner assessment and training journey.</p>
                    <p>Best regards,<br/>The UiPath Partner Team</p>
                  `,
                })
              }
            }
          }
        }
      } catch (e) {
        console.error('Welcome email send failed:', e)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
