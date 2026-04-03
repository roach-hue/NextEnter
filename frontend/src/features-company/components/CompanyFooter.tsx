export default function CompanyFooter() {
  return (
    <footer className="py-8 bg-white border-t border-gray-200">
      <div className="px-4 mx-auto max-w-7xl">
        {/* 상단: 메뉴 링크 & 공지사항 (한 줄 배치) */}
        <div className="flex flex-col items-center justify-between mb-6 md:flex-row">
          {/* 왼쪽: 주요 링크 */}
          <div className="flex flex-wrap gap-6 text-[13px] text-gray-600">
            <span className="cursor-pointer hover:text-black">회사소개</span>
            <span className="cursor-pointer hover:text-black">광고문의</span>
            <span className="cursor-pointer hover:text-black">제휴문의</span>
            <span className="cursor-pointer hover:text-black">이용약관</span>
            {/* 개인정보처리방침은 법적으로 볼드 처리하는 경우가 많음 */}
            <span className="font-bold text-black cursor-pointer">
              개인정보처리방침
            </span>
            <span className="cursor-pointer hover:text-black">
              위치기반서비스이용약관
            </span>
          </div>

          {/* 오른쪽: 공지사항 (옵션) */}
          <div className="mt-4 md:mt-0 text-[13px]">
            <span className="mr-3 font-bold text-black">공지사항</span>
            <span className="text-gray-600 cursor-pointer hover:underline">
              [안내] 기업회원 채용공고 등록 시스템 개편 안내
            </span>
            <span className="ml-4 text-xs text-gray-400">2026.01.19</span>
          </div>
        </div>

        {/* 구분선 (아주 얇게) */}
        <div className="w-full h-px mb-5 bg-gray-100"></div>

        {/* 하단: 회사 상세 정보 (작은 글씨, 회색톤) */}
        <div className="text-[12px] text-gray-500 leading-relaxed font-light">
          {/* 고객센터 및 연락처 라인 */}
          <div className="mb-2">
            <span className="font-bold text-gray-700">
              기업 전용 고객센터 : 1588-9999
            </span>
            <span className="mx-2 text-gray-300">|</span>
            <span>(평일 09:00 ~ 19:00 / 토요일 09:00 ~ 15:00)</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>FAX : 02-1234-5678</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>
              Email :{" "}
              <a
                href="mailto:biz@nextenter.com"
                className="hover:text-gray-800"
              >
                biz@nextenter.com
              </a>
            </span>
          </div>

          {/* 사업자 정보 라인 */}
          <div className="mb-4">
            <span>넥스트엔터(주)</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>대표 : 송진우</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>사업자등록번호 : 000-12-12345</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>주소 : 경기도 용인시 수지구 어쩌고 저쩌고 123</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>직업정보제공사업 신고번호 : 2026-서울강남-00000</span>
          </div>

          {/* 카피라이트 */}
          <div className="font-sans text-gray-400">
            Copyright © NEXT ENTER Corp. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
