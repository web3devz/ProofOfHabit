# ProofOfHabit

A decentralized habit tracking system built on **OneChain**. Daily activities become verifiable on-chain records — immutable proof of consistency that cannot be manipulated. Tracks streaks and can be extended with NFT rewards or token incentives.

---

## Deployed Contracts (Testnet)

| Name | Address |
|------|---------|
| Package ID | `0x2ebf14250c015c05a0c8f6abb67d933039062e955c2591c58b08e33bdb3aa623` |
| Deploy Transaction | `2eFmKtezTXxY8wzjFtqYUTwmaS8g2Y9MhyxecEiP7bYo` |

- [View Package](https://onescan.cc/testnet/packageDetail?packageId=0x2ebf14250c015c05a0c8f6abb67d933039062e955c2591c58b08e33bdb3aa623)
- [View Deploy Tx](https://onescan.cc/testnet/transactionBlocksDetail?digest=2eFmKtezTXxY8wzjFtqYUTwmaS8g2Y9MhyxecEiP7bYo)

---

## Contract API

```move
// Create your personal habit log (owned object)
public fun create_log(ctx: &mut TxContext)

// Log a habit entry — auto-tracks streak
public fun log_habit(log: &mut HabitLog, habit_name: vector<u8>, note: vector<u8>, ctx: &mut TxContext)
```

---

## Local Development

```bash
~/.cargo/bin/one move build --path contracts
~/.cargo/bin/one client publish --gas-budget 50000000 contracts
cd frontend && npm install && npm run dev
```

Set in `frontend/.env`:
```env
VITE_PACKAGE_ID=<package_id>
```

## License
MIT
