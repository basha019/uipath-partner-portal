// Role-based assessment questions (4 personas)

// Persona 1 – Leadership (CEO, CTO, Practice Lead, Head of Alliances)
const leadershipQuestions = [
  {
    question:
      'Scenario: Your organization is considering a significant investment in a new Agentic Automation practice. A key client asks, “How will Agentic Automation fundamentally change our business operations and competitive landscape over the next 3–5 years, beyond just cost savings?” How would you respond?',
    type: 'multiple-choice',
    options: [
      'A) Focus on immediate cost reduction and efficiency gains through task automation.',
      'B) Explain the technical capabilities of Agentic Automation and its integration with existing systems.',
      'C) Describe how Agentic Automation enables new business models, enhances decision-making with AI, and creates a more adaptive enterprise, citing specific industry examples. ',
      'D) Refer them to a technical expert within your team for a detailed explanation.',
    ],
  },
  {
    question:
      'Scenario: A competitor is pitching to one of your top accounts, claiming their AI automation platform is “more future-ready” than UiPath. How do you respond?',
    type: 'multiple-choice',
    options: [
      'A) Emphasize UiPath’s current market share and customer base.',
      'B) Highlight UiPath’s AI roadmap, ecosystem partnerships, and proven enterprise results with measurable ROI. ',
      'C) Offer a discount to retain the client.',
      'D) Avoid direct comparison and focus on your company’s internal strengths.',
    ],
  },
  {
    question: 'How would you ensure your team can deliver multiple large Agentic Automation projects at the same time?',
    type: 'multiple-choice',
    options: [
      'A) Hire contractors for each project.',
      'B) Build a certified internal talent pool, cross-train staff, and use UiPath partner resources when needed. ',
      'C) Limit the number of projects to match current staff capacity.',
      'D) Outsource all delivery to third parties.',
    ],
  },
  {
    question: 'Which is the most strategic way to measure the success of your Agentic Automation practice?',
    type: 'multiple-choice',
    options: [
      'A) Number of bots deployed.',
      'B) Hours saved in operations.',
      'C) Business outcomes achieved (e.g., revenue growth, faster time-to-market) and client satisfaction. ',
      'D) Number of certifications completed.',
    ],
  },
  {
    question:
      'Scenario: Some senior managers believe Agentic Automation will disrupt existing revenue streams from traditional RPA. How do you address this?',
    type: 'multiple-choice',
    options: [
      'A) Avoid the topic to prevent conflict.',
      'B) Show how Agentic Automation can expand offerings, open new markets, and increase client lifetime value. ',
      'C) Reassure them that RPA will remain unchanged.',
      'D) Delay Agentic Automation adoption until RPA demand drops.',
    ],
  },
  {
    question:
      'When presenting to an industry audience, what’s the most effective way to position UiPath’s Agentic Automation?',
    type: 'multiple-choice',
    options: [
      'A) Focus on technical specifications.',
      'B) Share client success stories with measurable business impact and industry relevance. ',
      'C) Use generic AI trends without specifics.',
      'D) Talk about your company’s history in automation.',
    ],
  },
  {
    question:
      'If your team requests a large budget for UiPath training and certifications, what’s the best approach?',
    type: 'multiple-choice',
    options: [
      'A) Approve without review.',
      'B) Ask for a clear ROI projection linked to business goals and client demand. ',
      'C) Reduce the budget to save costs.',
      'D) Delay decision until next fiscal year.',
    ],
  },
  {
    question:
      'Scenario: You are co-presenting with UiPath’s CEO at a global conference. What’s the best way to prepare?',
    type: 'multiple-choice',
    options: [
      'A) Memorize technical details of UiPath’s platform.',
      'B) Align on key strategic messages, industry examples, and your joint vision for the market. ',
      'C) Prepare a generic company overview.',
      'D) Let UiPath lead and speak only if asked.',
    ],
  },
  {
    question:
      'What other strategic or operational challenges do you foresee in scaling Agentic Automation in your organization?',
    type: 'text',
  },
];

