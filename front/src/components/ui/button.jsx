import React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({
                                     className,
                                     variant = "default",
                                     size = "default",
                                     children,
                                     ...props
                                 }, ref) => {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                {
                    "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
                    "bg-transparent border border-input hover:bg-accent hover:text-accent-foreground": variant === "outline",
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
                    "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
                    "bg-transparent hover:bg-transparent": variant === "link",
                },
                {
                    "h-10 py-2 px-4": size === "default",
                    "h-9 px-3": size === "sm",
                    "h-11 px-8": size === "lg",
                    "h-9 w-9": size === "icon",
                },
                className
            )}
            ref={ref}
            {...props}
        >
            {children}
        </button>
    )
})

Button.displayName = "Button"

export { Button }