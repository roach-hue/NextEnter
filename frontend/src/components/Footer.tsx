export default function Footer() {
  const navLinks = [
    { label: "회사 소개", href: "#" },
    { label: "제휴 문의", href: "#" },
    { label: "이용약관", href: "#" },
    { label: "개인정보처리방침", href: "#", bold: true },
    { label: "채용정보API", href: "#" },
    { label: "고객센터", href: "#" },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        {/* 네비게이션 링크 */}
        <div className="flex items-center justify-center mb-6 space-x-8">
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className={`text-sm text-gray-600 hover:text-gray-900 transition ${
                link.bold ? "font-bold" : ""
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* 구분선 */}
        <div className="w-full h-px mb-6 bg-gray-200"></div>

        {/* 회사 정보 */}
        <div className="space-y-2 text-sm text-center text-gray-500">
          <div>
            <span>고객센터 : </span>
            <span className="font-semibold">1588-1234</span>
            <span className="mx-2">(평일 09:00~18:00)</span>
            <span className="mx-2">|</span>
            <span>이메일 : </span>
            <span className="font-semibold">ABC123@NAVER.COM</span>
          </div>
          <div>
            <span>대표: 송진우</span>
            <span className="mx-2">|</span>
            <span>사업자 등록 번호 : 000-12-12345</span>
            <span className="mx-2">주소: 경기도 용인시 어쩌고</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
