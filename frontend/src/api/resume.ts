// C:\NextEnterFront\src\api\resume.ts
import api from "./axios";

// ===== 백엔드 리팩토링 후 새로운 요청 구조 =====
export interface CreateResumeRequest {
  title: string;
  jobCategory: string;
  skills?: string; // 쉼표로 구분된 문자열
  visibility?: string;

  // ✅ 개인정보 필드 추가
  resumeName?: string;
  resumeGender?: string;
  resumeBirthDate?: string;
  resumeEmail?: string;
  resumePhone?: string;
  resumeAddress?: string;
  resumeDetailAddress?: string;
  profileImage?: string;

  // ✅ 각 섹션별로 분리된 필드 (JSON 문자열로 전송)
  experiences?: string; // JSON 문자열: [{"title":"...", "period":"..."}]
  certificates?: string; // JSON 문자열: [{"title":"...", "date":"..."}]
  educations?: string; // JSON 문자열: [{"school":"...", "period":"..."}]
  careers?: string; // JSON 문자열: [{"company":"...", "position":"...", "role":"...", "period":"..."}]

  status?: string;
}

// ✅ 기존 데이터 구조와의 호환성을 위한 인터페이스
export interface ResumeSections {
  personalInfo?: {
    name?: string;
    gender?: string;
    birthDate?: string;
    email?: string;
    address?: string;
    profileImage?: string;
  };
  experiences?: Array<{
    title?: string;
    period?: string;
    content?: string;
  }>;
  certificates?: Array<{
    title?: string;
    date?: string;
  }>;
  educations?: Array<{
    school?: string;
    period?: string;
  }>;
  careers?: Array<{
    company?: string;
    period?: string;
    position?: string;
    role?: string;
  }>;
  coverLetter?: {
    title?: string;
    content?: string;
    files?: string[];
  };
}

// 포트폴리오 정보 인터페이스
export interface PortfolioInfo {
  portfolioId: number;
  filename: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  description?: string;
  displayOrder: number;
}

// 자기소개서 정보 인터페이스
export interface CoverLetterInfo {
  coverLetterId: number;
  title: string;
  content?: string;
  filePath?: string;
  fileType?: string;
}

// 이력서 응답
export interface ResumeResponse {
  resumeId: number;
  title: string;
  jobCategory: string;

  // ===== User 테이블에서 가져온 정보 =====
  userName?: string;
  userEmail?: string;
  userGender?: string;
  userPhone?: string;
  userAge?: number;
  userBio?: string;

  // ===== Resume 테이블에 저장된 개인정보 =====
  resumeName?: string;
  resumeGender?: string;
  resumeBirthDate?: string;
  resumeEmail?: string;
  resumePhone?: string;
  resumeAddress?: string;
  resumeDetailAddress?: string;
  profileImage?: string;

  // ===== 분리된 섹션들 (JSON 문자열) =====
  experiences?: string;
  certificates?: string;
  educations?: string;
  careers?: string;

  // ===== 기존 필드들 =====
  skills?: string;
  filePath?: string;
  fileType?: string;
  isMain: boolean;
  visibility: string;
  viewCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;

  // ✅ 포트폴리오와 자기소개서 목록
  portfolios?: PortfolioInfo[];
  coverLetters?: CoverLetterInfo[];

  // 하위 호환성을 위해 유지
  structuredData?: string;
}

// 이력서 목록 응답
export interface ResumeListItem {
  resumeId: number;
  title: string;
  jobCategory: string;
  isMain: boolean;
  visibility: string;
  viewCount: number;
  status: string;
  isIncomplete?: boolean;  // ✅ 미완성 여부
  createdAt: string;
}

// AI 추천 요청
export interface AIRecommendRequest {
  id: string;
  target_role: string;
  resume_content: any;
}

// AI 추천 응답
export interface AIRecommendResponse {
  companies: Array<{
    name: string;
    score: number;
    position: string;
    match_reasons: string[];
  }>;
  ai_report: string;
}

// ===== API 함수들 =====

export const getResumeList = async (
  userId: number,
): Promise<ResumeListItem[]> => {
  console.log("📄 [API] 이력서 목록 조회 요청 (userId:", userId, ")");

  const response = await api.get<ResumeListItem[]>("/api/resume/list", {
    headers: {
      userId: userId.toString(),
    },
  });

  console.log("✅ [API] 이력서 목록:", response.data);
  return response.data;
};

export const getResumeDetail = async (
  resumeId: number,
  userId: number,
): Promise<ResumeResponse> => {
  const response = await api.get<ResumeResponse>(`/api/resume/${resumeId}`, {
    headers: {
      userId: userId.toString(),
    },
  });
  return response.data;
};

