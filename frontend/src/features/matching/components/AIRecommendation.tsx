interface Recommendation {
  title: string;
  content: string;
}

interface AIRecommendationProps {
  recommendations: Recommendation[];
}

export default function AIRecommendation({ recommendations }: AIRecommendationProps) {
  return (
    <div className="p-6 bg-white border-2 border-blue-400 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🤖</span>
        <h3 className="text-xl font-bold text-blue-600">AI 추천 개선 사항</h3>
      </div>
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <div key={index} className="p-4 rounded-lg bg-blue-50">
            <h4 className="mb-2 font-bold">{recommendation.title}</h4>
            <p className="text-gray-700">{recommendation.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { Recommendation };
