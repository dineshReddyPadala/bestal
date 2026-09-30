import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import type { LegalBlock, LegalDocument, LegalSection } from '@/constants/legal/types';

function LegalBlocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <p key={index} className="legal-p">
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
          <ul key={index} className="legal-list">
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
  const HeadingTag = depth === 0 ? 'h2' : 'h3';

  return (
    <section id={section.id} className={depth > 0 ? 'legal-sub' : 'legal-sec'}>
      <HeadingTag className={depth > 0 ? 'legal-h3' : 'legal-h2'}>{section.title}</HeadingTag>
      {section.blocks.length > 0 ? <LegalBlocks blocks={section.blocks} /> : null}
      {section.subsections?.map((subsection) => (
        <LegalSectionBlock key={subsection.id} section={subsection} depth={depth + 1} />
      ))}
    </section>
  );
}

function TocList({ sections }: { sections: LegalSection[] }) {
  return (
    <ul className="legal-toc-list">
      {sections.map((section) => (
        <li key={section.id}>
          <a href={`#${section.id}`}>{section.title}</a>
          {section.subsections?.length ? <TocList sections={section.subsections} /> : null}
        </li>
      ))}
    </ul>
  );
}

export function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <div className="legal-page">
      <section className="hero" style={{ paddingBottom: 40 }}>
        <div className="shell" style={{ maxWidth: 960 }}>
          <span className="tag">Legal</span>
          <h1 style={{ marginTop: 14, fontSize: 36 }}>{document.title}</h1>
          <p className="legal-meta">Effective Date: {document.effectiveDate}</p>
        </div>
      </section>

      <section style={{ paddingBottom: 80 }}>
        <div className="shell legal-layout">
          <aside className="legal-toc" aria-label="Document sections">
            <h2>Contents</h2>
            <TocList sections={document.sections} />
          </aside>

          <div className="legal-body">
            {document.intro ? <LegalBlocks blocks={document.intro} /> : null}
            {document.sections.map((section) => (
              <LegalSectionBlock key={section.id} section={section} />
            ))}
            {document.outro ? <LegalBlocks blocks={document.outro} /> : null}
            <p className="legal-updated">
              Last Updated: {document.lastUpdated}. Questions?{' '}
              <Link to={ROUTES.contact} className="linkish">
                Contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
