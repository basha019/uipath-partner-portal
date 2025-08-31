import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const provider = process.env.EMAIL_PROVIDER || 'resend'
    if (provider === 'resend' && !process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const body = await req.json()
    let { email, trainingPlan, hoursPerDay, includeWeekends, planSummary } = body || {}
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Fallback: if training plan is not provided, fetch the latest saved plan for the current user
    if (!Array.isArray(trainingPlan) || trainingPlan.length === 0) {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: planRow } = await supabase
          .from('training_plans')
          .select('plan_details')
          .eq('user_id', user.id)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single()

        const details = (planRow as any)?.plan_details
        if (details) {
          trainingPlan = details.recommendedTrainings || []
          hoursPerDay = details.hoursPerDay
          includeWeekends = details.includeWeekends
          planSummary = details.planSummary
        }
      }
    }

    if (!Array.isArray(trainingPlan) || trainingPlan.length === 0) {
      return NextResponse.json({ error: 'Training plan not found for user' }, { status: 400 })
    }

    const trainingList = trainingPlan.map((training: any) => 
      `• ${training.title} (${training.duration} hours)`
    ).join('\n')

    const emailContent = `
      <h2>Your Personalized UiPath Partner Training Plan</h2>
      
      <p>Congratulations on completing your partner assessment! Based on your responses, we've created a customized training plan to help you excel in your role.</p>
      ${planSummary ? `<p style="color:#334155;">${planSummary}</p>` : ''}
      
      <h3>Recommended Training Courses:</h3>
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${trainingPlan.map((training: any) => 
          `<div style="margin-bottom: 12px;">
            <strong>${training.title}</strong><br>
            <span style="color: #64748B;">Duration: ${training.duration} hours</span>
            ${training.rationale ? `<div style="color:#64748B; font-size: 13px; margin-top: 4px;">Why: ${training.rationale}</div>` : ''}
          </div>`
        ).join('')}
      </div>
      
      <h3>Your Schedule Preferences:</h3>
      <ul>
        <li><strong>Daily Commitment:</strong> ${hoursPerDay} hours per day</li>
        <li><strong>Weekend Training:</strong> ${includeWeekends ? 'Yes' : 'No'}</li>
      </ul>
      
      <p>To get started with your training journey, please visit the <a href="https://www.uipath.com/learning" style="color: #FF6400;">UiPath Academy</a>.</p>
      
      <p>If you have any questions about your training plan, please don't hesitate to reach out to your partner success manager.</p>
      
      <p>Best regards,<br>
      The UiPath Partner Team</p>
    `

    if (provider === 'smtp') {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('SMTP is not configured properly')
        return NextResponse.json({ error: 'SMTP not configured', details: 'Missing SMTP_HOST/SMTP_USER/SMTP_PASS' }, { status: 500 })
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE !== 'false',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })

      const from = process.env.SMTP_FROM || process.env.SMTP_USER!

      try {
        const info = await transporter.sendMail({
          from,
          to: [email],
          cc: ['fatha.basha@gmail.com'],
          subject: 'Your Personalized UiPath Partner Training Plan',
          html: emailContent,
        })
        return NextResponse.json({ success: true, messageId: info.messageId, provider: 'smtp' })
      } catch (e) {
        console.error('SMTP send error:', e)
        let details = ''
        try { details = JSON.stringify(e) } catch { details = String(e) }
        return NextResponse.json({ error: 'Failed to send email', details }, { status: 500 })
      }
    } else {
      // Test-mode override: if RESEND_TEST_RECIPIENT is set, send only to that address
      const TEST_RECIPIENT = process.env.RESEND_TEST_RECIPIENT
      const to = TEST_RECIPIENT ? [TEST_RECIPIENT] : [email]
      const cc = TEST_RECIPIENT ? undefined : ['fatha.basha@gmail.com']

      const { data, error } = await resend.emails.send({
        from: 'UiPath Partner Portal <onboarding@resend.dev>', // Using Resend's test domain
        to,
        ...(cc ? { cc } : {}),
        subject: 'Your Personalized UiPath Partner Training Plan',
        html: emailContent,
      })

      if (error) {
        console.error('Resend error:', error)
        let details = ''
        try { details = JSON.stringify(error) } catch { details = String(error) }
        return NextResponse.json({ error: 'Failed to send email', details }, { status: 500 })
      }

      return NextResponse.json({ success: true, emailId: data?.id, testMode: !!TEST_RECIPIENT })
    }

  } catch (error) {
    console.error('Email API Error:', error)
    const message = (error as any)?.message || 'An internal server error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
