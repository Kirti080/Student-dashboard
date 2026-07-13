import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-slate-200",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="
          h-full
          rounded-full
          bg-blue-600
          transition-all
          duration-500
        "
        style={{
          width: `${value || 0}%`,
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };