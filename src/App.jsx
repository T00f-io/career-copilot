import { useState } from 'react'
import ResumeSection from './components/ResumeSection'
import WorkHistorySection from './components/WorkHistorySection'
import SkillsSection from './components/SkillsSection'
import Analyzer from './components/Analyzer'

const VAULT_TABS = [
  { id: 'resume', label: 'Resume' },
  { id: 'work', label: 'Work History' },
  { id: 'skills', label: 'Skills' },
]

function App() {
  const [view, setView] = useState('analyzer') // 'analyzer' | 'vault'
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
            <button
              onClick={() => setView('analyzer')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === 'analyzer'
                  ? 'bg-white text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Analyzer
            </button>
            <button
              onClick={() => setView('vault')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === 'vault'
                  ? 'bg-white text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Resume Vault
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
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
              {activeTab === 'skills' && <SkillsSection />}
            </div>
          </>
        )}

        {view === 'analyzer' && <Analyzer />}
      </main>
    </div>
  )
}

export default App