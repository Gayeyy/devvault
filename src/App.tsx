import { useState } from 'react'
import { Asterisk, Binary, Braces, Clock, Fingerprint, KeyRound, Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import JsonFormatter from './components/tools/JsonFormatter'
import JwtDecoder from './components/tools/JwtDecoder'
import Base64Tool from './components/tools/Base64Tool'
import RegexTester from './components/tools/RegexTester'
import UuidHashGenerator from './components/tools/UuidHashGenerator'
import TimestampConverter from './components/tools/TimestampConverter'

const TOOLS = [
  {
    id: 'json',
    name: 'JSON Formatter',
    description: 'JSON verisini doğrula, biçimlendir ve küçült',
    icon: Braces,
    component: JsonFormatter,
  },
  {
    id: 'jwt',
    name: 'JWT Decoder',
    description: 'Tokenın header ve payload kısımlarını çözümle',
    icon: KeyRound,
    component: JwtDecoder,
  },
  {
    id: 'base64',
    name: 'Base64 Codec',
    description: 'Metin ile Base64 arasında UTF-8 güvenli dönüşüm',
    icon: Binary,
    component: Base64Tool,
  },
  {
    id: 'regex',
    name: 'Regex Tester',
    description: 'Desenleri canlı test et, eşleşmeleri ve grupları gör',
    icon: Asterisk,
    component: RegexTester,
  },
  {
    id: 'uuid',
    name: 'UUID & Hash',
    description: 'v4 UUID üret; MD5, SHA-1 ve SHA-256 hesapla',
    icon: Fingerprint,
    component: UuidHashGenerator,
  },
  {
    id: 'timestamp',
    name: 'Unix Zaman',
    description: 'Epoch damgaları ile tarih arasında çift yönlü dönüşüm',
    icon: Clock,
    component: TimestampConverter,
  },
]

function App() {
  const [activeId, setActiveId] = useState(TOOLS[0].id)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const active = TOOLS.find((tool) => tool.id === activeId) ?? TOOLS[0]
  const ActiveIcon = active.icon
  const ActiveTool = active.component

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <Sidebar
        tools={TOOLS}
        activeId={activeId}
        onSelect={(id: string) => {
          setActiveId(id)
          setSidebarOpen(false)
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Üst çubuk */}
        <header className="flex items-center gap-3 border-b border-zinc-800/80 bg-zinc-950/80 px-4 py-3.5 backdrop-blur md:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 md:hidden"
            aria-label="Kenar çubuğunu aç"
          >
            <Menu size={20} />
          </button>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-indigo-400">
            <ActiveIcon size={16} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-white">{active.name}</h1>
            <p className="hidden truncate text-xs text-zinc-500 sm:block">{active.description}</p>
          </div>
        </header>

        {/* Araç içeriği */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <ActiveTool />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
