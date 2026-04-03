interface SuitabilityInfo {
  suitable: boolean;
  message: string;
  emoji: string;
}

interface MatchingScoreCardProps {
  suitabilityInfo: SuitabilityInfo;
}

export default function MatchingScoreCard({ suitabilityInfo }: MatchingScoreCardProps) {
  return (
    <div className={`rounded-2xl p-8 text-white ${suitabilityInfo.suitable ? 'bg-blue-600' : 'bg-red-600'}`}>
      <div className="text-center">
        <h2 className="mb-6 text-2xl font-bold">종합 매칭 점수</h2>
        <div className="mb-6 text-8xl">{suitabilityInfo.emoji}</div>
        <div className="mb-4 text-4xl font-bold">
          이 공고에 지원하기 <span className="underline">{suitabilityInfo.message}</span>합니다!
        </div>
      </div>
    </div>
  );
}

export type { SuitabilityInfo };
