import { useMemo, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ErrorCard, Panel, StatusBadge, ToolButton } from '../ui';

const FLAG_OPTIONS = [
  { key: 'g', label: 'g', title: 'global — tüm eşleşmeler' },
  { key: 'i', label: 'i', title: 'büyük/küçük harf duyarsız' },
  { key: 'm', label: 'm', title: 'çok satırlı — ^ ve $ satır başı/sonu' },
];

const TEMPLATES = [
  { name: 'E-posta', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'gi' },
  { name: 'URL', pattern: 'https?:\\/\\/[^\\s]+', flags: 'gi' },
  { name: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
  { name: 'Tarih', pattern: '\\b\\d{1,2}[./]\\d{1,2}[./]\\d{4}\\b', flags: 'g' },
  { name: 'Hex Renk', pattern: '#[0-9a-fA-F]{6}\\b', flags: 'g' },
];

const SAMPLE_TEXT = `İletişim: ada.lovelace@example.com, destek@devvault.io
Site: https://devvault.example.com/docs ve http://10.0.42.7/api
Sunucular: 192.168.1.42, 8.8.8.8 — tarih 07.10.2026 / 2026-10-07
Renkler: #4f46e5, #10b981, #FFFFFF`;

const MAX_LISTED_MATCHES = 100;

// Deseni derle; boş desen ve sözdizimi hataları ayrı durum olarak döner
function useCompiledRegex(pattern, flags) {
  return useMemo(() => {
    if (!pattern) return { status: 'empty' };
    try {
      return { status: 'ok', re: new RegExp(pattern, flags) };
    } catch (error) {
      return { status: 'invalid', message: error.message };
    }
  }, [pattern, flags]);
}

function useMatches(compiled, text) {
  return useMemo(() => {
    if (compiled.status !== 'ok') return [];
    const found = [];
    if (compiled.re.global) {
      for (const match of text.matchAll(compiled.re)) {
        if (match[0] === '') continue; // sıfır uzunluktaki eşleşmeleri atla
        found.push(match);
        if (found.length >= 500) break; // aşırı girdi için güvenlik sınırı
      }
    } else {
      const match = text.match(compiled.re);
      if (match && match[0] !== '') found.push(match);
    }
    return found;
  }, [compiled, text]);
}

// Eşleşmeleri düz metin parçalarına böler; vurgulama katmanı bunları basar
function toSegments(text, matches) {
  const segments = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.index < cursor) continue; // üst üste binen eşleşme yok sayılır
    if (match.index > cursor) segments.push({ text: text.slice(cursor, match.index) });
    segments.push({ text: match[0], highlight: true });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}

// Arkada vurgulanan metin, önünde şeffaf metin: kaydırmalar senkron yürür
function HighlightEditor({ value, onChange, segments }) {
  const preRef = useRef(null);

  const syncScroll = (event) => {
    if (preRef.current) {
      preRef.current.scrollTop = event.target.scrollTop;
      preRef.current.scrollLeft = event.target.scrollLeft;
    }
  };

  return (
    <div className="relative h-64 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/70 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20">
      <pre
        ref={preRef}
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden whitespace-pre p-3 font-mono text-sm leading-relaxed text-zinc-300"
      >
        {segments.map((segment, i) =>
          segment.highlight ? (
            <mark key={i} className="rounded-sm bg-indigo-500/35 text-indigo-100">
              {segment.text}
            </mark>
          ) : (
            <span key={i}>{segment.text}</span>
          ),
        )}
        {'\n'}
      </pre>
      <textarea
        value={value}
        onChange={onChange}
        onScroll={syncScroll}
        wrap="off"
        spellCheck={false}
        className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-3 font-mono text-sm leading-relaxed text-transparent caret-indigo-300 outline-none placeholder:text-zinc-600"
        placeholder="Test metnini buraya yazın veya yapıştırın…"
        aria-label="Test metni"
      />
    </div>
  );
}

function GroupChip({ children }) {
  return (
    <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-xs text-zinc-400">
      {children}
    </span>
  );
}

