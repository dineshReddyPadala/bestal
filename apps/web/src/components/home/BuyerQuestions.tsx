import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { buyerQuestions, buyerQuestionsDraft } from '../../data/homeCopy';
import { SectionHeading } from './SectionHeading';
import { Draft } from './Draft';

export function BuyerQuestions() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="buyer-questions" className="bg-cream py-16 md:py-24">
      <div className="section-shell max-w-3xl">
        <SectionHeading title={buyerQuestions.h2} align="center" />

        <Draft className="mt-10" label="Draft questions — pending approval">
          <div className="divide-y divide-line border-y border-line">
            {buyerQuestionsDraft.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={item.question}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-4 py-5 text-left"
                  >
                    <span className="font-display text-[16px] font-semibold leading-snug text-ink">
                      {item.question}
                    </span>
                    {isOpen ? (
                      <Minus className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    ) : (
                      <Plus className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" aria-hidden="true" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="pb-5 pr-8 text-[14px] leading-relaxed text-ink/65">
                      {item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Draft>

        <p className="mt-10 text-center text-[15px] font-medium text-ink/70">
          {buyerQuestions.closing}
        </p>
      </div>
    </section>
  );
}
