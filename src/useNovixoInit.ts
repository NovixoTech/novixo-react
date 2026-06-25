import { useState, useEffect, useRef } from "react";

export interface NovixoInitConfig {
  syncHandler: (item: any) => Promise<boolean>;
  onSyncSuccess?: (item: any) => void;
  onQueueChange?: (size: number) => void;
  onNetworkStateChange?: (newState: string, oldState: string) => void;
  [key: string]: any;
}

export interface NovixoInitResult {
  /** True while Novixo.init() is running */
  initializing: boolean;
  /** True once init completed successfully */
  ready: boolean;
  /** Error message if init failed */
  error: string | null;
}

/**
 * Initializes novixo-engine once on mount.
 * Returns loading and error state so you can show a spinner or error UI.
 *
 * @example
 * const { ready, error } = useNovixoInit({
 *   syncHandler: async (item) => {
 *     const res = await fetch("/api/sync", { method: "POST", body: JSON.stringify(item) });
 *     return res.ok;
 *   }
 * });
 *
 * if (!ready) return <LoadingScreen />;
 */
export function useNovixoInit(config: NovixoInitConfig): NovixoInitResult {
  const [initializing, setInitializing] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        const { default: Novixo } = await import("novixo-engine");
        await Novixo.init(config);
        setReady(true);
      } catch (err: any) {
        setError(err?.message || "Failed to initialize novixo-engine");
      } finally {
        setInitializing(false);
      }
    }

    init();
  }, []);

  return { initializing, ready, error };
}
