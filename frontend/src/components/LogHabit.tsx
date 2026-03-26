import { useState } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { PACKAGE_ID, txUrl } from '../config/network'

const enc = (s: string) => Array.from(new TextEncoder().encode(s))

interface Props {
  onSuccess?: () => void
}

export default function LogHabit({ onSuccess }: Props) {
  const account = useCurrentAccount()
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()
  const [habit, setHabit] = useState('')
  const [note, setNote] = useState('')
  const [txDigest, setTxDigest] = useState('')
  const [error, setError] = useState('')

  const { data } = useSuiClientQuery('getOwnedObjects', {
    owner: account?.address ?? '',
    filter: { StructType: `${PACKAGE_ID}::habit::HabitLog` },
    options: { showContent: true },
  })

  const log = data?.data?.[0]
  const logId = log?.data?.objectId

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!account || !logId || !habit) return
    setError('')
    setTxDigest('')

    const tx = new Transaction()
    tx.moveCall({
      target: `${PACKAGE_ID}::habit::log_habit`,
      arguments: [
        tx.object(logId),
        tx.pure.vector('u8', enc(habit)),
        tx.pure.vector('u8', enc(note)),
      ],
    })

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (r) => {
          setTxDigest(r.digest)
          setHabit('')
          setNote('')
          onSuccess?.()
        },
        onError: (e) => setError(e.message),
      }
    )
  }

  if (!logId) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h3>No habit log found</h3>
        <p>You need to create a habit log first.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Log Habit</h2>
        <p className="card-desc">Record your daily habit to build your streak.</p>
      </div>

      <form onSubmit={submit} className="form">
        <label>
          Habit Name *
          <input
            value={habit}
            onChange={(e) => setHabit(e.target.value)}
            placeholder="e.g. Morning Run, Study Session"
            required
          />
        </label>

        <label>
          Note
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional details..."
            rows={2}
          />
        </label>

        {error && <p className="error">⚠ {error}</p>}

        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? 'Logging...' : 'Log Habit'}
        </button>
      </form>

      {txDigest && (
        <div className="tx-success">
          <span>✅ Habit logged on-chain</span>
          <a href={txUrl(txDigest)} target="_blank" rel="noreferrer">View tx ↗</a>
        </div>
      )}
    </div>
  )
}
