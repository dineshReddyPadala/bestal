import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ADVISOR_EXAMPLES } from '@/constants/content';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/app-context';
import { parseNeed, recommendService } from '@/utils/advisor';
import { wait } from '@/utils/format';
import type { Recommendation } from '@/types';

export function SolutionFinder() {
  const { needText, setNeedText, setMatch, toast } = useApp();
  const [exampleIndex, setExampleIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [parsedKeywords, setParsedKeywords] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState('');

  async function advise() {
    const text = needText.trim();
    if (!text) {
      toast("Tell us what you're working on first");
      return;
    }
    setLoading(true);
    await wait(450);
    const parsed = parseNeed(text);
    const rec = recommendService(parsed);
    setMatch(parsed);
    setParsedKeywords(parsed.keywords);
    setTimeframe(parsed.months ? 'Months+' : 'Short-term');
    setResult(rec);
    setLoading(false);
  }

  function tryAnother() {
    const next = (exampleIndex + 1) % ADVISOR_EXAMPLES.length;
    setExampleIndex(next);
    setNeedText(ADVISOR_EXAMPLES[next]);
    void adviseAfter(ADVISOR_EXAMPLES[next]);
  }

  async function adviseAfter(text: string) {
    setLoading(true);
    await wait(450);
    const parsed = parseNeed(text);
    const rec = recommendService(parsed);
    setMatch(parsed);
    setParsedKeywords(parsed.keywords);
    setTimeframe(parsed.months ? 'Months+' : 'Short-term');
    setResult(rec);
    setLoading(false);
  }

  return (
    <div className="advisor-box">
      <textarea
        className="need"
        value={needText}
        onChange={(event) => setNeedText(event.target.value)}
        aria-label="Describe your challenge"
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={() => void advise()} disabled={loading}>
          {loading ? 'Reading...' : 'Find My Solution'}
        </Button>
        <Button variant="outline" onClick={tryAnother} disabled={loading}>
          Try another example
        </Button>
      </div>
      {result ? (
        <div className="res on">
          <b style={{ color: 'var(--navy)' }}>This sounds like it fits:</b>
          <div className="kv">
            <div>
              <span>Area</span>
              <b>{parsedKeywords.slice(0, 2).join(', ') || 'General'}</b>
            </div>
            <div>
              <span>Timeframe</span>
              <b>{timeframe}</b>
            </div>
            <div>
              <span>Suggested approach</span>
              <b>{result.shape}</b>
            </div>
          </div>
          <div className="recbox">
            <b>{result.service}</b>
            <span style={{ fontSize: 13.5, color: '#41506B' }}>{result.why}</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <Link className="btn primary sm" to={result.ctaTo}>
              {result.ctaLabel}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
