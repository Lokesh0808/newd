import Link from "next/link";
import { cn } from "@/lib/utils";

/** The CareerAI wordmark — a gradient spark used in the header and footer. */
export function Logo({
  className,
  href = "/",
  showText = true,
}: {
  className?: string;
  href?: string | null;
  showText?: boolean;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient shadow-lg shadow-brand-500/30">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden>
          <path
            d="M12 3.2 13.9 8.6 19.3 10.5 13.9 12.4 12 17.8 10.1 12.4 4.7 10.5 10.1 8.6 12 3.2Z"
            fill="white"
          />
          <circle cx="18.4" cy="17.6" r="1.6" fill="white" fillOpacity="0.85" />
        </svg>
      </span>
      {showText && (
        <span className="text-lg font-bold tracking-tight">
          Career<span className="text-brand-gradient">AI</span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="CareerAI home" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {content}
    </Link>
  );
}
