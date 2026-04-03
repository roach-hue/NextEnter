import api from "./axios";

export interface PaymentVerifyRequest {
  paymentId: string;
  transactionId: string;
  amount: number;
  credits: number;
}

export interface PaymentVerifyResponse {
  success: boolean;
  message: string;
  credits?: number;
}

/**
 * 포트원 결제 검증
 */
export const verifyPayment = async (
  userId: number,
  request: PaymentVerifyRequest
): Promise<PaymentVerifyResponse> => {
  const response = await api.post<PaymentVerifyResponse>(
    `/api/payment/verify`,
    request,
    {
      headers: {
        userId: userId.toString(),
      },
    }
  );
  return response.data;
};