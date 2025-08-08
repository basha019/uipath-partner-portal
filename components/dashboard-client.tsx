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

interface DashboardClientProps {
  assessment: { answers: any } | null;
  trainingPlan: { plan_details: any } | null;
}

export default function DashboardClient({ assessment, trainingPlan }: DashboardClientProps) {
  if (!assessment || !trainingPlan) {
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
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 justify-end">
        <a
          href="/assessment"
          onClick={(e) => {
            if (!confirm('Retake the assessment? This will overwrite your current training plan after you confirm the new plan.')) {
              e.preventDefault()
            }
          }}
          className="px-4 py-2 text-white bg-primary-orange rounded-md hover:opacity-90"
        >
          Retake Assessment
        </a>
        <a
          href="/planner"
          className="px-4 py-2 text-white bg-secondary-blue rounded-md hover:opacity-90"
        >
          Regenerate Plan
        </a>
      </div>
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
        <ul className="list-disc list-inside space-y-2">
          {trainingPlan.plan_details.recommendedTrainings.map((item: any) => (
            <li key={item.title} className="text-gray-600">
              {item.title} <span className="text-sm text-gray-500">({item.duration} hours)</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-4 border-t">
          <p className="text-dark-gray-900"><strong>Daily Commitment:</strong> {trainingPlan.plan_details.hoursPerDay} hours</p>
          <p className="text-dark-gray-900"><strong>Schedule:</strong> Includes weekends? {trainingPlan.plan_details.includeWeekends ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  )
}
