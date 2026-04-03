interface JobSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Array<{
    jobId: number;
    title: string;
    jobCategory: string;
    deadline: string;
    status: string;
  }>;
  onSelectJob: (jobId: number) => void;
  talentName: string;
  offeredJobIds: number[]; // ✅ 이미 제안한 공고 ID 목록
}

export default function JobSelectionModal({
  isOpen,
  onClose,
  jobs,
  onSelectJob,
  talentName,
  offeredJobIds,
}: JobSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl p-6 bg-white rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            기업의 요청할 공고 선택
          </h2>
          <p className="mt-2 text-gray-600">
            <span className="font-semibold text-purple-600">{talentName}</span>
            님에게 면접을 제안할 공고를 선택하세요
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-4xl">📋</div>
            <p className="mb-4 text-gray-600">사용 가능한 공고가 없습니다.</p>
            <p className="text-sm text-gray-500">
              먼저 채용공고를 등록하고 마감일을 확인해주세요.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const isOffered = offeredJobIds.includes(job.jobId); // ✅ 이미 제안한 공고인지 확인

              return (
                <button
                  key={job.jobId}
                  onClick={() => !isOffered && onSelectJob(job.jobId)} // ✅ 제안한 공고는 클릭 불가
                  disabled={isOffered} // ✅ disabled 속성 추가
                  className={`w-full p-4 text-left transition border-2 rounded-xl ${
                    isOffered
                      ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60" // ✅ 회색 비활성화 스타일
                      : "border-gray-200 hover:border-purple-500 hover:shadow-md cursor-pointer" // 일반 스타일
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3
                          className={`text-lg font-bold ${
                            isOffered ? "text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {job.title}
                        </h3>
                        {isOffered && (
                          <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-full">
                            이미 제안함
                          </span>
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-3 text-sm ${
                          isOffered ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            isOffered
                              ? "bg-gray-200 text-gray-500"
                              : "bg-purple-100 text-purple-600"
                          }`}
                        >
                          {job.jobCategory}
                        </span>
                        <span>마감: {job.deadline}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isOffered ? (
                        <span className="px-3 py-1 text-sm font-medium text-gray-500 bg-gray-200 rounded-full">
                          제안 완료
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-full">
                          모집중
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
