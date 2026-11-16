import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";

export default function AdminIntrouvable() {
  return (
    <>
      <AdminPageHeader titre="Page introuvable" description="Cette page du back-office n’existe pas." />
      <div className="bo-card flex flex-col items-start gap-4 p-6">
        <p className="m-0 text-[#2B3A58]">Vérifiez l’adresse ou revenez au tableau de bord.</p>
        <Link href="/admin" className="bo-b bo-b-n">
          Retour au tableau de bord
        </Link>
      </div>
    </>
  );
}
