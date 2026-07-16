import React, { useState } from 'react';
import { Check, Crown, LockKeyhole, ShoppingBag, Sparkles, X } from 'lucide-react';
import { PACKS, SUBSCRIPTION_PLANS } from '../data/music.js';

export default function StoreModal({ entitlements, onClose, onChoosePlan, onBuyPack }) {
  const [tab, setTab] = useState('plans');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="store-title">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-cyan-800/70 bg-[#081321] shadow-[0_0_60px_rgba(8,145,178,0.28)]">
        <div className="flex items-center justify-between border-b border-cyan-900/60 p-5 md:p-6">
          <div>
            <div className="mb-1 flex items-center gap-2 text-cyan-300">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.22em]">Chord Master Store</span>
            </div>
            <h2 id="store-title" className="text-2xl font-black text-white">Choose how you want to learn</h2>
            <p className="mt-1 text-sm text-slate-400">Subscriptions unlock the full practice system. Packs permanently unlock selected libraries.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close store" className="rounded-xl p-2 text-cyan-500 transition hover:bg-cyan-900/40 hover:text-cyan-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex gap-2 border-b border-cyan-900/50 px-5 pt-4 md:px-6">
          {[
            { id: 'plans', label: 'Memberships' },
            { id: 'packs', label: 'One-time Packs' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-t-xl px-5 py-3 text-sm font-bold transition ${tab === item.id ? 'bg-cyan-500 text-slate-950' : 'text-cyan-300 hover:bg-cyan-900/30'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="scrollbar-thin overflow-y-auto p-5 md:p-6">
          {tab === 'plans' ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isCurrent = entitlements.plan === plan.id;
                const isPro = plan.id === 'pro';
                return (
                  <article key={plan.id} className={`relative flex flex-col rounded-3xl border p-5 ${isPro ? 'border-amber-400/70 bg-amber-400/[0.06]' : 'border-cyan-900/70 bg-slate-950/35'}`}>
                    {isPro && (
                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-950">
                        <Crown className="h-3.5 w-3.5" /> Best value
                      </div>
                    )}
                    <div className="mb-4">
                      <h3 className="text-xl font-black text-white">{plan.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{plan.tagline}</p>
                    </div>
                    <div className="mb-5 flex items-end gap-3">
                      <div className="text-3xl font-black text-cyan-300">{plan.monthly}</div>
                      {plan.id !== 'free' && <div className="pb-1 text-xs text-slate-500">or {plan.annual}</div>}
                    </div>
                    <ul className="mb-6 space-y-3 text-sm text-slate-300">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => onChoosePlan(plan.id)}
                      className={`mt-auto rounded-2xl px-4 py-3 text-sm font-black tracking-wide transition ${isCurrent ? 'cursor-default border border-emerald-600/50 bg-emerald-500/10 text-emerald-300' : isPro ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'}`}
                    >
                      {isCurrent ? 'CURRENT PLAN' : plan.id === 'free' ? 'SWITCH TO FREE' : `CHOOSE ${plan.name.toUpperCase()}`}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div>
              <div className="mb-5 rounded-2xl border border-cyan-900/60 bg-cyan-950/20 p-4 text-sm text-cyan-100">
                <div className="flex gap-3">
                  <Sparkles className="h-5 w-5 shrink-0 text-cyan-400" />
                  <p>Packs are one-time digital purchases. Plus members can use all standard libraries while subscribed; Pro includes every pack.</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {PACKS.map((pack) => {
                  const owned = entitlements.plan === 'pro' || entitlements.purchasedPacks.includes(pack.id);
                  return (
                    <article key={pack.id} className="rounded-3xl border border-cyan-900/70 bg-slate-950/35 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-black text-white">{pack.name}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{pack.description}</p>
                        </div>
                        <div className="whitespace-nowrap text-lg font-black text-cyan-300">{pack.price}</div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {pack.styles.map((style) => (
                          <span key={style} className="rounded-full border border-cyan-800/60 bg-cyan-950/30 px-3 py-1 text-xs font-bold text-cyan-300">{style}</span>
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={owned}
                        onClick={() => onBuyPack(pack.id)}
                        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${owned ? 'border border-emerald-600/50 bg-emerald-500/10 text-emerald-300' : 'border border-cyan-700 bg-cyan-900/30 text-cyan-200 hover:bg-cyan-800/50'}`}
                      >
                        {owned ? <Check className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
                        {owned ? 'OWNED' : 'UNLOCK PACK'}
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            Prototype billing is simulated locally. Production builds should replace these buttons with StoreKit, Google Play Billing, or Stripe Checkout and verify entitlements on a backend.
          </p>
        </div>
      </div>
    </div>
  );
}
