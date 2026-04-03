// 전역 네비게이션 가드 (이동 방지기)
let isBlocked = false;
let blockMessage = "";

// 1. 방어막 켜기/끄기 함수
export const setNavigationBlocker = (
  blocked: boolean,
  message: string = ""
) => {
  isBlocked = blocked;
  blockMessage = message;
};

// 2. 이동 가능 여부 체크 함수 (Header에서 사용)
export const checkNavigationBlocked = (): boolean => {
  if (isBlocked) {
    // 차단된 상태면 물어봄. '취소' 누르면 true(차단됨) 반환
    return !window.confirm(blockMessage || "이동하시겠습니까?");
  }
  return false; // 차단 안 됨
};
