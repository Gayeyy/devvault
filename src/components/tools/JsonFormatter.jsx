import { useMemo, useState } from 'react';
import { Braces, Minimize2, Sparkles, Trash2 } from 'lucide-react';
import CopyButton from '../CopyButton';
import { CodeTextarea, ErrorCard, Panel, StatusBadge, ToolButton } from '../ui';
import { highlightJson } from '../../lib/highlight';

const SAMPLE_JSON = JSON.stringify(
  {
    name: 'DevVault',
    version: '0.1.0',
    darkMode: true,
    tags: ['json', 'jwt', 'base64'],
    author: { name: 'Geliştirici', active: true },
    stats: { tools: 3, uptime: 99.9, deprecated: null },
  },
  null,
  2,
);

// "Unexpected token ... at position 42" tarzı hatalardan satır/sütun çıkarır
function locateError(message, source) {
  const match = message.match(/position (\d+)/i);
  if (!match) return { message };

  const pos = Math.min(Number(match[1]), source.length);
  const line = source.slice(0, pos).split('\n').length;
  const column = pos - source.lastIndexOf('\n', pos - 1);
  return { message, line, column };
}

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState(2);
  const [output, setOutput] = useState('');

  const validation = useMemo(() => {
    if (!input.trim()) return { status: 'empty' };
    try {
      return { status: 'valid', value: JSON.parse(input) };
    } catch (error) {
      return { status: 'invalid', ...locateError(error.message, input) };
    }
  }, [input]);

  const format = (spaces) => {
    if (validation.status !== 'valid') return;
    setOutput(JSON.stringify(validation.value, null, spaces));
  };

  const clear = () => {
    setInput('');
    setOutput('');
  };

  const outputBytes = output ? new TextEncoder().encode(output).length : 0;
  const outputLines = output ? output.split('\n').length : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Girdi"
          actions={
            <StatusBadge
              tone={
                validation.status === 'valid'
                  ? 'success'
                  : validation.status === 'invalid'
                    ? 'error'
                    : 'neutral'
              }
            >
              {validation.status === 'valid'
                ? 'Geçerli JSON'
                : validation.status === 'invalid'
                  ? 'Geçersiz JSON'
                  : 'Girdi bekleniyor'}
            </StatusBadge>
          }
        >
          <div className="flex h-full flex-col gap-3">
            <CodeTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"anahtar": "değer"} biçiminde JSON yapıştırın…'
              className="min-h-64 flex-1"
              aria-label="JSON girdisi"
            />

            {validation.status === 'invalid' && (
              <ErrorCard
                title="JSON çözümlenemedi"
                message={`${validation.message}${validation.line ? ` (satır ${validation.line}, sütun ${validation.column})` : ''}`}
              />
            )}

            <div className="flex flex-wrap items-center gap-2">
              <ToolButton
                icon={Sparkles}
                variant="primary"
                disabled={validation.status !== 'valid'}
                onClick={() => format(indent)}
              >
                Biçimlendir
              </ToolButton>
              <ToolButton
                icon={Minimize2}
                disabled={validation.status !== 'valid'}
                onClick={() => format(0)}
              >
                Küçült
              </ToolButton>
              <select
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="rounded-lg border border-zinc-700/80 bg-zinc-800/50 px-2.5 py-1.5 text-sm text-zinc-300 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                aria-label="Girinti miktarı"
              >
                <option value={2}>2 Boşluk</option>
                <option value={4}>4 Boşluk</option>
              </select>
              <div className="ml-auto flex items-center gap-2">
                <ToolButton icon={Braces} onClick={() => setInput(SAMPLE_JSON)}>
                  Örnek
                </ToolButton>
                <ToolButton icon={Trash2} disabled={!input && !output} onClick={clear}>
                  Temizle
                </ToolButton>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          title="Çıktı"
          actions={
            <div className="flex items-center gap-2">
              {output && (
                <span className="text-xs text-zinc-500">
                  {outputLines} satır · {outputBytes} bayt
                </span>
              )}
              <CopyButton text={output} disabled={!output} />
            </div>
          }
        >
          {output ? (
            <pre
              className="h-64 min-h-full overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 font-mono text-sm leading-relaxed text-zinc-200"
              dangerouslySetInnerHTML={{ __html: highlightJson(output) }}
            />
          ) : (
            <div className="flex h-64 min-h-full items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 text-sm text-zinc-600">
              Biçimlendirilen JSON burada görünecek
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
