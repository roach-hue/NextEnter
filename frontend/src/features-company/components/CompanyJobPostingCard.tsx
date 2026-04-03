// 백엔드 API 응답 구조에 맞춘 인터페이스
export interface JobPostingData {
  jobId: number;
  title: string;
  companyName: string;
  companyId?: number;
  location: string;
  jobCategory: string;
  deadline: string;
  status: string;
  applicantCount: number;
  viewCount?: number;
  bookmarkCount?: number;
  thumbnailUrl?: string;
  logoUrl?: string;
  experienceMin?: number;
  experienceMax?: number;
}

interface CompanyJobPostingCardProps {
  job: JobPostingData;
  onDetailClick: (jobId: number) => void;
}

// D-Day 계산 함수
const calculateDaysLeft = (deadline: string): number => {
  const today = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// 경력 정보 포맷팅
const formatExperience = (min?: number, max?: number) => {
  if (min === undefined && max === undefined) return "경력무관";
  if (min === 0) return "신입";
  if (max === undefined) return `${min}년 이상`;
  return `${min}~${max}년`;
};

// 상태 배지 컴포넌트
const getStatusBadge = (status: string) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "진행중";
      case "CLOSED":
        return "마감";
      case "EXPIRED":
        return "기간만료";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "CLOSED":
        return "bg-gray-100 text-gray-600";
      case "EXPIRED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}
    >
      {getStatusText(status)}
    </span>
  );
};

export default function CompanyJobPostingCard({
  job,
  onDetailClick,
}: CompanyJobPostingCardProps) {
  const daysLeft = calculateDaysLeft(job.deadline);

  return (
    <div
      onClick={() => onDetailClick(job.jobId)}
      className="flex flex-col overflow-hidden transition bg-white border border-gray-300 shadow-sm cursor-pointer rounded-xl hover:shadow-xl hover:border-purple-400 h-[480px]"
    >
      {/* 로고 영역 */}
      <div className="flex items-center justify-center h-16 bg-gradient-to-br from-gray-50 to-gray-100">
        {job.logoUrl ? (
          <img
            src={job.logoUrl}
            alt={job.companyName}
            className="object-contain w-16 h-16"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/150?text=No+Logo";
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-gray-400 bg-white rounded-lg">
            {job.companyName?.charAt(0) || "회"}
          </div>
        )}
      </div>

      {/* 내용 영역 */}
      <div className="flex flex-col flex-1 p-5">
        {/* 직무명 */}
        <h3 className="mb-2 text-base font-bold text-gray-900 line-clamp-2 hover:text-purple-600">
          {job.title}
        </h3>

        {/* 회사명 */}
        <p className="mb-3 text-sm font-medium text-gray-600">
          {job.companyName}
        </p>

        {/* 썸네일 이미지 */}
        <div className="mb-3 overflow-hidden rounded-lg h-32">
          {job.thumbnailUrl ? (
            <img
              src={job.thumbnailUrl}
              alt={`${job.title} 썸네일`}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/400x200?text=No+Image";
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-32 bg-gradient-to-br from-purple-50 to-blue-50">
              <svg
                className="w-12 h-12 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* 정보 태그 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {formatExperience(job.experienceMin, job.experienceMax)}
          </span>
          {getStatusBadge(job.status)}
        </div>

        {/* 통계 정보 */}
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
          <span>👁️ {job.viewCount || 0}</span>
          <span>📝 {job.applicantCount || 0}</span>
          <span>⭐ {job.bookmarkCount || 0}</span>
        </div>

        {/* 하단 정보 */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs text-gray-600">
              {job.deadline ? `~ ${job.deadline}` : "마감일 미정"}
            </span>
          </div>
          {/* D-Day 배지 */}
          <div
            className={`px-3 py-1 text-xs font-bold rounded-lg ${
              daysLeft <= 7
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {daysLeft > 0 ? `D-${daysLeft}` : "마감"}
          </div>
        </div>
      </div>
    </div>
  );
}