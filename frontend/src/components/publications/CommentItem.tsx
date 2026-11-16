import Image from "next/image";
import { images } from "@/lib/images";
import { initiales } from "@/lib/initiales";
import type { CommentairePublic } from "@/types";
import { TimeAgo } from "./TimeAgo";

/** Logo QCM rond (auteur des publications et des réponses officielles). */
export function LogoRond({ size = 40 }: { size?: 36 | 40 }) {
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-orange bg-white"
      style={{ width: size, height: size }}
    >
      <Image {...images.logo} alt="" sizes="36px" style={{ width: size - 4, height: "auto" }} />
    </span>
  );
}

export function Avatar({ nom, photo, couleur }: { nom: string; photo?: string | null; couleur?: "facebook" }) {
  if (photo) {
    return <Image src={photo} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span
      aria-hidden="true"
      className={
        couleur === "facebook"
          ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-sm font-bold text-white"
          : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soft text-sm font-bold text-navy"
      }
    >
      {initiales(nom)}
    </span>
  );
}

/** Un commentaire validé, suivi de la « Réponse officielle » de QCM s'il y en a une. */
export function CommentItem({ commentaire: c }: { commentaire: CommentairePublic }) {
  return (
    <li className="flex flex-col gap-2.5">
      <div className="flex gap-3">
        <Avatar nom={c.utilisateur.nom} photo={c.utilisateur.photo_url} />
        <div className="min-w-0 flex-1 rounded-2xl bg-page px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-[15px] text-navy">{c.utilisateur.nom}</strong>
            <span className="text-[13px] text-subtle">
              · <TimeAgo iso={c.created_at} />
            </span>
          </div>
          <p className="m-0 mt-1.5 leading-[1.6] text-body">{c.contenu}</p>
        </div>
      </div>
      {c.reponse_qcm && (
        <div className="ml-[52px] flex gap-3">
          <LogoRond size={36} />
          <div className="min-w-0 flex-1 rounded-2xl bg-navy px-4 py-3 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-[15px]">Quick Cargo Madagascar</strong>
              <span className="rounded-full bg-orange px-2 py-0.5 text-[11px] font-bold text-navy-deep">
                Réponse officielle
              </span>
            </div>
            <p className="m-0 mt-1.5 leading-[1.6] text-sky">{c.reponse_qcm}</p>
          </div>
        </div>
      )}
    </li>
  );
}
