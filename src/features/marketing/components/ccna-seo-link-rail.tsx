import { SeoRelatedContentCards } from "@/features/marketing/components/ccna-seo-shared"
import { getCcnaSeoLinkGroups } from "@/features/marketing/lib/ccna-seo-link-map"

export function CcnaSeoLinkRail({ currentRoute }: { currentRoute: string }) {
  const groups = getCcnaSeoLinkGroups(currentRoute)

  return (
    <section className="space-y-6 rounded-[1.5rem] border border-white/70 bg-white/90 px-4 py-6 shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
      {groups.map((group) => (
        <SeoRelatedContentCards
          cardClassName="bg-pearl/70"
          columns={group.columns}
          intro={group.intro}
          items={group.links}
          key={group.id}
          sectionClassName="space-y-4"
          title={group.title}
        />
      ))}
    </section>
  )
}
