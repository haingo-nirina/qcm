/** Écran affiché pendant la vérification de la session (aucun contenu du back-office n'est rendu). */
export function EcranChargement({ message = "Vérification de votre session…" }: { message?: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#F4F6FB]" role="status">
      <span className="flex items-center gap-3 font-semibold text-[#5A6987]">
        <span
          aria-hidden="true"
          className="h-5 w-5 animate-spin rounded-full border-[3px] border-[#D5DEEF] border-t-[#0A2463] motion-reduce:animate-none"
        />
        {message}
      </span>
    </div>
  );
}
