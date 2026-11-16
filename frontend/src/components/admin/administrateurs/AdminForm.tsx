"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useToast } from "@/components/admin/ui/Toaster";
import { creerAdministrateur } from "@/services/administrateurs";
import type { RoleAdmin } from "@/types";

type Erreurs = Partial<Record<"nom" | "email" | "mdp", string>>;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Ajout d'un compte de l'équipe QCM (mot de passe provisoire à transmettre à la personne). */
export function AdminForm({ onFermer }: { onFermer: () => void }) {
  const toast = useToast();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleAdmin>("moderateur");
  const [mdp, setMdp] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [envoi, setEnvoi] = useState(false);
  const nomRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const mdpRef = useRef<HTMLInputElement>(null);
  const titreRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titreRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    nomRef.current?.focus({ preventScroll: true });
  }, [nomRef]);

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e: Erreurs = {};
    if (nom.trim().length < 2) e.nom = "Le nom est obligatoire.";
    if (!EMAIL.test(email.trim())) e.email = "Saisissez une adresse e-mail valide.";
    if (mdp.length < 8) e.mdp = "8 caractères minimum.";
    setErreurs(e);
    const premier = (["nom", "email", "mdp"] as const).find((k) => e[k]);
    if (premier) return { nom: nomRef, email: emailRef, mdp: mdpRef }[premier].current?.focus();

    setEnvoi(true);
    try {
      const a = await creerAdministrateur({ nom, email, role, mot_de_passe: mdp });
      toast.succes(`Compte créé pour ${a.nom} (${a.role === "admin" ? "administrateur" : "modérateur"}). Transmettez-lui son mot de passe provisoire.`);
      onFermer();
    } catch (err) {
      toast.erreur(err);
    } finally {
      setEnvoi(false);
    }
  }

  const champ = (cle: keyof Erreurs) => ({
    "aria-invalid": erreurs[cle] ? true : undefined,
    "aria-describedby": erreurs[cle] ? `adm-${cle}-err` : undefined,
  });
  const erreur = (cle: keyof Erreurs) =>
    erreurs[cle] && (
      <span id={`adm-${cle}-err`} role="alert" className="bo-erreur">
        {erreurs[cle]}
      </span>
    );
  const effacer = (cle: keyof Erreurs) => erreurs[cle] && setErreurs((x) => ({ ...x, [cle]: undefined }));

  return (
    <form onSubmit={onSubmit} noValidate className="bo-card bo-fade flex flex-col gap-3.5 p-5 sm:p-6" aria-labelledby="titre-form-adm">
      <h2 id="titre-form-adm" ref={titreRef} className="m-0 text-lg text-[#0A2463]">
        Nouveau compte
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
        <label className="bo-label">
          <span>
            Nom <span aria-hidden="true" className="text-[#B42318]">*</span>
          </span>
          <input className="bo-field" type="text" autoComplete="off" maxLength={80} ref={nomRef} value={nom} {...champ("nom")} onChange={(e) => (setNom(e.target.value), effacer("nom"))} />
          {erreur("nom")}
        </label>
        <label className="bo-label">
          <span>
            E-mail <span aria-hidden="true" className="text-[#B42318]">*</span>
          </span>
          <input className="bo-field" type="email" autoComplete="off" placeholder="prenom@quickcargo.mg" ref={emailRef} value={email} {...champ("email")} onChange={(e) => (setEmail(e.target.value), effacer("email"))} />
          {erreur("email")}
        </label>
        <label className="bo-label">
          Rôle
          <select className="bo-field" value={role} onChange={(e) => setRole(e.target.value as RoleAdmin)} aria-describedby="adm-role-aide">
            <option value="moderateur">Modérateur</option>
            <option value="admin">Administrateur</option>
          </select>
          <span id="adm-role-aide" className="text-xs font-normal text-[#5A6987]">
            {role === "admin" ? "Accès complet au back-office." : "Tableau de bord, commentaires et demandes de devis."}
          </span>
        </label>
        <label className="bo-label">
          <span>
            Mot de passe provisoire <span aria-hidden="true" className="text-[#B42318]">*</span>
          </span>
          <span className="flex gap-2">
            <input
              className="bo-field"
              type={voirMdp ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              ref={mdpRef}
              value={mdp}
              {...champ("mdp")}
              onChange={(e) => (setMdp(e.target.value), effacer("mdp"))}
            />
            <button type="button" className="bo-b bo-b-l shrink-0" aria-pressed={voirMdp} onClick={() => setVoirMdp((v) => !v)}>
              {voirMdp ? "Masquer" : "Afficher"}
              <span className="sr-only"> le mot de passe</span>
            </button>
          </span>
          {erreur("mdp")}
        </label>
      </div>
      <div className="flex flex-wrap justify-end gap-2.5">
        <button type="button" className="bo-b bo-b-l" onClick={onFermer} disabled={envoi}>
          Annuler
        </button>
        <button type="submit" className="bo-b bo-b-n" disabled={envoi}>
          {envoi ? "Création…" : "Créer le compte"}
        </button>
      </div>
    </form>
  );
}
