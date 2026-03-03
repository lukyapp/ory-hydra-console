const URI_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const UNSAFE_CUSTOM_SCHEMES = new Set(['data:', 'file:', 'javascript:', 'vbscript:']);

interface ValidateOAuthUriOptions {
  label: string;
  allowCustomScheme?: boolean;
}

export const validateOAuthUri = (
  value: string,
  { label, allowCustomScheme = false }: ValidateOAuthUriOptions,
) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (!URI_SCHEME_PATTERN.test(trimmed)) {
    return `${label} must be a valid URI.`;
  }

  try {
    const uri = new URL(trimmed);
    const protocol = uri.protocol.toLowerCase();

    if (protocol === 'http:' || protocol === 'https:') {
      return null;
    }

    if (allowCustomScheme && !UNSAFE_CUSTOM_SCHEMES.has(protocol)) {
      return null;
    }

    if (allowCustomScheme) {
      return `${label} must use http://, https://, or a custom app scheme (for example myapp://callback).`;
    }

    return `${label} must start with http:// or https://.`;
  } catch {
    return `${label} must be a valid URI.`;
  }
};