export default function RegexTester() {
  const [pattern, setPattern] = useState(TEMPLATES[0].pattern);
  const [activeFlags, setActiveFlags] = useState({ g: true, i: true, m: false });
  const [text, setText] = useState(SAMPLE_TEXT);

  const flags = FLAG_OPTIONS.filter((f) => activeFlags[f.key])
    .map((f) => f.key)
    .join('');

  const compiled = useCompiledRegex(pattern, flags);
  const matches = useMatches(compiled, text);
  const segments = useMemo(() => toSegments(text, matches), [text, matches]);

  const toggleFlag = (key) => setActiveFlags((prev) => ({ ...prev, [key]: !prev[key] }));

  const applyTemplate = (template) => {
    setPattern(template.pattern);
    const next = { g: false, i: false, m: false };
    for (const flag of template.flags) next[flag] = true;
    setActiveFlags(next);
  };

  const statusBadge =
    compiled.status === 'invalid' ? (
      <StatusBadge tone="error">Geçersiz desen</StatusBadge>
    ) : compiled.status === 'empty' ? (
      <StatusBadge>Desen girin</StatusBadge>
    ) : matches.length > 0 ? (
      <StatusBadge tone="success">{matches.length} eşleşme</StatusBadge>
    ) : (
      <StatusBadge tone="warning">Eşleşme yok</StatusBadge>
    );

  return (
    <div className="space-y-4">
      <Panel title="Desen" actions={statusBadge}>
        <div className="flex flex-col gap-3">
          <div className="flex items-stretch overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/70 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20">
            <span className="flex select-none items-center pl-3 font-mono text-sm text-zinc-600">/</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              spellCheck={false}
              placeholder="regex deseni"
              className="min-w-0 flex-1 bg-transparent px-2 py-2.5 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
              aria-label="Regex deseni"
            />
            <span className="flex select-none items-center pr-3 font-mono text-sm text-indigo-400">/{flags}</span>
          </div>

          {compiled.status === 'invalid' && (
            <ErrorCard title="Desen derlenemedi" message={compiled.message} />
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500">Bayraklar:</span>
              {FLAG_OPTIONS.map(({ key, label, title }) => (
                <button
                  key={key}
                  type="button"
                  title={title}
                  onClick={() => toggleFlag(key)}
                  aria-pressed={activeFlags[key]}
                  className={`h-7 w-7 rounded-md border font-mono text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
                    activeFlags[key]
                      ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-500">Şablonlar:</span>
              {TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
                    pattern === template.pattern
                      ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Test Metni">
          <HighlightEditor value={text} onChange={(e) => setText(e.target.value)} segments={segments} />
        </Panel>

        <Panel
          title="Eşleşmeler"
          actions={
            <div className="flex items-center gap-2">
              {matches.length > MAX_LISTED_MATCHES && (
                <span className="text-xs text-zinc-500">ilk {MAX_LISTED_MATCHES} gösteriliyor</span>
              )}
              <ToolButton
                icon={Trash2}
                disabled={!text}
                onClick={() => setText('')}
              >
                Metni temizle
              </ToolButton>
            </div>
          }
        >
          {matches.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 px-4 text-center text-sm text-zinc-600">
              {compiled.status === 'ok' ? 'Henüz eşleşme yok' : 'Geçerli bir desen girin'}
            </div>
          ) : (
            <div className="flex h-64 flex-col gap-2 overflow-y-auto pr-1">
              {matches.slice(0, MAX_LISTED_MATCHES).map((match, i) => (
                <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="shrink-0 rounded bg-indigo-500/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-indigo-300">
                      #{i + 1}
                    </span>
                    <span className="min-w-0 truncate font-mono text-sm text-indigo-200">{match[0]}</span>
                    <span className="ml-auto shrink-0 text-xs text-zinc-600">@ {match.index}</span>
                  </div>
                  {(match.length > 1 || match.groups) && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {match.groups &&
                        Object.entries(match.groups).map(([name, value]) => (
                          <GroupChip key={name}>
                            {name}: {value ?? '(eşleşmedi)'}
                          </GroupChip>
                        ))}
                      {Array.from({ length: match.length - 1 }, (_, gi) => (
                        <GroupChip key={gi}>grup {gi + 1}: {match[gi + 1] ?? '(eşleşmedi)'}</GroupChip>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
