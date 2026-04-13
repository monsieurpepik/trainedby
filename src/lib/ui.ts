/**
 * Client-side UI helpers — imported by page scripts.
 * All functions are side-effect-free except showToast which mutates the DOM.
 */

export function showToast(
  msg: string,
  type: 'success' | 'error' | '' = '',
  duration = 3000,
): void {
  let toast = document.getElementById('toast') as HTMLDivElement | null;
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText =
      'position:fixed;bottom:max(24px,env(safe-area-inset-bottom));left:50%;' +
      'transform:translateX(-50%) translateY(80px);background:#1c1c1c;' +
      'border:1px solid rgba(255,255,255,0.08);color:#fff;padding:12px 20px;' +
      'border-radius:24px;font-size:13px;font-weight:600;z-index:9999;' +
      'transition:transform 0.3s cubic-bezier(0.32,0.72,0,1);white-space:nowrap;' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.5);pointer-events:none;';
    document.body.appendChild(toast);
  }

  // Reset inline overrides from previous call
  toast.removeAttribute('style');
  toast.style.cssText =
    'position:fixed;bottom:max(24px,env(safe-area-inset-bottom));left:50%;' +
    'transform:translateX(-50%) translateY(80px);background:#1c1c1c;' +
    'border:1px solid rgba(255,255,255,0.08);color:#fff;padding:12px 20px;' +
    'border-radius:24px;font-size:13px;font-weight:600;z-index:9999;' +
    'transition:transform 0.3s cubic-bezier(0.32,0.72,0,1);white-space:nowrap;' +
    'box-shadow:0 8px 32px rgba(0,0,0,0.5);pointer-events:none;';

  if (type === 'success') {
    toast.style.background = 'rgba(0,200,83,0.08)';
    toast.style.borderColor = 'rgba(0,200,83,0.2)';
    toast.style.color = '#00C853';
  } else if (type === 'error') {
    toast.style.background = 'rgba(255,85,85,0.08)';
    toast.style.borderColor = 'rgba(255,85,85,0.2)';
    toast.style.color = '#ff5555';
  }

  toast.textContent = msg;
  toast.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    if (toast) toast.style.transform = 'translateX(-50%) translateY(80px)';
  }, duration);
}

export function copyToClipboard(text: string, successMsg = 'Copied!'): void {
  navigator.clipboard.writeText(text).then(() => showToast(successMsg, 'success'));
}
