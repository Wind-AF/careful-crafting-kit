import { Link } from "@tanstack/react-router";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function CtaButton({ href, children, className = "" }: Props) {
  const isHash = href.startsWith("#");
  const cls = `mx-auto inline-flex w-full max-w-sm items-center justify-center rounded-md bg-gradient-to-b from-gh-gold-bright to-gh-gold px-6 py-3 text-center text-base font-bold uppercase tracking-wide text-black shadow-[0_4px_24px_rgba(201,162,39,0.35)] transition hover:brightness-110 active:scale-[0.98] sm:mx-0 sm:w-auto sm:max-w-none sm:px-8 sm:text-lg ${className}`;
  if (isHash) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={cls}>
      {children}
    </Link>
  );
}
