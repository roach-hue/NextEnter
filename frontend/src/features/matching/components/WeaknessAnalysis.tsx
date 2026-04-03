interface WeaknessItem {
  text: string;
}

interface WeaknessAnalysisProps {
  weaknesses: WeaknessItem[];
}

export default function WeaknessAnalysis({ weaknesses }: WeaknessAnalysisProps) {
  return (
    <div className="p-6 bg-white border-2 border-yellow-400 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">⚠️</span>
        <h3 className="text-xl font-bold text-yellow-600">개선 필요 사항</h3>
      </div>
      <ul className="space-y-3">
        {weaknesses.map((weakness, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-1 text-yellow-500">•</span>
            <span>{weakness.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export type { WeaknessItem };
