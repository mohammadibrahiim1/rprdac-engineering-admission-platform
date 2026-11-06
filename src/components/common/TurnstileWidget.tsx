import { useEffect, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

interface TurnstileWidgetProps {
  siteKey: string;
  action: string;
  onSuccess?: (token: string) => void;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

const TurnstileWidget = ({
  siteKey,
  action,
  onVerify,
  onExpire,
  onError,
}: TurnstileWidgetProps) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    // Dynamic Network Listener
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Check if running on local network IP (e.g. 192.168.x.x or localhost)
  const isLocalNetwork =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    /^192\.168\.\d+\.\d+$/.test(window.location.hostname);

  // Dynamic Decision: Online ebong Local Network na holei shudhu Turnstile active hobe
  const isTurnstileRequired = isOnline && !isLocalNetwork;

  // Offline or Local IP-te thakle automatic dummy token pass hobe
  useEffect(() => {
    if (!isTurnstileRequired) {
      onVerify("OFFLINE_BYPASS_TOKEN_FOR_LOCAL_DEV");
    }
  }, [isTurnstileRequired, onVerify]);

  // Offline-e widget render hobe na, smooth experience thakbe
  if (!isTurnstileRequired) {
    return (
      <div className="text-xs text-gray-400 text-center py-1">
        🔒 Security verification bypassed in local/offline mode.
      </div>
    );
  }

  const normalizedSiteKey = siteKey?.trim();

  if (!normalizedSiteKey) {
    return (
      <p className="text-sm text-red-600">
        Security verification is not configured.
      </p>
    );
  }

  return (
    <div className="flex min-h-[65px] w-full items-center justify-center">
      <Turnstile
        siteKey={normalizedSiteKey}
        options={{
          action,
          theme: "light",
          size: "normal",
          appearance: "always",
        }}
        onSuccess={(token) => onVerify(token)}
        onExpire={() => onExpire?.()}
        onError={() => onError?.()}
      />
    </div>
  );
};

export default TurnstileWidget;
