import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function MessagesLoading() {
  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex h-[calc(80vh-120px)] flex-col md:flex-row">
          {/* Conversation List */}
          <div className="w-full border-r border-gray-200 md:w-1/3">
            <div className="p-4">
              <Skeleton className="mb-4 h-10 w-full" />

              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i}>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="mt-2 h-3 w-1/2" />
                      </div>
                    </div>
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Message Area */}
          <div className="flex flex-1 flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1 h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-9 w-28" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="my-4 flex items-center justify-center">
                  <Skeleton className="h-6 w-32 rounded-full" />
                </div>

                {[1, 2, 3].map((i) => (
                  <div key={`left-${i}`} className="flex justify-start">
                    <Skeleton className="h-20 w-2/3 rounded-lg" />
                  </div>
                ))}

                {[1, 2].map((i) => (
                  <div key={`right-${i}`} className="flex justify-end">
                    <Skeleton className="h-16 w-2/3 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
