import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit'
import { PACKAGE_ID } from '../config/network'

interface LogFields {
  owner: string
  streak: string
  next_id: string
}

export default function MyHabits() {
  const account = useCurrentAccount()
  const { data, isPending, error } = useSuiClientQuery('getOwnedObjects', {
    owner: account?.address ?? '',
    filter: { StructType: `${PACKAGE_ID}::habit::HabitLog` },
    options: { showContent: true },
  })

  if (isPending) return <div className="status-box">Loading your habits...</div>
  if (error) return <div className="status-box error">Error: {error.message}</div>

  const logs = data?.data ?? []

  if (logs.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔥</div>
        <h3>No habit log found</h3>
        <p>Create your first habit log to start tracking.</p>
      </div>
    )
  }

  return (
    <div>
      {logs.map((obj) => {
        const content = obj.data?.content
        if (content?.dataType !== 'moveObject') return null
        const f = content.fields as unknown as LogFields

        return (
          <div key={obj.data?.objectId} className="card">
            <div className="card-header">
              <h2>Your Habit Log</h2>
              <p className="card-desc">{f.next_id} entries logged on-chain</p>
            </div>
            <div className="streak-display">
              <div className="streak-big">🔥 {f.streak}</div>
              <div className="streak-label">Current Streak</div>
            </div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border)', marginTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Total Logs</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '.3rem' }}>{f.next_id}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
