import { useMemo, useState } from 'react';
import { KeyRound, ShieldAlert, Trash2 } from 'lucide-react';
import CopyButton from '../CopyButton';
import { CodeTextarea, ErrorCard, Panel, StatusBadge, ToolButton } from '../ui';
import { highlightJson } from '../../lib/highlight';
import { decodeBase64, encodeBase64 } from '../../lib/codec';

const dateFormatter = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });

// Örnek token: exp değeri her zaman yüklendiği andan 1 saat sonradır
const SAMPLE_JWT = [
  encodeBase64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }), { urlSafe: true }),
  encodeBase64(
    JSON.stringify({
      sub: '1234567890',
      name: 'DevVault Kullanıcısı',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
    { urlSafe: true },
  ),
  encodeBase64('demo-imza', { urlSafe: true }),
].join('.');

function decodeSegment(part, label) {
  let text;
  try {
    text = decodeBase64(part, { urlSafe: true });
  } catch {
    throw new Error(`${label} parçası geçerli Base64URL verisi içermiyor.`);
  }
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error();
    }
    return parsed;
  } catch {
    throw new Error(`${label} parçası geçerli bir JSON nesnesi içermiyor.`);
  }
}

function formatTimestamp(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return { text: String(value), valid: false };
  return { text: dateFormatter.format(new Date(num * 1000)), valid: true };
}

function JsonBlock({ value }) {
  const json = JSON.stringify(value, null, 2);
  return (
    <pre
      className="h-56 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 font-mono text-sm leading-relaxed text-zinc-200"
      dangerouslySetInnerHTML={{ __html: highlightJson(json) }}
    />
  );
}

export default function JwtDecoder() {
  const [token, setToken] = useState('');

  const result = useMemo(() => {
    const trimmed = token.trim();
    if (!trimmed) return { status: 'empty' };

    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      return {
        status: 'invalid',
        message: "JWT, 'header.payload.signature' biçiminde nokta ile ayrılmış 3 parçadan oluşmalıdır.",
      };
    }

    try {
      return {
        status: 'valid',
        header: decodeSegment(parts[0], 'Header'),
        payload: decodeSegment(parts[1], 'Payload'),
        signature: parts[2],
      };
    } catch (error) {
      return { status: 'invalid', message: error.message };
    }
  }, [token]);

  const { payload } = result;
  const claims = result.status === 'valid' ? payload : null;

  const expClaim = claims ? Number(claims.exp) : NaN;
  const hasValidExp = claims && Number.isFinite(expClaim);
  const expired = hasValidExp && expClaim * 1000 <= Date.now();

  const timeRows = [
    { key: 'iat', label: 'İhraç zamanı (iat)' },
    { key: 'nbf', label: 'Geçerlilik başlangıcı (nbf)' },
    { key: 'exp', label: 'Son kullanma (exp)' },
  ].filter(({ key }) => claims && key in claims);

  return (
    <div className="space-y-4">
      <Panel
        title="Token"
        actions={
          claims ? (
            hasValidExp ? (
              <StatusBadge tone={expired ? 'error' : 'success'}>
                {expired ? 'Süresi dolmuş' : 'Aktif'}
              </StatusBadge>
            ) : (
              <StatusBadge>exp yok</StatusBadge>
            )
          ) : undefined
        }
      >
        <div className="flex flex-col gap-3">
          <CodeTextarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9… biçiminde JWT yapıştırın…"
            className="h-28"
            aria-label="JWT girdisi"
          />

          {result.status === 'invalid' && <ErrorCard title="JWT çözümlenemedi" message={result.message} />}

          <div className="flex flex-wrap items-center gap-2">
            <ToolButton icon={KeyRound} variant="primary" onClick={() => setToken(SAMPLE_JWT)}>
              Örnek yükle
            </ToolButton>
            <ToolButton
              icon={Trash2}
              className="ml-auto"
              disabled={!token}
              onClick={() => setToken('')}
            >
              Temizle
            </ToolButton>
          </div>
        </div>
      </Panel>

      {claims ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel
              title="Header"
              actions={<CopyButton text={JSON.stringify(result.header, null, 2)} />}
            >
              <JsonBlock value={result.header} />
            </Panel>
            <Panel
              title="Payload"
              actions={<CopyButton text={JSON.stringify(payload, null, 2)} />}
            >
              <JsonBlock value={payload} />
            </Panel>
          </div>

          {timeRows.length > 0 && (
            <Panel title="Zaman Bilgileri">
              <dl className="grid gap-2 sm:grid-cols-3">
                {timeRows.map(({ key, label }) => {
                  const { text, valid } = formatTimestamp(claims[key]);
                  return (
                    <div
                      key={key}
                      className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2.5"
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        {label}
                      </dt>
                      <dd
                        className={`mt-1 font-mono text-sm ${
                          key === 'exp' && valid && expired
                            ? 'text-red-400'
                            : key === 'exp' && valid
                              ? 'text-emerald-400'
                              : 'text-zinc-300'
                        }`}
                      >
                        {text}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </Panel>
          )}

          <Panel title="İmza">
            <div className="flex flex-col gap-2">
              <p className="break-all rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 font-mono text-sm text-zinc-500">
                {result.signature || '(boş)'}
              </p>
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300/90">
                <ShieldAlert size={17} className="mt-0.5 shrink-0" />
                <p>
                  Kod çözme işlemi tamamen tarayıcınızda yapılır; imza doğrulaması yapılmaz.
                  Tokenları asla doğrulanmamış kaynaklarla paylaşmayın.
                </p>
              </div>
            </div>
          </Panel>
        </>
      ) : (
        result.status === 'empty' && (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 px-4 py-12 text-sm text-zinc-600">
            Çözümlenen header ve payload burada görünecek
          </div>
        )
      )}
    </div>
  );
}
