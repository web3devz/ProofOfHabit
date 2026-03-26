import { useState } from 'react'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import MyHabits from './components/MyHabits'
import LogHabit from './components/LogHabit'
import './App.css'

type Tab = 'view' | 'log'

export default function App() {
  const account = useCurrentAccount()
  const [tab, setTab] = useState<Tab>('view')

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="logo">🔥</span>
          <div>
            <div className="brand-name">ProofOfHabit</div>
            <div className="brand-sub">Verifiable Consistency</div>
          </div>
        </div>
        <ConnectButton />
      </header>

      {!account ? (
        <>
          <section className="hero">
            <div className="hero-badge">Immutable Proof</div>
            <h1>Your Habits,<br />Permanently Verified</h1>
            <p className="hero-sub">
              Transform daily activities into verifiable on-chain records.
              Build streaks, prove consistency, and earn trust through immutable proof.
            </p>
            <div className="hero-features">
              <div className="feature"><span>📝</span><span>Logged</span></div>
              <div className="feature"><span>⛓️</span><span>On-Chain</span></div>
              <div className="feature"><span>🔥</span><span>Streaks</span></div>
              <div className="feature"><span>✅</span><span>Verifiable</span></div>
            </div>
          </section>

          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-value">∞</div>
              <div className="stat-label">Habits Trackable</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Manipulation Risk</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">100%</div>
              <div className="stat-label">Transparent</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">&lt;1s</div>
              <div className="stat-label">Finality</div>
            </div>
          </div>

          <section className="how-section">
            <div className="section-title">How ProofOfHabit Works</div>
            <p className="section-sub">Three steps to verifiable consistency</p>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-num">01</div>
                <div className="step-icon">📋</div>
                <h3>Log Activity</h3>
                <p>Record your habit — workout, study, meditation, or any daily activity.</p>
              </div>
              <div className="step-card">
                <div className="step-num">02</div>
                <div className="step-icon">⛓️</div>
                <h3>On-Chain Record</h3>
                <p>Each log is minted as an immutable record in your personal habit log.</p>
              </div>
              <div className="step-card">
                <div className="step-num">03</div>
                <div className="step-icon">🔥</div>
                <h3>Build Streaks</h3>
                <p>Consistent daily logs build verifiable streaks that prove your commitment.</p>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="dashboard">
          <div className="dashboard-inner">
            <nav className="tabs">
              {(['view', 'log'] as Tab[]).map((t) => (
                <button
                  key={t}
                  className={tab === t ? 'active' : ''}
                  onClick={() => setTab(t)}
                >
                  {t === 'view' && '📊 My Habits'}
                  {t === 'log' && '✏️ Log Habit'}
                </button>
              ))}
            </nav>
            <main>
              {tab === 'view' && <MyHabits />}
              {tab === 'log' && <LogHabit onSuccess={() => setTab('view')} />}
            </main>
          </div>
        </div>
      )}

      <footer className="footer">
        <span>ProofOfHabit · OneChain Testnet</span>
        <a href="https://onescan.cc/testnet" target="_blank" rel="noreferrer">Explorer ↗</a>
      </footer>
    </div>
  )
}
