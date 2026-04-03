export const requireAuth = (
  isAuthenticated: boolean,
  onLoginClick: () => void,
  featureName: string = "이 기능"
): boolean => {
  if (!isAuthenticated) {
    alert(`${featureName}은(는) 로그인이 필요합니다.`);
    onLoginClick();
    return false;
  }
  return true;
};
