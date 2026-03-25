function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(data)
      }}
      type="application/ld+json"
    />
  )
}
