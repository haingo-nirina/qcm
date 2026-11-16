import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { images } from "@/lib/images";

const valeurs = ["Sécurité", "Transparence", "Suivi", "Réactivité"];

export function AboutPreview() {
  return (
    <section aria-labelledby="titre-apropos" className="section-x bg-white py-[100px]">
      <div className="container-qcm flex flex-wrap items-center gap-14">
        <div className="rv min-w-0 flex-[1_1_460px]">
          <Image
            {...images.entrepotAerien}
            alt="Vue aérienne de l’entrepôt Quick Cargo Madagascar"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="float block h-auto w-full rounded-3xl shadow-[0_30px_70px_rgba(10,36,99,.22)]"
          />
        </div>
        <div className="rv flex min-w-0 flex-[1_1_420px] flex-col gap-5">
          <SectionHeading
            id="titre-apropos"
            eyebrow="Qui sommes-nous"
            title="La clé de votre réussite à l’import"
            size="md"
            className="[&_h2]:text-[clamp(2rem,3.4vw,2.8rem)]"
          />
          <p className="m-0 text-[17px] leading-[1.75] text-muted">
            Quick Cargo Madagascar accompagne les commerçants et les entreprises malgaches dans leurs
            importations depuis la Chine, Dubaï, l’Inde et l’Indonésie, du choix du fournisseur jusqu’à la
            livraison.
          </p>
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0">
            {valeurs.map((v) => (
              <li key={v} className="flex items-center gap-2.5 font-semibold text-navy">
                <Icon name="check" size={20} strokeWidth={2.2} className="text-orange" />
                {v}
              </li>
            ))}
          </ul>
          <Link className="btn btn-n mt-1.5 self-start" href="/a-propos">
            En savoir plus sur nous
          </Link>
        </div>
      </div>
    </section>
  );
}
