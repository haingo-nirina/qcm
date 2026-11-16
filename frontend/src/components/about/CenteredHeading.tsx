/** Titre de section centré (sur-titre + titre) des pages intérieures. */
export function CenteredHeading({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={id} className="m-0 text-[clamp(1.8rem,3vw,2.4rem)] text-navy">
        {title}
      </h2>
    </div>
  );
}
