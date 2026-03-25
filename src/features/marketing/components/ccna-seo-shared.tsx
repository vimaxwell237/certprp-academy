import type { ReactNode } from "react"

import Link from "next/link"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface SeoBreadcrumbItem {
  route: string
  title: string
}

export interface SeoCardAction {
  href: string
  label: string
}

export interface SeoCardGridItem {
  title: string
  description: string
  bullets?: string[]
  link?: SeoCardAction
}

export interface SeoRelatedLinkItem {
  route: string
  title: string
  description: string
  ctaLabel?: string
}

export interface SeoComparisonRow {
  label: string
  values: string[]
}

function getGridColumnsClass(columns: 1 | 2 | 3 | 4) {
  switch (columns) {
    case 1:
      return "lg:grid-cols-1"
    case 2:
      return "lg:grid-cols-2"
    case 4:
      return "lg:grid-cols-4"
    default:
      return "lg:grid-cols-3"
  }
}

export function SeoBreadcrumbs({ items }: { items: SeoBreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li className="flex items-center gap-2" key={item.route}>
              {isLast ? (
                <span className="font-semibold text-ink">{item.title}</span>
              ) : (
                <Link className="transition hover:text-cyan" href={item.route}>
                  {item.title}
                </Link>
              )}
              {!isLast ? <span aria-hidden="true">/</span> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function SeoSectionHeader({
  title,
  intro,
  eyebrow,
  className
}: {
  title: string
  intro: string
  eyebrow?: string
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
        {title}
      </h2>
      <p className="max-w-4xl text-base text-slate">{intro}</p>
    </div>
  )
}

export function SeoHeroSection({
  eyebrow,
  title,
  description,
  points,
  primaryAction,
  secondaryAction,
  asideTitle,
  asideDescription,
  asidePoints,
  asideContent
}: {
  eyebrow: string
  title: string
  description: string
  points?: string[]
  primaryAction: SeoCardAction
  secondaryAction?: SeoCardAction
  asideTitle: string
  asideDescription?: string
  asidePoints?: string[]
  asideContent?: ReactNode
}) {
  return (
    <section className="grid gap-6 rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(8,145,178,0.16),_transparent_30%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.98))] px-6 py-10 shadow-soft lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
      <div className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
          {eyebrow}
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink lg:text-5xl">
          {title}
        </h1>
        <p className="max-w-3xl text-lg text-slate">{description}</p>
        {points && points.length > 0 ? (
          <ul className="space-y-2 text-sm text-slate">
            {points.map((point) => (
              <li key={point}>- {point}</li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
            href={primaryAction.href}
          >
            {primaryAction.label}
          </Link>
          {secondaryAction ? (
            <Link
              className="inline-flex items-center justify-center rounded-full border border-ink/10 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={secondaryAction.href}
            >
              {secondaryAction.label}
            </Link>
          ) : null}
        </div>
      </div>

      <Card className="border-ink/5 bg-white/85">
        <h2 className="font-display text-2xl font-semibold text-ink">{asideTitle}</h2>
        {asideDescription ? <p className="mt-3 text-base text-slate">{asideDescription}</p> : null}
        {asidePoints && asidePoints.length > 0 ? (
          <ul className="mt-4 space-y-3 text-sm text-slate">
            {asidePoints.map((point) => (
              <li key={point}>- {point}</li>
            ))}
          </ul>
        ) : null}
        {asideContent ? <div className="mt-4">{asideContent}</div> : null}
      </Card>
    </section>
  )
}

export function SeoCardGrid({
  items,
  columns = 3,
  cardClassName,
  linkClassName
}: {
  items: SeoCardGridItem[]
  columns?: 1 | 2 | 3 | 4
  cardClassName?: string
  linkClassName?: string
}) {
  return (
    <div className={cn("grid gap-4", getGridColumnsClass(columns))}>
      {items.map((item) => (
        <Card className={cn("border-ink/5", cardClassName)} key={item.title}>
          <h3 className="font-display text-2xl font-semibold text-ink">{item.title}</h3>
          <p className="mt-3 text-base text-slate">{item.description}</p>
          {item.bullets && item.bullets.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm text-slate">
              {item.bullets.map((bullet) => (
                <li key={bullet}>- {bullet}</li>
              ))}
            </ul>
          ) : null}
          {item.link ? (
            <Link
              className={cn(
                "mt-4 inline-flex text-sm font-semibold text-cyan transition hover:text-cyan-700",
                linkClassName
              )}
              href={item.link.href}
            >
              {item.link.label}
            </Link>
          ) : null}
        </Card>
      ))}
    </div>
  )
}

export function SeoTrustSection({
  title,
  description,
  points,
  variant = "dark",
  className
}: {
  title: string
  description: string
  points: string[]
  variant?: "dark" | "card"
  className?: string
}) {
  if (variant === "card") {
    return (
      <Card className={cn("border-ink/5", className)}>
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-3 text-base text-slate">{description}</p>
        <div className="mt-5 grid gap-3">
          {points.map((point) => (
            <div
              className="rounded-2xl border border-ink/5 bg-white px-4 py-4 text-sm text-slate"
              key={point}
            >
              {point}
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <section
      className={cn(
        "rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,145,178,0.9))] px-6 py-8 text-white shadow-soft lg:px-10",
        className
      )}
    >
      <div className="max-w-4xl space-y-4">
        <h2 className="font-display text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-base text-slate-100">{description}</p>
        <div className="grid gap-3 md:grid-cols-3">
          {points.map((point) => (
            <div
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm text-slate-100"
              key={point}
            >
              {point}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SeoRelatedContentCards({
  title,
  intro,
  items,
  columns = 3,
  cardClassName,
  sectionClassName
}: {
  title: string
  intro: string
  items: SeoRelatedLinkItem[]
  columns?: 1 | 2 | 3 | 4
  cardClassName?: string
  sectionClassName?: string
}) {
  return (
    <section className={cn("space-y-4", sectionClassName)}>
      <SeoSectionHeader title={title} intro={intro} />
      <div className={cn("grid gap-4", getGridColumnsClass(columns))}>
        {items.map((item) => (
          <Card className={cn("border-ink/5", cardClassName)} key={item.route}>
            <h3 className="font-display text-2xl font-semibold text-ink">
              <Link className="transition hover:text-cyan" href={item.route}>
                {item.title}
              </Link>
            </h3>
            <p className="mt-3 text-base text-slate">{item.description}</p>
            <Link
              className="mt-4 inline-flex text-sm font-semibold text-cyan transition hover:text-cyan-700"
              href={item.route}
            >
              {item.ctaLabel ?? `Explore ${item.title}`}
            </Link>
          </Card>
        ))}
      </div>
    </section>
  )
}

export function SeoComparisonTable({
  columns,
  rows,
  className
}: {
  columns: string[]
  rows: SeoComparisonRow[]
  className?: string
}) {
  return (
    <div className={cn("overflow-x-auto rounded-[1.5rem] border border-ink/5 bg-pearl/70", className)}>
      <table className="min-w-full divide-y divide-ink/5 text-left text-sm">
        <thead className="bg-white/80 text-ink">
          <tr>
            {columns.map((column) => (
              <th className="px-4 py-4 font-semibold" key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">
          {rows.map((row) => (
            <tr className="align-top" key={row.label}>
              <th className="px-4 py-4 font-semibold text-ink">{row.label}</th>
              {row.values.map((value, index) => (
                <td className="px-4 py-4 align-top text-sm text-slate" key={`${row.label}-${index}`}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SeoCtaBanner({
  title,
  description,
  primaryAction,
  secondaryAction,
  footnote,
  variant = "light"
}: {
  title: string
  description: string
  primaryAction: SeoCardAction
  secondaryAction?: SeoCardAction
  footnote?: ReactNode
  variant?: "light" | "dark"
}) {
  const isDark = variant === "dark"

  return (
    <section
      className={
        isDark
          ? "rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,145,178,0.9))] px-6 py-8 text-white shadow-soft lg:px-10"
          : "rounded-[2rem] border border-white/70 bg-white/90 px-6 py-8 shadow-soft lg:px-10"
      }
    >
      <div className="max-w-4xl space-y-4">
        <h2
          className={cn(
            "font-display text-3xl font-bold tracking-tight",
            isDark ? "text-white" : "text-ink"
          )}
        >
          {title}
        </h2>
        <p className={isDark ? "text-base text-slate-100" : "text-base text-slate"}>
          {description}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className={
              isDark
                ? "inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-sand"
                : "inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
            }
            href={primaryAction.href}
          >
            {primaryAction.label}
          </Link>
          {secondaryAction ? (
            <Link
              className={
                isDark
                  ? "inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
                  : "inline-flex items-center justify-center rounded-full border border-ink/10 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              }
              href={secondaryAction.href}
            >
              {secondaryAction.label}
            </Link>
          ) : null}
        </div>
        {footnote ? (
          <div className={isDark ? "text-sm text-slate-200" : "text-sm text-slate"}>{footnote}</div>
        ) : null}
      </div>
    </section>
  )
}
