import { useCallback, useEffect, useRef, useState } from 'react';

export class ApiError extends Error {
  constructor(message, field, status) {
    super(message);
    this.field = field;
    this.status = status;
  }
}

async function request(path, body) {
  let res;
  try {
    res = await fetch(path, body === undefined ? undefined : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    throw new ApiError('We could not reach CashG. Check that the CashG window is still open, then try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'Something went wrong. Please try again.', data.field, res.status);
  return data;
}

export const api = {
  meta: () => request('/api/meta'),
  tickets: () => request('/api/tickets'),
  ticket: (ref) => request(`/api/tickets/${encodeURIComponent(ref)}`),
  createTicket: (input) => request('/api/tickets', input),
  markSeen: (ref) => request(`/api/tickets/${encodeURIComponent(ref)}/seen`, {}),
  setStatus: (ref, to, note) => request(`/api/tickets/${encodeURIComponent(ref)}/status`, { to, note }),
  sendMessage: (ref, actor, body) => request(`/api/tickets/${encodeURIComponent(ref)}/messages`, { actor, body }),
  reset: () => request('/api/reset', {}),
};

/**
 * Loads data, and loads it again whenever the tab regains focus, so a change made
 * in the Support console shows up when the tester switches back to the customer app.
 */
export function useLoad(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const latest = useRef(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(loader, deps);

  const reload = useCallback(() => {
    const id = ++latest.current;
    return load().then(
      (data) => id === latest.current && setState({ data, error: null, loading: false }),
      (error) => id === latest.current && setState((s) => ({ data: s.data, error, loading: false }))
    );
  }, [load]);

  useEffect(() => {
    setState((s) => ({ ...s, loading: true }));
    reload();
    const onFocus = () => document.visibilityState === 'visible' && reload();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      latest.current++;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [reload]);

  const setData = useCallback((data) => setState({ data, error: null, loading: false }), []);
  return { ...state, reload, setData };
}
