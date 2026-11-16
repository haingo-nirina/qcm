import { engagementsAccueil } from "@/content/accueil";

/** Bandeau « 01 · Nous sourçons. » … « 05 · Nous livrons. » en bas de la bannière. */
export function EngagementsBand() {
  return (
    <div className="up d5 section-x container-qcm relative z-[2] pb-[34px]">
      <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3 p-0">
        {engagementsAccueil.map((texte, i) => (
          <li
            key={texte}
            className="rounded-2xl border border-white/22 bg-white/10 px-[18px] py-4 font-display text-[15px] font-semibold backdrop-blur-[10px]"
          >
            <span className="text-orange">{String(i + 1).padStart(2, "0")}</span> · {texte}
          </li>
        ))}
      </ol>
    </div>
  );
}
