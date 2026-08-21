import { cn } from '@bestal/shared-utils';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MktShell } from '../../components/marketing/MktShell';
import { PageMeta } from '../../components/PageMeta';
import { FAQ_PAGE } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

function faqItemId(categoryId: string, question: string) {
  return `${categoryId}-${question.slice(0, 24)}`;
}

export function FaqPage() {
  const defaultCategory = FAQ_PAGE.categories[0]?.id ?? 'general';
  const [activeCategory, setActiveCategory] = useState(defaultCategory);

  const activeCategoryData = useMemo(
    () => FAQ_PAGE.categories.find((category) => category.id === activeCategory),
    [activeCategory],
  );

  const firstItem = activeCategoryData?.items[0];
  const [openId, setOpenId] = useState(
    firstItem ? faqItemId(activeCategory, firstItem.question) : '',
  );

  function selectCategory(categoryId: string) {
    const category = FAQ_PAGE.categories.find((item) => item.id === categoryId);
    setActiveCategory(categoryId);
    const firstQuestion = category?.items[0];
    setOpenId(firstQuestion ? faqItemId(categoryId, firstQuestion.question) : '');
  }

  if (!activeCategoryData) {
    return null;
  }

  return (
    <div className="mkt-faq-page">
      <PageMeta title={PAGE_SEO.faq.title} description={PAGE_SEO.faq.description} />

      <section className="mkt-white mkt-section mkt-faq-hero">
        <MktShell>
          <div className="mkt-hiw-label">{FAQ_PAGE.label}</div>
          <h1>{FAQ_PAGE.title}</h1>
          <p className="mkt-faq-hero-note howitworks-body-style">
            {FAQ_PAGE.contactPrefix}{' '}
            <a href={`mailto:${FAQ_PAGE.contactEmail}`}>{FAQ_PAGE.contactEmail}</a>
          </p>
        </MktShell>
      </section>

      <section className="mkt-cream mkt-section mkt-faq-body-section">
        <MktShell className="mkt-faq-layout">
          <aside className="mkt-faq-toc" aria-label="FAQ categories">
            <h2>{FAQ_PAGE.tocTitle}</h2>
            <ul>
              {FAQ_PAGE.categories.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    className={cn(activeCategory === category.id && 'is-active')}
                    aria-current={activeCategory === category.id ? 'true' : undefined}
                    onClick={() => selectCategory(category.id)}
                  >
                    {category.title}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="mkt-faq-content">
            <section
              key={activeCategoryData.id}
              id={`faq-${activeCategoryData.id}`}
              className="mkt-faq-category"
              aria-live="polite"
            >
              <h3 className="mkt-faq-category-label">{activeCategoryData.title}</h3>
              <div className="mkt-faq-accordion">
                {activeCategoryData.items.map((item) => {
                  const id = faqItemId(activeCategoryData.id, item.question);
                  const isOpen = openId === id;
                  return (
                    <article
                      key={item.question}
                      className={cn('mkt-faq-accordion-item', isOpen && 'is-open')}
                    >
                      <button
                        type="button"
                        className="mkt-faq-accordion-btn"
                        aria-expanded={isOpen}
                        onClick={() => setOpenId(isOpen ? '' : id)}
                      >
                        <span className="mkt-faq-accordion-icon" aria-hidden="true">
                          {isOpen ? '−' : '+'}
                        </span>
                        <span className="mkt-faq-accordion-q">{item.question}</span>
                      </button>
                      {isOpen ? (
                        <div className="mkt-faq-accordion-body">
                          <p className="mkt-faq-accordion-a">{item.answer}</p>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>

            <p className="mkt-faq-footer-note howitworks-body-style">
              Still have questions?{' '}
              <Link to="/contact" className="mkt-faq-inline-link">
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
