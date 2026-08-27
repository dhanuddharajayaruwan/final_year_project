export const NAVBAR_OFFSET = 90;

export function scrollToSection(
  sectionId,
  { behavior = "smooth", offset = NAVBAR_OFFSET } = {}
) {
  const id = String(sectionId).replace(/^#/, "");
  if (!id) return false;

  const element = document.getElementById(id);
  if (!element) return false;

  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

export function scrollToHash(
  hash,
  { maxAttempts = 25, interval = 100, ...scrollOptions } = {}
) {
  if (!hash || hash === "#") return;

  let attempts = 0;

  const tryScroll = () => {
    if (scrollToSection(hash, scrollOptions)) return;
    attempts += 1;
    if (attempts < maxAttempts) {
      setTimeout(tryScroll, interval);
    }
  };

  tryScroll();
}
