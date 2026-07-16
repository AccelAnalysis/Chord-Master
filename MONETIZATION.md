# Monetization Design

## Product principle

Subscription value should come from ongoing learning outcomes, not from placing arbitrary limits on the basic instrument. The free tier should demonstrate a complete listen-and-imitate loop. Paid tiers should deepen the experience through content breadth, MIDI, customization, analytics, adaptive practice, and cloud continuity.

## Recommended revenue layers

### Recurring membership

Use subscriptions for benefits that continue to grow or incur ongoing service costs:

- Full progression library
- MIDI and advanced evaluation
- Practice history and analytics
- Adaptive drills
- Cloud synchronization
- New monthly lessons and progression releases
- Educator assignments and student tracking

### Permanent one-time products

Use in-app products for bounded content with durable value:

- Genre progression packs
- Voicing packs
- Premium instrument sound packs
- Artist- or instructor-created lesson collections, with appropriate rights
- Seasonal or themed practice programs

Avoid selling consumable “practice credits.” They add friction without improving the learning model.

## Entitlement model

```text
plan.free
plan.plus
plan.pro
pack.jazz
pack.neo_soul
pack.gospel
pack.cinematic
```

`plan.pro` should imply access to every current first-party pack. `plan.plus` may include the standard catalog while packs remain permanent fallback ownership after cancellation.

## Upgrade moments

Show an upgrade prompt only when the learner reaches a relevant boundary:

- Selecting a locked progression
- Connecting a MIDI keyboard
- Selecting 3/4 or 6/8
- Saving more than the free custom-progression limit
- Opening advanced analytics

Do not interrupt the first practice session with a paywall.

## Introductory offers

Recommended tests:

- Seven-day Plus trial after the learner completes three sessions
- Annual Plus offer after the learner connects MIDI
- Discounted genre pack after practicing the free progression in that genre
- Pro trial tied to the first completed MIDI performance assessment

## Measurement

Track:

- First successful chord and first completed progression
- Free-to-paid conversion by upgrade trigger
- Trial start, activation, and renewal
- Monthly and annual plan mix
- Pack attachment rate
- MIDI connection rate
- Sessions per week and progression completion
- Churn by feature usage
- Refund and failed-payment rates

## Platform implementation

### Native iOS/iPadOS

Use StoreKit for digital subscriptions and packs, restore purchases, and synchronize verified entitlements through the backend.

### Native Android

Use Google Play Billing for subscriptions and one-time products. Verify purchase tokens on the backend and process lifecycle notifications.

### Web

Use Stripe Checkout or an embedded payment flow for subscriptions and one-time purchases. Provision entitlements only after verified webhook events.

Keep catalog IDs mapped through a backend table so pricing and product identifiers can differ by platform while access remains consistent.
