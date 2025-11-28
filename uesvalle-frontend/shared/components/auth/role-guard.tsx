"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/store/auth-store";
import { Usuario } from "@/shared/types/auth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Usuario["rol"][];
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = "/",
}: RoleGuardProps) {
  const router = useRouter();
  const usuario = useAuthStore((state) => state.usuario);

  useEffect(() => {
    if (usuario && !allowedRoles.includes(usuario.rol)) {
      router.push(redirectTo);
    }
  }, [usuario, allowedRoles, redirectTo, router]);

  // Si el usuario no tiene el rol permitido, no mostrar nada
  if (!usuario || !allowedRoles.includes(usuario.rol)) {
    return null;
  }

  return <>{children}</>;
}
