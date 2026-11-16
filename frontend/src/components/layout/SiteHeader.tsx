"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/content/navigation";
import { lienWhatsApp } from "@/lib/whatsapp";
import { Icon } from "@/components/ui/Icon";
import { images } from "@/lib/images";

function estActif(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * En-tête commun, posé par-dessus la bannière de chaque page (fond bleu nuit / photo).
 * Menu complet sur grand écran, menu « hamburger » en dessous de 1280 px.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const boutonRef = useRef<HTMLButtonElement>(null);

  // Ferme le menu mobile à chaque changement de page.
  const [pageVue, setPageVue] = useState(pathname);
  if (pageVue !== pathname) {
    setPageVue(pathname);
    setOuvert(false);
  }

  // Touche Échap : ferme le menu et rend le focus au bouton.
  useEffect(() => {
    if (!ouvert) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOuvert(false);
        boutonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ouvert]);

  return (
    <header id="haut" className="absolute inset-x-0 top-0 z-30 text-white">
      <nav
        aria-label="Navigation principale"
        className="section-x container-qcm flex items-center justify-between gap-[18px] py-[22px]"
      >
        <Link
          href="/"
          aria-label="Quick Cargo Madagascar – accueil"
          className="flex items-center rounded-[18px] bg-white px-3.5 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,.18)]"
        >
          <Image
            {...images.logo}
            alt="Quick Cargo Madagascar – la clef de votre réussite"
            preload
            sizes="130px"
            className="block h-12 w-auto sm:h-16"
          />
        </Link>

        {/* Grand écran */}
        <div className="hidden flex-wrap items-center gap-6 text-[15px] font-medium xl:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              aria-current={estActif(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <a className="btn btn-o btn-sm" href={lienWhatsApp()} target="_blank" rel="noopener noreferrer">
            Devis WhatsApp
          </a>
        </div>

        {/* Mobile / tablette */}
        <button
          ref={boutonRef}
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-white/60 bg-white/10 text-white backdrop-blur-md xl:hidden"
          aria-expanded={ouvert}
          aria-controls="menu-mobile"
          aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOuvert((o) => !o)}
        >
          <Icon name={ouvert ? "fermer" : "menu"} size={24} strokeWidth={2.2} />
        </button>
      </nav>

      <div
        id="menu-mobile"
        hidden={!ouvert}
        className="section-x xl:hidden"
      >
        <div className="pop container-qcm flex flex-col gap-1 rounded-3xl border border-white/15 bg-navy-deep/95 p-4 shadow-[0_30px_60px_rgba(0,0,0,.35)] backdrop-blur-md">
          {navigation.map((item) => {
            const actif = estActif(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={actif ? "page" : undefined}
                className={`flex min-h-12 items-center rounded-xl px-4 text-base font-medium no-underline hover:bg-white/10 ${
                  actif ? "bg-white/10 text-orange-light" : "text-white"
                }`}
              >
                {actif && <span aria-hidden="true" className="mr-3 h-5 w-1 rounded bg-orange" />}
                {item.label}
              </Link>
            );
          })}
          <a
            className="btn btn-o mt-2"
            href={lienWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" size={20} />
            Devis WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
