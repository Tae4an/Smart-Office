import React from "react"
import { cn } from "../../lib/utils"

const Dialog = ({ children, open, onOpenChange }) => {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50">
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />
            <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50">
                {children}
            </div>
        </div>
    )
}

const DialogContent = ({
                           className,
                           children,
                           ...props
                       }) => {
    return (
        <div
            className={cn(
                "bg-background border rounded-lg shadow-lg w-full max-w-lg overflow-hidden",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export { Dialog, DialogContent }