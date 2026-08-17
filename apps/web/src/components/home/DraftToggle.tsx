import { Eye, EyeOff } from 'lucide-react';
import { useCopyReview } from '../../contexts/CopyReview';

export function DraftToggle() {
  const { highlight, setHighlight } = useCopyReview();

  return (
    <button
      type="button"
      onClick={() => setHighlight(!highlight)}
      aria-pressed={highlight}
      className={`fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[12px] font-semibold shadow-lg transition-colors duration-150 ease-out ${
        highlight
          ? 'border-amber-500 bg-amber-400 text-ink'
          : 'border-line bg-white text-ink/70 hover:text-ink'
      }`}
    >
      {highlight ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      {highlight ? 'Hide draft copy' : 'Review draft copy'}
    </button>
  );
}
