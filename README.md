# novixo-react

React hooks for the NovixoTech ecosystem. Use novixo-engine and novixo-ai in any React component with one line of code.

```bash
npm install novixo-react
```

---

## Hooks

| Hook | Description |
|------|-------------|
| `useOnlineStatus` | Simple true/false online detection |
| `useNetworkStatus` | Full 4-state network status from novixo-engine |
| `useNovixoInit` | Initialize novixo-engine with loading/error state |
| `useOfflineQueue` | Access and control the offline queue |
| `useNovixoAI` | Call novixo-ai with loading/error/response state |

---

## useOnlineStatus

```tsx
import { useOnlineStatus } from "novixo-react";

function App() {
  const isOnline = useOnlineStatus();
  return isOnline ? <App /> : <OfflineBanner />;
}
```

---

## useNetworkStatus

```tsx
import { useNetworkStatus } from "novixo-react";

function NetworkBadge() {
  const { state, isOffline, isWeak } = useNetworkStatus();

  if (isOffline) return <span>⛔ Offline</span>;
  if (isWeak) return <span>⚠️ Weak connection</span>;
  return <span>✅ Connected</span>;
}
```

Returns `{ state, isOnline, isStable, isWeak, isOffline }`

---

## useNovixoInit

```tsx
import { useNovixoInit } from "novixo-react";

function App() {
  const { ready, initializing, error } = useNovixoInit({
    syncHandler: async (item) => {
      const res = await fetch("/api/sync", {
        method: "POST",
        body: JSON.stringify(item),
      });
      return res.ok;
    },
  });

  if (initializing) return <LoadingScreen />;
  if (error) return <p>Failed: {error}</p>;
  return <MainApp />;
}
```

---

## useOfflineQueue

```tsx
import { useOfflineQueue } from "novixo-react";

function MessageInput() {
  const { send, queueSize, syncing, syncNow } = useOfflineQueue();

  return (
    <div>
      <button onClick={() => send({ type: "message", payload: { text: "Hello!" } })}>
        Send
      </button>
      {queueSize > 0 && <span>{queueSize} pending</span>}
      {syncing && <span>Syncing...</span>}
    </div>
  );
}
```

---

## useNovixoAI

```tsx
import { useNovixoAI } from "novixo-react";

function AIChat() {
  const { ask, response, loading, error } = useNovixoAI({
    keys: {
      groq: import.meta.env.VITE_GROQ_KEY,
      gemini: import.meta.env.VITE_GEMINI_KEY,
    },
  });

  return (
    <div>
      <button onClick={() => ask("Explain recursion")} disabled={loading}>
        {loading ? "Thinking..." : "Ask AI"}
      </button>
      {response && <p>{response}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}
```

---

## Part of the NovixoTech ecosystem

- [novixo-engine](https://npmjs.com/package/novixo-engine) — Offline-first network SDK
- [novixo-ai](https://npmjs.com/package/novixo-ai) — Multi-provider AI client
- [novixo-agent-logger](https://npmjs.com/package/novixo-agent-logger) — AI agent audit trail
- **novixo-react** — React hooks ← you are here

---

## License

MIT © [NovixoTech](https://github.com/NovixoTech)
