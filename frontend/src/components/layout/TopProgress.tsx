"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * Instant, zero-dependency feedback bar shown at the very top whenever the
 * route changes, so navigation never feels dead even while Next.js renders.
 */
export function TopProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = React.useState(false);
  const first = React.useRef(true);

  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 550);
    return () => clearTimeout(t);
  }, [pathname]);

  return visible ? <div className="top-progress-bar" aria-hidden="true" /> : null;
}