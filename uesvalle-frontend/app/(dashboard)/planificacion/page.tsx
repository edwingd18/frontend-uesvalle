"use client";

"use client";

import { PlanificacionAnualView } from "@/features/planificacion/components/PlanificacionAnualView";
import { useAuthStore } from "@/shared/store/auth-store";

export default function PlanificacionPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const isTecnico = usuario?.rol === "TECNICO";

  return (
    <div className="container mx-auto py-6">
      <PlanificacionAnualView readOnly={isTecnico} />
    </div>
  );
}
