import { useEffect } from "react";

const BASE_URL = "https://inspira-legal.cloud";

function setMeta(attr, value, content) {
  let el = document.querySelector(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!href) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useSEO({ title, description, path, noIndex = false }) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | Inspira Legal`
      : "Inspira Legal – Másteres y Visas en España";
    const canonical = path ? `${BASE_URL}${path}` : `${BASE_URL}/`;

    document.title = fullTitle;

    setMeta("name", "description", description || "");
    setMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");

    setCanonical(noIndex ? null : canonical);

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description || "");
    setMeta("property", "og:url", canonical);

    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description || "");
  }, [title, description, path, noIndex]);
}
