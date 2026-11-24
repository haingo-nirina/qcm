"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { equipe, servicesEquipe, type MembreEquipe, type ServiceEquipe } from "@/content/equipe";
import { CenteredHeading } from "./CenteredHeading";

type Filtre = ServiceEquipe | "tous";

/** Délai entre deux cartes de la cascade d'apparition (ms). */
const DECALAGE_CASCADE = 80;
/** Durée de mise en avant de chaque carte par le « projecteur » (ms). */
const INTERVALLE_PROJECTEUR = 2600;

const REQUETE_MOUVEMENT_REDUIT = "(prefers-reduced-motion: reduce)";

/** true si le visiteur a demandé à limiter les animations (réglage système). */
function useMouvementReduit() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REQUETE_MOUVEMENT_REDUIT);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REQUETE_MOUVEMENT_REDUIT).matches,
    () => false,
  );
}

const libelleService = (service: ServiceEquipe) => servicesEquipe.find((s) => s.id === service)?.libelle ?? "";

/** Photo ronde ; l'initiale du prénom reste dessous et apparaît si la photo manque ou ne charge pas. */
function Portrait({ membre, taille, decoratif }: { membre: MembreEquipe; taille: number; decoratif?: boolean }) {
  const [erreur, setErreur] = useState(false);
  return (
    <span className={`team-portrait ${taille > 100 ? "team-portrait-lg" : "team-portrait-sm"}`}>
      <span className="team-initiale" aria-hidden="true">
        {membre.nom.trim().charAt(0).toUpperCase()}
      </span>
      {membre.photo && !erreur && (
        <Image
          src={membre.photo}
          alt={decoratif ? "" : `Photo de ${membre.nom}, ${membre.poste}`}
          width={taille}
          height={taille}
          sizes={`${taille}px`}
          loading="lazy"
          className="team-photo"
          onError={() => setErreur(true)}
        />
      )}
    </span>
  );
}

interface CarteProps {
  membre: MembreEquipe;
  retournee: boolean;
  projecteur: boolean;
  /** Délai de la cascade (ms), undefined tant que la carte n'est pas apparue. */
  delai: number | undefined;
  onRetourner: () => void;
  onFermer: () => void;
}

