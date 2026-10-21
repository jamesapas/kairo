"use client";

import React, { createContext, useContext, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AuthModal } from "./auth-modal";

interface AuthModalContextType {
  isOpen: boolean;
  mode: "login" | "register";
  reason?: string;
  openAuthModal: (mode?: "login" | "register", reason?: string) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

function AuthSearchParamsHandler({
  onTrigger,
}: {
  onTrigger: (mode: "login" | "register") => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authQuery = searchParams.get("auth");
    if (authQuery === "login" || authQuery === "register") {
      onTrigger(authQuery);

      // Clean up the URL search param without reloading
      const params = new URLSearchParams(searchParams.toString());
      params.delete("auth");
      const nextQuery = params.toString() ? `?${params.toString()}` : "";
      router.replace(`${pathname}${nextQuery}`, { scroll: false });
    }
  }, [searchParams, pathname, router, onTrigger]);

  return null;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [reason, setReason] = useState<string | undefined>();

  const openAuthModal = (newMode: "login" | "register" = "login", newReason?: string) => {
    setMode(newMode);
    setReason(newReason);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
    setReason(undefined);
  };

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        mode,
        reason,
        openAuthModal,
        closeAuthModal,
      }}
    >
      <Suspense fallback={null}>
        <AuthSearchParamsHandler onTrigger={(m) => openAuthModal(m)} />
      </Suspense>

      {children}

      <AuthModal
        isOpen={isOpen}
        onClose={closeAuthModal}
        initialMode={mode}
        reason={reason}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
