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
  /** Send a message and get a response */
  chat: (messages: Message[], options?: AIOptions) => Promise<string | null>;
  /** Shorthand: ask a single question */
  ask: (prompt: string, systemPrompt?: string) => Promise<string | null>;
  /** The last response text */
  response: string | null;
  /** Which provider answered last */
  provider: string | null;
  /** True while waiting for AI response */
  loading: boolean;
  /** Error message if the request failed */
  error: string | null;
  /** Clear the last response and error */
  reset: () => void;
}

/**
 * Use novixo-ai in any React component.
 * Handles loading, error, and response state automatically.
 *
 * @example
 * const { ask, response, loading, error } = useNovixoAI({
 *   keys: { groq: import.meta.env.VITE_GROQ_KEY }
 * });
 *
 * const handleSubmit = async () => {
 *   await ask("Explain photosynthesis");
 * };
 *
 * {loading && <Spinner />}
 * {response && <p>{response}</p>}
 * {error && <p className="error">{error}</p>}
 */
export function useNovixoAI(config: {
  keys: Partial<Record<string, string>>;
  providers?: string[];
  models?: Partial<Record<string, string>>;
  maxTokens?: number;
  temperature?: number;
  cache?: boolean;
}): NovixoAIResult {
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
      const ai = new NovixoAI(config as any);
      const result = await ai.chat(messages, options);

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
  }, [config]);

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
