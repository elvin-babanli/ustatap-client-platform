import { clsx } from "clsx";

export function Card({
  children,
  className,
  padding = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { padding?: boolean }) {
  return (
    <div
      className={clsx(
        "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden",
        padding && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("border-b border-gray-100 pb-4 mb-4", className)} {...props}>
      {children}
    </div>
  );
}
