import { supabase } from './supabase'

// Pulls resume + work history + projects + education + skills from Supabase
// and assembles a single structured context block for the analyzer prompt.
// Returns { context, isEmpty }.

export async function buildVaultContext() {
  const [resumeRes, workRes, projectsRes, eduRes, skillsRes] = await Promise.all([
    supabase.from('resume_vault').select('*').limit(1).maybeSingle(),
    supabase.from('work_history').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
    supabase.from('projects').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
    supabase.from('education').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
    supabase.from('skills').select('*').order('category', { ascending: true }).order('name', { ascending: true }),
  ])

  if (resumeRes.error) throw new Error(`Resume load failed: ${resumeRes.error.message}`)
  if (workRes.error) throw new Error(`Work history load failed: ${workRes.error.message}`)
  if (projectsRes.error) throw new Error(`Projects load failed: ${projectsRes.error.message}`)
  if (eduRes.error) throw new Error(`Education load failed: ${eduRes.error.message}`)
  if (skillsRes.error) throw new Error(`Skills load failed: ${skillsRes.error.message}`)

  const resume = resumeRes.data
  const roles = workRes.data || []
  const projects = projectsRes.data || []
  const education = eduRes.data || []
  const skills = skillsRes.data || []

  const isEmpty =
    !resume?.full_resume_text?.trim() &&
    roles.length === 0 &&
    projects.length === 0 &&
    education.length === 0 &&
    skills.length === 0

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

  // Projects — rich structured fields (often AI/automation work missing from the formal resume)
  if (projects.length > 0) {
    const projectBlocks = projects.map((p) => {
      const lines = [`### ${p.name}${p.role ? ` — ${p.role}` : ''}`]
      if (p.stack?.trim()) lines.push(`Stack: ${p.stack.trim()}`)
      if (p.problem?.trim()) lines.push(`Problem: ${p.problem.trim()}`)
      if (p.what_i_built?.trim()) lines.push(`Built: ${p.what_i_built.trim()}`)
      if (p.outcome?.trim()) lines.push(`Outcome: ${p.outcome.trim()}`)
      if (p.link?.trim()) lines.push(`Link: ${p.link.trim()}`)
      return lines.join('\n')
    })
    parts.push(`## PROJECTS\n${projectBlocks.join('\n\n')}`)
  }

  // Education
  if (education.length > 0) {
    const eduBlocks = education.map((e) => {
      const dates = [e.start_date, e.end_date].filter(Boolean).join(' – ')
      const header = [e.credential, e.field].filter(Boolean).join(', ') || e.institution
      const lines = [`### ${header}${dates ? ` (${dates})` : ''}`]
      if (e.institution?.trim() && header !== e.institution) lines.push(e.institution.trim())
      if (e.details?.trim()) lines.push(e.details.trim())
      return lines.join('\n')
    })
    parts.push(`## EDUCATION\n${eduBlocks.join('\n\n')}`)
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