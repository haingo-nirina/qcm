import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/layout/LoginForm";
import { images } from "@/lib/images";

export const metadata: Metadata = { title: "Connexion" };

/** Écran de connexion du back-office (maquette admin-connexion.html). */
export default function ConnexionAdminPage() {
  return (
    <div className="flex min-h-dvh flex-wrap bg-[#061A47] text-[#0B1B3F]">
      <div
        className="flex min-h-[260px] min-w-0 flex-[1_1_420px] flex-col justify-between gap-[30px] bg-cover bg-center p-8 text-white sm:min-h-[320px] sm:p-12"
        style={{
          backgroundImage: `linear-gradient(160deg,rgba(6,26,71,.9),rgba(10,36,99,.75)),url(${images.entrepotAerien.src})`,
        }}
      >
        <span className="self-start rounded-[18px] bg-white px-4 py-2">
          <Image {...images.logo} alt="Quick Cargo Madagascar" sizes="122px" className="block h-[60px] w-auto" preload />
        </span>
        <div className="flex max-w-[460px] flex-col gap-3.5">
          <h1 className="m-0 text-[32px] leading-[1.1] sm:text-[40px]">Back-office</h1>
          <p className="m-0 text-[17px] leading-[1.6] text-[#DCE5F7]">
            Gérez les publications, les commentaires, les départs de groupage et les demandes de devis du site Quick
            Cargo Madagascar.
          </p>
        </div>
        <span className="text-[13px] text-[#C7D3EE]">Accès réservé à l’équipe QCM</span>
      </div>

      <main id="contenu" className="flex min-w-0 flex-[1_1_420px] items-center justify-center bg-[#F4F6FB] px-4 py-12 sm:px-6">
        <Suspense fallback={<div className="h-[460px] w-full max-w-[420px] rounded-3xl bg-white" />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
