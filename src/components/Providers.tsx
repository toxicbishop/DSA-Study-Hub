import { GoogleOAuthProvider } from "@react-oauth/google";
import { ReactNode, useEffect, useState } from "react";

let cachedClientId: string | null = null;

export function Providers({ children }: { children: ReactNode }) {
  const [clientId, setClientId] = useState<string>("");

  useEffect(() => {
    if (cachedClientId) {
      setClientId(cachedClientId);
      return;
    }
    
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        cachedClientId = data.googleClientId;
        setClientId(cachedClientId || "");
      })
      .catch(err => console.error("Failed to fetch config", err));
  }, []);

  if (!clientId) {
    return <>{children}</>;
  }
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
