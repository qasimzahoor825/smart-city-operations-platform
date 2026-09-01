"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui";

interface DataPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function PageContainer({ title, description, children }: DataPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function useAsync<T>(loader: () => Promise<T>, fallback: T, deps: React.DependencyList = []) {
  const [data, setData] = React.useState<T>(fallback);
  const [loading, setLoading] = React.useState(true);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    loader()
      .then((res) => {
        if (active) setData(res);
      })
      .catch(() => {
        /* fallback already set */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const refresh = React.useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, refresh };
}

export { Card, CardHeader, CardTitle, CardDescription };