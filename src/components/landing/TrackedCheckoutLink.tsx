import { Link } from "@tanstack/react-router";
import type { OfferUnits } from "@/lib/checkout";

type Props = {
  units: OfferUnits;
  className?: string;
  children: React.ReactNode;
};

/** Repassa a query string atual (click_id, sid, fbclid, UTM, etc.) para o checkout. */
export function TrackedCheckoutLink({ units, className, children }: Props) {
  const qs =
    typeof window !== "undefined" ? window.location.search.replace(/^\?/, "") : "";
  const search = qs
    ? Object.fromEntries(new URLSearchParams(qs).entries())
    : undefined;
  return (
    <Link
      to="/checkout/$units"
      params={{ units }}
      search={search as never}
      className={className}
    >
      {children}
    </Link>
  );
}
