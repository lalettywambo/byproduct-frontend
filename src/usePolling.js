import { useEffect } from 'react';

const EVERY_MS = 10000; // 10 seconds

// Call reload() every 10 seconds while the tab is open, so a page shows what the
// other business did without a page reload: usePolling(me.reload, me.loading);
//   reload - the reload function from useApi
//   busy   - true while the last request is still on its way: don't start another one yet
// Hidden tabs (another tab in front, phone locked) don't poll; when the tab comes back,
// it reloads straight away.
export function usePolling(reload, busy = false) {
  useEffect(() => {
    if (busy) return; // wait for the answer; this effect starts again when it arrives

    function reloadIfVisible() {
      if (document.visibilityState === 'visible') reload();
    }

    const timer = setInterval(reloadIfVisible, EVERY_MS);
    document.addEventListener('visibilitychange', reloadIfVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', reloadIfVisible);
    };
  }, [reload, busy]);
}
