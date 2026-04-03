import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Footer 임포트 제거됨
import { signup } from "../api/auth";
import { registerCompany } from "../api/company";
import { useKakaoAddress } from "../hooks/useKakaoAddress";

interface SignupPageProps {
  onLogoClick?: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  initialAccountType?: "personal" | "business";
}

export default function SignupPage({
  onLogoClick,
  onLoginClick,
  initialAccountType = "personal",
}: SignupPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [accountType, setAccountType] = useState<"personal" | "business">(
    initialAccountType || "personal"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // ✅ 카카오 주소 API 훅 사용
  const { openPostcode } = useKakaoAddress((data) => {
    setAddress(data.address);
  });

  const passwordsMatch =
    password && passwordConfirm && password === passwordConfirm;
  const showPasswordMismatch = passwordConfirm && password !== passwordConfirm;

  const validateField = (fieldName: string, value: string) => {
    let error = "";
    switch (fieldName) {
      case "email":
        if (!value.trim()) error = "이메일을 입력해주세요";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "올바른 이메일 형식이 아닙니다";
        break;
      case "password":
        if (!value.trim()) error = "비밀번호를 입력해주세요";
        else if (value.length < 4)
          error = "비밀번호는 최소 4자 이상이어야 합니다";
        break;
      case "passwordConfirm":
        if (!value.trim()) error = "비밀번호를 다시 입력해주세요";
        else if (password !== value) error = "비밀번호가 일치하지 않습니다";
        break;
      case "name":
        if (!value.trim()) error = "이름을 입력해주세요";
        break;
      case "phone":
        if (!value.trim()) error = "전화번호를 입력해주세요";
        break;
      case "businessNumber":
        if (accountType === "business" && !value.trim())
          error = "사업자등록번호를 입력해주세요";
        break;
      case "companyName":
        if (accountType === "business" && !value.trim())
          error = "기업명을 입력해주세요";
        break;
    }
    return error;
  };

  const handleBlur = (fieldName: string, value: string) => {
    setTouched({ ...touched, [fieldName]: true });
    const error = validateField(fieldName, value);
    setErrors({ ...errors, [fieldName]: error });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }

    if (!password.trim()) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (password.length < 4) {
      newErrors.password = "비밀번호는 최소 4자 이상이어야 합니다";
    }

    if (!passwordConfirm.trim()) {
      newErrors.passwordConfirm = "비밀번호를 다시 입력해주세요";
    } else if (password !== passwordConfirm) {
      newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다";
    }

    if (!name.trim()) newErrors.name = "이름을 입력해주세요";
    if (!phone.trim()) newErrors.phone = "전화번호를 입력해주세요";

    if (accountType === "business") {
      if (!businessNumber.trim())
        newErrors.businessNumber = "사업자등록번호를 입력해주세요";
      if (!companyName.trim()) newErrors.companyName = "기업명을 입력해주세요";
    }

    setErrors(newErrors);
    setTouched({
      email: true,
      password: true,
      passwordConfirm: true,
      name: true,
      phone: true,
      ...(accountType === "business" && {
        businessNumber: true,
        companyName: true,
      }),
    });

    return Object.keys(newErrors).length === 0;
  };

  const parseEmployeeCount = (value: string): number | undefined => {
    if (!value) return undefined;

    const rangeMap: { [key: string]: number } = {
      "1-10": 10,
      "11-50": 50,
      "51-100": 100,
      "101-500": 500,
      "500+": 1000,
    };

    return rangeMap[value];
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      if (accountType === "personal") {
        const genderValue = gender ? gender.toUpperCase() : undefined;

        const signupData = {
          email: email.trim(),
          password: password,
          name: name.trim(),
          phone: phone.trim(),
          age: age ? parseInt(age) : undefined,
          gender: genderValue,
          address: address.trim() || undefined,
          detailAddress: detailAddress.trim() || undefined,
        };

        const response = await signup(signupData);

        if (response.success) {
          alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
          navigate("/user/login");
        } else {
          setApiError(response.message || "회원가입에 실패했습니다.");
        }
      } else {
        const companyData = {
          email: email.trim(),
          password: password,
          name: name.trim(),
          phone: phone.trim() || undefined,
          businessNumber: businessNumber.trim(),
          companyName: companyName.trim(),
          industry: industry.trim() || undefined,
          employeeCount: parseEmployeeCount(employeeCount),
          website: companyUrl.trim() || undefined,
          description: companyDescription.trim() || undefined,
          address: address.trim() || undefined,
          detailAddress: detailAddress.trim() || undefined,
        };

        const response = await registerCompany(companyData);

        if (response.success) {
          alert("기업 회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
          navigate("/company/login");
        } else {
          setApiError(response.message || "기업 회원가입에 실패했습니다.");
        }
      }
    } catch (err: any) {
      console.error("회원가입 오류:", err);

      if (err.response?.data?.message) {
        setApiError(err.response.data.message);
      } else if (err.message) {
        setApiError(err.message);
      } else {
        setApiError("회원가입 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ❌ 상단 로고 헤더 삭제됨 */}

      <div className="flex flex-col items-center flex-1 px-4 py-8">
        <div className="w-full max-w-md">
          {/* 로고 */}
          <div
            className="mb-8 text-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <h1 className="text-4xl font-bold text-blue-600">NextEnter</h1>
          </div>
          <div className="flex mb-6">
            <button
              onClick={() => {
                setAccountType("personal");
                setErrors({});
                setApiError("");
              }}
              className={`flex-1 py-4 text-center font-bold transition-all ${
                accountType === "personal"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              개인회원
            </button>
            <button
              onClick={() => {
                setAccountType("business");
                setErrors({});
                setApiError("");
              }}
              className={`flex-1 py-4 text-center font-bold transition-all ${
                accountType === "business"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              기업회원
            </button>
          </div>

          {apiError && (
            <div className="p-4 mb-4 border border-red-200 rounded bg-red-50">
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => handleBlur("email", e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-blue-500 text-sm disabled:bg-gray-100 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && touched.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={(e) => handleBlur("password", e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-blue-500 text-sm disabled:bg-gray-100 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.password && touched.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                placeholder="비밀번호 확인"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                onBlur={(e) => handleBlur("passwordConfirm", e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded focus:outline-none text-sm disabled:bg-gray-100 ${
                  showPasswordMismatch
                    ? "border-red-500"
                    : passwordsMatch
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
              />
              {showPasswordMismatch && touched.passwordConfirm && (
                <p className="mt-1 text-xs text-red-500">
                  비밀번호가 일치하지 않습니다
                </p>
              )}
              {passwordsMatch && touched.passwordConfirm && (
                <p className="mt-1 text-xs text-green-500">
                  비밀번호가 일치합니다
                </p>
              )}
              {errors.passwordConfirm &&
                !showPasswordMismatch &&
                touched.passwordConfirm && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.passwordConfirm}
                  </p>
                )}
            </div>
            <div>
              <input
                type="text"
                placeholder={
                  accountType === "business" ? "담당자 이름" : "이름"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => handleBlur("name", e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-blue-500 text-sm disabled:bg-gray-100 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && touched.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            <div>
              <input
                type="tel"
                placeholder="전화번호 (예: 010-1234-5678)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={(e) => handleBlur("phone", e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-blue-500 text-sm disabled:bg-gray-100 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone && touched.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>
            {accountType === "personal" && (
              <>
                <div>
                  <input
                    type="number"
                    placeholder="나이 (선택사항)"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-sm text-gray-700 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">성별 선택 (선택사항)</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                    <option value="other">기타</option>
                  </select>
                </div>
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="주소 (선택사항)"
                      value={address}
                      readOnly
                      className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded cursor-not-allowed bg-gray-50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={openPostcode}
                      disabled={isLoading}
                      className="px-4 py-3 text-sm font-medium text-white transition bg-gray-600 rounded hover:bg-gray-700 disabled:bg-gray-400"
                    >
                      주소 찾기
                    </button>
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="상세 주소 (선택사항)"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </>
            )}
            {accountType === "business" && (
              <>
                <div>
                  <input
                    type="text"
                    placeholder="사업자등록번호 (예: 123-45-67890)"
                    value={businessNumber}
                    onChange={(e) => setBusinessNumber(e.target.value)}
                    onBlur={(e) => handleBlur("businessNumber", e.target.value)}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-blue-500 text-sm disabled:bg-gray-100 ${
                      errors.businessNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.businessNumber && touched.businessNumber && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.businessNumber}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="기업명"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    onBlur={(e) => handleBlur("companyName", e.target.value)}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-blue-500 text-sm disabled:bg-gray-100 ${
                      errors.companyName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.companyName && touched.companyName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.companyName}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="업종 (선택사항, 예: IT/소프트웨어)"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <select
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-sm text-gray-700 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">직원수 선택 (선택사항)</option>
                    <option value="1-10">1-10명</option>
                    <option value="11-50">11-50명</option>
                    <option value="51-100">51-100명</option>
                    <option value="101-500">101-500명</option>
                    <option value="500+">500명 이상</option>
                  </select>
                </div>
                <div>
                  <input
                    type="url"
                    placeholder="회사 홈페이지 URL (선택사항)"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="회사소개 (선택사항)"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    disabled={isLoading}
                    rows={4}
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="회사 주소 (선택사항)"
                      value={address}
                      readOnly
                      className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded cursor-not-allowed bg-gray-50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={openPostcode}
                      disabled={isLoading}
                      className="px-4 py-3 text-sm font-medium text-white transition bg-gray-600 rounded hover:bg-gray-700 disabled:bg-gray-400"
                    >
                      주소 찾기
                    </button>
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="상세 주소 (선택사항)"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-6 text-base font-bold text-white transition-colors bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "가입 중..." : "가입하기"}
            </button>
          </form>
          <div className="mt-6 text-sm text-center text-gray-600">
            이미 계정이 있으신가요?{" "}
            <button
              onClick={() => {
                if (location.pathname.includes("/company")) {
                  navigate("/company/login");
                } else {
                  navigate("/user/login");
                }
              }}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              로그인
            </button>
          </div>
        </div>
      </div>
      {/* ❌ 푸터 삭제됨 */}
    </div>
  );
}
