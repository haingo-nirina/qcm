import { lienWhatsApp } from "@/lib/whatsapp";
import { Icon } from "@/components/ui/Icon";

/** Bouton WhatsApp flottant, présent sur toutes les pages. */
export function WhatsAppFloat() {
  return (
    <a
      className="wa-float btn fixed bottom-6 right-6 z-50 h-[62px] w-[62px] !p-0 bg-whatsapp text-[#06301A] shadow-[0_12px_30px_rgba(37,211,102,.45)] hover:text-[#06301A]"
      href={lienWhatsApp()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Demander un devis sur WhatsApp"
    >
      <Icon name="whatsapp" size={28} />
    </a>
  );
}