const saDevQuestions = [
  {
    question:
      'Scenario: A client wants to process large volumes of unstructured documents using UiPath. What’s your best first step?',
    type: 'multiple-choice',
    options: [
      'A) Recommend immediate full deployment.',
      'B) Build a proof-of-concept using UiPath Document Understanding to validate accuracy and performance. ',
      'C) Ask the client to handle document processing manually first.',
      'D) Use only OCR tools without UiPath capabilities.',
    ],
  },
  {
    question:
      'Scenario: You’ve developed an industry-specific accelerator. How do you ensure it stays aligned with UiPath’s product roadmap?',
    type: 'multiple-choice',
    options: [
      'A) Assume your design will remain relevant for years.',
      'B) Regularly review UiPath release notes, join partner tech sessions, and adjust the accelerator accordingly. ',
      'C) Wait until a client requests a change.',
      'D) Stop updating once the first version works.',
    ],
  },
  {
    question: 'A client fears your UiPath solution won’t scale globally. How do you address this?',
    type: 'multiple-choice',
    options: [
      'A) Reassure them without evidence.',
      'B) Present architecture diagrams, load testing results, and examples of similar global deployments. ',
      'C) Suggest limiting usage to one location.',
      'D) Avoid the question.',
    ],
  },
  {
    question: 'When a developer suggests skipping UiPath best practices to meet a deadline, you:',
    type: 'multiple-choice',
    options: [
      'A) Approve if it speeds delivery.',
      'B) Explain risks of technical debt and find a compromise that meets timelines without skipping standards. ',
      'C) Ignore the suggestion.',
      'D) Cancel the project.',
    ],
  },
  {
    question: 'How do you prepare your team for integrating UiPath with AI/ML and cloud systems?',
    type: 'multiple-choice',
    options: [
      'A) Let them learn on the job.',
      'B) Enroll them in UiPath advanced AI/ML integration training and set up internal labs. ',
      'C) Outsource all AI/ML components.',
      'D) Avoid AI/ML features.',
    ],
  },
  {
    question:
      'Scenario: You’re asked to present technical progress to a client’s C-suite. How do you prepare?',
    type: 'multiple-choice',
    options: [
      'A) Dive into every technical detail possible.',
      'B) Focus on how technical progress supports business outcomes, using simple visuals. ',
      'C) Let your PM handle it without your input.',
      'D) Send a written report instead.',
    ],
  },
  {
    question: 'A bot’s performance drops after go-live. You:',
    type: 'multiple-choice',
    options: [
      'A) Restart the bot and hope it fixes itself.',
      'B) Investigate root cause, check logs, optimize code, and adjust resources. ',
      'C) Wait for the client to complain again.',
      'D) Replace the bot entirely.',
    ],
  },
  {
    question:
      'What technical challenges or opportunities do you think UiPath should address to better support your solutions?',
    type: 'text',
  },
];

const salesBdQuestions = [
  {
    question:
      'Scenario: A client says, “We’ve already tried RPA. Why bother with Agentic Automation?”',
    type: 'multiple-choice',
    options: [
      'A) Explain it’s just a newer version of RPA.',
      'B) Show how Agentic Automation combines AI, decision-making, and adaptability to deliver business transformation beyond RPA. ',
      'C) Offer a discount.',
      'D) Tell them to trust UiPath’s brand.',
    ],
  },
  {
    question: 'A client doubts the ROI. You:',
    type: 'multiple-choice',
    options: [
      'A) Ignore the objection.',
      'B) Use industry case studies and ROI calculators to demonstrate measurable benefits. ',
      'C) Say savings will come “eventually.”',
      'D) Drop the topic.',
    ],
  },
  {
    question:
      'Scenario: Your pipeline is weak. How do you find strong Agentic Automation prospects?',
    type: 'multiple-choice',
    options: [
      'A) Target everyone in your network.',
      'B) Use ICP profiles, look for industries with high process complexity, and partner with UiPath for warm introductions. ',
      'C) Wait for inbound leads only.',
      'D) Contact only existing RPA clients.',
    ],
  },
  {
    question: 'When facing a direct competitor in a deal:',
    type: 'multiple-choice',
    options: [
      'A) Criticize their weaknesses without proof.',
      'B) Highlight UiPath’s proven deployments, AI roadmap, and co-innovation track record. ',
      'C) Ignore the competition.',
      'D) Offer lower prices.',
    ],
  },
  {
    question: 'You’ve been assigned to sell AI-heavy solutions but lack experience.',
    type: 'multiple-choice',
    options: [
      'A) Avoid AI-heavy deals.',
      'B) Complete UiPath’s advanced technical sales training and shadow experienced sellers. ',
      'C) Guess and hope for the best.',
      'D) Ask a tech colleague to handle all AI deals alone.',
    ],
  },
  {
    question:
      'Scenario: You need C-suite access in a strategic account.',
    type: 'multiple-choice',
    options: [
      'A) Call reception and ask for the CEO.',
      'B) Work with UiPath’s alliance manager and leverage joint success stories for an introduction. ',
      'C) Send a cold LinkedIn message.',
      'D) Skip executive contact.',
    ],
  },
  {
    question: 'Your delivery team prefers old RPA approaches.',
    type: 'multiple-choice',
    options: [
      'A) Ignore them.',
      'B) Show how Agentic Automation can open bigger deals and longer-term contracts. ',
      'C) Force them to use the new approach without explanation.',
      'D) Delay the transition.',
    ],
  },
  {
    question:
      'What customer objections or deal blockers do you encounter most often when selling Agentic Automation?',
    type: 'text',
  },
];

