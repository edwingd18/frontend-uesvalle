"use client";

import { PlanificacionAnualView } from "@/features/planificacion/components/PlanificacionAnualView";

export default function PlanificacionPage() {
  return (
    <div className="w-full min-h-full py-4 sm:py-6 px-1 sm:px-4 md:px-6 lg:container lg:mx-auto">
      <PlanificacionAnualView />
    </div>
  );
}
