interface ErrorBannerProps {
  message: string | null;
  nonce: number;
}

export function ErrorBanner({ message, nonce }: ErrorBannerProps) {
  if (!message) {
    return <p className="error" role="alert" hidden />;
  }

  // Remounting on every new error (via `key`) restarts the shake animation
  // even when the same message is shown twice in a row — equivalent to the
  // original's "force reflow, then re-add the class" trick.
  return (
    <p key={nonce} className="error shake" role="alert">
      {message}
    </p>
  );
}
