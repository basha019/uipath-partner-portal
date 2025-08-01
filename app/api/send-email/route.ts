import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, trainingPlan, hoursPerDay, includeWeekends } = await req.json();

    if (!email || !trainingPlan) {
      return NextResponse.json({ error: 'Email and training plan are required' }, { status: 400 });
    }

    const trainingList = trainingPlan.map((training: any) => 
      `• ${training.title} (${training.duration} hours)`
    ).join('\n');

    const emailContent = `
      <h2>Your Personalized UiPath Partner Training Plan</h2>
      
      <p>Congratulations on completing your partner assessment! Based on your responses, we've created a customized training plan to help you excel in your role.</p>
      
      <h3>Recommended Training Courses:</h3>
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${trainingPlan.map((training: any) => 
          `<div style="margin-bottom: 10px;">
            <strong>${training.title}</strong><br>
            <span style="color: #64748B;">Duration: ${training.duration} hours</span>
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
    `;

    const { data, error } = await resend.emails.send({
      from: 'UiPath Partner Portal <onboarding@resend.dev>', // Using Resend's test domain
      to: [email],
      subject: 'Your Personalized UiPath Partner Training Plan',
      html: emailContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: data?.id });

  } catch (error) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
