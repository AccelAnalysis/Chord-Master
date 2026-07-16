import React from 'react';
import { generateKeyboard, spellPitchClass } from '../lib/music.js';

const KEYBOARD = generateKeyboard(48, 84);
const WHITE_KEYS = KEYBOARD.filter((key) => !key.isBlack);
const BLACK_KEYS = KEYBOARD.filter((key) => key.isBlack);
const WHITE_KEY_WIDTH = 100 / WHITE_KEYS.length;
const BLACK_OFFSETS = { 1: 0, 3: 1, 6: 3, 8: 4, 10: 5 };

export default function PianoKeyboard({
  expectedNotes,
  expectedLeftHandNotes = [],
  expectedRightHandNotes = [],
  pressedKeys,
  phase,
  onNoteOn,
  onNoteOff,
  accidental = 'sharp',
}) {
  const expected = new Set(expectedNotes);
  const expectedLeft = new Set(expectedLeftHandNotes);
  const expectedRight = new Set(expectedRightHandNotes);
  const practicePhase = ['waiting_imitate', 'transitioning', 'waiting_release'].includes(phase);

  const getWhiteStyle = (key) => {
    const isExpected = expected.has(key.midi);
    const isPressed = pressedKeys.has(key.midi);
    const isLeft = expectedLeft.has(key.midi);

    if (isPressed) return 'z-10 bg-gradient-to-b from-orange-300 to-orange-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.6),0_0_20px_rgba(249,115,22,0.8)]';
    if (isExpected && phase === 'demonstrating') {
      return isLeft
        ? 'z-10 bg-gradient-to-b from-indigo-200 to-indigo-500 shadow-[0_0_18px_rgba(99,102,241,0.75)]'
        : 'z-10 bg-gradient-to-b from-cyan-200 to-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.75)]';
    }
    if (isExpected && practicePhase) {
      return isLeft
        ? 'border-b-4 border-b-indigo-500 bg-gradient-to-b from-gray-200 to-indigo-100'
        : 'border-b-4 border-b-orange-400 bg-gradient-to-b from-gray-200 to-orange-100';
    }
    return 'bg-gradient-to-b from-white to-gray-200';
  };

  const getBlackStyle = (key) => {
    const isExpected = expected.has(key.midi);
    const isPressed = pressedKeys.has(key.midi);
    const isLeft = expectedLeft.has(key.midi);

    if (isPressed) return 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]';
    if (isExpected && phase === 'demonstrating') {
      return isLeft
        ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]'
        : 'bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]';
    }
    if (isExpected && practicePhase) return isLeft ? 'border-b-4 border-b-indigo-500 bg-gray-700' : 'border-b-4 border-b-orange-500 bg-gray-700';
    return 'bg-gradient-to-b from-gray-800 to-black shadow-[inset_0_2px_5px_rgba(255,255,255,0.1),2px_0_5px_rgba(0,0,0,0.6)]';
  };

  return (
    <section className="relative mx-auto mb-7 mt-auto flex h-40 w-full max-w-6xl justify-start overflow-x-auto select-none touch-none md:h-56">
      <div className="relative flex h-full w-full min-w-[900px] overflow-hidden rounded-b-2xl border-t-[8px] border-t-gray-900 bg-[#0a0a0a] shadow-[0_20px_50px_rgba(0,0,0,0.6)] md:border-t-[12px]">
        <div className="flex h-full w-full">
          {WHITE_KEYS.map((key) => (
            <button
              key={key.midi}
              type="button"
              aria-label={`Play ${spellPitchClass(key.noteClass, accidental)}${key.octave}`}
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture?.(event.pointerId);
                onNoteOn(key.midi, `virtual-${event.pointerId}`);
              }}
              onPointerUp={(event) => onNoteOff(key.midi, `virtual-${event.pointerId}`)}
              onPointerCancel={(event) => onNoteOff(key.midi, `virtual-${event.pointerId}`)}
              className={`relative flex-1 rounded-b-lg border-r border-gray-400 outline-none transition-colors duration-75 focus:ring-2 focus:ring-inset focus:ring-cyan-500 ${getWhiteStyle(key)}`}
            >
              {key.noteClass === 0 && (
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500">
                  C{key.octave}
                </span>
              )}
            </button>
          ))}
        </div>

        {BLACK_KEYS.map((key) => {
          const octaveOffset = key.octave - 3;
          const whiteKeyIndex = BLACK_OFFSETS[key.noteClass] + octaveOffset * 7;
          const left = (whiteKeyIndex + 1) * WHITE_KEY_WIDTH;

          return (
            <button
              key={key.midi}
              type="button"
              aria-label={`Play ${spellPitchClass(key.noteClass, accidental)}${key.octave}`}
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture?.(event.pointerId);
                onNoteOn(key.midi, `virtual-${event.pointerId}`);
              }}
              onPointerUp={(event) => onNoteOff(key.midi, `virtual-${event.pointerId}`)}
              onPointerCancel={(event) => onNoteOff(key.midi, `virtual-${event.pointerId}`)}
              className={`absolute top-0 z-20 h-[62%] w-[2.9%] rounded-b-md outline-none transition-colors duration-75 focus:ring-2 focus:ring-inset focus:ring-cyan-500 ${getBlackStyle(key)}`}
              style={{ left: `calc(${left}% - 1.45%)` }}
            />
          );
        })}
      </div>
    </section>
  );
}
