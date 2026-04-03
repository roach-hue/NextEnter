import { useState, useEffect } from "react";
import {
  getNotificationSettings,
  updateNotificationSettings,
  NotificationSettings as NotificationSettingsType,
} from "../../../api/notification";

interface IndividualNotificationSettingsProps {
  userId: number;
  onSave?: () => void;
}

export default function IndividualNotificationSettings({
  userId,
  onSave,
}: IndividualNotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettingsType | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getNotificationSettings("individual", userId);
      setSettings(data);
    } catch (error) {
      console.error("알림 설정 로드 실패:", error);
      // 기본값 설정
      setSettings({
        id: 0,
        userId: userId,
        userType: "INDIVIDUAL",
        newApplicationNotification: false,
        deadlineNotification: false,
        interviewResponseNotification: false,
        positionOfferNotification: true,
        interviewOfferNotification: true,
        applicationStatusNotification: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await updateNotificationSettings("individual", userId, settings);
      alert("알림 설정이 저장되었습니다.");
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error("알림 설정 저장 실패:", error);
      alert("알림 설정 저장에 실패했습니다.");
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
              <p className="font-medium text-gray-900">받은 포지션 제안 알림</p>
              <p className="text-sm text-gray-500">
                기업으로부터 포지션 제안을 받을 때 알림을 받습니다
              </p>
            </div>
            <label className="relative inline-block h-8 w-14">
              <input
                type="checkbox"
                checked={settings.positionOfferNotification}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    positionOfferNotification: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">받은 기업의 요청 알림</p>
              <p className="text-sm text-gray-500">
                기업으로부터 기업의 요청을 받을 때 알림을 받습니다
              </p>
            </div>
            <label className="relative inline-block h-8 w-14">
              <input
                type="checkbox"
                checked={settings.interviewOfferNotification}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    interviewOfferNotification: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">지원 상태 변경 알림</p>
              <p className="text-sm text-gray-500">
                지원한 공고의 상태가 변경될 때 알림을 받습니다 (서류합격,
                면접요청 등)
              </p>
            </div>
            <label className="relative inline-block h-8 w-14">
              <input
                type="checkbox"
                checked={settings.applicationStatusNotification}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    applicationStatusNotification: e.target.checked,
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
