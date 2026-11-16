"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { useAdminSession } from "@/components/admin/layout/AdminSession";
import { useConfirmation } from "@/components/admin/ui/ConfirmDialog";
import { ChargementListe, EtatErreur, EtatVide } from "@/components/admin/ui/etats";
import { Pill } from "@/components/admin/ui/Pill";
import { useToast } from "@/components/admin/ui/Toaster";
import { rubriqueDe } from "@/lib/admin-rubriques";
import { formatDateCourte } from "@/lib/dates";
import { useDonnees } from "@/lib/useDonnees";
import { changerActivationAdministrateur, getAdministrateurs, modifierRoleAdministrateur } from "@/services/administrateurs";
import type { Administrateur, Id, RoleAdmin } from "@/types";
import { AdminForm } from "./AdminForm";

const libelleRole: Record<RoleAdmin, string> = { admin: "Administrateur", moderateur: "Modérateur" };

/** Rubrique Administrateurs (rôle admin) : comptes de l'équipe, rôle, activation. Formulaire : ?edition=nouveau */
export function AdministrateursGestion() {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const confirmer = useConfirmation();
  const { admin: moi } = useAdminSession();
  const formOuvert = useSearchParams().get("edition") === "nouveau";
  const { donnees, chargement, erreur } = useDonnees("administrateurs", getAdministrateurs);
  const [enCours, setEnCours] = useState<Id | null>(null);
  const boutonRef = useRef<HTMLButtonElement>(null);

  function basculerForm(ouvrir: boolean) {
    router.replace(ouvrir ? `${pathname}?edition=nouveau` : pathname, { scroll: false });
    if (!ouvrir) requestAnimationFrame(() => boutonRef.current?.focus());
  }

  async function agir(a: Administrateur, action: () => Promise<void>, message: string) {
    setEnCours(a.id);
    try {
      await action();
      toast.succes(message);
    } catch (e) {
      toast.erreur(e);
    } finally {
      setEnCours(null);
    }
  }

  async function changerRole(a: Administrateur, role: RoleAdmin) {
    if (role === "moderateur") {
      const ok = await confirmer({
        titre: `Passer ${a.nom} en modérateur ?`,
        message: "Cette personne n’aura plus accès aux publications, aux départs ni aux administrateurs.",
        confirmer: "Changer le rôle",
      });
      if (!ok) return;
    }
    await agir(a, () => modifierRoleAdministrateur(a.id, role), `${a.nom} est maintenant ${libelleRole[role].toLowerCase()}.`);
  }

  async function basculerActivation(a: Administrateur) {
    if (a.actif) {
      const ok = await confirmer({
        titre: `Désactiver le compte de ${a.nom} ?`,
        message: "Cette personne ne pourra plus se connecter au back-office. Vous pourrez réactiver le compte à tout moment.",
        confirmer: "Désactiver",
        danger: true,
      });
      if (!ok) return;
    }
    await agir(a, () => changerActivationAdministrateur(a.id, !a.actif), a.actif ? `Compte de ${a.nom} désactivé.` : `Compte de ${a.nom} réactivé.`);
  }

  return (
    <>
      <AdminPageHeader titre="Administrateurs" description={rubriqueDe(pathname)?.description} />
      <div className="bo-fade flex flex-col gap-4">
        <div className="flex justify-end">
          <button ref={boutonRef} type="button" className="bo-b bo-b-o" aria-expanded={formOuvert} onClick={() => basculerForm(!formOuvert)}>
            + Ajouter un compte
          </button>
        </div>

        {formOuvert && <AdminForm onFermer={() => basculerForm(false)} />}

        {erreur ? (
          <EtatErreur erreur={erreur} />
        ) : chargement || !donnees ? (
          <ChargementListe lignes={2} hauteur="h-14" libelle="Chargement des comptes…" />
        ) : donnees.length === 0 ? (
          <EtatVide icone="◉">Aucun compte.</EtatVide>
        ) : (
          <div className="bo-card overflow-x-auto" role="region" aria-label="Tableau des administrateurs" tabIndex={0}>
            <table className="bo-tb">
              <thead>
                <tr>
                  <th scope="col">Nom</th>
                  <th scope="col">Rôle</th>
                  <th scope="col">Statut</th>
                  <th scope="col">Dernière connexion</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donnees.map((a) => {
                  const estMoi = a.id === moi.id;
                  return (
                    <tr key={a.id}>
                      <td>
                        <strong className="text-[#0A2463]">{a.nom}</strong>
                        {estMoi && (
                          <Pill ton="bleu" className="ml-2">
                            Vous
                          </Pill>
                        )}
                        <br />
                        <span className="text-[#5A6987]">{a.email}</span>
                      </td>
                      <td>
                        <select
                          className="bo-field !min-h-10 max-w-[190px]"
                          aria-label={`Rôle de ${a.nom}`}
                          value={a.role}
                          disabled={estMoi || enCours === a.id}
                          title={estMoi ? "Vous ne pouvez pas modifier votre propre rôle." : undefined}
                          onChange={(e) => changerRole(a, e.target.value as RoleAdmin)}
                        >
                          <option value="admin">Administrateur</option>
                          <option value="moderateur">Modérateur</option>
                        </select>
                      </td>
                      <td>{a.actif ? <Pill ton="vert">Actif</Pill> : <Pill ton="gris">Désactivé</Pill>}</td>
                      <td className="whitespace-nowrap text-[#5A6987]">{a.derniere_connexion ? formatDateCourte(a.derniere_connexion) : "Jamais"}</td>
                      <td>
                        {estMoi ? (
                          <span className="text-[13px] text-[#5A6987]">—</span>
                        ) : (
                          <button type="button" className={`bo-b ${a.actif ? "bo-b-r" : "bo-b-g"}`} disabled={enCours === a.id} onClick={() => basculerActivation(a)}>
                            {a.actif ? "Désactiver" : "Réactiver"}
                            <span className="sr-only"> le compte de {a.nom}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
