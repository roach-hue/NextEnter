// [변경] axios 패키지를 직접 쓰는 대신, 설정이 완료된(인터셉터 포함) 기존 파일을 가져옵니다.
import api from "./axios";

// ============================================================================
// 1. 타입 정의 (Spring Boot의 DTO와 1:1 매칭)
// ============================================================================

// [요청] 백엔드 V2.0: 이력서 ID만 보내면 백엔드가 DB에서 조회하여 AI 프롬프트 구성
export interface AiRecommendRequest {
  resumeId: number;
  userId: number;
  jobCategory?: string; // (선택) 사용자가 직무를 강제 지정하고 싶을 때
}

// [응답] 화면(UI)에 보여줄 데이터 정의
export interface CompanyInfo {
  company_name: string;
  role: string;
  score: number;
  match_level: string; // "BEST", "HIGH", "GAP"
  is_exact_match: boolean;
  missing_skills: string[];
  job_id: number | null;
  job_status: string | null; // "ACTIVE", "CLOSED"
}

export interface AiRecommendationResult {
  companies: CompanyInfo[];
  ai_report: string;
  grade: string;    // S, A, B, C, F
  score: number;
  experience_level: string; // JUNIOR, SENIOR
}

// ============================================================================
// 2. API 호출 함수
// ============================================================================

// baseURL이 이미 'http://localhost:8080'으로 설정되어 있으므로 뒷부분만 적으면 됩니다.
export const getAiRecommendation = async (
  requestData: AiRecommendRequest,
): Promise<AiRecommendationResult> => {
  try {
    console.log("🚀 [Front] AI 분석 요청 전송:", requestData);

    // [변경] api.post를 사용하면 토큰이 자동으로 헤더에 포함됩니다.
    // 주소도 '/api/ai/resume/recommend' 만 적으면 됩니다.
    // AI 요청은 시간이 오래 걸리므로 타임아웃을 60초로 늘립니다.
    const response = await api.post("/api/ai/resume/recommend", requestData, {
      timeout: 60000,
    });

    // 응답 데이터 (AiRecommendResponse)
    const backendData = response.data;
    console.log("✅ [Front] AI 분석 응답 수신:", backendData);

    // [핵심] 백엔드 데이터를 UI 형식으로 변환 (Adapter)
    const mappedResult: AiRecommendationResult = {
      grade: backendData.grade || "B",
      score: backendData.score || 0,
      experience_level: backendData.experience_level || backendData.experienceLevel || "JUNIOR",

      ai_report:
        backendData.ai_feedback ||
        backendData.aiReport ||
        "분석 리포트가 없습니다.",

      companies: (
        backendData.recommendations ||
        backendData.companies ||
        []
      ).map((item: any) => ({
        company_name: item.company_name || item.companyName,
        role: item.role || item.match_type || "포지션",
        score: item.match_score || item.score || 0,
        match_level: item.match_level || item.matchLevel || "NORMAL",
        is_exact_match: item.is_exact_match || item.isExactMatch || false,
        missing_skills: item.missing_skills || item.missingSkills || [],
        job_id: item.job_id || item.jobId || null,
        job_status: item.job_status || item.jobStatus || null,
      })),
    };

    return mappedResult;
  } catch (error) {
    console.error("❌ AI 분석 API 호출 실패:", error);
    throw error;
  }
};
