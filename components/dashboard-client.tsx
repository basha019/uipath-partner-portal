'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

// Placeholder data for charts
const radarChartData = [
  { subject: 'Sales Skills', A: 120, B: 110, fullMark: 150 },
  { subject: 'Technical Knowledge', A: 98, B: 130, fullMark: 150 },
  { subject: 'Product Positioning', A: 86, B: 130, fullMark: 150 },
  { subject: 'Consulting Acumen', A: 99, B: 100, fullMark: 150 },
  { subject: 'Project Management', A: 85, B: 90, fullMark: 150 },
  { subject: 'Leadership', A: 65, B: 85, fullMark: 150 },
];

const barChartData = [
  { name: 'Technical Skills', 'Current Level': 65, 'Target Level': 85 },
  { name: 'Product Knowledge', 'Current Level': 70, 'Target Level': 90 },
  { name: 'Sales Methodology', 'Current Level': 45, 'Target Level': 80 },
  { name: 'Industry Expertise', 'Current Level': 55, 'Target Level': 75 },
  { name: 'Leadership', 'Current Level': 60, 'Target Level': 85 },
];

interface ScorecardRec { title: string; rationale: string }
interface Scorecard {
  persona: string
  total: number
  correct: number
  percent: number
  breakdown: Array<{ question: string; correct: boolean; userAnswer?: string; correctAnswer: string }>
  recommendations: ScorecardRec[]
}

interface DashboardClientProps {
  assessment: { answers: any } | null;
  trainingPlan: { plan_details: any } | null;
  scorecard?: Scorecard | null;
}

export default function DashboardClient({ assessment, trainingPlan, scorecard }: DashboardClientProps) {
  if (!assessment && !trainingPlan) {
    return (
      <div className="text-center py-12 bg-white p-8 rounded-lg shadow-md">
        <p className="text-lg text-dark-gray-900">Welcome to your dashboard!</p>
        <p className="text-md text-gray-600">Complete your assessment to see your personalized results and training plan.</p>
        <a href="/assessment" className="mt-4 inline-block px-6 py-2 text-white bg-primary-orange rounded-md hover:opacity-90">
          Start Assessment
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Assessment Scorecard */}
      {scorecard && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2 text-dark-gray-900">Assessment Results</h3>
          <p className="text-gray-700 mb-1"><strong>Persona:</strong> {scorecard.persona}</p>
          <p className="text-gray-700 mb-4"><strong>Score:</strong> {scorecard.percent}% ({scorecard.correct}/{scorecard.total})</p>

          {scorecard.recommendations.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold text-md text-dark-gray-900 mb-2">Assessment-based Recommendations</h4>
              <ul className="list-disc list-inside space-y-1">
                {scorecard.recommendations.map((r) => (
                  <li key={r.title} className="text-gray-700">
                    {r.title}
                    {r.rationale && <div className="text-sm text-gray-500">{r.rationale}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions moved to header in app/dashboard/page.tsx */}
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-4 text-dark-gray-900">Competency Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Your Score" dataKey="A" stroke="#0061F2" fill="#0061F2" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-4 text-dark-gray-900">Skills Gap Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Current Level" fill="#112B4E" />
              <Bar dataKey="Target Level" fill="#0061F2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Training Plan Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-4 text-dark-gray-900">Your Training Plan</h3>
        {trainingPlan?.plan_details?.planSummary && (
          <p className="text-gray-700 mb-4">{trainingPlan.plan_details.planSummary}</p>
        )}
        {trainingPlan?.plan_details?.recommendedTrainings && (
          <ul className="list-disc list-inside space-y-2">
            {trainingPlan.plan_details.recommendedTrainings.map((item: any) => (
              <li key={item.title} className="text-gray-600">
                {item.title} <span className="text-sm text-gray-500">({item.duration} hours)</span>
                {item.rationale && (
                  <div className="text-sm text-gray-500">{item.rationale}</div>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 pt-4 border-t">
          <p className="text-dark-gray-900"><strong>Daily Commitment:</strong> {trainingPlan?.plan_details?.hoursPerDay ?? '-'} hours</p>
          <p className="text-dark-gray-900"><strong>Schedule:</strong> Includes weekends? {trainingPlan?.plan_details?.includeWeekends ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  )
}
