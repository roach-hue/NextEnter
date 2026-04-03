import { useState, useEffect } from "react";
import {
  getNotificationSettings,
  updateNotificationSettings,
  NotificationSettings as NotificationSettingsType,
} from "../../../api/notification";

interface NotificationSettingsProps {
  companyId: number;
  onSave?: () => void;
}

export default function NotificationSettings({
  companyId,
  onSave,
}: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettingsType | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [companyId]);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // 5초 타임아웃 설정
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000),
      );

      const dataPromise = getNotificationSettings("company", companyId);

      const data = (await Promise.race([
        dataPromise,
        timeoutPromise,
      ])) as NotificationSettingsType;

      setSettings(data);
    } catch (error) {
      console.error("알림 설정 로드 실패:", error);
      // 기본값 설정
      setSettings({
        id: 0,
        userId: companyId,
        userType: "COMPANY",
        newApplicationNotification: true,
        deadlineNotification: true,
        interviewResponseNotification: true,
        positionOfferNotification: false,
        interviewOfferNotification: false,
        applicationStatusNotification: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);

      // 5초 타임아웃 설정
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000),
      );

      const savePromise = updateNotificationSettings(
        "company",
        companyId,
        settings,
      );

      await Promise.race([savePromise, timeoutPromise]);

      alert("알림 설정이 저장되었습니다.");
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error("알림 설정 저장 실패:", error);
      if (error instanceof Error && error.message === "Timeout") {
        alert("서버 응답 시간이 초과했습니다. 다시 시도해주세요.");
      } else {
        alert("알림 설정 저장에 실패했습니다.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12 text-gray-500">
        알림 설정을 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-6 text-2xl font-bold">알림 설정</h2>
        <p className="mb-6 text-gray-600">
          서비스 이용 관련 알림 수신 여부를 제어합니다.
        </p>
      </div>

      {/* 이메일 알림 */}
      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="mb-4 text-lg font-bold">이메일 알림</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">
                새로운 지원자 발생 시 알림
              </p>
              <p className="text-sm text-gray-500">
                공고에 새로운 지원자가 있을 때 이메일을 받습니다
              </p>
            </div>
            <label className="relative inline-block h-8 w-14">
              <input
                type="checkbox"
                checked={settings.newApplicationNotification}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    newApplicationNotification: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">공고 마감 임박 알림</p>
              <p className="text-sm text-gray-500">
                공고 마감 3일 전 알림을 받습니다
              </p>
            </div>
            <label className="relative inline-block h-8 w-14">
              <input
                type="checkbox"
                checked={settings.deadlineNotification}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    deadlineNotification: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">
                면접자의 면접 동의 알림
              </p>
              <p className="text-sm text-gray-500">
                기업의 요청에 대한 지원자의 수락/거절 알림을 받습니다
              </p>
            </div>
            <label className="relative inline-block h-8 w-14">
              <input
                type="checkbox"
                checked={settings.interviewResponseNotification}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    interviewResponseNotification: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 text-lg font-bold text-white transition bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? "저장 중..." : "설정 저장"}
        </button>
      </div>
    </div>
  );
}
