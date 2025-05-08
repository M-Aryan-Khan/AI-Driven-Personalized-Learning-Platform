import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function ReviewsLoading() {
  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="mt-2 h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <Skeleton className="h-12 w-16" />
                <Skeleton className="mt-2 h-4 w-24" />
                <Skeleton className="mt-1 h-3 w-16" />
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex-1">
                      <Skeleton className="h-2 w-full" />
                    </div>
                    <Skeleton className="h-4 w-10" />
                  </div>
                ))}
              </div>

              <Skeleton className="mt-6 h-32 w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Skeleton className="h-10 w-full md:w-2/3" />
                <Skeleton className="h-10 w-32" />
              </div>

              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="mt-1 h-4 w-32" />
                        <Skeleton className="mt-2 h-3 w-full" />
                        <Skeleton className="mt-2 h-3 w-full" />
                        <Skeleton className="mt-2 h-3 w-2/3" />
                      </div>
                    </div>
                    <Separator className="my-6" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
