"use client"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
    return (
        <Sonner
            position="top-center"
            className="toaster group"
            expand={true}
            richColors={true}
            duration={5000}
            style={{ zIndex: 9999 }}
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton:
                        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton:
                        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                },
                style: {
                    zIndex: 9999,
                }
            }}
            {...props}
        />
    )
}

export { Toaster }
