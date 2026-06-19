# Contributing to stellar-inspector

Thanks for wanting to help — seriously. This project is early and there's a lot of room to make it better.

Here's everything you need to know to get a contribution in.

---

## First time here?

Check the [open issues](https://github.com/horizoneer/stellar-inspector/issues) — anything tagged `good first issue` is a solid place to start. If you have an idea that isn't listed, open an issue first and let's talk through it before you spend time writing code.

---

## Setting up locally

```bash
git clone https://github.com/horizoneer/stellar-inspector.git
cd stellar-inspector
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Vite hot-reloads on save so you don't need to restart anything while developing.

---

## How the codebase is laid out

```
src/
  components/     # UI components — try to keep these generic and reusable
  hooks/          # Custom React hooks
  pages/          # Page-level components wired to routes
  utils/stellar.js  # All Horizon API calls go here — this is the core of the app
```

If you're adding support for a new operation type, `src/utils/stellar.js` is where the `normaliseOp` function lives. That's usually the right place to start.

---

## Making a change

1. Fork the repo
2. Create a branch — name it something descriptive like `feat/mainnet-toggle` or `fix/payment-op-display`
3. Make your changes
4. Test it manually — click through the app with a real transaction hash
5. Open a pull request with a short description of what you changed and why

---

## Pull request checklist

- [ ] Does it work with a real testnet transaction?
- [ ] Did you handle edge cases — empty fields, missing data, unexpected op types?
- [ ] Is the UI consistent with the rest of the app?
- [ ] No console errors?

We don't have automated tests yet (that's actually a good contribution if you want to set something up).

---

## Code style

Nothing strict. Just try to match the style of whatever file you're editing. We use CSS Modules for styles — keep component styles scoped to their module file.

---

## Questions?

Open an issue or start a discussion. We're friendly.
