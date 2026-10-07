// Base64 ve Base64URL kodlama/çözümleme yardımcıları (UTF-8 güvenli)

export function encodeBase64(text, { urlSafe = false } = {}) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  let base64 = btoa(binary);
  if (urlSafe) {
    base64 = base64.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
  }
  return base64;
}

export function decodeBase64(text, { urlSafe = false } = {}) {
  let base64 = text.replace(/\s+/g, '');
  if (urlSafe) {
    base64 = base64.replaceAll('-', '+').replaceAll('_', '/');
  }
  if (!base64) return '';
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
    throw new Error('Girdi geçerli Base64 karakterleri içermiyor.');
  }
  base64 += '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error('Çözümlenen veri geçerli bir UTF-8 metni değil (binary içerik olabilir).');
  }
}
