export interface Avis {
  initiales: string;
  texte: string;
  /** Version courte affichée sur l'accueil */
  texteCourt: string;
  nom: string;
  entreprise: string;
}

/** Témoignages clients (placeholders de la maquette, à remplacer par de vrais avis). */
export const avis: Avis[] = [
  {
    initiales: "C1",
    texte: "[Témoignage client à insérer : expérience avec le sourcing et la livraison.]",
    texteCourt: "[Témoignage client à insérer.]",
    nom: "[Nom du client]",
    entreprise: "[Entreprise]",
  },
  {
    initiales: "C2",
    texte: "[Témoignage client à insérer : paiement fournisseur et suivi.]",
    texteCourt: "[Témoignage client à insérer.]",
    nom: "[Nom du client]",
    entreprise: "[Entreprise]",
  },
  {
    initiales: "C3",
    texte: "[Témoignage client à insérer : dédouanement et délais.]",
    texteCourt: "[Témoignage client à insérer.]",
    nom: "[Nom du client]",
    entreprise: "[Entreprise]",
  },
];
