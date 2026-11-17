"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { rubriqueDe, rubriquesPour } from "@/lib/admin-rubriques";
import { images } from "@/lib/images";
import { useAdminSession } from "./AdminSession";
import { ResetDemoButton } from "./ResetDemoButton";

/**
 * Menu latéral (maquette) : rubriques autorisées pour le rôle, rubrique active en orange,
 * badges de compteur, utilisateur connecté et déconnexion en bas.
 * Sous 1024 px : barre supérieure + menu repliable.
 */
export function AdminSidebar() {
  const pathname = usePathname();
  const { admin, compteurs, deconnecter } = useAdminSession();
  const active = rubriqueDe(pathname);
  const aTraiter =
    (compteurs?.commentaires_en_attente ?? 0) + (compteurs?.experiences_en_attente ?? 0) + (compteurs?.devis_nouveaux ?? 0);
  const boutonRef = useRef<HTMLButtonElement>(null);
  const [ouvert, onOuvrir] = useState(false);
  const [page, setPage] = useState(pathname);

  // Referme le menu mobile à chaque changement de page.
  if (page !== pathname) {
    setPage(pathname);
    onOuvrir(false);
  }

  // Échap referme le menu mobile et rend le focus au bouton.
  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOuvrir(false);
        boutonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, [ouvert, onOuvrir]);

  const logo = (
    <span className="inline-block rounded-[14px] bg-white px-3 py-1.5">
      <Image {...images.logo} alt="Quick Cargo Madagascar – Back-office" sizes="94px" className="block h-[46px] w-auto" preload />
    </span>
  );

  return (
    <>
      {/* Barre supérieure (tablette, téléphone) */}
      <div className="sticky top-0 z-[60] flex h-16 items-center justify-between gap-3 bg-[#061A47] px-4 py-2.5 lg:hidden">
        <span className="inline-block rounded-[10px] bg-white px-2 py-1">
          <Image {...images.logo} alt="Quick Cargo Madagascar – Back-office" sizes="72px" className="block h-9 w-auto" />
        </span>
        <button
          ref={boutonRef}
          type="button"
          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-0 bg-white/10 px-3.5 font-semibold text-white"
          aria-expanded={ouvert}
          aria-controls="bo-menu"
          onClick={() => onOuvrir(!ouvert)}
        >
          <span aria-hidden="true" className="text-lg leading-none">
            {ouvert ? "✕" : "☰"}
          </span>
          Menu
          {!ouvert && aTraiter > 0 && (
            <span className="bo-badge !ml-0 !bg-[#F58A07] !text-[#061A47]">
              {aTraiter}
              <span className="sr-only"> éléments à traiter</span>
            </span>
          )}
        </button>
      </div>

      {ouvert && (
        <div aria-hidden="true" className="fixed inset-0 z-40 bg-[#061A47]/50 lg:hidden" onClick={() => onOuvrir(false)} />
      )}

      <nav
        id="bo-menu"
        aria-label="Menu du back-office"
        className={`${ouvert ? "flex" : "hidden"} fixed bottom-0 left-0 top-16 z-50 w-[min(290px,85vw)] flex-col gap-1.5 overflow-y-auto bg-[#061A47] px-4 py-6 text-white shadow-[20px_0_60px_rgba(0,0,0,.3)] lg:sticky lg:top-0 lg:bottom-auto lg:flex lg:h-dvh lg:w-[250px] lg:shrink-0 lg:shadow-none xl:w-[270px]`}
      >
        <div className="mx-1.5 mb-[18px] hidden lg:block">{logo}</div>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
          {rubriquesPour(admin.role).map((r) => {
            const n = r.badge ? compteurs?.[r.badge] ?? 0 : 0;
            return (
              <li key={r.href}>
                <Link href={r.href} className="bo-mi" aria-current={active?.href === r.href ? "page" : undefined}>
                  <span aria-hidden="true" className="w-[22px] text-center font-bold">
                    {r.icone}
                  </span>
                  {r.libelle}
                  {n > 0 && (
                    <span className="bo-badge">
                      {n}
                      <span className="sr-only"> à traiter</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex flex-col gap-3 border-t border-white/[.12] px-2 pt-4">
          <ResetDemoButton />
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F58A07] font-extrabold text-[#061A47]">
              {admin.nom.trim()[0]?.toUpperCase() ?? "?"}
            </span>
            <span className="flex min-w-0 flex-col text-sm">
              <strong className="truncate">{admin.nom}</strong>
              <span className="text-[13px] text-[#C7D3EE]">{admin.role === "admin" ? "Administrateur" : "Modérateur"}</span>
            </span>
          </div>
          <button type="button" onClick={deconnecter} className="bo-mi !min-h-10 !text-[14px]">
            <span aria-hidden="true" className="w-[22px] text-center">
              ⏻
            </span>
            Déconnexion
          </button>
        </div>
      </nav>
    </>
  );
}
