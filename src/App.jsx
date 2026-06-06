import { useState } from 'react'
import ResumeSection from './components/ResumeSection'
import WorkHistorySection from './components/WorkHistorySection'
import SkillsSection from './components/SkillsSection'
import ProjectsSection from './components/ProjectsSection'
import EducationSection from './components/EducationSection'
import Analyzer from './components/Analyzer'
import History from './components/History'
import Upwork from './components/Upwork'

const VAULT_TABS = [
  { id: 'resume', label: 'Resume' },
  { id: 'work', label: 'Work History' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
]

const VIEWS = [
  { id: 'analyzer', label: 'Analyzer' },
  { id: 'upwork', label: 'Upwork' },
  { id: 'history', label: 'History' },
  { id: 'vault', label: 'Resume Vault' },
]

function App() {
  const [view, setView] = useState('analyzer')
  const [activeTab, setActiveTab] = useState('resume')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Career Copilot</h1>
            <p className="text-sm text-zinc-400 mt-1">
              AI job fit analyzer &amp; resume optimizer
            </p>
          </div>
          <nav className="flex gap-1">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === v.id
                    ? 'bg-white text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {view === 'analyzer' && <Analyzer />}

        {view === 'history' && <History />}

        {view === 'upwork' && <Upwork />}

        {view === 'vault' && (
          <>
            <div className="flex gap-1 border-b border-zinc-800 mb-8">
              {VAULT_TABS.map((tab) => (
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
            <div>
              {activeTab === 'resume' && <ResumeSection />}
              {activeTab === 'work' && <WorkHistorySection />}
              {activeTab === 'projects' && <ProjectsSection />}
              {activeTab === 'education' && <EducationSection />}
              {activeTab === 'skills' && <SkillsSection />}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App