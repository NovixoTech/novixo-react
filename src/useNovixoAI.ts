import { useState, useCallback } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface AIOptions {
  systemPrompt?: string;
  providers?: string[];
}

export interface NovixoAIResult {
  chat: (messages: Message[], options?: AIOptions) => Promise<string | null>;
  ask: (prompt: string, systemPrompt?: string) => Promise<string | null>;
  response: string | null;
  provider: string | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export interface NovixoAIConfig {
  keys: Record<string, string | undefined>;
  providers?: string[];
  models?: Record<string, string>;
  maxTokens?: number;
  temperature?: number;
  cache?: boolean;
}

/**
 * Use novixo-ai in any React component.
 *
 * @example
 * const { ask, response, loading, error } = useNovixoAI({
 *   keys: { groq: import.meta.env.VITE_GROQ_KEY }
 * });
 * await ask("Explain photosynthesis");
 */
export function useNovixoAI(config: NovixoAIConfig): NovixoAIResult {
  const [response, setResponse] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chat = useCallback(async (
    messages: Message[],
    options: AIOptions = {}
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const { NovixoAI } = await import("novixo-ai");
      const ai = new (NovixoAI as any)(config);
      const result = await (ai as any).chat(messages, options);
      setResponse(result.text);
      setProvider(result.provider);
      return result.text;
    } catch (err: any) {
      const msg = err?.message || "AI request failed";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(config)]);

  const ask = useCallback(async (
    prompt: string,
    systemPrompt?: string
  ): Promise<string | null> => {
    return chat(
      [{ role: "user", content: prompt }],
      { systemPrompt }
    );
  }, [chat]);

  const reset = useCallback(() => {
    setResponse(null);
    setProvider(null);
    setError(null);
  }, []);

  return { chat, ask, response, provider, loading, error, reset };
      }
