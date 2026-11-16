import { maintenantISO, modifierBase, prochainId } from "@/mocks/store";
import type { MethodeConnexion, Session } from "@/types";
import { simulerLatence } from "./latence";

/**
 * Connexion SIMULÉE des visiteurs (pour commenter) : crée ou retrouve l'utilisateur
 * et son compte social dans les données de démo.
 * API future : POST /api/auth/facebook, /api/auth/google, /api/auth/inscription
 */
export async function connexion(
  methode: MethodeConnexion,
  infos?: { nom?: string; email?: string },
): Promise<Session> {
  await simulerLatence(300);
  const nomParDefaut = { facebook: "Utilisateur Facebook", google: "Utilisateur Google", email: "Vous" };
  const email = infos?.email?.trim().toLowerCase() || `visiteur.${methode}@exemple.mg`;
  const identifiant = methode === "email" ? email : `${methode}-visiteur-demo`;
  const nom = infos?.nom?.trim() || nomParDefaut[methode];

  const utilisateur = modifierBase((b) => {
    const compte = b.comptes_sociaux.find((c) => c.fournisseur === methode && c.identifiant_externe === identifiant);
    const existant = compte && b.utilisateurs.find((u) => u.id === compte.utilisateur_id);
    if (existant) {
      if (infos?.nom?.trim()) existant.nom = nom;
      return existant;
    }
    const maintenant = maintenantISO();
    const u = { id: prochainId(b.utilisateurs), nom, email, telephone_whatsapp: null, photo_url: null, bloque: false, created_at: maintenant };
    b.utilisateurs.push(u);
    b.comptes_sociaux.push({
      id: prochainId(b.comptes_sociaux),
      utilisateur_id: u.id,
      fournisseur: methode,
      identifiant_externe: identifiant,
      created_at: maintenant,
    });
    return u;
  });

  return { methode, utilisateur };
}