function CarteMembre({ membre, retournee, projecteur, delai, onRetourner, onFermer }: CarteProps) {
  const rectoRef = useRef<HTMLButtonElement>(null);
  /** Évite de re-retourner la carte quand « Retour » rend le focus au recto. */
  const ignorerFocus = useRef(false);
  const idVerso = `verso-${membre.nom.toLowerCase()}`;

  const retour = () => {
    ignorerFocus.current = true;
    onFermer();
    rectoRef.current?.focus();
  };

  return (
    <li
      data-membre={membre.nom}
      className={`team-item${delai !== undefined ? " is-in" : ""}${projecteur ? " is-spot" : ""}`}
      style={{ "--d": `${delai ?? 0}ms` } as CSSProperties}
    >
      <div
        className={`team-flip${retournee ? " is-flipped" : ""}`}
        onPointerEnter={(e) => e.pointerType === "mouse" && onRetourner()}
        onPointerLeave={(e) => e.pointerType === "mouse" && onFermer()}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onFermer();
        }}
      >
        <div className="team-inner">
          {/* Recto */}
          <button
            ref={rectoRef}
            type="button"
            className="team-face team-front"
            aria-label={`${membre.nom}, ${membre.poste} : afficher le détail`}
            aria-expanded={retournee}
            aria-controls={idVerso}
            onClick={onRetourner}
            onFocus={(e) => {
              if (!ignorerFocus.current && e.currentTarget.matches(":focus-visible")) onRetourner();
              ignorerFocus.current = false;
            }}
          >
            <span className="team-visual">
              <span className="team-badge" aria-hidden="true">
                <span className="team-badge-hover">Survolez-moi</span>
                <span className="team-badge-touch">Touchez-moi</span>
              </span>
              <span className="team-halo">
                <span className="team-arc" aria-hidden="true" />
                <span className="team-full" aria-hidden="true" />
                <Portrait membre={membre} taille={210} />
              </span>
            </span>
            <span className="team-text">
              <span className="font-display text-lg font-bold text-navy">{membre.nom}</span>
              <span className="text-sm font-semibold text-orange-text">{membre.poste}</span>
              <span className="team-bar" aria-hidden="true" />
            </span>
          </button>

          {/* Verso : inert tant que la carte n'est pas retournée (hors de la tabulation). */}
          <div id={idVerso} className="team-face team-back" inert={!retournee}>
            <div className="flex items-center gap-3">
              <Portrait membre={membre} taille={56} decoratif />
              <span className="text-xs font-bold uppercase tracking-[0.12em]">{libelleService(membre.service)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="m-0 font-display text-[22px] font-bold text-navy-deep">{membre.nom}</h3>
              <p className="m-0 text-[15px] font-semibold">{membre.poste}</p>
            </div>
            <p className="m-0 text-[15px] leading-relaxed">{membre.phrase}</p>
            <button type="button" className="btn btn-sm team-retour mt-auto self-start" onClick={retour}>
              Retour
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export function TeamGrid() {
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [retournee, setRetournee] = useState<string | null>(null);
  const [survolGrille, setSurvolGrille] = useState(false);
  /** Cartes déjà apparues → délai de cascade (ms). */
  const [apparus, setApparus] = useState<Record<string, number>>({});
  const [enVue, setEnVue] = useState(false);
  const [projecteur, setProjecteur] = useState<string | null>(null);
  const mouvementReduit = useMouvementReduit();

  const grilleRef = useRef<HTMLUListElement>(null);
  /** Cartes actuellement visibles à l'écran (pour le projecteur). */
  const visiblesRef = useRef<Set<string>>(new Set());

  const liste = useMemo(() => (filtre === "tous" ? equipe : equipe.filter((m) => m.service === filtre)), [filtre]);
  const projecteurActif = !mouvementReduit && enVue && !survolGrille && retournee === null;

  const changerFiltre = (f: Filtre) => {
    setFiltre(f);
    setRetournee(null);
    setApparus({}); // relance la cascade
    setProjecteur(null); // le projecteur repart de la première carte
  };

  // Apparition au défilement : chaque carte qui entre à l'écran est marquée « apparue »
  // (animation CSS à durée fixe → elle se termine toujours à opacity: 1).
  useEffect(() => {
    const grille = grilleRef.current;
    if (!grille) return;
    grille.dataset.anim = "on"; // sans JavaScript, les cartes restent simplement visibles
    visiblesRef.current = new Set();

    const observer = new IntersectionObserver(
      (entrees) => {
        const nouvelles: string[] = [];
        for (const entree of entrees) {
          const nom = (entree.target as HTMLElement).dataset.membre ?? "";
          if (entree.isIntersecting) {
            visiblesRef.current.add(nom);
            nouvelles.push(nom);
          } else {
            visiblesRef.current.delete(nom);
          }
        }
        setEnVue(visiblesRef.current.size > 0);
        if (nouvelles.length === 0) return;
        setApparus((prec) => {
          const suivant = { ...prec };
          let rang = 0;
          for (const nom of nouvelles) {
            if (!(nom in suivant)) suivant[nom] = rang++ * DECALAGE_CASCADE;
          }
          return suivant;
        });
      },
      { threshold: 0.12 },
    );
    grille.querySelectorAll<HTMLElement>("[data-membre]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filtre]);

  // Projecteur : met en avant une carte visible à tour de rôle.
  useEffect(() => {
    if (!projecteurActif) return;
    const id = window.setInterval(() => {
      setProjecteur((courant) => {
        const candidats = liste.filter((m) => visiblesRef.current.has(m.nom));
        if (candidats.length === 0) return null;
        const i = candidats.findIndex((m) => m.nom === courant);
        return candidats[(i + 1) % candidats.length].nom;
      });
    }, INTERVALLE_PROJECTEUR);
    return () => window.clearInterval(id);
  }, [projecteurActif, liste]);

  const options: Array<{ id: Filtre; libelle: string }> = [{ id: "tous", libelle: "Tous" }, ...servicesEquipe];

  return (
    <section aria-labelledby="titre-equipe" className="flex flex-col gap-9">
      <div className="rv flex flex-col items-center gap-4">
        <CenteredHeading id="titre-equipe" eyebrow="Notre équipe" title="Des experts à votre écoute" />
        <p className="m-0 max-w-[560px] text-center text-muted">
          Survolez une carte pour découvrir le rôle de chacun.
        </p>
      </div>

      <div role="group" aria-label="Filtrer l’équipe par service" className="flex flex-wrap justify-center gap-2.5">
        {options.map((o) => {
          const nombre = o.id === "tous" ? equipe.length : equipe.filter((m) => m.service === o.id).length;
          return (
            <button
              key={o.id}
              type="button"
              className="team-tab"
              aria-pressed={filtre === o.id}
              onClick={() => changerFiltre(o.id)}
            >
              {o.libelle}
              <span className="team-count">
                {nombre}
                <span className="sr-only"> {nombre > 1 ? "personnes" : "personne"}</span>
              </span>
            </button>
          );
        })}
      </div>

      <ul
        key={filtre}
        ref={grilleRef}
        className="team-grid m-0 flex list-none flex-wrap justify-center gap-6 p-0"
        onPointerEnter={(e) => e.pointerType === "mouse" && setSurvolGrille(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setSurvolGrille(false)}
      >
        {liste.map((membre) => (
          <CarteMembre
            key={membre.nom}
            membre={membre}
            retournee={retournee === membre.nom}
            projecteur={projecteurActif && projecteur === membre.nom}
            delai={apparus[membre.nom]}
            onRetourner={() => setRetournee(membre.nom)}
            onFermer={() => setRetournee((r) => (r === membre.nom ? null : r))}
          />
        ))}
      </ul>
    </section>
  );
}
