import { Separator } from "@/components/ui/separator"

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className = "" }: FormSectionProps) {
  return (
    <>
      <div className={className}>
        <div className="mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
      <Separator />
    </>
  )
}