export const getPublicResumeDetail = async (
  resumeId: number,
  viewerId: number,
): Promise<ResumeResponse> => {
  const response = await api.get<ResumeResponse>(
    `/api/resume/public/${resumeId}`,
    {
      headers: {
        userId: viewerId.toString(),
      },
    },
  );
  return response.data;
};

// ✅ 이력서 생성 (새로운 구조)
export const createResume = async (
  request: CreateResumeRequest,
  userId: number,
): Promise<{ resumeId: number }> => {
  const payload = {
    title: request.title,
    jobCategory: request.jobCategory,
    skills: request.skills,
    visibility: request.visibility || "PUBLIC",
    // ✅ 개인정보 필드 전송
    resumeName: request.resumeName,
    resumeGender: request.resumeGender,
    resumeBirthDate: request.resumeBirthDate,
    resumeEmail: request.resumeEmail,
    resumePhone: request.resumePhone,
    resumeAddress: request.resumeAddress,
    resumeDetailAddress: request.resumeDetailAddress,
    profileImage: request.profileImage,
    // ✅ 각 섹션별 필드 전송
    experiences: request.experiences,
    certificates: request.certificates,
    educations: request.educations,
    careers: request.careers,
    status: request.status || "DRAFT",
  };

  console.log("🚀 [API] 이력서 생성 요청:", payload);

  const response = await api.post<{ resumeId: number }>(
    "/api/resume",
    payload,
    {
      headers: {
        userId: userId.toString(),
      },
    },
  );

  console.log("✅ [API] 이력서 생성 응답:", response.data);
  return response.data;
};

// ✅ 이력서 수정 (새로운 구조)
export const updateResume = async (
  resumeId: number,
  request: CreateResumeRequest,
  userId: number,
): Promise<{ resumeId: number }> => {
  const payload = {
    title: request.title,
    jobCategory: request.jobCategory,
    skills: request.skills,
    visibility: request.visibility || "PUBLIC",
    // ✅ 개인정보 필드 전송
    resumeName: request.resumeName,
    resumeGender: request.resumeGender,
    resumeBirthDate: request.resumeBirthDate,
    resumeEmail: request.resumeEmail,
    resumePhone: request.resumePhone,
    resumeAddress: request.resumeAddress,
    resumeDetailAddress: request.resumeDetailAddress,
    profileImage: request.profileImage,
    // ✅ 각 섹션별 필드 전송
    experiences: request.experiences,
    certificates: request.certificates,
    educations: request.educations,
    careers: request.careers,
    status: request.status || "DRAFT",
  };

  console.log("🔄 [API] 이력서 수정 요청 (ID:", resumeId, "):", payload);

  const response = await api.put<{ resumeId: number }>(
    `/api/resume/${resumeId}`,
    payload,
    {
      headers: {
        userId: userId.toString(),
      },
    },
  );

  console.log("✅ [API] 이력서 수정 응답:", response.data);
  return response.data;
};

// ✅ 파일 포함 이력서 생성 (수정)
export const createResumeWithFiles = async (
  data: CreateResumeRequest,
  userId: number,
  resumeFiles: File[],
  portfolioFiles: File[],
  coverLetterFiles: File[],
): Promise<ResumeResponse> => {
  const formData = new FormData();

  // ✅ skills가 배열이면 문자열로 변환
  const skillsString = Array.isArray(data.skills)
    ? data.skills.join(", ")
    : data.skills;

  // JSON 데이터를 Blob으로 추가
  const jsonBlob = new Blob(
    [
      JSON.stringify({
        title: data.title,
        jobCategory: data.jobCategory,
        skills: skillsString, // ✅ 문자열로 전송
        visibility: data.visibility || "PUBLIC",
        // ✅ 개인정보 필드
        resumeName: data.resumeName,
        resumeGender: data.resumeGender,
        resumeBirthDate: data.resumeBirthDate,
        resumeEmail: data.resumeEmail,
        resumePhone: data.resumePhone,
        resumeAddress: data.resumeAddress,
        resumeDetailAddress: data.resumeDetailAddress,
        profileImage: data.profileImage,
        experiences: data.experiences,
        certificates: data.certificates,
        educations: data.educations,
        careers: data.careers,
        status: data.status || "COMPLETED",
      }),
    ],
    { type: "application/json" },
  );

  formData.append("request", jsonBlob);

  // 이력서 파일 추가
  resumeFiles.forEach((file) => {
    formData.append("resumeFiles", file);
  });

  // 포트폴리오 파일 추가
  portfolioFiles.forEach((file) => {
    formData.append("portfolioFiles", file);
  });

  // 자기소개서 파일 추가
  coverLetterFiles.forEach((file) => {
    formData.append("coverLetterFiles", file);
  });

  console.log("🚀 [API] 파일 포함 이력서 생성 요청");
  console.log("📤 skills (변환됨):", skillsString);
  console.log("📤 이력서 파일 개수:", resumeFiles.length);
  console.log("📤 포트폴리오 파일 개수:", portfolioFiles.length);
  console.log("📤 자기소개서 파일 개수:", coverLetterFiles.length);

  const response = await api.post<ResumeResponse>(
    "/api/resume/create-with-files",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        userId: userId.toString(),
      },
    },
  );

  console.log("✅ [API] 파일 포함 이력서 생성 응답:", response.data);
  return response.data;
};

