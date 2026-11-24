import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { PublicationDetail } from "@/components/publications/PublicationDetail";
import { formatDateLongue } from "@/lib/dates";
import { chargerPublication, type DonneesPublication } from "@/lib/fil-publications";
import { libellesCategorie } from "@/lib/libelles";
import { getPublications } from "@/services/publications";

/** Slug fictif renvoyé si l'API est injoignable au build (Cache Components exige au moins un paramètre). */
const SLUG_VIDE = "__aucune__";

/** Publications pré-générées au build ; les nouvelles le sont à leur première visite. */
export async function generateStaticParams() {
  try {
    const publications = await getPublications();
    if (publications.length > 0) return publications.map((p) => ({ slug: p.slug }));
  } catch {
    // API injoignable pendant le build : les pages seront générées à la demande.
  }
  return [{ slug: SLUG_VIDE }];
}

/** Données de la publication, mises en cache quelques minutes (null si elle n'existe pas). */
async function donnees(slug: string): Promise<DonneesPublication | null> {
  "use cache";
  cacheLife("minutes");
  if (slug === SLUG_VIDE) return null;
  try {
    return await chargerPublication(slug);
  } catch {
    return null;
  }
}

/** Résumé pour Google et l'aperçu WhatsApp / Facebook : début du texte, sur une ligne. */
function resume(texte: string, max = 160): string {
  const plat = texte.replace(/\s+/g, " ").trim();
  return plat.length <= max ? plat : `${plat.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

export async function generateMetadata({ params }: PageProps<"/publications/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = await donnees(slug);
  if (!d) return { title: "Publication introuvable", robots: { index: false } };

  const p = d.publication;
  const description = resume(p.contenu);
  const image = p.image_url ?? "/assets/entrepot-aerien.jpg";
  return {
    title: p.titre,
    description,
    alternates: { canonical: `/publications/${p.slug}` },
    openGraph: {
      type: "article",
      title: p.titre,
      description,
      url: `/publications/${p.slug}`,
      publishedTime: p.publie_le ?? undefined,
      images: [{ url: image, alt: p.titre }],
    },
    twitter: { card: "summary_large_image", title: p.titre, description, images: [image] },
  };
}

export default async function PublicationPage({ params }: PageProps<"/publications/[slug]">) {
  const { slug } = await params;
  const d = await donnees(slug);
  if (!d) notFound();

  const p = d.publication;
  const intro = [libellesCategorie[p.categorie], p.publie_le && `Publié le ${formatDateLongue(p.publie_le)}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PageHero
        crumb={p.titre}
        parent={{ href: "/publications", label: "Publications" }}
        title={p.titre}
        titleMaxWidth={900}
        intro={intro}
        image={p.image_url ?? "/assets/entrepot-aerien.jpg"}
        position="50% 50%"
        compact
      />

      <div className="densite section-x bg-page pb-[100px] pt-[70px]">
        <PublicationDetail initiales={d} />
      </div>
    </>
  );
}
