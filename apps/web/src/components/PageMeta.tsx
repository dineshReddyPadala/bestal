type PageMetaProps = {
  title: string;
  description: string;
  noIndex?: boolean;
};

function upsertNamedMeta(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function removeNamedMeta(name: string) {
  document.querySelector(`meta[name="${name}"]`)?.remove();
}

export function PageMeta({ title, description, noIndex = false }: PageMetaProps) {
  if (typeof document !== 'undefined') {
    document.title = title;
    upsertNamedMeta('description', description);

    if (noIndex) {
      upsertNamedMeta('robots', 'noindex, nofollow');
    } else {
      removeNamedMeta('robots');
    }
  }

  return null;
}
