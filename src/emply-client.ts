/**
 * Lightweight HTTP client for the Emply PIX payment API.
 * Uses native fetch -- no external HTTP dependencies.
 */

const DEFAULT_BASE_URL = "https://api.emply.com.br/api/v1";

export interface EmplyClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export interface EmplyResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
}

export interface EmplyError {
  detail: string;
}

export class EmplyClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: EmplyClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  }

  // ── helpers ──────────────────────────────────────────────────────

  private headers(extra?: Record<string, string>): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...extra,
    };
  }

  private async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | undefined>,
  ): Promise<EmplyResponse<T>> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null && v !== "") {
          url.searchParams.set(k, String(v));
        }
      }
    }

    const init: RequestInit = {
      method,
      headers: this.headers(),
    };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    const res = await fetch(url.toString(), init);
    let data: T;
    const text = await res.text();
    try {
      data = JSON.parse(text) as T;
    } catch {
      data = text as unknown as T;
    }

    return { ok: res.ok, status: res.status, data };
  }

  // ── public API ───────────────────────────────────────────────────

  async get<T = unknown>(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<EmplyResponse<T>> {
    return this.request<T>("GET", path, undefined, query);
  }

  async post<T = unknown>(
    path: string,
    body?: unknown,
    query?: Record<string, string | number | undefined>,
  ): Promise<EmplyResponse<T>> {
    return this.request<T>("POST", path, body, query);
  }

  async put<T = unknown>(
    path: string,
    body?: unknown,
    query?: Record<string, string | number | undefined>,
  ): Promise<EmplyResponse<T>> {
    return this.request<T>("PUT", path, body, query);
  }

  async del<T = unknown>(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<EmplyResponse<T>> {
    return this.request<T>("DELETE", path, undefined, query);
  }
}
