import { Icon } from "@/components/ui/Icon";
import type { Service } from "@/content/services";
import { cn } from "@/lib/cn";

type Props = {
  service: Service;
  /** Illustration à droite (une ligne sur deux) */
  inverse?: boolean;
};

/** Un service détaillé : grande vignette numérotée + texte et points clés, en alternance gauche / droite. */
export function ServiceDetail({ service, inverse }: Props) {
  const titreId = `service-${service.numero}`;
  return (
    <article
      aria-labelledby={titreId}
      className={cn(
        "rv flex flex-wrap items-center gap-12",
        // sur mobile, la vignette reste toujours au-dessus du texte
        inverse && "flex-row-reverse",
      )}
    >
      <div
        aria-hidden="true"
        className="card relative flex h-[260px] min-w-0 flex-[1_1_380px] items-center justify-center overflow-hidden rounded-[28px] bg-[linear-gradient(140deg,#0A2463,#1E56C8)] text-white sm:h-[320px]"
      >
        <span className="absolute left-7 top-[18px] font-display text-[90px] font-extrabold text-white/12">
          {service.numero}
        </span>
        <span className="ico float flex h-[120px] w-[120px] items-center justify-center rounded-[34px] bg-orange text-navy-deep">
          <Icon name={service.icone} size={60} strokeWidth={1.6} />
        </span>
      </div>

      <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-4">
        <span className="eyebrow">Service {service.numero}</span>
        <h2 id={titreId} className="m-0 text-[clamp(1.75rem,3vw,34px)] text-navy">
          {service.titre}
        </h2>
        <p className="m-0 text-[17px] leading-[1.75] text-muted">{service.description}</p>
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-body">
          {service.points.map((point) => (
            <li key={point} className="flex gap-2.5">
              <Icon name="check" size={20} strokeWidth={2.4} className="shrink-0 text-orange" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
