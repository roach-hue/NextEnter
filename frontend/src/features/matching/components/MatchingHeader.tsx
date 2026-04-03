interface MatchingHeaderProps {
  currentCredit: number;
  onCreditClick: () => void;
}

export default function MatchingHeader({
  currentCredit,
  onCreditClick,
}: MatchingHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
          📊
        </div>
        <h1 className="text-2xl font-bold">AI 매칭 분석</h1>
      </div>
      <button
        onClick={onCreditClick}
        className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition bg-blue-600 rounded-full hover:bg-blue-700"
      >
        <span>💳</span>
        <span>보유 크레딧 : {currentCredit}</span>
      </button>
    </div>
  );
}