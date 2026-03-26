import { useState } from 'react'
import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { PACKAGE_ID, txUrl } from '../config/network'

interface LogFields {
  owner: string
  streak: string
  next_id: string
}

export default function MyHabits() {
  const account = useCurrentAccount()
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()
  const [txDigest, setTxDigest] = useState('')
  const [error, setError] = useState('')

  const { data, isPending: isLoading, refetch } = useSuiClientQuery('getOwnedObjects', {
    owner: account?.address ?? '',
    filter: { StructType: `${PACKAGE_ID}::habit::HabitLog` },
    options: { showContent: true },
  })

  const createLog = () => {
    setError('')
    const tx = new Transaction()
    tx.moveCall({ target: `${PACKAGE_ID}::habit::create_log`, arguments: [] })
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (r) => { setTxDigest(r.digest); refetch() },
        onError: (e) => setError(e.message),
      }
    )
  }

  if (isLoading) return <div className="status-box">Loading your habits...</div>

  const logs = data?.data ?? []

  if (logs.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>My Habit Log</h2>
          <p className="card-desc">You don't have a habit log yet. Create one to start tracking.</p>
        </div>

        <div className="empty-state" style={{ padding: '2rem 0' }}>
          <div className="empty-icon">🔥</div>
          <h3>No habit log found</h3>
          <p style={{ marginBottom: '1.5rem' }}>Create your personal on-chain habit log to start building streaks.</p>
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
