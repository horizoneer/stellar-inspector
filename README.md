# stellar-inspector

A web-based tool for inspecting and decoding Stellar blockchain transactions. Paste a transaction hash or XDR string and get a human-readable breakdown — no digging through raw JSON required.

Built by [Horizoneer](https://github.com/horizoneer).

![stellar-inspector screenshot](./docs/screenshot.png)

---

## What it does

- Decodes transaction hashes into plain English — status, fee, memo, source account
- Shows operation-level details (payments, contract calls, trust lines, and more)
- Syntax-highlighted raw JSON for when you need to go deeper
- Copy to clipboard on every field — hashes, accounts, XDR strings
- Supports both Mainnet and Testnet (toggle coming soon)

---

## Getting started

You'll need Node.js 18+ installed.

```bash
git clone https://github.com/horizoneer/stellar-inspector.git
cd stellar-inspector
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

To build for production:

```bash
npm run build
```

---

## Stack

- React 18 + Vite
- react-syntax-highlighter (Prism) for raw JSON view
- Stellar Horizon REST API — no SDK dependency at runtime
- CSS Modules for styling

---

## Project structure

```
src/
  components/     # Reusable UI — CopyButton, Toast, Layout, TransactionView
  hooks/          # useClipboard
  pages/          # InspectorPage, AccountPage
  utils/          # stellar.js — all Horizon API calls live here
```

---

## Roadmap

These are things we want to build next. If any of these interest you, open an issue and let's talk.

- [ ] Mainnet / Testnet toggle
- [ ] Account detail page — balances, recent transactions, trustlines
- [ ] XDR decoder — paste raw XDR and get a structured breakdown
- [ ] Operation type coverage — currently handles the most common types, more to add
- [ ] Share a transaction via URL — `/tx/:hash` deep linking
- [ ] Dark/light mode toggle

---

## Contributing

We're actively looking for contributors. Whether it's fixing a bug, adding an operation type, or improving the UI — all of it helps.

See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

---

## License

MIT — do whatever you want with it.
