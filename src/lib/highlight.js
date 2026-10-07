// JSON metnini güvenli şekilde sözdizimi renklendirmesiyle HTML'e dönüştürür.
// Girdi önce HTML açısından kaçışlanır, bu yüzden çıktı güvenle innerHTML ile basılabilir.
export function highlightJson(json) {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped.replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false)\b|\bnull\b|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)/g,
    (match) => {
      let cls = 'text-sky-300'; // sayı
      if (match.startsWith('"')) {
        cls = match.trimEnd().endsWith(':') ? 'text-indigo-300' : 'text-emerald-300'; // anahtar / dize
      } else if (match === 'true' || match === 'false') {
        cls = 'text-fuchsia-400';
      } else if (match === 'null') {
        cls = 'text-zinc-500';
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
}
