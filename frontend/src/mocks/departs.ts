import type { DepartGroupage, Pays, PointDepart } from "@/types";

/** Données d'exemple : elles seront remplacées par les tables PostgreSQL via l'API. */

export const paysMock: Pays[] = [
  { id: 1, code: "CN", nom: "Chine" },
  { id: 2, code: "AE", nom: "Dubaï" },
  { id: 3, code: "IN", nom: "Inde" },
  { id: 4, code: "ID", nom: "Indonésie" },
];

export const pointsDepartMock: PointDepart[] = [
  { id: 1, pays_id: 1, nom: "Guangzhou" },
  { id: 2, pays_id: 1, nom: "Yiwu" },
  { id: 3, pays_id: 2, nom: "Jebel Ali" },
  { id: 4, pays_id: 3, nom: "Ahmedabad" },
  { id: 5, pays_id: 4, nom: "Jakarta" },
];

export const departsMock: DepartGroupage[] = [
  { id: 1, point_depart_id: 1, date_cloture: "2026-11-28", arrivee_estimee: "2027-01-15", statut: "ouvert", visible: true },
  { id: 2, point_depart_id: 2, date_cloture: "2026-12-05", arrivee_estimee: "2027-01-28", statut: "bientot_complet", visible: true },
  { id: 3, point_depart_id: 3, date_cloture: "2026-12-02", arrivee_estimee: "2027-01-05", statut: "ouvert", visible: true },
  { id: 4, point_depart_id: 4, date_cloture: "2026-12-10", arrivee_estimee: "2027-01-28", statut: "ouvert", visible: true },
  { id: 5, point_depart_id: 5, date_cloture: "2026-11-20", arrivee_estimee: "2026-12-26", statut: "ferme", visible: true },
  { id: 6, point_depart_id: 1, date_cloture: "2027-01-15", arrivee_estimee: "2027-03-01", statut: "ouvert", visible: false },
];
