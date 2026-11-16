import writeExcelFile from "write-excel-file/universal";
import type { DemandeDevisEnregistree } from "@/types";

/**
 * Export Excel (.xlsx) d'une liste de demandes de devis.
 * Ce module est chargé à la demande (import() au clic sur « Exporter ») :
 * la bibliothèque n'alourdit ni le site public ni le premier chargement du back-office.
 */
export async function exporterDevisXlsx(demandes: DemandeDevisEnregistree[], nomFichier: string): Promise<void> {
  const entete = (value: string) => ({ value, fontWeight: "bold" as const, backgroundColor: "#EEF2FA" });

  const blob = await writeExcelFile(demandes, {
    sheet: "Demandes de devis",
    stickyRowsCount: 1,
    columns: [
      { header: entete("Reçue le"), cell: (d) => ({ value: new Date(d.created_at), type: Date, format: "dd/mm/yyyy hh:mm" }), width: 18 },
      { header: entete("Client"), cell: (d) => ({ value: d.nom_client }), width: 24 },
      { header: entete("Entreprise"), cell: (d) => ({ value: d.entreprise ?? "" }), width: 24 },
      { header: entete("Numéro"), cell: (d) => ({ value: d.telephone }), width: 20 },
      { header: entete("Message"), cell: (d) => ({ value: d.message ?? "", wrap: true }), width: 60 },
      { header: entete("Source"), cell: (d) => ({ value: d.source === "whatsapp" ? "WhatsApp" : "Formulaire" }), width: 12 },
      { header: entete("Statut"), cell: (d) => ({ value: d.statut === "traitee" ? "Traitée" : "Nouvelle" }), width: 12 },
      {
        header: entete("Traitée le"),
        cell: (d) => (d.traitee_le ? { value: new Date(d.traitee_le), type: Date, format: "dd/mm/yyyy" } : { value: "" }),
        width: 14,
      },
    ],
  }).toBlob();

  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
