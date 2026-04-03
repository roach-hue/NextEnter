interface Resume {
  id: string;
  name: string;
}

interface Job {
  id: string;
  name: string;
  company: string;
}

interface TargetSelectionProps {
  resumes: Resume[];
  selectedResume: string;
  onResumeChange: (resumeId: string) => void;
  onAddResume: () => void;
  onAnalyze: () => void;
}

export default function TargetSelection({
  resumes,
  selectedResume,
  onResumeChange,
  onAddResume,
  onAnalyze
}: TargetSelectionProps) {
  const selectedResumeInfo = resumes.find(r => r.id === selectedResume);

  return (
    <div className="p-8 mb-6 bg-white border-2 border-blue-400 rounded-2xl">
      <h2 className="mb-6 text-xl font-bold">AI 기업 추천</h2>
      
      <div className="mb-6">
        {/* 이력서 선택 */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            이력서 선택
          </label>
          <div className="flex gap-2">
            <select
              value={selectedResume}
              onChange={(e) => onResumeChange(e.target.value)}
              className="flex-1 p-4 text-gray-700 bg-white border-2 border-gray-300 outline-none cursor-pointer rounded-xl hover:border-blue-400 focus:border-blue-500"
            >
              <option value="">이력서를 선택하세요</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.name}
                </option>
              ))}
            </select>
            <button
              onClick={onAddResume}
              className="px-6 py-4 font-medium text-gray-700 transition bg-gray-200 rounded-xl hover:bg-gray-300 whitespace-nowrap"
            >
              + 이력서 추가
            </button>
          </div>
          {selectedResumeInfo && (
            <p className="mt-2 text-sm text-green-600">
              ✓ {selectedResumeInfo.name} 선택됨
            </p>
          )}
        </div>
      </div>

      {/* 분석 시작 버튼 */}
      <button
        onClick={onAnalyze}
        className="flex items-center justify-center w-full gap-2 py-4 text-lg font-bold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700"
      >
        <span>🤖</span>
        <span>AI가 최적 공고 3곳 추천받기</span>
        <span className="text-sm">(크레딧 30)</span>
      </button>

      {/* 안내 메시지 */}
      <div className="p-4 mt-4 border-2 border-blue-200 bg-blue-50 rounded-xl">
        <div className="flex items-center gap-2 text-blue-700">
          <span>💡</span>
          <span className="font-medium">
            AI가 이력서를 분석하여 가장 적합한 기업 공고 3곳을 자동으로 추천해드립니다
          </span>
        </div>
      </div>
    </div>
  );
}

export type { Resume, Job };
