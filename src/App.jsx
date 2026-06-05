import { useState } from 'react'
import ResumeSection from './components/ResumeSection'
import WorkHistorySection from './components/WorkHistorySection'
import SkillsSection from './components/SkillsSection'

const TABS = [
  { id: 'resume', label: 'Resume' },
  { id: 'work', label: 'Work History' },
  { id: 'skills', label: 'Skills' },
]

function App() {
  const [activeTab, setActiveTab] = useState('resume')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <h1 className="text-xl font-semibold tracking-tight">
            Career Copilot
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Resume Vault
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-zinc-800 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div>
          {activeTab === 'resume' && <ResumeSection />}
          {activeTab === 'work' && <WorkHistorySection />}
          {activeTab === 'skills' && <SkillsSection />}
        </div>
      </main>
    </div>
  )
}

export default App