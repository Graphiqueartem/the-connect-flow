export type RuntimeConfig = {
  autoconvertApiKeyId?: string | null;
};

let cachedConfig: RuntimeConfig | null = null;

export const getRuntimeConfig = async (): Promise<RuntimeConfig> => {
  if (cachedConfig) return cachedConfig;

  try {
    const baseUrl = import.meta.env.BASE_URL || "/";
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const response = await fetch(`${normalizedBase}/config.json`, { cache: "no-store" });

    if (!response.ok) {
      cachedConfig = {};
      return cachedConfig;
    }

    const json = await response.json();
    cachedConfig = {
      autoconvertApiKeyId:
        typeof json?.autoconvertApiKeyId === "string" ? json.autoconvertApiKeyId : undefined,
    };
  } catch {
    cachedConfig = {};
  }

  return cachedConfig;
};
