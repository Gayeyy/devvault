import { useMemo, useState } from 'react';
import { ArrowDown, ArrowLeftRight, ArrowUp, Trash2 } from 'lucide-react';
import CopyButton from '../CopyButton';
import { CodeTextarea, ErrorCard, Panel, ToolButton } from '../ui';
import { decodeBase64, encodeBase64 } from '../../lib/codec';

const MODES = [
  { id: 'encode', label: 'Kodla', hint: 'Metin → Base64', icon: ArrowUp },
  { id: 'decode', label: 'Çöz', hint: 'Base64 → Metin', icon: ArrowDown },
];

export default function Base64Tool() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return { status: 'empty' };
    try {
      // Çözerken standart ve URL-güvenli alfabelerin ikisi de kabul edilir
      const output =
        mode === 'encode'
          ? encodeBase64(input, { urlSafe })
          : decodeBase64(input, { urlSafe: true });
      return { status: 'ok', output };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }, [mode, input, urlSafe]);

  const swap = () => {
    if (result.status !== 'ok') return;
    setInput(result.output);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  const clear = () => setInput('');

  const activeMode = MODES.find((m) => m.id === mode);
  const inputBytes = input ? new TextEncoder().encode(input).length : 0;
  const outputBytes = result.status === 'ok' ? new TextEncoder().encode(result.output).length : 0;

  return (
    <div className="space-y-4">
      {/* Yön seçici */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900/60 p-1" role="tablist">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => setMode(id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
                mode === id
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-500">{activeMode.hint}</span>

        <div className="ml-auto flex items-center gap-2">
          <ToolButton icon={ArrowLeftRight} disabled={result.status !== 'ok'} onClick={swap}>
            Yönü değiştir
          </ToolButton>
          <ToolButton icon={Trash2} disabled={!input} onClick={clear}>
            Temizle
          </ToolButton>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Girdi"
          actions={
            <div className="flex items-center gap-3">
              {mode === 'encode' ? (
                <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200">
                  <input
                    type="checkbox"
                    checked={urlSafe}
                    onChange={(e) => setUrlSafe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-800 accent-indigo-500"
                  />
                  URL-güvenli (-, _)
                </label>
              ) : (
                <span className="text-xs text-zinc-500">Standart ve URL-güvenli girdi kabul edilir</span>
              )}
              {input && <span className="text-xs text-zinc-500">{inputBytes} bayt</span>}
            </div>
          }
        >
          <CodeTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode' ? 'Base64’e dönüştürülecek metni girin…' : 'Base64 metnini yapıştırın…'
            }
            className="h-56"
            aria-label={mode === 'encode' ? 'Dönüştürülecek metin' : 'Base64 girdisi'}
          />
        </Panel>

        <Panel
          title="Çıktı"
          actions={
            <div className="flex items-center gap-2">
              {result.status === 'ok' && <span className="text-xs text-zinc-500">{outputBytes} bayt</span>}
              <CopyButton text={result.status === 'ok' ? result.output : ''} disabled={result.status !== 'ok'} />
            </div>
          }
        >
          {result.status === 'error' ? (
            <div className="flex h-56 flex-col justify-center">
              <ErrorCard title="Dönüştürme başarısız" message={result.message} />
            </div>
          ) : result.status === 'ok' ? (
            <pre className="h-56 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 font-mono text-sm leading-relaxed text-emerald-300">
              {result.output}
            </pre>
          ) : (
            <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 text-sm text-zinc-600">
              Dönüştürülen sonuç burada görünecek
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
