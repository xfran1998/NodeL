export interface ExecutionCallbacks {
  onLog: (text: string) => void;
  onPrompt: (message: string) => Promise<string>;
  onError: (text: string) => void;
  onComplete: () => void;
}

let activeIframe: HTMLIFrameElement | null = null;
let messageHandler: ((e: MessageEvent) => void) | null = null;

export function stopExecution() {
  if (messageHandler) {
    window.removeEventListener('message', messageHandler);
    messageHandler = null;
  }
  if (activeIframe) {
    activeIframe.remove();
    activeIframe = null;
  }
}

export function executeCode(code: string, callbacks: ExecutionCallbacks): Promise<void> {
  stopExecution();

  return new Promise<void>((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-scripts');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    activeIframe = iframe;

    const handler = async (e: MessageEvent) => {
      // Only accept messages from our iframe
      if (e.source !== iframe.contentWindow) return;

      const msg = e.data;
      if (!msg || typeof msg.type !== 'string') return;

      switch (msg.type) {
        case 'log':
          callbacks.onLog(String(msg.text));
          break;

        case 'prompt': {
          try {
            const value = await callbacks.onPrompt(String(msg.message));
            iframe.contentWindow?.postMessage({ type: 'prompt-response', value }, '*');
          } catch {
            iframe.contentWindow?.postMessage({ type: 'prompt-response', value: '' }, '*');
          }
          break;
        }

        case 'error':
          callbacks.onError(String(msg.text));
          break;

        case 'done':
          callbacks.onComplete();
          stopExecution();
          resolve();
          break;
      }
    };

    messageHandler = handler;
    window.addEventListener('message', handler);

    const iframeHTML = `<!DOCTYPE html>
<html><body><script>
window.addEventListener('message', async function(e) {
  if (!e.data || e.data.type !== 'run') return;

  // Override console.log
  console.log = function() {
    var text = Array.prototype.slice.call(arguments).map(function(a) {
      return String(a);
    }).join(' ');
    parent.postMessage({ type: 'log', text: text }, '*');
  };

  // Async prompt via postMessage round-trip
  function asyncPrompt(message) {
    return new Promise(function(resolve) {
      function onResponse(ev) {
        if (ev.data && ev.data.type === 'prompt-response') {
          window.removeEventListener('message', onResponse);
          resolve(ev.data.value);
        }
      }
      window.addEventListener('message', onResponse);
      parent.postMessage({ type: 'prompt', message: message }, '*');
    });
  }

  try {
    var AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    var fn = new AsyncFunction('prompt', e.data.code);
    await fn(asyncPrompt);
    parent.postMessage({ type: 'done' }, '*');
  } catch (err) {
    parent.postMessage({ type: 'error', text: String(err) }, '*');
    parent.postMessage({ type: 'done' }, '*');
  }
});
<\/script></body></html>`;

    iframe.srcdoc = iframeHTML;

    // Wait for iframe to load, then send the code
    iframe.onload = () => {
      iframe.contentWindow?.postMessage({ type: 'run', code }, '*');
    };
  });
}
