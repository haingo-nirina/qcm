"use client";

import Image from "next/image";
import { useState } from "react";
import { messagesWhatsApp, siteConfig } from "@/config/site";
import { formatDateLongue } from "@/lib/dates";
import { lienWhatsApp } from "@/lib/whatsapp";
import { libellesCategorie } from "@/lib/libelles";
import type { CommentairePublic, Publication } from "@/types";
import { CommentForm } from "./CommentForm";
import { CommentItem, LogoRond } from "./CommentItem";
import { PendingComment } from "./PendingComment";

const categories = libellesCategorie;

function IconeCommentaire() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z" />
    </svg>
  );
}

function IconePartage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

type Props = {
  publication: Publication;
  commentaires: CommentairePublic[];
  /** Commentaires dépliés au chargement (la première publication) */
  ouvertParDefaut?: boolean;
  /** Image chargée en priorité (première publication, visible sans défiler) */
  prioritaire?: boolean;
};

/** Une publication : image, catégorie, texte, partage WhatsApp et fil de commentaires. */
export function PublicationCard({ publication: p, commentaires, ouvertParDefaut, prioritaire }: Props) {
  const [ouvert, setOuvert] = useState(Boolean(ouvertParDefaut));
  const [enAttente, setEnAttente] = useState<CommentairePublic[]>([]);
  // Un commentaire « en attente » affiché localement disparaît de cette liste dès qu'il est approuvé.
  const enAttenteVisibles = enAttente.filter((c) => !commentaires.some((x) => x.id === c.id));
  const n = commentaires.length;
  const libelle = n === 0 ? "Commenter" : n === 1 ? "1 commentaire" : `${n} commentaires`;
  const zoneId = `commentaires-${p.id}`;
  const lienPartage = lienWhatsApp(`${messagesWhatsApp.partage(p.titre)}\n${siteConfig.url}/publications#${p.slug}`);

  return (
    <article
      id={p.slug}
      aria-labelledby={`titre-${p.slug}`}
      className="post scroll-mt-6 overflow-hidden rounded-3xl bg-white shadow-[0_6px_24px_rgba(10,36,99,.07)]"
    >
      {p.image_url && (
        <div className="relative h-[240px] overflow-hidden sm:h-[380px]">
          <Image
            src={p.image_url}
            alt=""
            fill
            preload={prioritaire}
            sizes="(min-width: 1100px) 66vw, 100vw"
            className="ph object-cover"
          />
          <span className="absolute left-5 top-5 rounded-full bg-orange px-3.5 py-2 text-[13px] font-bold text-navy-deep">
            {categories[p.categorie]}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-3.5 px-5 py-7 sm:px-[30px]">
        <div className="flex items-center gap-3">
          <LogoRond />
          <span className="flex flex-col">
            <strong className="text-[15px] text-navy">Quick Cargo Madagascar</strong>
            {p.publie_le && (
              <time dateTime={p.publie_le} className="text-[13px] text-subtle">
                {formatDateLongue(p.publie_le)}
              </time>
            )}
          </span>
        </div>
        <h2 id={`titre-${p.slug}`} className="m-0 text-[clamp(1.4rem,2.4vw,26px)] leading-[1.25] text-navy">
          {p.titre}
        </h2>
        <p className="m-0 whitespace-pre-line leading-[1.7] text-muted">{p.contenu}</p>

        <div className="flex flex-wrap gap-2.5 border-t border-line pt-3.5">
          <button
            type="button"
            className="btn btn-l"
            aria-expanded={ouvert}
            aria-controls={zoneId}
            onClick={() => setOuvert((o) => !o)}
          >
            <IconeCommentaire />
            {libelle}
          </button>
          <a className="btn btn-l" href={lienPartage} target="_blank" rel="noopener noreferrer">
            <IconePartage />
            Partager sur WhatsApp
          </a>
        </div>

        <div id={zoneId} hidden={!ouvert}>
          <div className="pop flex flex-col gap-4 pt-2">
            {(n > 0 || enAttenteVisibles.length > 0) && (
              <ul aria-label="Commentaires" className="m-0 flex list-none flex-col gap-4 p-0">
                {commentaires.map((c) => (
                  <CommentItem key={c.id} commentaire={c} />
                ))}
                {enAttenteVisibles.map((c) => (
                  <PendingComment key={c.id} commentaire={c} />
                ))}
              </ul>
            )}
            {p.commentaires_ouverts ? (
              <CommentForm publicationId={p.id} onEnvoye={(c) => c.statut === "en_attente" && setEnAttente((l) => [...l, c])} />
            ) : (
              <p className="m-0 text-sm text-subtle">Les commentaires sont fermés pour cette publication.</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
