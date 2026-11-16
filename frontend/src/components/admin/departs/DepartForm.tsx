"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useToast } from "@/components/admin/ui/Toaster";
import { formatPeriode } from "@/lib/dates";
import { libellesStatutDepart } from "@/lib/libelles";
import { creerDepart, modifierDepart } from "@/services/departs";
import type { DepartGroupageDetail, Pays, StatutDepart } from "@/types";

type Erreurs = Partial<Record<"ville" | "cloture" | "arrivee", string>>;

/** Formulaire « Nouveau départ groupage » / « Modifier le départ » (maquette). */
export function DepartForm({
  depart,
  pays,
  villes,
  onFermer,
}: {
  depart: DepartGroupageDetail | null;
  pays: Pays[];
  /** Villes / ports déjà connus, proposés à la saisie */
  villes: { pays_id: number; nom: string }[];
  onFermer: () => void;
}) {
  const toast = useToast();
  const d = depart;
  const [paysId, setPaysId] = useState(d?.pays.id ?? pays[0]?.id ?? 1);
  const [ville, setVille] = useState(d?.point_depart.nom ?? "");
  const [cloture, setCloture] = useState(d?.date_cloture.slice(0, 10) ?? "");
  const [arrivee, setArrivee] = useState(d?.arrivee_estimee.slice(0, 10) ?? "");
  const [statut, setStatut] = useState<StatutDepart>(d?.statut ?? "ouvert");
  const [visible, setVisible] = useState(d?.visible ?? true);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [envoi, setEnvoi] = useState(false);
  const paysRef = useRef<HTMLSelectElement>(null);
  const villeRef = useRef<HTMLInputElement>(null);
  const clotureRef = useRef<HTMLInputElement>(null);
  const arriveeRef = useRef<HTMLInputElement>(null);
  const titreRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titreRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    paysRef.current?.focus({ preventScroll: true });
  }, []);

  function valider(): Erreurs {
    const e: Erreurs = {};
    if (!ville.trim()) e.ville = "Indiquez la ville ou le port de départ.";
    if (!cloture) e.cloture = "La date de clôture est obligatoire.";
    if (!arrivee) e.arrivee = "L’arrivée estimée est obligatoire.";
    else if (cloture && arrivee <= cloture) e.arrivee = "L’arrivée doit être après la clôture.";
    return e;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e = valider();
    setErreurs(e);
    if (e.ville) return villeRef.current?.focus();
    if (e.cloture) return clotureRef.current?.focus();
    if (e.arrivee) return arriveeRef.current?.focus();
    setEnvoi(true);
    try {
      const saisie = { pays_id: paysId, point_depart_nom: ville, date_cloture: cloture, arrivee_estimee: arrivee, statut, visible };
      if (d) await modifierDepart(d.id, saisie);
      else await creerDepart(saisie);
      toast.succes(d ? "Départ modifié." : visible ? "Départ ajouté : il s’affiche sur l’accueil." : "Départ ajouté (masqué sur le site).");
      onFermer();
    } catch (err) {
      toast.erreur(err);
    } finally {
      setEnvoi(false);
    }
  }

  const effacer = (cle: keyof Erreurs) => erreurs[cle] && setErreurs((x) => ({ ...x, [cle]: undefined }));
  const champErreur = (cle: keyof Erreurs) => ({
    "aria-invalid": erreurs[cle] ? true : undefined,
    "aria-describedby": erreurs[cle] ? `dep-${cle}-err` : undefined,
  });
  const messageErreur = (cle: keyof Erreurs) =>
    erreurs[cle] && (
      <span id={`dep-${cle}-err`} role="alert" className="bo-erreur">
        {erreurs[cle]}
      </span>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="bo-card bo-fade flex flex-col gap-3.5 p-5 sm:p-6" aria-labelledby="titre-form-dep">
      <h2 id="titre-form-dep" ref={titreRef} className="m-0 text-lg text-[#0A2463]">
        {d ? "Modifier le départ" : "Nouveau départ groupage"}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5">
        <label className="bo-label">
          Pays
          <select ref={paysRef} className="bo-field" value={paysId} onChange={(e) => setPaysId(Number(e.target.value))}>
            {pays.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>
        </label>
        <label className="bo-label">
          <span>
            Ville / port <span aria-hidden="true" className="text-[#B42318]">*</span>
          </span>
          <input
            ref={villeRef}
            className="bo-field"
            type="text"
            list="dep-villes"
            placeholder="Ex. Guangzhou"
            maxLength={80}
            value={ville}
            required
            {...champErreur("ville")}
            onChange={(e) => {
              setVille(e.target.value);
              effacer("ville");
            }}
          />
          <datalist id="dep-villes">
            {villes
              .filter((v) => v.pays_id === paysId)
              .map((v) => (
                <option key={v.nom} value={v.nom} />
              ))}
          </datalist>
          {messageErreur("ville")}
        </label>
        <label className="bo-label">
          <span>
            Date de clôture <span aria-hidden="true" className="text-[#B42318]">*</span>
          </span>
          <input ref={clotureRef} className="bo-field" type="date" value={cloture} required {...champErreur("cloture")} onChange={(e) => {
              setCloture(e.target.value);
              effacer("cloture");
            }} />
          {messageErreur("cloture")}
        </label>
        <label className="bo-label">
          <span>
            Arrivée estimée <span aria-hidden="true" className="text-[#B42318]">*</span>
          </span>
          <input
            ref={arriveeRef}
            className="bo-field"
            type="date"
            min={cloture || undefined}
            value={arrivee}
            required
            {...champErreur("arrivee")}
            aria-describedby={erreurs.arrivee ? "dep-arrivee-err" : "dep-arrivee-aide"}
            onChange={(e) => {
              setArrivee(e.target.value);
              effacer("arrivee");
            }}
          />
          {messageErreur("arrivee") ?? (
            <span id="dep-arrivee-aide" className="text-xs font-normal text-[#5A6987]">
              Sur le site : « {arrivee ? formatPeriode(arrivee) : "Mi-janvier 2027"} »
            </span>
          )}
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <label className="bo-label !flex-row items-center !gap-2.5">
          Statut
          <select className="bo-field !w-auto" value={statut} onChange={(e) => setStatut(e.target.value as StatutDepart)}>
            {Object.entries(libellesStatutDepart).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="bo-check">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} /> Afficher sur le site
        </label>
      </div>
      <div className="flex flex-wrap justify-end gap-2.5">
        <button type="button" className="bo-b bo-b-l" onClick={onFermer} disabled={envoi}>
          Annuler
        </button>
        <button type="submit" className="bo-b bo-b-n" disabled={envoi}>
          {envoi ? "Enregistrement…" : d ? "Enregistrer les modifications" : "Enregistrer le départ"}
        </button>
      </div>
    </form>
  );
}
