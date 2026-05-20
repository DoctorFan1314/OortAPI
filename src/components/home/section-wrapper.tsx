"use client";

/** Wraps each homepage section with Hero-consistent gradient background */
export function SectionWrapper({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[400px] bg-primary/[0.05] rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />
      <div className="relative">
        {children}
      </div>
    </section>
  );
}
