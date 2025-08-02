import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const alertDialogVariants = cva(
  "fixed inset-0 z-50 flex items-center justify-center p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
const AlertDialog = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertDialogVariants>>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={alertDialogVariants({ variant, className })} {...props} />
  )
);
AlertDialog.displayName = "AlertDialog";
const AlertDialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`bg-white rounded-lg shadow-lg p-6 ${className}`} {...props} />
));
AlertDialogContent.displayName = "AlertDialogContent";
const AlertDialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`flex justify-end space-x-2 ${className}`} {...props} />
));
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button ref={ref} className={`btn btn-primary ${className}`} {...props} />
));
AlertDialogAction.displayName = "AlertDialogAction";
const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button ref={ref} className={`btn btn-secondary ${className}`} {...props} />
));
AlertDialogCancel.displayName = "AlertDialogCancel";
const AlertDialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`mb-4 ${className}`} {...props} />
));
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={`text-lg font-semibold ${className}`} {...props} />
));
AlertDialogTitle.displayName = "AlertDialogTitle";
const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button ref={ref} className={`btn btn-secondary ${className}`} {...props} />
));
AlertDialogTrigger.displayName = "AlertDialogTrigger";

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
};