import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { STATUS } from './lib.js';

// shortcut: importing the whole icon set makes the download larger, which does not matter for a
// copy that runs from the tester's own computer. Switch to named imports if this is ever hosted online.
export function Icon({ name, size = 20, ...rest }) {
  const Cmp = Icons[name] || Icons.Circle;
  return <Cmp size={size} strokeWidth={1.75} aria-hidden="true" {...rest} />;
}

export function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <path d="M21.5 10.2a8 8 0 1 0 0 11.6" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="23.2" cy="16" r="2.4" fill="#fff" />
    </svg>
  );
}

export function Button({ variant = 'primary', size, block, busy, icon, children, className = '', ...rest }) {
  const cls = ['btn', variant, size === 'sm' && 'sm', block && 'wide', className].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} disabled={busy || rest.disabled} aria-busy={busy || undefined} {...rest}>
      {busy ? <span className="spinner" aria-hidden="true" /> : icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </button>
  );
}

export function IconButton({ icon, label, ...rest }) {
  return (
    <button type="button" className="icon-btn" aria-label={label} title={label} {...rest}>
      <Icon name={icon} />
    </button>
  );
}

const STATUS_ICON = {
  submitted: 'Send', received: 'Inbox', under_review: 'Search', in_progress: 'Wrench',
  waiting_for_customer: 'MessageCircle', resolved: 'Check', closed: 'Archive',
};
export const statusIcon = (status) => STATUS_ICON[status] || 'Circle';

// Status is always an icon and a word together, never colour alone.
export function StatusPill({ status, audience = 'customer' }) {
  const meta = STATUS[status];
  const label = status === 'waiting_for_customer' && audience === 'support' ? 'Waiting for customer' : meta.short;
  return (
    <span className={`pill ${meta.tone}`}>
      <Icon name={statusIcon(status)} size={14} />
      {label}
    </span>
  );
}

export function Field({ label, optional, hint, error, count, children }) {
  const id = useId();
  const describedBy = [error && `${id}-err`, (hint || count) && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label} {optional && <span className="optional">(optional)</span>}
      </label>
      {children({ id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': describedBy })}
      {error && (
        <p className="error" id={`${id}-err`} role="alert">
          <Icon name="AlertCircle" size={16} style={{ marginTop: 2, flex: 'none' }} />
          {error}
        </p>
      )}
      {(hint || count) && (
        <p className="hint" id={`${id}-hint`}>
          <span>{hint}</span>
          {count && <span className="num">{count}</span>}
        </p>
      )}
    </div>
  );
}

export function Segmented({ label, value, onChange, options }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}>
          {o.icon && <Icon name={o.icon} size={16} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, label }) {
  return <button type="button" className="switch" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} />;
}

export function Chips({ label, value, onChange, options }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" className="chip" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
          {o.count != null && <span className="num"> {o.count}</span>}
        </button>
      ))}
    </div>
  );
}

// A native <dialog>: the browser handles focus trapping, Escape and background inertness.
export function Sheet({ open, onClose, title, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <>
          <div className="sheet-head">
            <h2>{title}</h2>
            <IconButton icon="X" label="Close" onClick={onClose} />
          </div>
          <div className="sheet-body">{children}</div>
        </>
      )}
    </dialog>
  );
}

export function Empty({ icon = 'Inbox', title, children, action }) {
  return (
    <div className="empty">
      <Icon name={icon} size={32} style={{ color: 'var(--muted)' }} />
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function LoadError({ error, onRetry }) {
  return (
    <div className="empty" role="alert">
      <Icon name="WifiOff" size={32} style={{ color: 'var(--negative)' }} />
      <h2>We could not load this</h2>
      <p>{error.message}</p>
      <Button variant="secondary" icon="RotateCcw" onClick={onRetry}>Try again</Button>
    </div>
  );
}

export function SkeletonRows({ rows = 3 }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div className="row" key={i}>
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 999 }} />
          <div className="row-main" style={{ display: 'grid', gap: 8 }}>
            <div className="skeleton" style={{ height: 14, width: '60%' }} />
            <div className="skeleton" style={{ height: 12, width: '35%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, icon = 'Check') => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list.slice(-2), { id, message, icon }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className="toast"
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              <Icon name={t.icon} size={18} />
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
