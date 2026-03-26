# ProofOfHabit ✅

**On-Chain Habit Tracking on OneChain — Build Consistency with Verifiable Streaks**

ProofOfHabit is a decentralized habit tracking system that records daily actions immutably on-chain. It transforms personal consistency into a transparent, verifiable, and ownership-driven process — eliminating reliance on centralized habit-tracking apps.

## 🌐 Overview

Most habit tracking tools today are centralized and prone to data loss, manipulation, or lack of long-term accountability. Users cannot truly verify or prove their consistency over time.

ProofOfHabit introduces a **decentralized habit logging system** where each action becomes a permanent on-chain record. This enables:

* **Transparency** → all habit activity is verifiable
* **Immutability** → records cannot be altered or deleted
* **Accountability** → streaks reflect true consistency
* **Ownership** → users control their own behavioral data

By combining blockchain with behavioral tracking, ProofOfHabit creates a foundation for **trustless self-improvement systems**.

## ❗ The Problem

* Habit tracking apps are centralized and unreliable
* No verifiable proof of consistency
* Easy to manipulate or reset progress
* No interoperability across platforms
* Limited motivation and accountability mechanisms

## 💡 The Solution

ProofOfHabit stores each habit log as part of a **user-owned on-chain object**. Using epoch-based logic, the system tracks streak continuity and ensures that consistency is accurately measured over time.

This opens the door for integrations like **reward systems, reputation scoring, and behavioral analytics**.

## ✨ Key Features

* **On-Chain Habit Logging**
  Record daily habits as immutable blockchain entries

* **Streak Tracking Logic**
  Maintain and verify consistency using epoch-based tracking

* **User-Owned Habit Logs**
  Each wallet controls its own habit data

* **Transparent Activity History**
  All logs are publicly verifiable

* **AI Habit Coaching**
  Generate insights, summaries, and improvement suggestions

* **Extensible Design**
  Supports future integrations like rewards, badges, and reputation

## ⚙️ How It Works

1. User creates a personal habit log on-chain
2. Daily habits are recorded with optional notes
3. Smart contract updates streak based on time logic
4. Data is stored immutably as part of the log object
5. Frontend visualizes progress and trends
6. AI generates insights for habit improvement

## 📦 Deployed Contract

* **Network:** OneChain Testnet

* **Package ID:**
  `0x2ebf14250c015c05a0c8f6abb67d933039062e955c2591c58b08e33bdb3aa623`

* **Deployment Transaction:**
  `2eFmKtezTXxY8wzjFtqYUTwmaS8g2Y9MhyxecEiP7bYo`

* **Explorer Links:**
  [https://onescan.cc/testnet/packageDetail?packageId=0x2ebf14250c015c05a0c8f6abb67d933039062e955c2591c58b08e33bdb3aa623](https://onescan.cc/testnet/packageDetail?packageId=0x2ebf14250c015c05a0c8f6abb67d933039062e955c2591c58b08e33bdb3aa623)
  [https://onescan.cc/testnet/transactionBlocksDetail?digest=2eFmKtezTXxY8wzjFtqYUTwmaS8g2Y9MhyxecEiP7bYo](https://onescan.cc/testnet/transactionBlocksDetail?digest=2eFmKtezTXxY8wzjFtqYUTwmaS8g2Y9MhyxecEiP7bYo)

## 🛠 Tech Stack

**Smart Contract**

* Move (OneChain)

**Frontend**

* React
* TypeScript
* Vite

**Wallet Integration**

* @mysten/dapp-kit

**Tooling**

* ESLint
* npm

**Network**

* OneChain Testnet

## 🔍 Use Cases

* **Personal Habit Tracking**
  Build and verify daily routines

* **Accountability Systems**
  Share verifiable progress with others

* **Gamified Self-Improvement**
  Enable rewards and streak-based incentives

* **Reputation Systems**
  Use consistency as a credibility metric

* **Wellness & Productivity Apps**
  Integrate decentralized habit tracking

## 🚀 Why ProofOfHabit Stands Out

* **Verifiable Consistency** — no fake streaks or resets
* **Immutable Records** — true history of habits
* **User-Owned Data** — no centralized control
* **AI-Enhanced Insights** — smarter habit improvement
* **Composable Primitive** — usable in multiple Web3 systems
* **Hackathon-Ready Impact** — strong real-world behavioral use case

## 🔮 Future Improvements

* Token-based reward system for streaks
* NFT badges for milestones
* Social accountability features
* Cross-app habit identity integration
* Advanced analytics and visualization
* Privacy-preserving habit tracking (ZK proofs)

## ⚙️ Contract API

```move id="l4zj1u"
public fun create_log(ctx: &mut TxContext)

public fun log_habit(
    log: &mut HabitLog,
    habit_name: vector<u8>,
    note: vector<u8>,
    ctx: &mut TxContext
)
```

## 💻 Local Development

```bash id="9n8a1x"
~/.cargo/bin/one move build --path contracts
~/.cargo/bin/one client publish --gas-budget 50000000 contracts
cd frontend
npm install
npm run dev
```

Set environment values in `frontend/.env`:

```env id="xk3p2q"
VITE_PACKAGE_ID=<package_id>
VITE_OPENAI_KEY=<openai_api_key>
```

## 📄 License

MIT License
