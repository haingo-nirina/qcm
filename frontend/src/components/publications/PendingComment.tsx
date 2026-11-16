import type { CommentairePublic } from "@/types";
import { Avatar } from "./CommentItem";

/** Commentaire que le visiteur vient d'envoyer : visible de lui seul tant qu'il n'est pas validé. */
export function PendingComment({ commentaire }: { commentaire: CommentairePublic }) {
  return (
    <li className="pop flex gap-3">
      <Avatar nom="Vous" couleur="facebook" />
      <div className="min-w-0 flex-1 rounded-2xl border-[1.5px] border-dashed border-[#F5B866] bg-[#FFFBF3] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-[15px] text-navy">Vous</strong>
          <span className="rounded-full bg-orange-bg px-2 py-0.5 text-[11px] font-bold text-orange-ink">
            En attente de validation
          </span>
        </div>
        <p className="m-0 mt-1.5 whitespace-pre-line leading-[1.6] text-body">{commentaire.contenu}</p>
        <p className="m-0 mt-2 text-[13px] text-subtle">
          Votre commentaire sera visible par tous après validation par l’équipe QCM.
        </p>
      </div>
    </li>
  );
}
