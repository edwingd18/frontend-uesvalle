"use client"

import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/shared/lib/utils"

export interface Step {
  id: number
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                    {
                      "bg-orange-600 border-orange-600": isCompleted || isCurrent,
                      "border-gray-300 bg-white": !isCompleted && !isCurrent,
                    }
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : isCurrent ? (
                    step.icon ? (
                      <step.icon className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-sm font-semibold text-white">
                        {step.id}
                      </span>
                    )
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Step Info */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      {
                        "text-orange-600": isCompleted || isCurrent,
                        "text-gray-500": !isCompleted && !isCurrent,
                      }
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 mt-[-50px]">
                  <div
                    className={cn(
                      "h-full transition-all",
                      {
                        "bg-orange-600": isCompleted,
                        "bg-gray-300": !isCompleted,
                      }
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
