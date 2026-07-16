# Chord Master Prototype

A responsive React/Vite application for learning and practicing chord progressions with visual keyboard guidance, Web Audio playback, touch input, physical MIDI input, progression editing, subscription tiers, and one-time content packs.

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

## Theory and practice system

The application now includes the principal product and music-theory improvements identified during review:

- Chord identity is separated from voicing, with right-hand, beginner two-hand, open two-hand, and jazz-shell profiles.
- Left- and right-hand notes are displayed separately on an expanded C3–C6 keyboard.
- Chord-tone, root-in-bass, exact-voicing, and exact-hand evaluation modes provide progressively stricter practice.
- Incorrect performances receive diagnostic missing-note and extra-note feedback.
- Audio chords and metronome clicks are scheduled against the Web Audio clock; animation frames drive only the visual timeline.
- Metronome modes support off, count-in only, or full demonstration playback, including 4/4, 3/4, 6/8, and 12/8 accent patterns.
- The timeline is measure-aware, duration-proportional, horizontally scrollable, and supports long forms such as 12-bar blues.
- Presets carry tonic-mode context, Roman numerals, recommended meter, tempo, feel, voicing, and theory focus.
- Physical MIDI supports device selection, velocity, connection changes, and sustain pedal CC64.
- The Progression Workshop supports Roman-numeral labels, variable durations, and saved progressions in local storage. Free includes one saved progression; Plus and Pro allow unlimited saves.

## Implemented

- Style and progression library spanning jazz, neo-soul, gospel, funk, rock, pop, country, folk, cinematic, and classical-influenced harmony
- Progressions with different chord counts, durations, meters, tonal modes, and harmonic forms
- Roman-numeral and sounding-chord display with sharp/flat spelling
- Scheduled demonstrations, count-in, compound-meter accents, and optional metronome
- Virtual piano keyboard and physical Web MIDI input
- Sustain-pedal handling and MIDI velocity response
- Imitation practice with release gating and diagnostic feedback
- Right-hand and two-hand voicing guidance
- Editable and locally saved custom progressions
- Free, Plus, and Pro entitlement model
- One-time Jazz, Neo-Soul, Gospel, and Cinematic content packs
- Paywall/store interface and feature gating
- LocalStorage-backed mock purchases for prototype testing

## Prototype purchase testing

Purchases are intentionally simulated. Choosing a plan or pack writes entitlements to `localStorage` under:

```text
chord-master-entitlements-v1
```

Saved custom progressions use:

```text
chord-master-custom-progressions-v1
```

Clear those values in browser storage to reset the prototype account and saved library.

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
- Chord-tone imitation practice
- One saved custom progression

### Plus — proposed $6.99/month or $59.99/year

- All standard progression libraries
- MIDI input, sustain, and velocity
- Unlimited saved custom progressions
- Two-hand voicings, metronome, count-in, and multiple meters
- Root-in-bass evaluation

### Pro — proposed $12.99/month or $99.99/year

- Everything in Plus
- All premium packs
- Jazz shell and exact-hand voicing drills
- Exact-voicing evaluation and richer diagnostic feedback
- Advanced analytics, export, and educator tools when the backend is added

### One-time packs

- Jazz Cadences — $8.99
- Neo-Soul Progressions — $9.99
- Gospel & Soul Movement — $9.99
- Cinematic Harmony — $6.99

These are launch hypotheses, not validated market prices. Test annual conversion, pack attachment, churn, and willingness to pay before locking them.

## Remaining production roadmap

- Replace the oscillator prototype with sampled acoustic-piano, electric-piano, organ, and style-specific sounds.
- Add authentication, cloud synchronization, secure backend entitlements, practice history, and analytics.
- Add adaptive drills, timing and velocity scoring, voice-leading lessons, and progressive skill paths.
- Integrate real StoreKit, Google Play Billing, and Stripe purchase adapters.
- Add export, assignment, classroom, and educator-management tools.
- Add automated unit, integration, browser, MIDI-device, accessibility, and mobile-layout test coverage.
