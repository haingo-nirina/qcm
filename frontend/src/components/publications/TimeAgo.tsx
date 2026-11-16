"use client";

import { useEffect, useState } from "react";
import { formatDateCourte, formatIlYA } from "@/lib/dates";

/**
 * « il y a 2 h », calculé dans le navigateur (la page est pré-générée :
 * le HTML contient la date, remplacée par la durée relative au chargement).
 */
export function TimeAgo({ iso }: { iso: string }) {
  const [maintenant, setMaintenant] = useState<number | null>(null);

  useEffect(() => {
    const maj = () => setMaintenant(Date.now());
    const premier = setTimeout(maj, 0);
    const t = setInterval(maj, 60_000);
    return () => {
      clearTimeout(premier);
      clearInterval(t);
    };
  }, []);

  return (
    <time dateTime={iso} title={formatDateCourte(iso)}>
      {maintenant === null ? `le ${formatDateCourte(iso)}` : formatIlYA(iso, maintenant)}
    </time>
  );
}
