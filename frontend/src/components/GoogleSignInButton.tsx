"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
}

interface GooglePromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: string;
      theme?: string;
      size?: string;
      text?: string;
      shape?: string;
      logo_alignment?: string;
      width?: number;
    }
  ) => void;
  prompt: (momentListener?: (notification: GooglePromptNotification) => void) => void;
}

interface GoogleIdentityServices {
  accounts: {
    id: GoogleAccountsId;
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityServices;
  }
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with";
  className?: string;
}

export const GoogleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      fill="#EA4335"
    />
  </svg>
);

export default function GoogleSignInButton({
  onSuccess,
  onError,
  text = "continue_with",
  className = "",
}: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const hiddenBtnRef = useRef<HTMLDivElement>(null);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "663446059486-26k74bahmnruch1rqer5g8jmbae9i2ov.apps.googleusercontent.com";

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response?.credential) {
        const errMsg = "No credential received from Google.";
        if (onError) onError(errMsg);
        return;
      }

      try {
        setLoading(true);
        const res = await loginWithGoogle(response.credential);

        if (res.success) {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push("/dashboard");
          }
        } else {
          if (onError) onError(res.error || "Google authentication failed.");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred during Google sign in.";
        if (onError) onError(message);
      } finally {
        setLoading(false);
      }
    },
    [loginWithGoogle, onError, onSuccess, router]
  );

  useEffect(() => {
    const initializeGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (hiddenBtnRef.current) {
            window.google.accounts.id.renderButton(hiddenBtnRef.current, {
              type: "standard",
              theme: "filled_black",
              size: "large",
              text: text,
              shape: "rectangular",
              logo_alignment: "left",
              width: 384,
            });
          }
        } catch (e) {
          console.error("Error initializing Google Identity Services:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGsi();
      return;
    }

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        initializeGsi();
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [clientId, text, handleCredentialResponse]);

  const handleCustomButtonClick = () => {
    if (loading) return;

    if (window.google?.accounts?.id) {
      const googleBtnIframe = hiddenBtnRef.current?.querySelector("div[role=button]") as HTMLElement;
      if (googleBtnIframe) {
        googleBtnIframe.click();
      } else {
        window.google.accounts.id.prompt((notification: GooglePromptNotification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const fallbackBtn = hiddenBtnRef.current?.querySelector("div[role=button]") as HTMLElement;
            if (fallbackBtn) {
              fallbackBtn.click();
            }
          }
        });
      }
    } else {
      if (onError) onError("Google Sign-In is still loading. Please check your internet connection.");
    }
  };

  const getButtonLabel = () => {
    if (text === "signup_with") return "Sign up with Google";
    if (text === "signin_with") return "Sign in with Google";
    return "Continue with Google";
  };

  return (
    <div className="w-full">
      {/* Visual Custom Button Styled Perfectly for ProjectLens */}
      <button
        type="button"
        onClick={handleCustomButtonClick}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-3 border shadow-sm ${
          loading
            ? "bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed"
            : "bg-slate-800/70 hover:bg-slate-750 border-slate-700/80 hover:border-blue-500/50 text-white hover:text-white shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] active:scale-[0.99]"
        } ${className}`}
        aria-label={getButtonLabel()}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span>Verifying Google account...</span>
          </>
        ) : (
          <>
            <GoogleIcon className="w-5 h-5 flex-shrink-0" />
            <span>{getButtonLabel()}</span>
          </>
        )}
      </button>

      {/* Hidden container where GSI renders its secure trigger element */}
      <div
        ref={hiddenBtnRef}
        aria-hidden="true"
        className="hidden"
        style={{ display: "none" }}
      />
    </div>
  );
}
