import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { QUALITIES } from '../data/music.js';
import { spellPitchClass } from '../lib/music.js';

const DURATION_OPTIONS = [1, 2, 3, 4, 6, 8, 12, 16];

export default function ProgressionEditor({ progression, currentKey, onAdd, onUpdate, onDelete, onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#02050A]/90 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="progression-editor-title">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border border-cyan-800 bg-[#0a1628] shadow-[0_0_50px_rgba(8,145,178,0.3)]">
        <div className="flex items-center justify-between border-b border-cyan-900/60 p-5 md:p-6">
          <div>
            <h2 id="progression-editor-title" className="text-lg font-black tracking-widest text-cyan-300 md:text-xl">EDIT PROGRESSION</h2>
            <p className="mt-1 text-xs text-slate-500">Roots are shown as sounding chords in {currentKey.label}.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close progression editor" className="rounded-xl p-2 text-cyan-600 transition hover:bg-cyan-900/40 hover:text-cyan-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="scrollbar-thin space-y-3 overflow-y-auto p-4 md:p-6">
          {progression.map((chord, index) => (
            <div key={chord.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-cyan-900/40 bg-[#0f2038] p-3 md:flex-nowrap md:p-4">
              <div className="hidden w-7 font-mono font-bold text-cyan-600 md:block">{index + 1}.</div>
              <label className="min-w-[120px] flex-1">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-cyan-500">Root</span>
                <select
                  value={chord.rootOffset}
                  onChange={(event) => onUpdate(index, 'rootOffset', Number(event.target.value))}
                  className="w-full rounded-xl border border-cyan-900/50 bg-slate-800/80 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                >
                  {Array.from({ length: 12 }, (_, offset) => (
                    <option key={offset} value={offset}>
                      {spellPitchClass(currentKey.offset + offset, currentKey.accidental)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="min-w-[160px] flex-[1.4]">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-cyan-500">Quality</span>
                <select
                  value={chord.quality}
                  onChange={(event) => onUpdate(index, 'quality', event.target.value)}
                  className="w-full rounded-xl border border-cyan-900/50 bg-slate-800/80 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                >
                  {QUALITIES.map((quality) => (
                    <option key={quality.value} value={quality.value}>{quality.label}</option>
                  ))}
                </select>
              </label>
              <label className="min-w-[100px] flex-1">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-cyan-500">Beats</span>
                <select
                  value={chord.durationBeats}
                  onChange={(event) => onUpdate(index, 'durationBeats', Number(event.target.value))}
                  className="w-full rounded-xl border border-cyan-900/50 bg-slate-800/80 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                >
                  {DURATION_OPTIONS.map((beats) => <option key={beats} value={beats}>{beats}</option>)}
                </select>
              </label>
              <button
                type="button"
                onClick={() => onDelete(index)}
                disabled={progression.length <= 1}
                aria-label={`Delete chord ${index + 1}`}
                className="self-end rounded-xl p-2.5 text-red-400/80 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-30"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={onAdd} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cyan-800/50 py-4 font-bold tracking-widest text-cyan-500 transition hover:border-cyan-400 hover:bg-cyan-900/30">
            <Plus className="h-5 w-5" /> ADD CHORD
          </button>
        </div>

        <div className="mt-auto rounded-b-3xl border-t border-cyan-900/60 bg-[#07101d] p-5 md:p-6">
          <button type="button" onClick={onClose} className="w-full rounded-xl bg-cyan-500 py-3.5 font-black tracking-[0.2em] text-[#050B14] shadow-[0_0_15px_rgba(6,182,212,0.4)] transition hover:bg-cyan-400 md:py-4">DONE</button>
        </div>
      </div>
    </div>
  );
}