const deliveryPmQuestions = [
  {
    question:
      'Scenario: Midway through deployment, an autonomous UiPath Agent identifies a new process variant with high ROI potential.',
    type: 'multiple-choice',
    options: [
      'A) Approve immediate integration without review.',
      'B) Run an impact and ROI assessment, adjust backlog/priorities, and formally agree changes with the client.',
      'C) Ignore until post–go-live.',
      'D) Ask dev team to handle quietly.',
    ],
  },
  {
    question:
      'When managing a program with multiple autonomous agents handling different processes:',
    type: 'multiple-choice',
    options: [
      'A) Let them run independently with no orchestration.',
      'B) Use UiPath Orchestrator & Communications Mining to coordinate workflows, prevent conflicts, and balance load.',
      'C) Merge all into one bot for simplicity.',
      'D) Disable inter-agent communication.',
    ],
  },
  {
    question: 'How do you explain Agentic Automation value to business leaders?',
    type: 'multiple-choice',
    options: [
      'A) Talk only about AI algorithms.',
      'B) Show clear metrics: cycle time reduction, autonomous task completion %, and reduced human intervention hours.',
      'C) Present raw technical logs.',
      'D) Avoid talking about AI specifics.',
    ],
  },
  {
    question: 'When an autonomous agent starts making incorrect decisions:',
    type: 'multiple-choice',
    options: [
      'A) Switch it off permanently.',
      'B) Use UiPath Test Suite and governance controls to identify the root cause and retrain or update agent logic.',
      'C) Leave it running for now.',
      'D) Roll back to manual processing only.',
    ],
  },
  {
    question: 'Your Agentic Automation rollout is part of a wider digital transformation.',
    type: 'multiple-choice',
    options: [
      'A) Keep it siloed to avoid complexity.',
      'B) Integrate with ERP/CRM systems and ensure alignment of agents’ actions with other transformation streams.',
      'C) Limit integration to back-office only.',
      'D) Delay until other streams finish.',
    ],
  },
  {
    question: 'If your project needs AI-specialist input mid-stream:',
    type: 'multiple-choice',
    options: [
      'A) Ignore and continue.',
      'B) Reallocate talent and request support from UiPath’s AI Center–trained partner network.',
      'C) Wait for post–go-live fixes.',
      'D) Pause until you can hire.',
    ],
  },
  {
    question: 'Post–go-live, your autonomous agents are stable. What’s next?',
    type: 'multiple-choice',
    options: [
      'A) Stop monitoring.',
      'B) Set up continuous performance tracking and feedback loops to improve agent decision-making over time.',
      'C) Freeze configurations permanently.',
      'D) Replace with new bots.',
    ],
  },
  {
    question: 'When delivery teams are hesitant about AI-led work allocation:',
    type: 'multiple-choice',
    options: [
      'A) Force adoption immediately.',
      'B) Showcase examples of human–AI collaboration from similar UiPath deployments to build confidence.',
      'C) Avoid the topic.',
      'D) Remove AI components.',
    ],
  },
  {
    question:
      'Scenario: Client complains that autonomous agents aren’t prioritizing tasks as expected.',
    type: 'multiple-choice',
    options: [
      'A) Ignore until SLA breach.',
      'B) Review agent prioritization logic, adjust AI models, and get client sign-off on updated rules.',
      'C) Remove prioritization logic.',
      'D) Blame client’s data quality.',
    ],
  },
  {
    question:
      'What delivery risks or adoption barriers do you see when introducing autonomous agents into existing workflows?',
    type: 'text',
  },
];

export const assessmentQuestions = {
  // Persona 1 – Leadership (CEO, CTO, Practice Lead, Head of Alliances)
  'Leadership (CEO, CTO, Practice Lead, Head of Alliances)': leadershipQuestions,

  // Persona 2 – Solution Architect/ Developers
  'Solution Architect/ Developers': saDevQuestions,

  // Persona 3 – Sales/ Presales/ Business Development
  'Sales/ Presales/ Business Development': salesBdQuestions,

  // Persona 4 – Delivery / Project Manager
  'Delivery / Project Manager': deliveryPmQuestions,

  // Backward compatible keys (mapped to closest persona)
  'CxO / Practice Lead': leadershipQuestions,
  'Sales / Pre-Sales': salesBdQuestions,
  'Technical Architect': saDevQuestions,
};
