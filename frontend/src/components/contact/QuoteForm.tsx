"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { lienWhatsApp } from "@/lib/whatsapp";
import { envoyerDemandeDevis } from "@/services/devis";

const vide = { nom: "", numero: "", entreprise: "", message: "" };
type Champs = typeof vide;

function messageWhatsApp(c: Champs) {
  const v = (s: string) => s.trim() || "-";
  return `Bonjour Quick Cargo Madagascar,\nNom : ${v(c.nom)}\nNuméro : ${v(c.numero)}\nEntreprise : ${v(c.entreprise)}\nMessage : ${v(c.message)}`;
}

const labelCls = "flex flex-col gap-2 text-sm font-semibold text-body";

/**
 * Formulaire de demande de devis (nom, numéro, entreprise, message).
 * « Devis via WhatsApp » ouvre WhatsApp avec les champs déjà remplis.
 */
export function QuoteForm() {
  const [champs, setChamps] = useState<Champs>(vide);
  const [etat, setEtat] = useState<"saisie" | "envoi" | "envoye">("saisie");
  const [erreur, setErreur] = useState<string | null>(null);
  const [nomEnvoye, setNomEnvoye] = useState("");
  const merciRef = useRef<HTMLHeadingElement>(null);
  const nomRef = useRef<HTMLInputElement>(null);

  // Après l'envoi, le focus va sur le message de confirmation (lecteurs d'écran, clavier).
  useEffect(() => {
    if (etat === "envoye") merciRef.current?.focus();
  }, [etat]);

  const maj = (nom: keyof Champs) => (e: { target: { value: string } }) =>
    setChamps((c) => ({ ...c, [nom]: e.target.value }));

  const demande = (source: "formulaire" | "whatsapp") => ({
    nom_client: champs.nom.trim(),
    telephone: champs.numero.trim(),
    entreprise: champs.entreprise.trim() || null,
    message: champs.message.trim() || null,
    depart_id: null,
    source,
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    setEtat("envoi");
    try {
      await envoyerDemandeDevis(demande("formulaire"));
      setNomEnvoye(champs.nom.trim());
      setEtat("envoye");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "L’envoi a échoué. Réessayez ou écrivez-nous sur WhatsApp.");
      setEtat("saisie");
    }
  }

  function onWhatsApp() {
    // Garde une trace de la demande côté QCM si le client s'est identifié (sans bloquer l'ouverture de WhatsApp).
    if (champs.nom.trim() && champs.numero.trim()) {
      envoyerDemandeDevis(demande("whatsapp")).catch(() => {});
    }
  }

  function recommencer() {
    setChamps(vide);
    setEtat("saisie");
    requestAnimationFrame(() => nomRef.current?.focus());
  }

  if (etat === "envoye") {
    return (
      <div className="pop flex flex-col items-center gap-4 py-10 text-center" role="status">
        <span className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#E6F7EC] text-[#157F3B]">
          <Icon name="check" size={36} strokeWidth={2.4} />
        </span>
        <h2 ref={merciRef} tabIndex={-1} className="m-0 text-[26px] text-navy outline-none">
          Merci, {nomEnvoye || "à vous"}&nbsp;!
        </h2>
        <p className="m-0 max-w-[380px] leading-[1.6] text-muted">
          Votre demande a bien été reçue. Un conseiller Quick Cargo Madagascar vous recontacte très vite.
        </p>
        <button className="btn btn-n" type="button" onClick={recommencer}>
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-[18px]" aria-labelledby="titre-devis">
      <div className="flex flex-col gap-1.5">
        <h2 id="titre-devis" className="m-0 text-[26px] text-navy">
          Demande de devis
        </h2>
        <p className="m-0 text-subtle">Remplissez ce formulaire, nous vous répondons rapidement.</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <label className={labelCls}>
          <span>
            Nom du client <span aria-hidden="true" className="text-orange-text">*</span>
          </span>
          <input
            ref={nomRef}
            className="field font-normal"
            type="text"
            name="nom"
            autoComplete="name"
            placeholder="Votre nom"
            required
            value={champs.nom}
            onChange={maj("nom")}
          />
        </label>
        <label className={labelCls}>
          <span>
            Numéro <span aria-hidden="true" className="text-orange-text">*</span>
          </span>
          <input
            className="field font-normal"
            type="tel"
            name="numero"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+261 …"
            required
            value={champs.numero}
            onChange={maj("numero")}
          />
        </label>
      </div>
      <label className={labelCls}>
        Entreprise
        <input
          className="field font-normal"
          type="text"
          name="entreprise"
          autoComplete="organization"
          placeholder="Nom de votre entreprise"
          value={champs.entreprise}
          onChange={maj("entreprise")}
        />
      </label>
      <label className={labelCls}>
        Message
        <textarea
          className="field resize-y font-normal"
          name="message"
          rows={6}
          placeholder="Produits, pays d’origine, quantités…"
          value={champs.message}
          onChange={maj("message")}
        />
      </label>

      {erreur && (
        <p role="alert" className="m-0 rounded-xl bg-[#FDECEC] px-4 py-3 text-sm font-semibold text-[#A61B1B]">
          {erreur}
        </p>
      )}

      <div className="mt-1.5 flex flex-wrap gap-3">
        <button type="submit" className="btn btn-n flex-[1_1_200px]" disabled={etat === "envoi"}>
          {etat === "envoi" ? "Envoi en cours…" : "Envoyer ma demande"}
        </button>
        <a
          className="btn btn-wa flex-[1_1_200px] !shadow-none"
          href={lienWhatsApp(messageWhatsApp(champs))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onWhatsApp}
        >
          <Icon name="whatsapp" size={20} />
          Devis via WhatsApp
        </a>
      </div>
      <p className="m-0 text-xs text-subtle">
        <span aria-hidden="true">*</span> Champs obligatoires
      </p>
    </form>
  );
}
