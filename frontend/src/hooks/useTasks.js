import { useState, useEffect } from 'react';
import { fetchTasks } from '../api';

export function useTasks(query, status, page, pageSize) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce search query by 600ms to avoid spamming the backend on each keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 600);

    return () => clearTimeout(handler);
  }, [query]);

  // Fetch tasks when debouncedQuery, status, page, or pageSize changes
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchTasks({
      query: debouncedQuery,
      status,
      page,
      pageSize,
      signal: controller.signal,
    })
      .then((data) => {
        setTasks(data.items);
        setTotal(data.total);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, status, page, pageSize]);

  return { tasks, total, loading, error };
}
