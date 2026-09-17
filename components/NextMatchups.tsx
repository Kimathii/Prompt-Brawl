"use client";

interface NextMatchupsProps {
  title?: string;
  prompts: string[];
  onSelect: (prompt: string) => void;
}

export default function NextMatchups({ title, prompts, onSelect }: NextMatchupsProps) {
  return (
    <div className="w-full">
      {title && (
        <p className="font-display text-xs text-muted uppercase tracking-[0.25em] mb-3 text-center">
          {title}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelect(prompt)}
            className="rounded-full border border-line bg-panel px-4 py-2 text-sm text-ink/80 hover:text-ink hover:border-fighterA/60 hover:shadow-glowA transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-fighterA"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
