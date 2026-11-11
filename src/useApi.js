import { useEffect, useState } from 'react';
import { api } from './api';

// Load data for a page: const { data, error, loading, reload } = useApi('/me/');
// Pass getAll as the second argument to fetch every page of a list.
// After reload(), the old data stays on screen until the new data arrives.
export function useApi(path, load = api) {
  const [version, setVersion] = useState(0); // bumped by reload() to fetch again
  const [result, setResult] = useState({ key: null, data: null, error: null });
  const key = `${path} #${version}`;

  useEffect(() => {
    let stale = false; // true once path changes or the page closes, so old answers are ignored
    load(path).then(
      (data) => !stale && setResult({ key, data, error: null }),
      (error) => !stale && setResult({ key, data: null, error }),
    );
    return () => {
      stale = true;
    };
  }, [key, path, load]);

  return {
    data: result.data,
    error: result.error,
    loading: result.key !== key, // the answer we have isn't for the latest request yet
    reload: () => setVersion((v) => v + 1),
  };
}
