import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import CopyButton from '../CopyButton';
import { CodeTextarea, Panel, ToolButton } from '../ui';
import { md5, toHex } from '../../lib/hash';

const COUNT_OPTIONS = [1, 5, 10];

// crypto.randomUUID yalnızca güvenli bağlamlarda vardır; http için elle v4 üret
function uuidv4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // sürüm 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 varyantı
  const hex = toHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generateUuids(count) {
  return Array.from({ length: count }, uuidv4);
}

async function digest(algorithm, data) {
  return toHex(await crypto.subtle.digest(algorithm, data));
}

function HashRow({ label, value, unsupported = false }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
        <CopyButton text={value} disabled={!value} />
      </div>
      <p className={`mt-1 break-all font-mono text-sm ${unsupported ? 'text-zinc-600' : 'text-zinc-300'}`}>
        {unsupported ? 'Bu bağlamda desteklenmiyor' : value || '—'}
      </p>
    </div>
  );
}

export default function UuidHashGenerator() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState(() => generateUuids(5));

  const [text, setText] = useState('');
  const [sha, setSha] = useState({ loading: false, sha1: '', sha256: '', supported: true });

  // MD5 senkron hesaplanır; SHA aileleri crypto.subtle ile asenkron çalışır
  const md5Hash = useMemo(() => (text ? md5(text) : ''), [text]);

  useEffect(() => {
    if (!text) {
      setSha({ loading: false, sha1: '', sha256: '', supported: true });
      return;
    }

    let cancelled = false;
    setSha((prev) => ({ ...prev, loading: true }));

    (async () => {
      try {
        const data = new TextEncoder().encode(text);
        const [sha1, sha256] = await Promise.all([digest('SHA-1', data), digest('SHA-256', data)]);
        if (!cancelled) setSha({ loading: false, sha1, sha256, supported: true });
      } catch {
        // http gibi güvenli olmayan bağlamlarda crypto.subtle yoktur
        if (!cancelled) setSha({ loading: false, sha1: '', sha256: '', supported: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [text]);

  const inputBytes = text ? new TextEncoder().encode(text).length : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel
        title="UUID v4 Üretici"
        actions={<CopyButton text={uuids.join('\n')} />}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900/60 p-1" role="group" aria-label="Üretilecek UUID sayısı">
              {COUNT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCount(option)}
                  aria-pressed={count === option}
                  className={`h-7 w-9 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
                    count === option
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <span className="text-xs text-zinc-500">adet</span>
            <ToolButton
              icon={RefreshCw}
              variant="primary"
              className="ml-auto"
              onClick={() => setUuids(generateUuids(count))}
            >
              Üret
            </ToolButton>
          </div>

          <ul className="space-y-1.5">
            {uuids.map((id) => (
              <li key={id} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2">
                <span className="min-w-0 flex-1 truncate font-mono text-sm text-emerald-300">{id}</span>
                <CopyButton text={id} />
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <Panel
        title="Hash Hesaplayıcı"
        actions={text && <span className="text-xs text-zinc-500">{inputBytes} bayt</span>}
      >
        <div className="flex flex-col gap-3">
          <CodeTextarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Metni girin; MD5, SHA-1 ve SHA-256 özetleri anında hesaplanır…"
            className="h-28"
            aria-label="Hash hesaplanacak metin"
          />
          <HashRow label="MD5" value={md5Hash} />
          <HashRow label="SHA-1" value={sha.sha1} unsupported={!sha.supported} />
          <HashRow label="SHA-256" value={sha.sha256} unsupported={!sha.supported} />
        </div>
      </Panel>
    </div>
  );
}
