"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAlerteAbonnes } from "@/components/admin/abonnes/useAlerteAbonnes";
import { useToast } from "@/components/admin/ui/Toaster";
import { libellesCategorie } from "@/lib/libelles";
import { slugifier } from "@/lib/slug";
import { creerPublication, modifierPublication, televerserImage, TITRE_MAX, TITRE_MIN } from "@/services/publications";
import type { CategoriePublication, Publication, StatutPublication } from "@/types";
import { ImageDropzone, type ValeurImage } from "./ImageDropzone";

type Erreurs = Partial<Record<"titre" | "contenu" | "image", string>>;

/**
 * Formulaire de création / modification d'une publication (maquette).
 * Le slug (adresse) est calculé depuis le titre.
 */
export function PublicationForm({ publication, onFermer }: { publication: Publication | null; onFermer: () => void }) {
  const toast = useToast();
  const proposerAlerte = useAlerteAbonnes();
  const p = publication;
  const [titre, setTitre] = useState(p?.titre ?? "");
  const [categorie, setCategorie] = useState<CategoriePublication>(p?.categorie ?? "arrivage");
  const [contenu, setContenu] = useState(p?.contenu ?? "");
  const [image, setImage] = useState<ValeurImage>(p?.image_url ? { url: p.image_url } : null);
  const [ouverts, setOuverts] = useState(p?.commentaires_ouverts ?? true);
  const [moderes, setModeres] = useState(p?.commentaires_moderes ?? true);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [envoi, setEnvoi] = useState<StatutPublication | null>(null);
  const titreRef = useRef<HTMLInputElement>(null);
  const contenuRef = useRef<HTMLTextAreaElement>(null);
  const titreCarteRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titreCarteRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    titreRef.current?.focus({ preventScroll: true });
  }, []);

  const dejaPubliee = p?.statut === "publie";
  // Une publication déjà en ligne garde son adresse (les liens partagés restent valides).
  const slug = dejaPubliee ? p.slug : slugifier(titre);

  function valider(statut: StatutPublication): Erreurs {
    const e: Erreurs = {};
    const t = titre.trim();
    if (!t) e.titre = "Le titre est obligatoire.";
    else if (t.length < TITRE_MIN) e.titre = `Le titre doit faire au moins ${TITRE_MIN} caractères.`;
    else if (t.length > TITRE_MAX) e.titre = `Le titre doit faire ${TITRE_MAX} caractères maximum.`;
    if (statut === "publie" && !contenu.trim()) e.contenu = "Le texte est obligatoire pour publier.";
    return e;
  }

  async function enregistrer(statut: StatutPublication) {
    const e = valider(statut);
    setErreurs(e);
    if (e.titre) return titreRef.current?.focus();
    if (e.contenu) return contenuRef.current?.focus();

    setEnvoi(statut);
    try {
      let image_url: string | null = null;
      if (image && "url" in image) image_url = image.url;
      if (image && "fichier" in image) {
        try {
          image_url = await televerserImage(image.fichier);
        } catch (err) {
          setErreurs({ image: err instanceof Error ? err.message : "La photo n’a pas pu être envoyée." });
          return;
        }
      }
      const saisie = { titre, categorie, contenu, image_url, statut, commentaires_ouverts: ouverts, commentaires_moderes: moderes };
      const enregistree = p ? await modifierPublication(p.id, saisie) : await creerPublication(saisie);
      toast.succes(
        statut === "publie"
          ? p
            ? "Publication mise à jour sur le site."
            : "Publication en ligne : elle est visible sur la page Publications."
          : "Brouillon enregistré (non visible sur le site).",
      );
      onFermer();
      // Mise en ligne (nouvelle publication ou brouillon publié) : proposer l'envoi aux abonnés
      if (statut === "publie" && !dejaPubliee) {
        void proposerAlerte("publication", enregistree.id, <>la publication « {enregistree.titre} »</>);
      }
    } catch (err) {
      toast.erreur(err);
    } finally {
      setEnvoi(null);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    enregistrer("publie");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="bo-card bo-fade flex flex-col gap-3.5 p-5 sm:p-6" aria-labelledby="titre-form-pub">
      <h2 id="titre-form-pub" ref={titreCarteRef} className="m-0 text-lg text-[#0A2463]">
        {p ? "Modifier la publication" : "Nouvelle publication"}
      </h2>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="bo-label" htmlFor="pub-titre">
            <span>
              Titre <span aria-hidden="true" className="text-[#B42318]">*</span>
            </span>
          </label>
          <input
            ref={titreRef}
            id="pub-titre"
            className="bo-field"
            type="text"
            placeholder="Ex. Arrivage du conteneur de Guangzhou"
            value={titre}
            maxLength={TITRE_MAX}
            required
            aria-invalid={erreurs.titre ? true : undefined}
            aria-describedby="pub-titre-aide"
            onChange={(e) => {
              setTitre(e.target.value);
              if (erreurs.titre) setErreurs((x) => ({ ...x, titre: undefined }));
            }}
          />
          <span id="pub-titre-aide" className="flex flex-wrap justify-between gap-2 text-xs text-[#5A6987]">
            {erreurs.titre ? (
              <span className="bo-erreur" role="alert">
                {erreurs.titre}
              </span>
            ) : (
              <span className="min-w-0 truncate">
                Adresse : /publications#{slug || "…"}
                {dejaPubliee && " (inchangée après publication)"}
              </span>
            )}
            <span aria-hidden="true">
              {titre.trim().length}/{TITRE_MAX}
            </span>
          </span>
        </div>
        <label className="bo-label" htmlFor="pub-categorie">
          Catégorie
          <select id="pub-categorie" className="bo-field" value={categorie} onChange={(e) => setCategorie(e.target.value as CategoriePublication)}>
            {Object.entries(libellesCategorie).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ImageDropzone
        valeur={image}
        erreurExterne={erreurs.image}
        onChange={(v) => {
          setImage(v);
          setErreurs((x) => ({ ...x, image: undefined }));
        }}
      />

      <div className="flex flex-col gap-1.5">
        <label className="bo-label" htmlFor="pub-texte">
          <span>
            Texte <span className="font-normal text-[#5A6987]">(obligatoire pour publier)</span>
          </span>
        </label>
        <textarea
          ref={contenuRef}
          id="pub-texte"
          className="bo-field resize-y"
          rows={5}
          placeholder="Contenu de la publication…"
          value={contenu}
          aria-invalid={erreurs.contenu ? true : undefined}
          aria-describedby={erreurs.contenu ? "pub-texte-err" : undefined}
          onChange={(e) => {
            setContenu(e.target.value);
            if (erreurs.contenu) setErreurs((x) => ({ ...x, contenu: undefined }));
          }}
        />
        {erreurs.contenu && (
          <p id="pub-texte-err" role="alert" className="bo-erreur">
            {erreurs.contenu}
          </p>
        )}
      </div>

      <fieldset className="m-0 flex flex-wrap items-center gap-x-[18px] border-0 p-0">
        <legend className="sr-only">Commentaires</legend>
        <label className="bo-check">
          <input type="checkbox" checked={ouverts} onChange={(e) => setOuverts(e.target.checked)} /> Autoriser les commentaires
        </label>
        <label className="bo-check" style={{ opacity: ouverts ? 1 : 0.55 }}>
          <input type="checkbox" checked={moderes} disabled={!ouverts} onChange={(e) => setModeres(e.target.checked)} /> Valider les commentaires avant affichage
        </label>
      </fieldset>

      <div className="flex flex-wrap justify-end gap-2.5">
        <button type="button" className="bo-b bo-b-l" onClick={onFermer} disabled={envoi !== null}>
          Annuler
        </button>
        <button type="button" className="bo-b bo-b-l" onClick={() => enregistrer("brouillon")} disabled={envoi !== null}>
          {envoi === "brouillon" ? "Enregistrement…" : dejaPubliee ? "Retirer du site (brouillon)" : "Enregistrer en brouillon"}
        </button>
        <button type="submit" className="bo-b bo-b-n" disabled={envoi !== null}>
          {envoi === "publie" ? "Publication…" : dejaPubliee ? "Enregistrer les modifications" : "Publier"}
        </button>
      </div>
    </form>
  );
}
