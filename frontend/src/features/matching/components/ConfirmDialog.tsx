interface ConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-8 mx-4 bg-white shadow-2xl rounded-2xl">
        <div className="mb-6 text-center">
          <div className="mb-4 text-5xl">💳</div>
          <h3 className="mb-4 text-2xl font-bold">정말 크레딧을 사용하시겠습니까?</h3>
          <p className="mt-2 text-gray-500">AI 매칭 분석에 크레딧 30이 차감됩니다.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 font-semibold text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            아니요
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            예
          </button>
        </div>
      </div>
    </div>
  );
}
