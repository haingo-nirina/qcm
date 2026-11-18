import Image from "next/image";
import { images } from "@/lib/images";

export function Presentation() {
  return (
    <div className="flex flex-wrap items-center gap-14">
      <div className="rv min-w-0 flex-[1_1_480px]">
        <Image
          {...images.services}
          alt="Quick Cargo Madagascar : nous sourçons, payons, acheminons, dédouanons et livrons"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="float block h-auto w-full rounded-3xl shadow-[0_30px_70px_rgba(10,36,99,.22)]"
        />
      </div>
      <div className="rv flex min-w-0 flex-[1_1_440px] flex-col gap-5">
        <span className="eyebrow">Présentation</span>
        <h2 className="m-0 text-[clamp(2rem,3.4vw,2.8rem)] leading-[1.15] text-navy">
          Quick Cargo Madagascar, la clé de votre réussite
        </h2>
        <p className="m-0 text-[17px] leading-[1.75] text-muted">
          Quick Cargo Madagascar accompagne les commerçants et les entreprises malgaches dans leurs importations
          depuis la Chine, Dubaï, l’Inde et l’Indonésie. Nous prenons en charge chaque étape, du choix du
          fournisseur à la livraison, pour que vous puissiez vous concentrer sur votre activité.
        </p>
        <p className="m-0 text-[17px] leading-[1.75] text-muted">
          QCM (Quick Cargo Madagascar) est une société spécialisée en logistique maritime, avec plus de
          20&nbsp;ans d’expérience et d’expertise dans le domaine de l’importation maritime.
        </p>
      </div>
    </div>
  );
}
