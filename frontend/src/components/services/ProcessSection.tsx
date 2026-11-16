import Image from "next/image";
import { images } from "@/lib/images";

/** « Comment ça marche » : visuel du processus en 5 étapes. */
export function ProcessSection() {
  return (
    <section aria-labelledby="titre-processus" className="section-x bg-page py-[100px]">
      <div className="rv container-qcm flex flex-col items-center gap-3 text-center">
        <span className="eyebrow">Comment ça marche</span>
        <h2 id="titre-processus" className="m-0 text-[clamp(2rem,3.4vw,2.8rem)] text-navy">
          Notre processus en 5 étapes
        </h2>
        <Image
          {...images.process}
          alt="Les 5 étapes : sourcing, paiement fournisseur, acheminement, dédouanement, livraison"
          sizes="(min-width: 1180px) 1100px, 100vw"
          className="mt-4 block h-auto w-full max-w-[1100px] rounded-3xl bg-white shadow-[0_10px_40px_rgba(10,36,99,.08)]"
        />
      </div>
    </section>
  );
}
