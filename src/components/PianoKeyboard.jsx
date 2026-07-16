import React from 'react';
import { generateKeyboard, spellPitchClass } from '../lib/music.js';

const KEYBOARD = generateKeyboard(48, 72);
const WHITE_KEYS = KEYBOARD.filter((key) => !key.isBlack);
const BLACK_KEYS = KEYBOARD.filter((key) => key.isBlack);
const WHITE_KEY_WIDTH = 100 / WHITE_KEYS.length;
const BLACK_OFFSETS = { 1: 0, 3: 1, 6: 3, 8: 4, 10: 5 };

export default function PianoKeyboard({ expectedNotes, pressedKeys, phase, onNoteOn, onNoteOff, accidental = 'sharp' }) {
  const expected = new Set(expectedNotes);

  return (
    <section className="relative mx-auto mb-7 mt-auto flex h-40 w-full max-w-5xl justify-center select-none touch-none md:h-56">
      <div className="relative flex h-full w-full overflow-hidden rounded-b-2xl border-t-[8px] border-t-gray-900 bg-[#0a0a0a] shadow-[0_20px_50px_rgba(0,0,0,0.6)] md:border-t-[12px]">
        <div className="flex h-full w-full">
          {WHITE_KEYS.map((key) => {
            const isExpected = expected.has(key.midi);
            const isPressed = pressedKeys.has(key.midi);
            const expectedDuringDemo = isExpected && phase === 'demonstrating';
            const expectedDuringPractice = isExpected && ['waiting_imitate', 'transitioning', 'waiting_release'].includes(phase);

            let keyStyle = 'bg-gradient-to-b from-white to-gray-200';
            if (isPressed) keyStyle = 'z-10 bg-gradient-to-b from-orange-300 to-orange-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.6),0_0_20px_rgba(249,115,22,0.8)]';
            else if (expectedDuringDemo) keyStyle = 'z-10 bg-gradient-to-b from-cyan-200 to-cyan-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.6),0_0_20px_rgba(34,211,238,0.8)]';
            else if (expectedDuringPractice) keyStyle = 'border-b-4 border-b-orange-400 bg-gradient-to-b from-gray-200 to-gray-300 shadow-[inset_0_-10px_10px_rgba(249,115,22,0.1)]';

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
                className={`relative flex-1 rounded-b-lg border-r border-gray-400 outline-none transition-colors duration-75 focus:ring-2 focus:ring-inset focus:ring-cyan-500 ${keyStyle}`}
              />
            );
          })}
        </div>

        {BLACK_KEYS.map((key) => {
          const isExpected = expected.has(key.midi);
          const isPressed = pressedKeys.has(key.midi);
          const expectedDuringDemo = isExpected && phase === 'demonstrating';
          const expectedDuringPractice = isExpected && ['waiting_imitate', 'transitioning', 'waiting_release'].includes(phase);

          let keyStyle = 'bg-gradient-to-b from-gray-800 to-black shadow-[inset_0_2px_5px_rgba(255,255,255,0.1),2px_0_5px_rgba(0,0,0,0.6)]';
          if (isPressed) keyStyle = 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]';
          else if (expectedDuringDemo) keyStyle = 'bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]';
          else if (expectedDuringPractice) keyStyle = 'border-b-4 border-b-orange-500 bg-gray-700';

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
              className={`absolute top-0 z-20 h-[62%] w-[4.2%] rounded-b-md outline-none transition-colors duration-75 focus:ring-2 focus:ring-inset focus:ring-cyan-500 ${keyStyle}`}
              style={{ left: `calc(${left}% - 2.1%)` }}
            />
          );
        })}
      </div>
    </section>
  );
}
