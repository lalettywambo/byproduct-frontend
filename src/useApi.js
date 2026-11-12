import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

// Load data for a page: const { data, error, loading, reload } = useApi('/me/');
// Pass getAll as the second argument to fetch every page of a list.
// After reload(), the old data stays on screen until the new data arrives.
// If a reload fails, the old data stays and no error is shown (the next reload tries again).
// Pass null as the path to load nothing (e.g. a form that only loads data when editing).
export function useApi(path, load = api) {
  const [version, setVersion] = useState(0); // bumped by reload() to fetch again
  const [result, setResult] = useState({ key: null, path: null, data: null, error: null });
  const key = `${path} #${version}`;

  useEffect(() => {
    if (!path) return;
    let stale = false; // true once path changes or the page closes, so old answers are ignored
    load(path).then(
      (data) => !stale && setResult({ key, path, data, error: null }),
      (error) => {
        if (stale) return;
        setResult((old) =>
          // Already showing data for this path: keep it, so a failed refresh doesn't blank the page.
          old.path === path && old.data ? { ...old, key } : { key, path, data: null, error },
        );
      },
    );
    return () => {
      stale = true;
    };
  }, [key, path, load]);

  // useCallback keeps reload the same function on every render, so effects can depend on it.
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return {
    data: result.data,
    error: result.error,
    loading: Boolean(path) && result.key !== key, // the answer we have isn't for the latest request yet
    reload,
  };
}
