import { useState, useEffect } from "react";

export type NetworkState = "STABLE" | "DEGRADED" | "UNSTABLE" | "OFFLINE";

export interface NetworkStatus {
  /** Current 4-state network status */
  state: NetworkState;
  /** True if not OFFLINE */
  isOnline: boolean;
  /** True if STABLE */
  isStable: boolean;
  /** True if DEGRADED or UNSTABLE */
  isWeak: boolean;
  /** True if OFFLINE */
  isOffline: boolean;
}

/**
 * Returns the current novixo-engine 4-state network status.
 * Requires novixo-engine to be initialized first with Novixo.init().
 *
 * @example
 * const { state, isOffline, isWeak } = useNetworkStatus();
 *
 * if (isOffline) return <OfflineBanner />;
 * if (isWeak) return <SlowNetworkWarning />;
 */
export function useNetworkStatus(): NetworkStatus {
  const [state, setState] = useState<NetworkState>("STABLE");

  useEffect(() => {
    let Novixo: any;

    async function init() {
      try {
        const engine = await import("novixo-engine");
        Novixo = engine.default;

        // Get initial state
        const current = Novixo.getNetworkState?.() as NetworkState;
        if (current) setState(current);

        // Listen for changes
        Novixo.on?.("network", (newState: NetworkState) => {
          setState(newState);
        });
      } catch {
        // novixo-engine not installed or not initialized — use browser fallback
        const fallback: NetworkState = navigator.onLine ? "STABLE" : "OFFLINE";
        setState(fallback);

        const onOnline = () => setState("STABLE");
        const onOffline = () => setState("OFFLINE");
        window.addEventListener("online", onOnline);
        window.addEventListener("offline", onOffline);

        return () => {
          window.removeEventListener("online", onOnline);
          window.removeEventListener("offline", onOffline);
        };
      }
    }

    const cleanup = init();
    return () => {
      cleanup?.then((fn) => fn?.());
      Novixo?.off?.("network");
    };
  }, []);

  return {
    state,
    isOnline: state !== "OFFLINE",
    isStable: state === "STABLE",
    isWeak: state === "DEGRADED" || state === "UNSTABLE",
    isOffline: state === "OFFLINE",
  };
}
