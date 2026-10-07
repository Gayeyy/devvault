import { CircleAlert } from 'lucide-react';

const buttonStyles = {
  primary:
    'bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:ring-indigo-500/50 shadow-lg shadow-indigo-500/20',
  secondary:
    'border border-zinc-700/80 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white focus-visible:ring-zinc-500/50',
};

export function ToolButton({ icon: Icon, variant = 'secondary', className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40 ${buttonStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

export function Panel({ title, actions, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`flex min-w-0 flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-2.5">
          {title && <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h2>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`flex-1 p-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

export function StatusBadge({ tone = 'neutral', children }) {
  const tones = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    error: 'border-red-500/30 bg-red-500/10 text-red-400',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    neutral: 'border-zinc-700 bg-zinc-800/60 text-zinc-400',
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${tones}`}>
      {children}
    </span>
  );
}

export function CodeTextarea({ className = '', ...props }) {
  return (
    <textarea
      spellCheck={false}
      className={`h-64 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 font-mono text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${className}`}
      {...props}
    />
  );
}

export function ErrorCard({ title = 'Hata', message }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
      <CircleAlert size={18} className="mt-0.5 shrink-0 text-red-400" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-red-300">{title}</p>
        <p className="mt-0.5 break-words text-sm text-red-400/90">{message}</p>
      </div>
    </div>
  );
}
