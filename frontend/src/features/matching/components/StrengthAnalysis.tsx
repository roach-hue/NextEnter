interface StrengthItem {
  text: string;
}

interface StrengthAnalysisProps {
  strengths: StrengthItem[];
}

export default function StrengthAnalysis({ strengths }: StrengthAnalysisProps) {
  return (
    <div className="p-6 bg-white border-2 border-green-400 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">✅</span>
        <h3 className="text-xl font-bold text-green-600">강점 분석</h3>
      </div>
      <ul className="space-y-3">
        {strengths.map((strength, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-1 text-green-500">•</span>
            <span>{strength.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export type { StrengthItem };
