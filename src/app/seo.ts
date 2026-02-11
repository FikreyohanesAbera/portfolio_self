type MetaSpec = {
  title: string
  description: string
  ogImage?: string
}

function setMetaByName(name: string, value: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute("name", name)
    document.head.appendChild(el)
  }
  el.setAttribute("content", value)
}

function setMetaByProperty(property: string, value: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute("property", property)
    document.head.appendChild(el)
  }
  el.setAttribute("content", value)
}

export function applySeo(spec: MetaSpec) {
  document.title = spec.title
  setMetaByName("description", spec.description)
  setMetaByProperty("og:title", spec.title)
  setMetaByProperty("og:description", spec.description)
  if (spec.ogImage) setMetaByProperty("og:image", spec.ogImage)
}
