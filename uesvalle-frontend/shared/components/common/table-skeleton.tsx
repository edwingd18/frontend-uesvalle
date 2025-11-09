import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
  rows?: number
  title?: string
  description?: string
}

export function TableSkeleton({ rows = 5, title, description }: TableSkeletonProps) {
  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && (
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          )}
          {description && (
            <CardDescription>
              <Skeleton className="h-4 w-96" />
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>
        {/* Filtros skeleton */}
        <div className="flex items-center py-4 gap-4">
          <Skeleton className="h-10 w-64" /> {/* Search */}
          <Skeleton className="h-10 w-40" />  {/* Filter 1 */}
          <Skeleton className="h-10 w-40" />  {/* Filter 2 */}
          <Skeleton className="h-10 w-40" />  {/* Filter 3 */}
          <Skeleton className="h-10 w-32 ml-auto" /> {/* Columns */}
        </div>

        {/* Table skeleton */}
        <div className="rounded-md border">
          {/* Header */}
          <div className="border-b p-4">
            <div className="grid grid-cols-7 gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>

          {/* Rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="border-b last:border-b-0 p-4">
              <div className="grid grid-cols-7 gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}