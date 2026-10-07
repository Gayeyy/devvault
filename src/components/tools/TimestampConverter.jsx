import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarClock, Globe, Pause, Play, Timer } from 'lucide-react';
import CopyButton from '../CopyButton';
import { ErrorCard, Panel, StatusBadge, ToolButton } from '../ui';

const daySeconds = 86400;

const localFormat = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'medium' });
const utcFormat = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'medium',
  timeStyle: 'medium',
  timeZone: 'UTC',
});
const relativeFormat = new Intl.RelativeTimeFormat('tr', { numeric: 'auto' });

// Metni epoch'a çevirir; 13 haneli (>=1e12) girdiyi milisaniye, diğerlerini saniye sayar
function parseEpoch(raw) {
  const num = Number(raw.replace(',', '.').trim());
  if (raw.trim() === '' || !Number.isFinite(num)) {
    throw new Error('Geçerli bir sayı girin (örn. 1760136000).');
  }
  const ms = Math.abs(num) >= 1e12 ? num : num * 1000;
  if (Math.abs(ms) > 8.64e15) {
    throw new Error('Değer JavaScript Date aralığının dışında (±8.64e15 ms).');
  }
  return ms;
}

function formatRelative(ms) {
  const diffSeconds = Math.round((ms - Date.now()) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds || unit === 'second') {
      return relativeFormat.format(Math.round(diffSeconds / seconds), unit);
    }
  }
}

// datetime-local girdisinin beklediği YYYY-MM-DDTHH:mm:ss biçimi (yerel saat)
function toLocalInputValue(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function StatTile({ label, value, children }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
        {children}
      </div>
      <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-white">{value}</p>
    </div>
  );
}

function InfoRow({ label, value, mono = true, copy = false }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
        {copy && <CopyButton text={value} disabled={!value} />}
      </div>
      <p className={`mt-1 break-all ${mono ? 'font-mono' : ''} text-sm text-zinc-300`}>{value || '—'}</p>
    </div>
  );
}

export default function TimestampConverter() {
  // Canlı sayaç
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [running, setRunning] = useState(true);

  // Timestamp → tarih yönü
  const [epochInput, setEpochInput] = useState(() => String(Math.floor(Date.now() / 1000)));

  // Tarih → timestamp yönü
  const [pickerValue, setPickerValue] = useState(() => toLocalInputValue(Date.now()));

  useEffect(() => {
    if (!running) return;
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  const epochResult = useMemo(() => {
    try {
      return { status: 'ok', ms: parseEpoch(epochInput), error: null };
    } catch (error) {
      return { status: 'error', ms: null, error: error.message };
    }
  }, [epochInput]);

  const pickerDate = useMemo(() => {
    if (!pickerValue) return null;
    const date = new Date(pickerValue); // datetime-local yerel saate göre çözümlenir
    return Number.isNaN(date.getTime()) ? null : date;
  }, [pickerValue]);

  const applyQuickOffset = (offsetSeconds) => {
    setEpochInput(String(Math.floor(Date.now() / 1000) + offsetSeconds));
  };

  const epochDate = epochResult.status === 'ok' ? new Date(epochResult.ms) : null;

  return (
    <div className="space-y-4">
      <Panel
        title="Canlı Zaman"
        actions={
          <div className="flex items-center gap-2">
            {running ? (
              <StatusBadge tone="success">Çalışıyor</StatusBadge>
            ) : (
              <StatusBadge tone="warning">Duraklatıldı</StatusBadge>
            )}
            <ToolButton
              icon={running ? Pause : Play}
              variant="primary"
              onClick={() => setRunning((prev) => !prev)}
            >
              {running ? 'Duraklat' : 'Devam Et'}
            </ToolButton>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatTile label="Epoch (saniye)" value={Math.floor(nowMs / 1000)}>
              <CopyButton text={String(Math.floor(nowMs / 1000))} />
            </StatTile>
            <StatTile label="Epoch (milisaniye)" value={nowMs}>
              <CopyButton text={String(nowMs)} />
            </StatTile>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-zinc-400">
              {localFormat.format(nowMs)} <span className="text-zinc-600">(yerel)</span>
            </span>
            <ToolButton icon={ArrowRight} onClick={() => setEpochInput(String(Math.floor(nowMs / 1000)))}>
              Dönüştürücüye aktar
            </ToolButton>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Timestamp → Tarih"
          actions={<Timer size={14} className="text-zinc-500" />}
        >
          <div className="flex flex-col gap-3">
            <input
              value={epochInput}
              onChange={(e) => setEpochInput(e.target.value)}
              spellCheck={false}
              placeholder="örn. 1760136000 veya 1760136000000"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              aria-label="Unix timestamp girdisi"
            />

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: 'Şu an', offset: 0 },
                { label: '+1 Gün', offset: daySeconds },
                { label: '+1 Hafta', offset: daySeconds * 7 },
              ].map(({ label, offset }) => (
                <ToolButton key={label} onClick={() => applyQuickOffset(offset)}>
                  {label}
                </ToolButton>
              ))}
            </div>

            {epochResult.status === 'error' ? (
              <ErrorCard title="Dönüştürme başarısız" message={epochResult.error} />
            ) : (
              <div className="space-y-2">
                <InfoRow label="Yerel saat" value={localFormat.format(epochDate)} mono={false} />
                <InfoRow label="UTC" value={`${utcFormat.format(epochDate)} UTC`} mono={false} />
                <InfoRow label="ISO-8601" value={epochDate.toISOString()} copy />
                <InfoRow label="Göreceli" value={formatRelative(epochResult.ms)} mono={false} />
              </div>
            )}
          </div>
        </Panel>

        <Panel
          title="Tarih → Timestamp"
          actions={<CalendarClock size={14} className="text-zinc-500" />}
        >
          <div className="flex flex-col gap-3">
            <input
              type="datetime-local"
              step={1}
              value={pickerValue}
              onChange={(e) => setPickerValue(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 font-mono text-sm text-zinc-200 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 [color-scheme:dark]"
              aria-label="Tarih ve saat seçici"
            />

            <div className="flex flex-wrap items-center gap-1.5">
              <ToolButton icon={Globe} onClick={() => setPickerValue(toLocalInputValue(Date.now()))}>
                Şimdi
              </ToolButton>
            </div>

            {pickerDate ? (
              <div className="space-y-2">
                <InfoRow label="Epoch (saniye)" value={String(Math.floor(pickerDate.getTime() / 1000))} copy />
                <InfoRow label="Epoch (milisaniye)" value={String(pickerDate.getTime())} copy />
                <InfoRow label="UTC" value={`${utcFormat.format(pickerDate)} UTC`} mono={false} />
                <InfoRow label="ISO-8601" value={pickerDate.toISOString()} copy />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 text-sm text-zinc-600">
                Geçerli bir tarih ve saat seçin
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
