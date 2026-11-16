/** Lignes de routes orange en pointillés animés (fond décoratif). */
export function RoutesBackdrop({
  paths,
  viewBox,
  className,
}: {
  paths: string[];
  viewBox: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={viewBox}
      preserveAspectRatio="none"
      className={className ?? "absolute inset-0 h-full w-full opacity-45"}
    >
      {paths.map((d) => (
        <path key={d} className="route" d={d} fill="none" stroke="#F58A07" strokeWidth={2} />
      ))}
    </svg>
  );
}
