import api from "./axios";

// 크레딧 잔액 응답 타입
export interface CreditBalance {
  userId: number;
  balance: number;
  updatedAt: string;
}

// 크레딧 충전 요청 타입
export interface CreditChargeRequest {
  amount: number;
  paymentMethod?: string;
  description?: string;
}

// ✅ 크레딧 이용 내역 응답 타입 추가
export interface CreditHistoryItem {
  creditHistoryId: number;
  userId: number;
  transactionType: "CHARGE" | "DEDUCT"; // 충전 또는 차감
  amount: number;
  balance: number; // 거래 후 잔액
  description: string;
  createdAt: string;
}

export interface CreditHistoryResponse {
  content: CreditHistoryItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// API 응답 타입
export interface CreditApiResponse<T> {
  success: boolean;
  message: string;
  balance?: T;
}

/**
 * 크레딧 잔액 조회
 */
export const getCreditBalance = async (
  userId: number
): Promise<CreditBalance> => {
  const response = await api.get<CreditBalance>(`/api/credit/balance`, {
    headers: {
      userId: userId.toString(),
    },
  });
  return response.data;
};

/**
 * ✅ 크레딧 이용 내역 조회
 */
export const getCreditHistory = async (
  userId: number,
  page: number = 0,
  size: number = 10
): Promise<CreditHistoryResponse> => {
  const response = await api.get<CreditHistoryResponse>(
    `/api/credit/history`,
    {
      params: {
        page,
        size,
      },
      headers: {
        userId: userId.toString(),
      },
    }
  );
  return response.data;
};

/**
 * 크레딧 충전
 */
export const chargeCredit = async (
  userId: number,
  request: CreditChargeRequest
): Promise<CreditApiResponse<CreditBalance>> => {
  const response = await api.post<CreditApiResponse<CreditBalance>>(
    `/api/credit/charge`,
    request,
    {
      headers: {
        userId: userId.toString(),
      },
    }
  );
  return response.data;
};

/**
 * 크레딧 차감
 */
export const deductCredit = async (
  userId: number,
  amount: number,
  description?: string
): Promise<CreditApiResponse<CreditBalance>> => {
  const params = new URLSearchParams();
  params.append("amount", amount.toString());
  if (description) {
    params.append("description", description);
  }

  const response = await api.post<CreditApiResponse<CreditBalance>>(
    `/api/credit/deduct?${params.toString()}`,
    {},
    {
      headers: {
        userId: userId.toString(),
      },
    }
  );
  return response.data;
};

/**
 * 크레딧 충분 여부 확인
 */
export const checkCredit = async (
  userId: number,
  amount: number
): Promise<{ hasEnoughCredit: boolean; requiredAmount: number }> => {
  const response = await api.get<{
    hasEnoughCredit: boolean;
    requiredAmount: number;
  }>(`/api/credit/check?amount=${amount}`, {
    headers: {
      userId: userId.toString(),
    },
  });
  return response.data;
};
