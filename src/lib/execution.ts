export interface ExecutionCallbacks {
  onLog: (text: string) => void;
  onPrompt: (message: string) => Promise<string>;
  onError: (text: string) => void;
  onComplete: () => void;
  onNodeEnter?: (nodeId: string) => void;
  onVarUpdate?: (name: string, value: string) => void;
}

export interface ExecutionOptions {
  stepDelay?: number;
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

/** Send a step-forward signal to the iframe (for manual Step mode) */
export function stepForward() {
  if (activeIframe?.contentWindow) {
    activeIframe.contentWindow.postMessage({ type: 'continue' }, '*');
  }
}

export function executeCode(
  code: string,
  callbacks: ExecutionCallbacks,
  options?: ExecutionOptions,
): Promise<void> {
  stopExecution();

  return new Promise<void>((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-scripts');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    activeIframe = iframe;

    const stepDelay = options?.stepDelay ?? 300;

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

        case 'node-enter':
          callbacks.onNodeEnter?.(String(msg.nodeId));
          // Delay is handled here in the parent (not in the iframe)
          // to avoid browser throttling of setTimeout in sandboxed iframes.
          if (stepDelay === 0) {
            // Instant mode — continue immediately
            iframe.contentWindow?.postMessage({ type: 'continue' }, '*');
          } else if (stepDelay > 0) {
            // Timed delay — wait then continue
            setTimeout(() => {
              iframe.contentWindow?.postMessage({ type: 'continue' }, '*');
            }, stepDelay);
          }
          // stepDelay < 0 → manual step mode, user clicks "Next" which calls stepForward()
          break;

        case 'var-update':
          callbacks.onVarUpdate?.(String(msg.name), String(msg.value));
          break;

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

  // Node execution tracking — sends node-enter to parent and waits
  // for the parent to reply with 'continue'. The parent handles all
  // timing delays to avoid browser throttling inside sandboxed iframes.
  function __onNode(nodeId) {
    parent.postMessage({ type: 'node-enter', nodeId: nodeId }, '*');
    return new Promise(function(resolve) {
      function onContinue(ev) {
        if (ev.data && ev.data.type === 'continue') {
          window.removeEventListener('message', onContinue);
          resolve();
        }
      }
      window.addEventListener('message', onContinue);
    });
  }

  // Variable update tracking
  function __onVar(name, value) {
    parent.postMessage({ type: 'var-update', name: name, value: value }, '*');
  }

  try {
    var AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    var fn = new AsyncFunction('prompt', '__onNode', '__onVar', e.data.code);
    await fn(asyncPrompt, __onNode, __onVar);
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
      iframe.contentWindow?.postMessage(
        { type: 'run', code },
        '*',
      );
    };
  });
}
