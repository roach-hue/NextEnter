import { useCallback } from 'react';

interface AddressData {
  address: string;
  zonecode: string;
}

declare global {
  interface Window {
    daum: any;
  }
}

export const useKakaoAddress = (onComplete: (data: AddressData) => void) => {
  const openPostcode = useCallback(() => {
    if (!window.daum || !window.daum.Postcode) {
      alert('카카오 주소 API를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data: any) {
        // 도로명 주소 또는 지번 주소 선택
        const fullAddress = data.roadAddress || data.jibunAddress;
        const zonecode = data.zonecode;

        onComplete({
          address: fullAddress,
          zonecode: zonecode,
        });
      },
    }).open();
  }, [onComplete]);

  return { openPostcode };
};
