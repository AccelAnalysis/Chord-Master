# Chord Master Prototype

A responsive React/Vite prototype for learning and practicing chord progressions with visual keyboard guidance, Web Audio playback, optional metronome, touch input, MIDI input, progression editing, subscription tiers, and one-time content packs.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Implemented

- Chord-progression demonstrations with duration-proportional blocks
- Virtual piano keyboard and physical Web MIDI input
- Imitation practice with pitch-class validation and a release gate
- Editable chord roots, qualities, and durations
- Key-aware sharp/flat spelling for the included keys
- 4/4, 3/4, and 6/8 meter selection
- Optional metronome for paid prototype tiers
- Free, Plus, and Pro entitlement model
- One-time Jazz, Neo-Soul, Gospel, and Cinematic content packs
- Paywall/store interface and feature gating
- LocalStorage-backed mock purchases for prototype testing

## Prototype purchase testing

Purchases are intentionally simulated. Choosing a plan or pack writes entitlements to `localStorage` under:

```text
chord-master-entitlements-v1
```

Clear that value in browser storage to reset the account.

## Production billing architecture

Do not trust purchase state stored in the browser. A production implementation should:

1. Keep a canonical entitlement record on a secure backend.
2. Verify Apple StoreKit transactions using App Store Server APIs and server notifications.
3. Verify Google Play purchase tokens and process real-time developer notifications.
4. Use Stripe Checkout/Billing and verified webhooks for direct web subscriptions and one-time purchases.
5. Map all platform products to common internal entitlements such as `plan.plus`, `plan.pro`, and `pack.gospel`.
6. Support restore purchases, grace periods, refunds, cancellations, billing retry, and cross-device access.

Recommended adapter boundary:

```js
billing.purchaseSubscription(productId)
billing.purchaseOneTimeProduct(productId)
billing.restorePurchases()
billing.getEntitlements()
```

The UI should consume only normalized entitlements, not platform-specific receipt fields.

## Proposed offer structure

### Free

- Selected starter progressions
- Demo playback and virtual keyboard
- Basic imitation practice
- One editable progression

### Plus — proposed $6.99/month or $59.99/year

- All standard progression libraries
- MIDI input
- Unlimited custom progressions
- Metronome and multiple meters
- Cloud sync and practice history when the backend is added

### Pro — proposed $12.99/month or $99.99/year

- Everything in Plus
- All premium packs
- Advanced voicings and adaptive drills
- Detailed performance analytics
- Export and educator tools

### One-time packs

- Jazz Cadences — $8.99
- Neo-Soul Progressions — $9.99
- Gospel & Soul Movement — $9.99
- Cinematic Harmony — $6.99

These are launch hypotheses, not validated market prices. Test annual conversion, pack attachment, churn, and willingness to pay before locking them.

## Important product next steps

- Replace animation-frame chord triggering with an AudioContext lookahead scheduler.
- Add proper measures, count-in, accent patterns, and compound-meter pulse settings.
- Separate chord identity from voicing and hand assignment.
- Add exact-voicing, inversion-tolerant, and hand-specific evaluation modes.
- Add sustain-pedal handling, selected MIDI device management, and velocity scoring.
- Add sampled piano/electric-piano sounds.
- Add authentication, cloud storage, analytics, and backend entitlement verification.
- Build native StoreKit and Google Play Billing wrappers if distributing through mobile stores.
