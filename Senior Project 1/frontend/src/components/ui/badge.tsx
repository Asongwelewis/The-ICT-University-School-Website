import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Badge variant styles using class-variance-authority
 * Provides consistent styling for different badge types and sizes
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        /** Primary badge with theme colors */
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        /** Secondary badge with muted colors */
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        /** Success badge for positive states */
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-600",
        /** Warning badge for caution states */
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        /** Destructive badge for errors */
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        /** Outline badge with border only */
        outline: "text-foreground",
      },
      size: {
        /** Small badge for compact spaces */
        sm: "px-2 py-0.5 text-xs",
        /** Default badge size */
        default: "px-2.5 py-0.5 text-xs",
        /** Large badge for emphasis */
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Props for the Badge component
 * Extends standard HTML div attributes with variant styling options
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Additional CSS classes to apply to the badge
   */
  className?: string
  /**
   * Badge content - can be text, numbers, or React elements
   */
  children?: React.ReactNode
}

/**
 * Badge component for displaying status, categories, or labels
 * 
 * @example
 * ```tsx
 * <Badge variant="default">New</Badge>
 * <Badge variant="destructive" size="lg">Error</Badge>
 * <Badge variant="outline" size="sm">Draft</Badge>
 * <Badge variant="success">Completed</Badge>
 * <Badge variant="warning">Pending</Badge>
 * ```
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }