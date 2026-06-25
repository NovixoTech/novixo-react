import { useState, useEffect, useCallback } from "react";

export type QueuePriority = "HIGH" | "MEDIUM" | "LOW";

export interface QueueItem {
  id: string;
  type: string;
  payload: any;
  priority: QueuePriority;
  createdAt: number;
}

export interface OfflineQueueResult {
  /** All items currently in the queue */
  queue: QueueItem[];
  /** Number of items in the queue */
  queueSize: number;
  /** True while syncing */
  syncing: boolean;
  /** Last time a sync completed successfully */
  lastSyncedAt: Date | null;
  /** Add an item to the queue */
  send: (data: { type: string; payload: any }, priority?: QueuePriority) => Promise<void>;
  /** Manually trigger a sync */
  syncNow: () => Promise<void>;
  /** Clear all items from the queue */
  clearQueue: () => Promise<void>;
}

/**
 * Access and control the novixo-engine offline queue.
 * Requires useNovixoInit to have completed first.
 *
 * @example
 * const { queueSize, send, syncNow, lastSyncedAt } = useOfflineQueue();
 *
 * // Send a message (works offline too)
 * await send({ type: "message", payload: { text: "Hello" } });
 *
 * // Show queue badge
 * {queueSize > 0 && <Badge>{queueSize} pending</Badge>}
 */
export function useOfflineQueue(): OfflineQueueResult {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  useEffect(() => {
    let Novixo: any;

    async function setup() {
      try {
        const engine = await import("novixo-engine");
        Novixo = engine.default;

        // Load initial queue
        setQueue(Novixo.getQueue?.() || []);

        // Listen to queue changes
        Novixo.on?.("queued", () => {
          setQueue(Novixo.getQueue?.() || []);
        });

        Novixo.on?.("synced", () => {
          setQueue(Novixo.getQueue?.() || []);
          setLastSyncedAt(new Date());
          setSyncing(false);
        });

        Novixo.on?.("failed", () => {
          setSyncing(false);
        });
      } catch {
        // novixo-engine not available
      }
    }

    setup();

    return () => {
      Novixo?.off?.("queued");
      Novixo?.off?.("synced");
      Novixo?.off?.("failed");
    };
  }, []);

  const send = useCallback(async (
    data: { type: string; payload: any },
    priority?: QueuePriority
  ) => {
    try {
      const { default: Novixo, Priority } = await import("novixo-engine") as any;
      const p = priority ? Priority[priority] : Priority.MEDIUM;
      await Novixo.send(data, p);
      setQueue(Novixo.getQueue?.() || []);
    } catch (err) {
      console.error("[useOfflineQueue] send failed:", err);
    }
  }, []);

  const syncNow = useCallback(async () => {
    try {
      setSyncing(true);
      const { default: Novixo } = await import("novixo-engine");
      await (Novixo as any).syncNow?.();
    } catch (err) {
      console.error("[useOfflineQueue] syncNow failed:", err);
      setSyncing(false);
    }
  }, []);

  const clearQueue = useCallback(async () => {
    try {
      const { default: Novixo } = await import("novixo-engine");
      await (Novixo as any).clearQueue?.();
      setQueue([]);
    } catch (err) {
      console.error("[useOfflineQueue] clearQueue failed:", err);
    }
  }, []);

  return {
    queue,
    queueSize: queue.length,
    syncing,
    lastSyncedAt,
    send,
    syncNow,
    clearQueue,
  };
}
