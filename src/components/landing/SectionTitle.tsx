type Props = {
  as?: "h1" | "h2" | "h3";
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
};

export function SectionTitle({
  as: Tag = "h2",
  children,
  className = "",
  subtitle,
}: Props) {
  return (
    <div className={`mb-6 text-center sm:mb-8 ${className}`}>
      <Tag className="text-balance font-display text-3xl uppercase tracking-tight text-gh-gold-bright sm:text-4xl md:text-5xl lg:text-6xl">
        {children}
      </Tag>
      {subtitle ? (
        <p className="mt-2 text-balance text-xs uppercase text-gh-muted sm:mt-3 sm:text-base sm:tracking-wide md:tracking-widest">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
