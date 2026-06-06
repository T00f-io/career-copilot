import { supabase } from './supabase'

// Pulls resume + work history + skills from Supabase and assembles
// a single structured context block for the analyzer prompt.
// Returns { context, isEmpty }.

export async function buildVaultContext() {
  const [resumeRes, workRes, skillsRes] = await Promise.all([
    supabase.from('resume_vault').select('*').limit(1).maybeSingle(),
    supabase.from('work_history').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
    supabase.from('skills').select('*').order('category', { ascending: true }).order('name', { ascending: true }),
  ])

  if (resumeRes.error) throw new Error(`Resume load failed: ${resumeRes.error.message}`)
  if (workRes.error) throw new Error(`Work history load failed: ${workRes.error.message}`)
  if (skillsRes.error) throw new Error(`Skills load failed: ${skillsRes.error.message}`)

  const resume = resumeRes.data
  const roles = workRes.data || []
  const skills = skillsRes.data || []

  const isEmpty =
    !resume?.full_resume_text?.trim() && roles.length === 0 && skills.length === 0

  const parts = []

  // Professional summary
  if (resume?.summary?.trim()) {
    parts.push(`## PROFESSIONAL SUMMARY\n${resume.summary.trim()}`)
  }

  // Full resume text
  if (resume?.full_resume_text?.trim()) {
    parts.push(`## FULL RESUME\n${resume.full_resume_text.trim()}`)
  }

  // Work history — structured per role
  if (roles.length > 0) {
    const roleBlocks = roles.map((r) => {
      const dates = [r.start_date, r.end_date].filter(Boolean).join(' – ')
      const header = [r.title, r.company].filter(Boolean).join(' @ ')
      const lines = [`### ${header}${dates ? ` (${dates})` : ''}`]
      if (r.description?.trim()) lines.push(r.description.trim())
      return lines.join('\n')
    })
    parts.push(`## WORK HISTORY\n${roleBlocks.join('\n\n')}`)
  }

  // Skills — grouped by category
  if (skills.length > 0) {
    const grouped = skills.reduce((acc, s) => {
      const key = s.category?.trim() || 'Other'
      if (!acc[key]) acc[key] = []
      acc[key].push(s.name)
      return acc
    }, {})
    const skillLines = Object.entries(grouped).map(
      ([cat, names]) => `- ${cat}: ${names.join(', ')}`
    )
    parts.push(`## SKILLS\n${skillLines.join('\n')}`)
  }

  return { context: parts.join('\n\n'), isEmpty }
}