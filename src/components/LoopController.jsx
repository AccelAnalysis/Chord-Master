import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Repeat2 } from 'lucide-react';

const PLAY_LABEL = 'Play demonstration';
const STOP_LABEL = 'Stop demonstration';
const RESET_LABEL = 'Reset transport';

const findTransportButton = () => document.querySelector(
  `button[aria-label="${PLAY_LABEL}"], button[aria-label="${STOP_LABEL}"]`,
);

export default function LoopController() {
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [mountNode, setMountNode] = useState(null);
  const loopEnabledRef = useRef(false);
  const manualStopUntilRef = useRef(0);
  const playbackStartedAtRef = useRef(0);
  const lastLabelRef = useRef('');
  const mountNodeRef = useRef(null);

  useEffect(() => {
    loopEnabledRef.current = loopEnabled;
  }, [loopEnabled]);

  useEffect(() => {
    const ensureMountNode = () => {
      const transportButton = findTransportButton();
      if (!transportButton?.parentElement) return null;

      let node = mountNodeRef.current;
      if (!node || !document.body.contains(node)) {
        node = document.createElement('div');
        node.dataset.loopController = 'true';
        node.className = 'flex shrink-0';
        mountNodeRef.current = node;
        setMountNode(node);
      }

      if (node.previousElementSibling !== transportButton) {
        transportButton.insertAdjacentElement('afterend', node);
      }
      return transportButton;
    };

    const handleTransportState = () => {
      const transportButton = ensureMountNode();
      if (!transportButton) return;

      const nextLabel = transportButton.getAttribute('aria-label') || '';
      const previousLabel = lastLabelRef.current;
      const now = performance.now();

      if (previousLabel === PLAY_LABEL && nextLabel === STOP_LABEL) {
        playbackStartedAtRef.current = now;
      }

      const completedNaturally = previousLabel === STOP_LABEL
        && nextLabel === PLAY_LABEL
        && now - playbackStartedAtRef.current > 300
        && now > manualStopUntilRef.current;

      if (completedNaturally && loopEnabledRef.current && !transportButton.disabled) {
        requestAnimationFrame(() => {
          const currentButton = findTransportButton();
          if (
            loopEnabledRef.current
            && currentButton?.getAttribute('aria-label') === PLAY_LABEL
            && !currentButton.disabled
          ) {
            currentButton.click();
          }
        });
      }

      lastLabelRef.current = nextLabel;
    };

    const handleManualStop = (event) => {
      const button = event.target.closest?.('button[aria-label]');
      const label = button?.getAttribute('aria-label');
      if (label === STOP_LABEL || label === RESET_LABEL) {
        manualStopUntilRef.current = performance.now() + 900;
      }
    };

    document.addEventListener('click', handleManualStop, true);
    const observer = new MutationObserver(handleTransportState);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-label', 'disabled'],
    });
    handleTransportState();

    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleManualStop, true);
      mountNodeRef.current?.remove();
      mountNodeRef.current = null;
    };
  }, []);

  if (!mountNode) return null;

  return createPortal(
    <button
      type="button"
      onClick={() => setLoopEnabled((enabled) => !enabled)}
      aria-pressed={loopEnabled}
      aria-label={loopEnabled ? 'Disable progression loop' : 'Enable progression loop'}
      className={`flex h-12 items-center gap-2 rounded-2xl border px-3 text-[10px] font-black tracking-widest transition md:h-14 ${
        loopEnabled
          ? 'border-cyan-300 bg-cyan-400/20 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.25)]'
          : 'border-cyan-800/60 bg-slate-950/30 text-slate-400 hover:border-cyan-500 hover:text-cyan-200'
      }`}
    >
      <Repeat2 className="h-4 w-4" />
      LOOP
    </button>,
    mountNode,
  );
}