// ✅ 파일 포함 이력서 수정 (수정)
export const updateResumeWithFiles = async (
  resumeId: number,
  data: CreateResumeRequest,
  userId: number,
  resumeFiles: File[],
  portfolioFiles: File[],
  coverLetterFiles: File[],
): Promise<ResumeResponse> => {
  const formData = new FormData();

  // ✅ skills가 배열이면 문자열로 변환
  const skillsString = Array.isArray(data.skills)
    ? data.skills.join(", ")
    : data.skills;

  // JSON 데이터를 Blob으로 추가
  const jsonBlob = new Blob(
    [
      JSON.stringify({
        title: data.title,
        jobCategory: data.jobCategory,
        skills: skillsString, // ✅ 문자열로 전송
        visibility: data.visibility || "PUBLIC",
        // ✅ 개인정보 필드
        resumeName: data.resumeName,
        resumeGender: data.resumeGender,
        resumeBirthDate: data.resumeBirthDate,
        resumeEmail: data.resumeEmail,
        resumePhone: data.resumePhone,
        resumeAddress: data.resumeAddress,
        resumeDetailAddress: data.resumeDetailAddress,
        profileImage: data.profileImage,
        experiences: data.experiences,
        certificates: data.certificates,
        educations: data.educations,
        careers: data.careers,
        status: data.status || "COMPLETED",
      }),
    ],
    { type: "application/json" },
  );

  formData.append("request", jsonBlob);

  // 이력서 파일 추가
  resumeFiles.forEach((file) => {
    formData.append("resumeFiles", file);
  });

  // 포트폴리오 파일 추가
  portfolioFiles.forEach((file) => {
    formData.append("portfolioFiles", file);
  });

  // 자기소개서 파일 추가
  coverLetterFiles.forEach((file) => {
    formData.append("coverLetterFiles", file);
  });

  console.log("🔄 [API] 파일 포함 이력서 수정 요청 (ID:", resumeId, ")");
  console.log("📤 skills (변환됨):", skillsString);
  console.log("📤 이력서 파일 개수:", resumeFiles.length);
  console.log("📤 포트폴리오 파일 개수:", portfolioFiles.length);
  console.log("📤 자기소개서 파일 개수:", coverLetterFiles.length);

  const response = await api.put<ResumeResponse>(
    `/api/resume/${resumeId}/update-with-files`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        userId: userId.toString(),
      },
    },
  );

  console.log("✅ [API] 파일 포함 이력서 수정 응답:", response.data);
  return response.data;
};

export const deleteResume = async (
  resumeId: number,
  userId: number,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/api/resume/${resumeId}`,
    {
      headers: {
        userId: userId.toString(),
      },
    },
  );
  return response.data;
};

export const uploadResumeFile = async (
  file: File,
  userId: number,
): Promise<ResumeResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<ResumeResponse>(
    "/api/resume/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        userId: userId.toString(),
      },
    },
  );
  return response.data;
};

export const getAIRecommendation = async (
  request: AIRecommendRequest,
): Promise<AIRecommendResponse> => {
  const response = await api.post<AIRecommendResponse>(
    "/api/ai/recommend",
    request,
  );
  return response.data;
};

// 포트폴리오 목록 조회
export interface PortfolioDto {
  portfolioId: number;
  resumeId: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  description?: string;
  displayOrder: number;
  uploadedAt: string;
}

export interface PortfolioListResponse {
  portfolios: PortfolioDto[];
  total: number;
}

export const getPortfolioList = async (
  userId: number,
  resumeId: number,
): Promise<PortfolioListResponse> => {
  const response = await api.get<PortfolioListResponse>(
    `/api/resume/${resumeId}/portfolios`,
    {
      headers: {
        userId: userId.toString(),
      },
    },
  );
  return response.data;
};

export const downloadPortfolio = async (
  userId: number,
  resumeId: number,
  portfolioId: number,
  fileName: string,
): Promise<void> => {
  const response = await api.get(
    `/api/resume/${resumeId}/portfolios/${portfolioId}/download`,
    {
      headers: {
        userId: userId.toString(),
      },
      responseType: "blob",
    },
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
