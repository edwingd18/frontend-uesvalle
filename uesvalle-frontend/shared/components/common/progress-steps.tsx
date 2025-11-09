"use client"

import { cn } from "@/shared/lib/utils"

interface ProgressStepsProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function ProgressSteps({ currentStep, totalSteps, className }: ProgressStepsProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Counter */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-600">
          Paso {currentStep + 1} de {totalSteps}
        </p>
        <p className="text-xs font-medium text-orange-600">
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  )
}
