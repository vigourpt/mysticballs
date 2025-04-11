// Type definitions for Deno APIs for Supabase Edge Functions

declare namespace Deno {
  interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): Record<string, string>;
  }

  interface Reader {
    read(p: Uint8Array): Promise<number | null>;
  }

  interface Writer {
    write(p: Uint8Array): Promise<number>;
  }

  interface Closer {
    close(): void;
  }

  export const env: Env;
}
