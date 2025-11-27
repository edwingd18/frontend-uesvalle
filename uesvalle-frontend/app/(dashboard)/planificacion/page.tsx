"use client";

"use client";

import { PlanificacionAnualView } from "@/features/planificacion/components/PlanificacionAnualView";
import { useAuthStore } from "@/shared/store/auth-store";

export default function PlanificacionPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const isTecnico = usuario?.rol === "TECNICO";

  return (
    <div className="w-full min-h-full py-4 sm:py-6 px-1 sm:px-4 md:px-6 lg:container lg:mx-auto">
      <PlanificacionAnualView readOnly={isTecnico} />
    </div>
  );
}
