const readEnv = (key: string): string | undefined => {
  const value = process.env[key];
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const env = {
  walletConnectProjectId: readEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID'),
  coinbaseAppName: readEnv('NEXT_PUBLIC_COINBASE_APP_NAME') ?? 'Base Mini App'
};
