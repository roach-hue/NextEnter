interface JobCardProps {
  job: {
    id: number;
    jobId: number;
    company: string;
    title: string;
    tags: string[];
    scrapDate: string;
    bookmarked: boolean;
  };
  showCheckbox?: boolean;
  isChecked?: boolean;
  onCheckboxChange?: (id: number) => void;
  onTitleClick?: (jobId: number) => void;
  onBookmarkToggle?: (id: number) => void;
}

export default function JobCard({
  job,
  showCheckbox = false,
  isChecked = false,
  onCheckboxChange,
  onTitleClick,
  onBookmarkToggle,
}: JobCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50">
      {/* 체크박스 */}
      {showCheckbox && (
        <input
          type="checkbox"
          className="mt-1"
          checked={isChecked}
          onChange={() => onCheckboxChange?.(job.id)}
        />
      )}

      {/* 공고 내용 */}
      <div className="flex-1">
        <div className="flex items-start gap-2">
          <h3 className="text-sm text-gray-600">{job.company}</h3>
          <button
            onClick={() => onBookmarkToggle?.(job.id)}
            className="text-yellow-400 hover:text-yellow-500"
          >
            {job.bookmarked ? "★" : "☆"}
          </button>
        </div>
        <h2
          onClick={() => onTitleClick?.(job.jobId)}
          className="mt-1 text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
        >
          {job.title}
        </h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {job.tags.map((tag, index) => (
            <span key={index} className="text-xs text-gray-600">
              {tag}
              {index < job.tags.length - 1 && ", "}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <span>스크랩하기</span>
        </div>
      </div>

      {/* 마감일 */}
      <div className="text-sm text-gray-500">{job.scrapDate}</div>
    </div>
  );
}
