/**
 * Écran de chargement du site public, affiché pendant qu'une page attend ses données
 * (API lente) : bannière et cartes « squelettes » qui reprennent la mise en page.
 */
export default function Chargement() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Chargement de la page…</span>

      <section aria-hidden="true" className="relative flex min-h-[440px] flex-col bg-navy-deep pt-[112px] sm:pt-[120px]">
        <div className="section-x container-qcm flex flex-1 flex-col justify-center gap-5 pb-[70px] pt-[30px]">
          <div className="squelette-sombre h-4 w-40 rounded-full" />
          <div className="squelette-sombre h-12 w-full max-w-[560px] rounded-2xl" />
          <div className="squelette-sombre h-5 w-full max-w-[620px] rounded-full" />
          <div className="squelette-sombre h-5 w-2/3 max-w-[420px] rounded-full" />
        </div>
      </section>

      <div aria-hidden="true" className="section-x bg-page py-[70px]">
        <div className="container-qcm grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0_6px_24px_rgba(10,36,99,.07)]">
              <div className="squelette h-44 rounded-2xl" />
              <div className="squelette h-6 w-3/4 rounded-full" />
              <div className="squelette h-4 w-full rounded-full" />
              <div className="squelette h-4 w-5/6 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
