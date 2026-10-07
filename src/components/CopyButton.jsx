import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // http gibi güvenli olmayan bağlamlar için yedek yöntem
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    textarea.remove();
    return copied;
  }
}

export default function CopyButton({ text, disabled = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (await copyToClipboard(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-700/80 bg-zinc-800/50 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
      {copied ? 'Kopyalandı' : 'Kopyala'}
    </button>
  );
}
