import React, { useEffect, useState } from 'react';
import { FolderOpen, Plus, Save, Trash2, X } from 'lucide-react';
import { QUALITIES } from '../data/music.js';
import { spellPitchClass } from '../lib/music.js';

const DURATION_OPTIONS = [1, 2, 3, 4, 6, 8, 12, 16];

export default function ProgressionEditor({
  progression,
  currentKey,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
  savedProgressions = [],
  activeSavedId = null,
  initialName = 'Custom Progression',
  onSave,
  onLoadSaved,
  onDeleteSaved,
  canSaveUnlimited = false,
}) {
  const [tab, setTab] = useState('edit');
  const [name, setName] = useState(initialName);

  useEffect(() => setName(initialName), [initialName]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#02050A]/90 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="progression-editor-title">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-cyan-800 bg-[#0a1628] shadow-[0_0_50px_rgba(8,145,178,0.3)]">
        <div className="flex items-center justify-between border-b border-cyan-900/60 p-5 md:p-6">
          <div>
            <h2 id="progression-editor-title" className="text-lg font-black tracking-widest text-cyan-300 md:text-xl">PROGRESSION WORKSHOP</h2>
            <p className="mt-1 text-xs text-slate-500">Edit sounding chords in {currentKey.name}, then save the progression for later practice.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close progression editor" className="rounded-xl p-2 text-cyan-600 transition hover:bg-cyan-900/40 hover:text-cyan-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex gap-2 border-b border-cyan-900/50 px-5 pt-4 md:px-6">
          <button type="button" onClick={() => setTab('edit')} className={`rounded-t-xl px-5 py-3 text-sm font-bold transition ${tab === 'edit' ? 'bg-cyan-500 text-slate-950' : 'text-cyan-300 hover:bg-cyan-900/30'}`}>Edit</button>
          <button type="button" onClick={() => setTab('saved')} className={`rounded-t-xl px-5 py-3 text-sm font-bold transition ${tab === 'saved' ? 'bg-cyan-500 text-slate-950' : 'text-cyan-300 hover:bg-cyan-900/30'}`}>
            Saved ({savedProgressions.length})
          </button>
        </div>

        {tab === 'edit' ? (
          <>
            <div className="border-b border-cyan-900/40 p-4 md:px-6">
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-cyan-500">Progression name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} className="w-full rounded-xl border border-cyan-900/60 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-cyan-400" />
              </label>
            </div>

            <div className="scrollbar-thin space-y-3 overflow-y-auto p-4 md:p-6">
              {progression.map((chord, index) => (
                <div key={chord.id} className="grid gap-3 rounded-2xl border border-cyan-900/40 bg-[#0f2038] p-3 md:grid-cols-[2rem_1fr_1.4fr_0.8fr_1fr_auto] md:items-end md:p-4">
                  <div className="hidden pb-3 font-mono font-bold text-cyan-600 md:block">{index + 1}.</div>
                  <label>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-cyan-500">Root</span>
                    <select value={chord.rootOffset} onChange={(event) => onUpdate(index, 'rootOffset', Number(event.target.value))} className="w-full rounded-xl border border-cyan-900/50 bg-slate-800/80 px-3 py-2.5 text-white outline-none focus:border-cyan-400">
                      {Array.from({ length: 12 }, (_, offset) => (
                        <option key={offset} value={offset}>{spellPitchClass(currentKey.offset + offset, currentKey.accidental)}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-cyan-500">Quality</span>
                    <select value={chord.quality} onChange={(event) => onUpdate(index, 'quality', event.target.value)} className="w-full rounded-xl border border-cyan-900/50 bg-slate-800/80 px-3 py-2.5 text-white outline-none focus:border-cyan-400">
                      {QUALITIES.map((quality) => <option key={quality.value} value={quality.value}>{quality.label}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-cyan-500">Units</span>
                    <select value={chord.durationBeats} onChange={(event) => onUpdate(index, 'durationBeats', Number(event.target.value))} className="w-full rounded-xl border border-cyan-900/50 bg-slate-800/80 px-3 py-2.5 text-white outline-none focus:border-cyan-400">
                      {DURATION_OPTIONS.map((beats) => <option key={beats} value={beats}>{beats}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-cyan-500">Roman numeral</span>
                    <input value={chord.numeral ?? ''} onChange={(event) => onUpdate(index, 'numeral', event.target.value)} placeholder="e.g. V7" className="w-full rounded-xl border border-cyan-900/50 bg-slate-800/80 px-3 py-2.5 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400" />
                  </label>
                  <button type="button" onClick={() => onDelete(index)} disabled={progression.length <= 1} aria-label={`Delete chord ${index + 1}`} className="rounded-xl p-2.5 text-red-400/80 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-30">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={onAdd} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cyan-800/50 py-4 font-bold tracking-widest text-cyan-500 transition hover:border-cyan-400 hover:bg-cyan-900/30">
                <Plus className="h-5 w-5" /> ADD CHORD
              </button>
            </div>

            <div className="mt-auto rounded-b-3xl border-t border-cyan-900/60 bg-[#07101d] p-5 md:p-6">
              <div className="mb-3 text-center text-xs text-slate-500">
                {canSaveUnlimited ? 'Your plan includes unlimited saved progressions.' : 'Free includes one saved progression. Upgrade to Plus for unlimited saves.'}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <button type="button" onClick={() => onSave(name, activeSavedId)} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3.5 font-black tracking-[0.16em] text-[#050B14] shadow-[0_0_15px_rgba(6,182,212,0.4)] transition hover:bg-cyan-400">
                  <Save className="h-5 w-5" /> SAVE
                </button>
                <button type="button" onClick={onClose} className="rounded-xl border border-cyan-700 py-3.5 font-black tracking-[0.16em] text-cyan-300 transition hover:bg-cyan-900/40">DONE</button>
              </div>
            </div>
          </>
        ) : (
          <div className="scrollbar-thin min-h-[18rem] space-y-3 overflow-y-auto p-4 md:p-6">
            {savedProgressions.length === 0 ? (
              <div className="flex min-h-[14rem] flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-900/60 text-center">
                <FolderOpen className="mb-3 h-8 w-8 text-cyan-700" />
                <p className="font-bold text-cyan-200">No saved progressions yet</p>
                <p className="mt-1 text-sm text-slate-500">Build one in the Edit tab and save it.</p>
              </div>
            ) : savedProgressions.map((item) => (
              <div key={item.id} className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${item.id === activeSavedId ? 'border-cyan-500 bg-cyan-500/10' : 'border-cyan-900/50 bg-slate-950/30'}`}>
                <button type="button" onClick={() => { onLoadSaved(item); setName(item.name); setTab('edit'); }} className="min-w-0 flex-1 text-left">
                  <div className="truncate font-black text-white">{item.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.progression.length} chords • {item.meterId} • {item.modeId}</div>
                </button>
                <button type="button" onClick={() => onDeleteSaved(item.id)} aria-label={`Delete ${item.name}`} className="rounded-xl p-2 text-red-400 transition hover:bg-red-500/20"><Trash2 className="h-5 w-5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
