import { cn } from '@bestal/shared-utils';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MktShell } from './MktShell';
import type { LegalBlock, LegalDocument, LegalSection } from '../../lib/legal/types';

type LegalDocumentPageProps = {
  document: LegalDocument;
};

function flattenSections(sections: LegalSection[]): LegalSection[] {
  return sections.flatMap((section) => [
    section,
    ...(section.subsections ? flattenSections(section.subsections) : []),
  ]);
}

function LegalBlocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <p key={index} className="mkt-legal-paragraph">
              {block.text.split('\n').map((line, lineIndex, lines) => (
                <span key={lineIndex}>
                  {line}
                  {lineIndex < lines.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          );
        }

        return (
          <ul key={index} className="mkt-legal-list">
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        );
      })}
    </>
  );
}

function LegalSectionBlock({ section, depth = 0 }: { section: LegalSection; depth?: number }) {
  const HeadingTag = depth === 0 ? 'h3' : 'h4';

  return (
    <section id={section.id} className={cn('mkt-legal-section', depth > 0 && 'mkt-legal-subsection')}>
      <HeadingTag className={cn('mkt-legal-section-title', depth > 0 && 'mkt-legal-subsection-title')}>
        {section.title}
      </HeadingTag>
      {section.blocks.length > 0 ? <LegalBlocks blocks={section.blocks} /> : null}
      {section.subsections?.map((subsection) => (
        <LegalSectionBlock key={subsection.id} section={subsection} depth={depth + 1} />
      ))}
    </section>
  );
}

export function LegalDocumentPage({ document }: LegalDocumentPageProps) {
  const tocSections = useMemo(() => flattenSections(document.sections), [document.sections]);
  const [activeSection, setActiveSection] = useState(tocSections[0]?.id ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    );

    tocSections.forEach((section) => {
      const element = window.document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocSections]);

  function scrollToSection(sectionId: string) {
    const element = window.document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  }

  return (
    <div className="mkt-legal-page">
      <section className="mkt-white mkt-section mkt-legal-hero">
        <MktShell>
          <div className="mkt-hiw-label">Legal</div>
          <h1>{document.title}</h1>
          <p className="mkt-legal-meta">
            Effective Date: {document.effectiveDate}
          </p>
        </MktShell>
      </section>

      <section className="mkt-cream mkt-section mkt-legal-body-section">
        <MktShell className="mkt-legal-layout">
          <aside className="mkt-legal-toc" aria-label="Document sections">
            <h2>Contents</h2>
            <ul>
              {tocSections.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    className={cn(activeSection === section.id && 'is-active')}
                    aria-current={activeSection === section.id ? 'true' : undefined}
                    onClick={() => scrollToSection(section.id)}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="mkt-legal-content">
            {document.intro ? <LegalBlocks blocks={document.intro} /> : null}

            {document.sections.map((section) => (
              <LegalSectionBlock key={section.id} section={section} />
            ))}

            {document.outro ? <LegalBlocks blocks={document.outro} /> : null}

            <p className="mkt-legal-footer-note">
              Last Updated: {document.lastUpdated}. Questions?{' '}
              <Link to="/reach-out" className="mkt-faq-inline-link">
                Reach out to us
              </Link>
              .
            </p>
          </div>
        </MktShell>
      </section>
    </div>
  );
}
