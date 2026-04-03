import api from "./axios";

// 연락 메시지 인터페이스
export interface ContactMessage {
  contactId: number;
  companyUserId: number;
  resumeId: number;
  talentUserId: number;
  message: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

// 인재가 받은 연락 메시지 조회
export const getReceivedContacts = async (
  talentUserId: number
): Promise<ContactMessage[]> => {
  const response = await api.get("/api/resume/contact/received", {
    headers: {
      userId: talentUserId,
    },
  });
  return response.data;
};

// 연락 메시지 상태 변경
export const updateContactStatus = async (
  contactId: number,
  status: string,
  talentUserId: number
): Promise<{ success: boolean; message: string }> => {
  const response = await api.put(
    `/api/resume/contact/${contactId}/status`,
    null,
    {
      params: { status },
      headers: {
        userId: talentUserId,
      },
    }
  );
  return response.data;
};
