import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Button ─────────────────────────────────────────────────────────────────
const BTN_VARIANTS = {
  primary:
    'bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 border border-neutral-900',
  secondary:
    'bg-white text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200',
  danger:
    'bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200 border border-red-200',
  ghost:
    'bg-transparent text-neutral-500 hover:bg-neutral-100 active:bg-neutral-200 border border-transparent',
};

const BTN_SIZES = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-4 text-[13.5px] gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className = '',
  ...props
}) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-all duration-150 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1
        ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]} ${className}
      `}
    >
      {loading ? (
        <svg
          className="w-3.5 h-3.5 animate-spin"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle
            cx="8"
            cy="8"
            r="6"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="28"
            strokeDashoffset="10"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
export function Input({ label, error, hint, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          h-9 px-3 rounded-lg border text-[13.5px] text-neutral-900
          bg-white placeholder:text-neutral-300
          outline-none transition-all duration-150 w-full
          focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400
          disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
          ${
            error
              ? 'border-red-300 bg-red-50 focus:ring-red-100 focus:border-red-400'
              : 'border-neutral-200 hover:border-neutral-300'
          }
          ${className}
        `}
      />
      {error && <p className="text-[11.5px] text-red-500 mt-0.5">{error}</p>}
      {hint && !error && (
        <p className="text-[11.5px] text-neutral-400 mt-0.5">{hint}</p>
      )}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
const BADGE_COLORS = {
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

export function Badge({ color = 'slate', children, className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px]
        font-medium border leading-tight
        ${BADGE_COLORS[color]} ${className}
      `}
    >
      {children}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-lg',
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.target === overlayRef.current && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.975, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.975, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`bg-white rounded-2xl shadow-2xl shadow-black/10 w-full ${width} flex flex-col max-h-[90vh] ring-1 ring-black/5`}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-neutral-100 shrink-0">
              <div>
                <h2 className="text-[15px] font-semibold text-neutral-900 tracking-tight leading-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[12.5px] text-neutral-400 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400
                  hover:bg-neutral-100 hover:text-neutral-600 transition-colors duration-150 -mt-0.5 -mr-1"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 2L12 12M12 2L2 12"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 px-6 py-5 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  loading,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="text-[13.5px] text-neutral-500 leading-relaxed mb-5">
        {description}
      </p>
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={`animate-spin text-neutral-400 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="40"
        strokeDashoffset="15"
      />
    </svg>
  );
}
