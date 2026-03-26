import { useState, useEffect } from 'react'
import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { PACKAGE_ID, txUrl } from '../config/network'

const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY as string

interface LogFields {
  owner: string
  streak: string
  next_id: string
  last_epoch: string
  entries: { fields: { id: { id: string } } }
}

interface HabitEntry {
  id: number
  habit_name: string
  note: string
  epoch: number
}

interface AICoach {
  summary: string
  topHabit: string
  streakTip: string
  motivation: string
}

export default function MyHabits() {
  const account = useCurrentAccount()
  const client = useSuiClient()
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()
  const [txDigest, setTxDigest] = useState('')
  const [error, setError] = useState('')
  const [entries, setEntries] = useState<HabitEntry[]>([])
  const [entriesLoading, setEntriesLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiCoach, setAiCoach] = useState<AICoach | null>(null)
  const [aiError, setAiError] = useState('')

  const { data, isPending: isLoading, refetch } = useSuiClientQuery('getOwnedObjects', {
    owner: account?.address ?? '',
    filter: { StructType: `${PACKAGE_ID}::habit::HabitLog` },
    options: { showContent: true },
  })

  const logs = data?.data ?? []
  const logObj = logs[0]
  const content = logObj?.data?.content
  const fields = content?.dataType === 'moveObject' ? content.fields as unknown as LogFields : null
  const tableId = fields?.entries?.fields?.id?.id
  const streak = fields?.streak ?? '0'
  const totalLogs = fields?.next_id ?? '0'

  // Fetch habit entries from Table via dynamic fields
  useEffect(() => {
    if (!tableId || totalLogs === '0') { setEntries([]); return }
    setEntriesLoading(true)
    ;(async () => {
      try {
        const dynFields = await client.getDynamicFields({ parentId: tableId })
        const fetched: HabitEntry[] = []
        for (const f of dynFields.data) {
          const obj = await client.getDynamicFieldObject({ parentId: tableId, name: f.name })
          const val = (obj.data?.content as { dataType: string; fields: { name: number; value: { fields: HabitEntry } } } | undefined)
          if (val?.dataType === 'moveObject') {
            const v = val.fields.value.fields
            fetched.push({
              id: Number(val.fields.name),
              habit_name: v.habit_name,
              note: v.note,
              epoch: Number(v.epoch),
            })
          }
        }
        fetched.sort((a, b) => b.id - a.id)
        setEntries(fetched)
      } catch { setEntries([]) }
      finally { setEntriesLoading(false) }
    })()
  }, [tableId, totalLogs])

  const createLog = () => {
    setError('')
    const tx = new Transaction()
    tx.moveCall({ target: `${PACKAGE_ID}::habit::create_log`, arguments: [] })
    signAndExecute(
      { transaction: tx },
      { onSuccess: (r) => { setTxDigest(r.digest); refetch() }, onError: (e) => setError(e.message) }
    )
  }

  const getAICoach = async () => {
    if (entries.length === 0) return
    setAiLoading(true); setAiError(''); setAiCoach(null)
    try {
      const habitCounts = entries.reduce((acc: Record<string, number>, e) => {
        acc[e.habit_name] = (acc[e.habit_name] || 0) + 1; return acc
      }, {})
      const topHabit = Object.entries(habitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'
      const recentHabits = entries.slice(0, 8).map(e => `${e.habit_name}${e.note ? ` (${e.note})` : ''}`).join(', ')

      const prompt = `You are a habit coach AI. Analyze this user's on-chain habit log and give personalized coaching.

Total logs: ${entries.length}
Current streak: ${streak}
Top habit: ${topHabit}
Habit frequency: ${JSON.stringify(habitCounts)}
Recent habits: ${recentHabits}

Respond ONLY with valid JSON:
{
  "summary": "<1 sentence overall habit health assessment>",
  "topHabit": "<insight about their most logged habit>",
  "streakTip": "<specific tip to improve or maintain their streak>",
  "motivation": "<short motivational message based on their progress>"
}`

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.5, max_tokens: 250 }),
      })
      if (!res.ok) throw new Error(`OpenAI error ${res.status}`)
      const d = await res.json()
      const raw = d.choices?.[0]?.message?.content?.trim() ?? ''
      setAiCoach(JSON.parse(raw.replace(/```json|```/g, '').trim()))
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : 'AI coaching failed')
    } finally { setAiLoading(false) }
  }

  // Build habit frequency map for mini chart
  const habitCounts = entries.reduce((acc: Record<string, number>, e) => {
    acc[e.habit_name] = (acc[e.habit_name] || 0) + 1; return acc
  }, {})
  const topHabits = Object.entries(habitCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxCount = topHabits[0]?.[1] ?? 1

  if (isLoading) return <div className="status-box">Loading your habits...</div>

  if (logs.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>My Habit Log</h2>
          <p className="card-desc">Create your on-chain habit log to start building streaks.</p>
        </div>
        <div className="empty-state" style={{ padding: '2rem 0' }}>
          <div className="empty-icon">🔥</div>
          <h3>No habit log found</h3>
          <p style={{ marginBottom: '1.5rem' }}>One log per wallet — your habits, permanently on-chain.</p>
          <button className="btn-primary" onClick={createLog} disabled={isPending}>
            {isPending ? 'Creating...' : '+ Create Habit Log'}
          </button>
        </div>
        {error && <p className="error" style={{ marginTop: '1rem' }}>⚠ {error}</p>}
        {txDigest && (
          <div className="tx-success" style={{ marginTop: '1rem' }}>
            <span>✅ Habit log created</span>
            <a href={txUrl(txDigest)} target="_blank" rel="noreferrer">View tx ↗</a>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Stats Card */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Your Habit Tracker</h2>
            <p className="card-desc">{totalLogs} habits logged on-chain</p>
          </div>
          <button
            className="btn-ai-summary"
            onClick={getAICoach}
            disabled={aiLoading || entries.length === 0}
            title={entries.length === 0 ? 'Log some habits first' : 'Get AI coaching'}
          >
            {aiLoading ? <><span className="ai-spin">⟳</span> Analyzing...</> : <>🤖 AI Coach</>}
          </button>
        </div>

        {/* Streak + Stats Row */}
        <div className="habit-stats-row">
          <div className="habit-stat-box streak-box">
            <div className="habit-stat-icon">🔥</div>
            <div className="habit-stat-num">{streak}</div>
            <div className="habit-stat-label">Day Streak</div>
          </div>
          <div className="habit-stat-box">
            <div className="habit-stat-icon">📝</div>
            <div className="habit-stat-num">{totalLogs}</div>
            <div className="habit-stat-label">Total Logs</div>
          </div>
          <div className="habit-stat-box">
            <div className="habit-stat-icon">🎯</div>
            <div className="habit-stat-num">{topHabits.length}</div>
            <div className="habit-stat-label">Unique Habits</div>
          </div>
          <div className="habit-stat-box">
            <div className="habit-stat-icon">⭐</div>
            <div className="habit-stat-num">{topHabits[0]?.[0] ?? '—'}</div>
            <div className="habit-stat-label">Top Habit</div>
          </div>
        </div>
      </div>

      {/* AI Error */}
      {aiError && <p className="error" style={{ marginBottom: '1rem' }}>⚠ {aiError}</p>}

      {/* AI Coach Card */}
      {aiCoach && (
        <div className="card ai-summary-card">
          <div className="ai-summary-header">
            <span className="ai-badge-label">🤖 AI Habit Coach</span>
            <button onClick={() => setAiCoach(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          </div>
          <p className="ai-overview">{aiCoach.summary}</p>
          <div className="ai-insights-grid">
            <div className="ai-insight-item">
              <div className="ai-insight-label">🏆 Top Habit</div>
              <div className="ai-insight-value">{aiCoach.topHabit}</div>
            </div>
            <div className="ai-insight-item">
              <div className="ai-insight-label">🔥 Streak Tip</div>
              <div className="ai-insight-value">{aiCoach.streakTip}</div>
            </div>
            <div className="ai-insight-item" style={{ gridColumn: '1 / -1' }}>
              <div className="ai-insight-label">💪 Motivation</div>
              <div className="ai-insight-value">{aiCoach.motivation}</div>
            </div>
          </div>
        </div>
      )}

      {/* Habit Frequency Chart */}
      {topHabits.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>Habit Frequency</h2>
            <p className="card-desc">Your most practiced habits</p>
          </div>
          <div className="habit-chart">
            {topHabits.map(([name, count]) => (
              <div key={name} className="habit-bar-row">
                <div className="habit-bar-label">{name}</div>
                <div className="habit-bar-track">
                  <div className="habit-bar-fill" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
                <div className="habit-bar-count">{count}×</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entry History */}
      <div className="card">
        <div className="card-header">
          <h2>Activity Log</h2>
          <p className="card-desc">{entriesLoading ? 'Loading...' : `${entries.length} entries`}</p>
        </div>

        {entriesLoading && <div className="status-box">Fetching entries from chain...</div>}

        {!entriesLoading && entries.length === 0 && (
          <div className="empty-state" style={{ padding: '1.5rem 0' }}>
            <p>No entries yet. Log your first habit!</p>
          </div>
        )}

        {!entriesLoading && entries.length > 0 && (
          <div className="habit-log-list">
            {entries.map((e) => (
              <div key={e.id} className="habit-log-item">
                <div className="habit-log-dot" />
                <div className="habit-log-content">
                  <div className="habit-log-name">{e.habit_name}</div>
                  {e.note && <div className="habit-log-note">{e.note}</div>}
                </div>
                <div className="habit-log-epoch">epoch {e.epoch}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
