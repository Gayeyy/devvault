import { GitBranch, Vault } from 'lucide-react';

function NavItem({ icon: Icon, name, active = false, onClick }) {
  const base = 'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${active ? 'bg-zinc-800/70 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
      )}
      <Icon
        size={17}
        className={`shrink-0 ${active ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}
      />
      <span className="flex-1 truncate text-left">{name}</span>
    </button>
  );
}

export default function Sidebar({ tools, activeId, onSelect, open, onClose }) {
  return (
    <>
      {/* Mobil karartma katmanı */}
      <div
        className={`fixed inset-0 z-20 bg-black/60 backdrop-blur-sm transition-opacity md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950 transition-transform duration-200 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Marka */}
        <div className="flex items-center gap-3 border-b border-zinc-800/80 px-5 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
            <Vault size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-tight text-white">DevVault</p>
            <p className="truncate text-xs text-zinc-500">Geliştirici Araç Kutusu</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Araçlar</p>
            {tools.map((tool) => (
              <NavItem
                key={tool.id}
                icon={tool.icon}
                name={tool.name}
                active={tool.id === activeId}
                onClick={() => onSelect(tool.id)}
              />
            ))}
          </div>
        </nav>

        {/* Alt bilgi */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 px-5 py-3.5">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <GitBranch size={15} />
            GitHub
          </a>
          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
            v1.0.0
          </span>
        </div>
      </aside>
    </>
  );
}
