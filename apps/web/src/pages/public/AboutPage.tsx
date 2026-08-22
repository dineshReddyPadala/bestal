import { Link } from 'react-router-dom';
import { cn } from '@bestal/shared-utils';
import { MktShell } from '../../components/marketing/MktShell';
import { PageMeta } from '../../components/PageMeta';
import { ForwardArrow } from '../../components/ui/ForwardArrow';
import { images } from '../../data/homeCopy';
import { ABOUT_HERO_IMAGE_SRC } from '../../lib/brand';
import {
  ABOUT_CTA,
  ABOUT_DIFFERENCE,
  ABOUT_FEATURED,
  ABOUT_HERO,
  ABOUT_SPECIALISTS,
  ABOUT_SPLIT,
  type AboutDifferenceCard,
} from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

function AboutDifferenceTags({
  tags,
  variant = 'filled',
}: {
  tags: readonly string[];
  variant?: AboutDifferenceCard['tagVariant'];
}) {
  return (
    <div className="mkt-about-tags">
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn('mkt-about-tag', variant === 'outline' && 'mkt-about-tag--outline')}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function AboutFeaturedCard({
  num,
  title,
  body,
  tags,
  className,
}: {
  num?: string;
  title: string;
  body: string;
  tags: readonly string[];
  className?: string;
}) {
  return (
    <article className={cn('mkt-about-featured', className)}>
      <div className="mkt-about-featured-copy">
        {num ? <span className="mkt-about-card-num">{num}</span> : null}
        <h3 className="mkt-about-featured-title">{title}</h3>
      </div>
      <div className="mkt-about-featured-body">
        <p className="howitworks-body-style">{body}</p>
        <AboutDifferenceTags tags={tags} variant="filled" />
      </div>
    </article>
  );
}

export function AboutPage() {
  return (
    <div className="mkt-about-page">
      <PageMeta title={PAGE_SEO.about.title} description={PAGE_SEO.about.description} />

      <section className="mkt-white mkt-section mkt-about-hero">
        <MktShell className="mkt-g2 mkt-about-hero-grid">
          <div className="mkt-about-hero-copy">
            <h1>{ABOUT_HERO.title}</h1>
            <p className="mkt-about-hero-subtitle">{ABOUT_HERO.subtitle}</p>
            <p className="mkt-lead howitworks-body-style">{ABOUT_HERO.body}</p>
            <div className="mkt-actions">
              <Link to="/how-it-works" className="mkt-btn mkt-btn-primary">
                {ABOUT_HERO.primaryCta}
                <ForwardArrow />
              </Link>
            </div>
          </div>
          <div className="mkt-about-hero-photo">
            <img
              src={ABOUT_HERO_IMAGE_SRC}
              alt="Technology professionals collaborating in a modern office"
            />
          </div>
        </MktShell>
      </section>

      <section className="mkt-cream mkt-section mkt-about-intro">
        <MktShell>
          <div className="mkt-about-intro-inner">
            {ABOUT_SPLIT.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="howitworks-body-style">
                {paragraph}
              </p>
            ))}
          </div>
        </MktShell>
      </section>

      <section className="mkt-white mkt-section mkt-about-diff-section">
        <MktShell>
          <h2 className="mkt-about-section-title">What makes us different</h2>

          <AboutFeaturedCard
            num={ABOUT_FEATURED.num}
            title={ABOUT_FEATURED.title}
            body={ABOUT_FEATURED.body}
            tags={ABOUT_FEATURED.tags}
          />

          <div className="mkt-about-grid">
            {ABOUT_DIFFERENCE.map((item) => (
              <article key={item.title} className="mkt-about-card mkt-about-card--hover">
                <span className="mkt-about-card-num">{item.num}</span>
                <h3>{item.title}</h3>
                <div className="mkt-about-card-reveal">
                  <div className="mkt-about-card-reveal-inner">
                    <p className="howitworks-body-style">{item.body}</p>
                    {item.tags ? (
                      <AboutDifferenceTags tags={item.tags} variant={item.tagVariant} />
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <AboutFeaturedCard
            num={ABOUT_SPECIALISTS.num}
            title={ABOUT_SPECIALISTS.title}
            body={ABOUT_SPECIALISTS.body}
            tags={ABOUT_SPECIALISTS.tags}
            className="mkt-about-featured--specialists"
          />
        </MktShell>
      </section>

      <section className="mkt-cream mkt-section-tight">
        <MktShell className="mkt-g2 mkt-about-closing">
          <div className="mkt-about-closing-copy">
            <h2>{ABOUT_CTA.title}</h2>
            <p className="howitworks-body-style">{ABOUT_CTA.body}</p>
          </div>
          <div className="mkt-about-cta-photo mkt-about-closing-photo">
            <img src={images.cta} alt="Professional working at a desk with multiple monitors" />
          </div>
        </MktShell>
      </section>
    </div>
  );
}
