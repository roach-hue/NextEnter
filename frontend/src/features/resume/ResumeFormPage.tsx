import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { JOB_CATEGORIES, AVAILABLE_SKILLS } from "../../constants/jobConstants";
import {
  createResume,
  updateResume,
  getResumeDetail,
  createResumeWithFiles,
  updateResumeWithFiles,
  CreateResumeRequest,
  ResumeSections,
} from "../../api/resume";
import { usePageNavigation } from "../../hooks/usePageNavigation";

import { useKakaoAddress } from "../../hooks/useKakaoAddress";
import { setNavigationBlocker } from "../../utils/navigationBlocker";
import LeftSidebar from "../../components/LeftSidebar";

interface ResumeFormPageProps {
  onBack?: () => void;
  initialMenu?: string;
  onNavigate?: (page: string, subMenu?: string) => void;
}

type EducationForm = {
  school: string;
  type: string;
  subType: string;
  major: string;
  startDate: string;
  endDate: string;
};

export default function ResumeFormPage({
  onBack,
  initialMenu,
  onNavigate,
}: ResumeFormPageProps) {
  const navigate = useNavigate();
  const { resumeId: resumeIdParam } = useParams();
  const { user } = useAuthStore();

  const resumeId = resumeIdParam ? parseInt(resumeIdParam) : null;

  const { activeMenu, handleMenuClick } = usePageNavigation(
    "resume",
    initialMenu,
    onNavigate,
  );

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");

  const [educations, setEducations] = useState<EducationForm[]>([
    {
      school: "",
      type: "",
      subType: "",
      major: "",
      startDate: "",
      endDate: "",
    },
  ]);

  const [careers, setCareers] = useState<
    {
      company: string;
      position: string;
      role: string;
      startDate: string;
      endDate: string;
    }[]
  >([{ company: "", position: "", role: "", startDate: "", endDate: "" }]);

  // ✅ 파일 업로드(새로 선택한 파일들)
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const portfolioFileInputRef = useRef<HTMLInputElement>(null);

  const [experiences, setExperiences] = useState<
    { title: string; startDate: string; endDate: string }[]
  >([{ title: "", startDate: "", endDate: "" }]);

  const [certificates, setCertificates] = useState<
    { title: string; date: string }[]
  >([{ title: "", date: "" }]);

  const [coverLetterFiles, setCoverLetterFiles] = useState<File[]>([]);
  const coverLetterFileInputRef = useRef<HTMLInputElement>(null);

  const [resumeTitle, setResumeTitle] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [coverLetterTitle, setCoverLetterTitle] = useState("");
  const [coverLetterContent, setCoverLetterContent] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ 드래그 상태 관리
  const [isResumeDragging, setIsResumeDragging] = useState(false);
  const [isPortfolioDragging, setIsPortfolioDragging] = useState(false);
  const [isCoverLetterDragging, setIsCoverLetterDragging] = useState(false);

  // ✅ JSON 안전 파서
  // ✅ 수정: value를 필수 파라미터로 바꾸되, null/undefined를 허용하도록 타입 변경
  const safeJsonParse = <T,>(
    value: string | null | undefined,
    fallback: T,
  ): T => {
    if (!value) return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  };

  // ✅ skills 파싱: "React, Vue" / JSON 배열 둘 다 대응
  const splitSkills = (skills?: string): string[] => {
    if (!skills) return [];
    const trimmed = skills.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      const parsed = safeJsonParse<any>(skills, []);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    }
    return skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  // ✅ [핵심] 저장되어 있는 education.school 문자열을 다시 분해해서 수정페이지에 동일하게 표시
  // 저장 포맷(현재 너 코드):
  //   schoolText = `${school} ${type}` + (subType ? ` - ${subType}` : "") + (major ? ` ${major}` : "")
  const parseEducationSchoolText = (
    raw: string,
  ): { school: string; type: string; subType: string; major: string } => {
    const types = ["고등학교", "대학교", "대학원"] as const;

    const subTypesMap: Record<string, string[]> = {
      고등학교: [
        "일반고",
        "특목고",
        "특성화고",
        "마이스터고",
        "자율고",
        "영재고",
      ],
      대학교: ["2년제", "3년제", "4년제"],
      대학원: ["석사", "박사"],
    };

    const result = { school: raw || "", type: "", subType: "", major: "" };
    if (!raw) return result;

    const trimmed = raw.trim();

    // 1) " - "가 있으면: "<학교명> <type> - <subType> <major?>"
    if (trimmed.includes(" - ")) {
      const [left, right] = trimmed.split(" - ");
      // left에서 type 찾기 (끝에 붙어있음)
      const foundType = types.find((t) => left.trim().endsWith(t));
      if (foundType) {
        result.type = foundType;
        result.school = left
          .trim()
          .slice(0, left.trim().length - foundType.length)
          .trim();
      } else {
        // 혹시 타입을 못 찾으면 왼쪽 통으로 school
        result.school = left.trim();
      }

      // right에서 subType(앞부분) + major(나머지)
      const candidates = result.type
        ? subTypesMap[result.type]
        : ([] as string[]);
      const foundSub = candidates.find((s) => right.trim().startsWith(s));
      if (foundSub) {
        result.subType = foundSub;
        result.major = right.trim().slice(foundSub.length).trim(); // 나머지가 학과
      } else {
        // subType을 못 찾으면 통째 major로
        result.major = right.trim();
      }
      return result;
    }

    // 2) " - "가 없으면: "<학교명> <type> <major?>"
    // type을 찾아서 school / major 분리
    const foundType = types.find(
      (t) => trimmed.includes(` ${t}`) || trimmed.endsWith(t),
    );
    if (foundType) {
      // 가장 뒤쪽의 type 기준으로 split
      const idx = trimmed.lastIndexOf(foundType);
      const before = trimmed.slice(0, idx).trim(); // "<학교명>"
      const after = trimmed.slice(idx + foundType.length).trim(); // "<major?>"
      result.school = before;
      result.type = foundType;
      result.major = after; // 학과가 있을 수도 / 없을 수도
      return result;
    }

    // 3) 아무것도 못 찾으면 school에만 넣기
    result.school = trimmed;
    return result;
  };

  const { openPostcode } = useKakaoAddress((data) => {
    setAddress(data.address);
  });

  useEffect(() => {
    if (resumeId && user?.userId) {
      loadResumeData(resumeId, user.userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, user?.userId]);

  useEffect(() => {
    setNavigationBlocker(
      true,
      "작성 중인 내용이 사라집니다. 정말 이동하시겠습니까?",
    );
    return () => setNavigationBlocker(false, "");
  }, []);

  const loadResumeData = async (id: number, userId: number) => {
    setIsLoading(true);
    setError("");

    try {
      const resume = await getResumeDetail(id, userId);
      console.log("🔍 [디버그] 불러온 이력서 데이터:", resume);

      // ===== 기본 정보 =====
      setResumeTitle(resume.title || "");
      if (resume.jobCategory) setSelectedJob(resume.jobCategory);
      setVisibility(resume.visibility || "PUBLIC");

      // ===== 개인정보(Resume 테이블 우선) =====
      if (resume.resumeName) setName(resume.resumeName);
      if (resume.resumeGender) setSelectedGender(resume.resumeGender);
      if (resume.resumeBirthDate) setBirthDate(resume.resumeBirthDate);
      if (resume.resumeEmail) setEmail(resume.resumeEmail);
      if (resume.resumePhone) setPhone(resume.resumePhone);
      if (resume.resumeAddress) setAddress(resume.resumeAddress);
      if (resume.resumeDetailAddress)
        setDetailAddress(resume.resumeDetailAddress);
      if (resume.profileImage) setSelectedImage(resume.profileImage);

      // ===== ✅ 새 구조(분리 필드) 먼저 로드 =====
      const expArr = safeJsonParse<Array<{ title?: string; period?: string }>>(
        resume.experiences,
        [],
      );
      if (expArr.length > 0) {
        setExperiences(
          expArr.map((exp) => {
            const [start, end] = (exp.period || "").split(" - ");
            return {
              title: exp.title || "",
              startDate: start || "",
              endDate: end || "",
            };
          }),
        );
      }

      const certArr = safeJsonParse<Array<{ title?: string; date?: string }>>(
        resume.certificates,
        [],
      );
      if (certArr.length > 0) {
        setCertificates(
          certArr.map((c) => ({ title: c.title || "", date: c.date || "" })),
        );
      }

      // ✅ 여기서 학력 파싱 (핵심)
      const eduArr = safeJsonParse<Array<{ school?: string; period?: string }>>(
        resume.educations,
        [],
      );
      if (eduArr.length > 0) {
        setEducations(
          eduArr.map((e) => {
            const [start, end] = (e.period || "").split(" ~ ");
            const parsed = parseEducationSchoolText(e.school || "");
            return {
              school: parsed.school,
              type: parsed.type,
              subType: parsed.subType,
              major: parsed.major,
              startDate: start || "",
              endDate: end || "",
            };
          }),
        );
      }

      const careerArr = safeJsonParse<
        Array<{
          company?: string;
          position?: string;
          role?: string;
          period?: string;
        }>
      >(resume.careers, []);

      if (careerArr.length > 0) {
        setCareers(
          careerArr.map((c) => {
            const [start, end] = (c.period || "").split(" ~ ");
            return {
              company: c.company || "",
              position: c.position || "",
              role: c.role || "",
              startDate: start || "",
              endDate: end || "",
            };
          }),
        );
      }

      // ===== ✅ skills 로드 =====
      setSelectedSkills(splitSkills(resume.skills));

      // ===== 하위호환: structuredData는 "비어있을 때만" 채움 =====
      if (resume.structuredData) {
        try {
          const sections: ResumeSections = JSON.parse(resume.structuredData);

          // 개인정보 fallback
          if (sections.personalInfo) {
            if (!name) setName(sections.personalInfo.name || "");
            if (!selectedGender)
              setSelectedGender(sections.personalInfo.gender || "");
            if (!birthDate) setBirthDate(sections.personalInfo.birthDate || "");
            if (!email) setEmail(sections.personalInfo.email || "");
            if (!address) setAddress(sections.personalInfo.address || "");
            if (!selectedImage)
              setSelectedImage(sections.personalInfo.profileImage || null);
          }

          // 경험 fallback
          if (expArr.length === 0 && sections.experiences?.length) {
            setExperiences(
              sections.experiences.map((exp) => ({
                title: exp.title || "",
                startDate: exp.period?.split(" - ")[0] || "",
                endDate: exp.period?.split(" - ")[1] || "",
              })),
            );
          }

          // 자격증 fallback
          if (certArr.length === 0 && sections.certificates?.length) {
            setCertificates(
              sections.certificates.map((cert) => ({
                title: cert.title || "",
                date: cert.date || "",
              })),
            );
          }

          // ✅ 학력 fallback에서도 동일 파싱 적용 (핵심)
          if (eduArr.length === 0 && sections.educations?.length) {
            setEducations(
              sections.educations.map((edu) => {
                const periodParts = edu.period?.split(" ~ ") || ["", ""];
                const parsed = parseEducationSchoolText(edu.school || "");
                return {
                  school: parsed.school,
                  type: parsed.type,
                  subType: parsed.subType,
                  major: parsed.major,
                  startDate: periodParts[0] || "",
                  endDate: periodParts[1] || "",
                };
              }),
            );
          }

          // 경력 fallback
          if (careerArr.length === 0 && sections.careers?.length) {
            setCareers(
              sections.careers.map((career) => {
                const periodParts = career.period?.split(" ~ ") || ["", ""];
                return {
                  company: career.company || "",
                  position: career.position || "",
                  role: career.role || "",
                  startDate: periodParts[0] || "",
                  endDate: periodParts[1] || "",
                };
              }),
            );
          }

          // 자기소개서 텍스트 fallback
          if (sections.coverLetter) {
            if (!coverLetterTitle)
              setCoverLetterTitle(sections.coverLetter.title || "");
            if (!coverLetterContent)
              setCoverLetterContent(sections.coverLetter.content || "");
          }
        } catch (parseError) {
          console.error("structuredData 파싱 오류:", parseError);
        }
      }
    } catch (err: any) {
      console.error("이력서 데이터 로드 오류:", err);
      setError("이력서 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenderSelect = (gender: string) => setSelectedGender(gender);
  const handleJobSelect = (job: string) => setSelectedJob(job);

  const addEducation = () =>
    setEducations([
      ...educations,
      {
        school: "",
        type: "",
        subType: "",
        major: "",
        startDate: "",
        endDate: "",
      },
    ]);
  const removeEducation = (index: number) =>
    setEducations(educations.filter((_, i) => i !== index));

  const addCareer = () =>
    setCareers([
      ...careers,
      { company: "", position: "", role: "", startDate: "", endDate: "" },
    ]);
  const removeCareer = (index: number) =>
    setCareers(careers.filter((_, i) => i !== index));

  const addCertificate = () =>
    setCertificates([...certificates, { title: "", date: "" }]);
  const removeCertificate = (index: number) =>
    setCertificates(certificates.filter((_, i) => i !== index));

  const addExperience = () =>
    setExperiences([...experiences, { title: "", startDate: "", endDate: "" }]);
  const removeExperience = (index: number) =>
    setExperiences(experiences.filter((_, i) => i !== index));

  const handleResumeFileUpload = () =>
    resumeFileInputRef.current?.click();

  const removeResumeFile = (index: number) =>
    setResumeFiles(resumeFiles.filter((_, i) => i !== index));

  const handlePortfolioFileUpload = () =>
    portfolioFileInputRef.current?.click();

  const removePortfolioFile = (index: number) =>
    setPortfolioFiles(portfolioFiles.filter((_, i) => i !== index));

  const handleCoverLetterFileUpload = () =>
    coverLetterFileInputRef.current?.click();

  const removeCoverLetterFile = (index: number) =>
    setCoverLetterFiles(coverLetterFiles.filter((_, i) => i !== index));

  // ✅ 드래그 앤 드롭 핸들러
  const processFiles = (files: FileList | null, type: "resume" | "portfolio" | "coverLetter") => {
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const validFiles = newFiles.filter((file) => {
        const ext = file.name.split(".").pop()?.toLowerCase();
        const validExtensions = ["pdf", "docx"];
        const validMimeTypes = [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        
        return validExtensions.includes(ext || "") && 
               validMimeTypes.includes(file.type);
      });

      if (validFiles.length !== newFiles.length) {
        const invalidFiles = newFiles.filter(f => !validFiles.includes(f));
        alert(`다음 파일은 업로드할 수 없습니다:\n${invalidFiles.map(f => f.name).join('\n')}\n\nPDF, DOCX 파일만 업로드 가능합니다.`);
      }

      if (type === "resume") {
        setResumeFiles((prev) => [...prev, ...validFiles]);
      } else if (type === "portfolio") {
        setPortfolioFiles((prev) => [...prev, ...validFiles]);
      } else {
        setCoverLetterFiles((prev) => [...prev, ...validFiles]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent, type: "resume" | "portfolio" | "coverLetter") => {
    e.preventDefault();
    if (type === "resume") setIsResumeDragging(true);
    else if (type === "portfolio") setIsPortfolioDragging(true);
    else setIsCoverLetterDragging(true);
  };

  const handleDragLeave = (type: "resume" | "portfolio" | "coverLetter") => {
    if (type === "resume") setIsResumeDragging(false);
    else if (type === "portfolio") setIsPortfolioDragging(false);
    else setIsCoverLetterDragging(false);
  };

  const handleDrop = (e: React.DragEvent, type: "resume" | "portfolio" | "coverLetter") => {
    e.preventDefault();
    if (type === "resume") {
      setIsResumeDragging(false);
      processFiles(e.dataTransfer.files, "resume");
    } else if (type === "portfolio") {
      setIsPortfolioDragging(false);
      processFiles(e.dataTransfer.files, "portfolio");
    } else {
      setIsCoverLetterDragging(false);
      processFiles(e.dataTransfer.files, "coverLetter");
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill))
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    else setSelectedSkills([...selectedSkills, skill]);
  };
  const removeSkill = (skill: string) =>
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));

  const handleSubmit = async () => {
    if (!resumeTitle) return alert("이력서 제목을 입력해주세요.");
    if (!name) return alert("이름을 입력해주세요.");
    if (!selectedJob) return alert("직무를 선택해주세요.");
    if (!user?.userId) return alert("로그인이 필요합니다.");

    setIsLoading(true);

    try {
      const experiencesData = experiences
        .filter((e) => e.title && e.title.trim() !== "")
        .map((e) => ({
          title: e.title,
          period:
            e.startDate && e.endDate ? `${e.startDate} - ${e.endDate}` : "",
        }));

      const certificatesData = certificates
        .filter((c) => c.title && c.title.trim() !== "")
        .map((c) => ({ title: c.title, date: c.date || "" }));

      // ✅ 저장 포맷 유지(기존 그대로) — 대신 로드에서 다시 파싱해주니까 수정 화면도 정상
      const educationsData = educations
        .filter((e) => e.school && e.school.trim() !== "")
        .map((e) => {
          let schoolText = e.school;
          if (e.type) schoolText += ` ${e.type}`;
          if (e.subType) schoolText += ` - ${e.subType}`;
          if (e.major) schoolText += ` ${e.major}`;
          return {
            school: schoolText,
            period:
              e.startDate && e.endDate ? `${e.startDate} ~ ${e.endDate}` : "",
          };
        });

      const careersData = careers
        .filter((c) => c.company && c.company.trim() !== "")
        .map((c) => ({
          company: c.company,
          position: c.position || "",
          role: c.role || "",
          period:
            c.startDate && c.endDate ? `${c.startDate} ~ ${c.endDate}` : "",
        }));

      const resumeData: CreateResumeRequest = {
        title: resumeTitle,
        jobCategory: selectedJob,
        skills: selectedSkills.join(", "),
        visibility,
        resumeName: name,
        resumeGender: selectedGender,
        resumeBirthDate: birthDate,
        resumeEmail: email,
        resumePhone: phone,
        resumeAddress: address,
        resumeDetailAddress: detailAddress,
        profileImage: selectedImage || undefined,
        experiences:
          experiencesData.length > 0 ? JSON.stringify(experiencesData) : "[]",
        certificates:
          certificatesData.length > 0 ? JSON.stringify(certificatesData) : "[]",
        educations:
          educationsData.length > 0 ? JSON.stringify(educationsData) : "[]",
        careers: careersData.length > 0 ? JSON.stringify(careersData) : "[]",
        status: "COMPLETED",
      };

      let response: any;

      if (
        resumeFiles.length > 0 ||
        portfolioFiles.length > 0 ||
        coverLetterFiles.length > 0
      ) {
        if (resumeId) {
          response = await updateResumeWithFiles(
            resumeId,
            resumeData,
            user.userId,
            resumeFiles,
            portfolioFiles,
            coverLetterFiles,
          );
        } else {
          response = await createResumeWithFiles(
            resumeData,
            user.userId,
            resumeFiles,
            portfolioFiles,
            coverLetterFiles,
          );
        }
      } else {
        if (resumeId)
          response = await updateResume(resumeId, resumeData, user.userId);
        else response = await createResume(resumeData, user.userId);
      }

      if (response.resumeId) {
        alert(`이력서가 ${resumeId ? "수정" : "등록"}되었습니다!`);
        setNavigationBlocker(false, "");
        window.location.href = "/user/resume?menu=resume-sub-1";
      } else {
        setError(`이력서 ${resumeId ? "수정" : "등록"}에 실패했습니다.`);
      }
    } catch (err: any) {
      console.error("이력서 저장 오류:", err);
      setError(
        err.response?.data?.message ||
          `이력서 ${resumeId ? "수정" : "등록"} 중 오류가 발생했습니다.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("정말 취소하시겠습니까?")) {
      setNavigationBlocker(false, "");
      window.location.href = "/user/resume?menu=resume-sub-1";
    }
  };

  // availableSkills defined in constants

  return (
    <div className="px-4 py-8 mx-auto bg-white max-w-7xl">
      {/* 1. 부모 Flex 컨테이너: items-start 필수 */}
      <div className="flex items-start gap-6">
        {/* 2. 왼쪽 고정 영역 (제목 + 사이드바) */}
        {/* sticky: 고정, top-10: 상단 여백, shrink-0: 찌그러짐 방지 */}
        <div className="sticky flex flex-col gap-6 top-10 shrink-0">
          {/* 제목을 여기로 가져오세요 */}
          <h2 className="px-2 text-2xl font-bold">이력서 작성</h2>

          {/* 사이드바 컴포넌트 */}
          <LeftSidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />
        </div>

        {/* 3. 오른쪽 컨텐츠 영역 */}
        <div className="flex-1 space-y-8">
          {error && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* ===== 이력서 제목/공개설정 ===== */}
          <section className="p-8 bg-white border-2 border-gray-200 rounded-2xl">
            <h2 className="mb-6 text-2xl font-bold">이력서 제목</h2>
            <input
              type="text"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              placeholder="예: 프론트엔드 개발자 이력서"
              className="w-full p-4 mb-6 border-2 border-gray-300 rounded-lg outline-none focus:border-blue-500"
            />
          </section>

          {/* ===== 인적사항/직무/스킬/경험/자격증 ===== */}
          <section className="p-8 bg-white border-2 border-gray-200 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {resumeId ? "인적사항" : "인적사항"}
              </h2>
              <button
                onClick={handleCancel}
                className="px-6 py-2 text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                목록으로
              </button>
            </div>

            {/* 사진 업로드 */}
            <div className="mb-6">
              <div className="flex gap-4">
                <div>
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="profile-image"
                    className="flex items-center justify-center w-40 h-48 transition border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt="Profile"
                        className="object-cover w-full h-full rounded-lg"
                      />
                    ) : (
                      <span className="text-4xl text-gray-400">+</span>
                    )}
                  </label>
                </div>

                <div className="flex-1">
                  <div className="grid grid-cols-4 gap-0 mb-4 overflow-hidden border-2 border-gray-300 rounded-lg">
                    <div className="p-3 font-medium text-center border-r border-gray-300 bg-gray-50">
                      이름
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="p-3 border-r border-gray-300 outline-none"
                    />
                    <div className="p-3 font-medium text-center border-r border-gray-300 bg-gray-50">
                      성별
                    </div>
                    <select
                      value={selectedGender}
                      onChange={(e) => handleGenderSelect(e.target.value)}
                      className="p-3 bg-white outline-none cursor-pointer"
                    >
                      <option value="">선택</option>
                      <option value="MALE">남성</option>
                      <option value="FEMALE">여성</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-4 gap-0 mb-4 overflow-hidden border-2 border-gray-300 rounded-lg">
                    <div className="p-3 font-medium text-center border-r border-gray-300 bg-gray-50">
                      생년월일
                    </div>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="col-span-3 p-3 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-0 mb-4 overflow-hidden border-2 border-gray-300 rounded-lg">
                    <div className="p-3 font-medium text-center border-r border-gray-300 bg-gray-50">
                      이메일
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="col-span-3 p-3 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-0 mb-4 overflow-hidden border-2 border-gray-300 rounded-lg">
                    <div className="p-3 font-medium text-center border-r border-gray-300 bg-gray-50">
                      연락처
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="col-span-3 p-3 outline-none"
                      placeholder="010-0000-0000"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-0 overflow-hidden border-2 border-gray-300 rounded-lg">
                    <div className="flex items-center justify-center p-3 font-medium text-center border-r border-gray-300 bg-gray-50">
                      주소
                    </div>
                    <div className="col-span-3 p-3">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={address}
                          readOnly
                          placeholder="주소 찾기 버튼을 클릭하세요"
                          className="flex-1 outline-none cursor-not-allowed bg-gray-50"
                        />
                        <button
                          type="button"
                          onClick={openPostcode}
                          className="px-4 py-1 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700"
                        >
                          주소 찾기
                        </button>
                      </div>
                      <input
                        type="text"
                        value={detailAddress}
                        onChange={(e) => setDetailAddress(e.target.value)}
                        placeholder="상세 주소를 입력하세요 (예: 3층)"
                        className="w-full pt-2 mt-2 border-t border-gray-200 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 직무 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold">직무</h3>
              </div>

              <div className="grid grid-cols-6 gap-4 mb-6">
                {JOB_CATEGORIES.map((job) => (
                  <button
                    key={job}
                    onClick={() => handleJobSelect(job)}
                    className={`p-3 text-center border-2 rounded-lg cursor-pointer transition ${
                      selectedJob === job
                        ? "border-blue-500 bg-blue-50 font-semibold"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {job === "프론트엔드" ? "프론트" : job}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <h4 className="mb-3 font-semibold">스킬 선택</h4>
                <div className="p-4 overflow-y-auto border-2 border-gray-200 rounded-lg max-h-60">
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SKILLS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 rounded-full text-sm transition ${
                          selectedSkills.includes(skill)
                            ? "bg-blue-600 text-white font-semibold"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedSkills.length > 0 && (
                <div>
                  <h4 className="mb-3 font-semibold">선택된 스킬</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => removeSkill(skill)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 transition bg-blue-100 rounded-full hover:bg-blue-200"
                      >
                        <span>✕</span>
                        <span>{skill}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 경험/활동/교육 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">경험/활동/교육</h3>
                <button
                  onClick={addExperience}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  + 추가
                </button>
              </div>

              <div className="space-y-4">
                {experiences.map((experience, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-gray-300 rounded-lg"
                  >
                    <div className="mb-3">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        내용
                      </label>
                      <input
                        type="text"
                        placeholder="예: 프로젝트 1차"
                        value={experience.title}
                        onChange={(e) => {
                          const newExperiences = [...experiences];
                          newExperiences[index].title = e.target.value;
                          setExperiences(newExperiences);
                        }}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          시작일
                        </label>
                        <input
                          type="date"
                          value={experience.startDate}
                          onChange={(e) => {
                            const newExperiences = [...experiences];
                            newExperiences[index].startDate = e.target.value;
                            setExperiences(newExperiences);
                          }}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          종료일
                        </label>
                        <input
                          type="date"
                          value={experience.endDate}
                          onChange={(e) => {
                            const newExperiences = [...experiences];
                            newExperiences[index].endDate = e.target.value;
                            setExperiences(newExperiences);
                          }}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => removeExperience(index)}
                        className="px-4 py-2 text-sm font-medium text-red-600 transition border-2 border-red-300 rounded-lg hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 자격증/어학/수상 */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">자격증/어학/수상</h3>
                <button
                  onClick={addCertificate}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  + 추가
                </button>
              </div>

              <div className="space-y-3">
                {certificates.map((certificate, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-gray-300 rounded-lg"
                  >
                    <div className="mb-3">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        내용
                      </label>
                      <input
                        type="text"
                        placeholder="예: 정보처리기사 1급"
                        value={certificate.title}
                        onChange={(e) => {
                          const newCertificates = [...certificates];
                          newCertificates[index].title = e.target.value;
                          setCertificates(newCertificates);
                        }}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        취득일
                      </label>
                      <input
                        type="date"
                        value={certificate.date}
                        onChange={(e) => {
                          const newCertificates = [...certificates];
                          newCertificates[index].date = e.target.value;
                          setCertificates(newCertificates);
                        }}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => removeCertificate(index)}
                        className="px-4 py-2 text-sm font-medium text-red-600 transition border-2 border-red-300 rounded-lg hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== 학력/경력/포트폴리오/자기소개서 ===== */}
          <section className="p-8 bg-white border-2 border-gray-200 rounded-2xl">
            {/* 학력 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">학력</h3>
                <button
                  onClick={addEducation}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  + 추가
                </button>
              </div>

              <div className="space-y-4">
                {educations.map((education, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-gray-300 rounded-lg"
                  >
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          학교 이름
                        </label>
                        <input
                          type="text"
                          value={education.school}
                          onChange={(e) => {
                            const newEducations = [...educations];
                            newEducations[index].school = e.target.value;
                            setEducations(newEducations);
                          }}
                          placeholder={`예: ${
                            education.type === "고등학교"
                              ? "서울고등학교"
                              : education.type === "대학교"
                                ? "서울대학교"
                                : education.type === "대학원"
                                  ? "서울대학교 대학원"
                                  : "학교 이름을 입력하세요"
                          }`}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          학교 종류
                        </label>
                        <select
                          value={education.type}
                          onChange={(e) => {
                            const newEducations = [...educations];
                            newEducations[index].type = e.target.value;
                            newEducations[index].subType = "";
                            setEducations(newEducations);
                          }}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                        >
                          <option value="">선택</option>
                          <option value="고등학교">고등학교</option>
                          <option value="대학교">대학교</option>
                          <option value="대학원">대학원</option>
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          세부 종류
                        </label>
                        <select
                          value={education.subType}
                          onChange={(e) => {
                            const newEducations = [...educations];
                            newEducations[index].subType = e.target.value;
                            setEducations(newEducations);
                          }}
                          disabled={!education.type}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">선택</option>
                          {education.type === "고등학교" && (
                            <>
                              <option value="일반고">일반고</option>
                              <option value="특목고">특목고</option>
                              <option value="특성화고">특성화고</option>
                              <option value="마이스터고">마이스터고</option>
                              <option value="자율고">자율고</option>
                              <option value="영재고">영재고</option>
                            </>
                          )}
                          {education.type === "대학교" && (
                            <>
                              <option value="2년제">2년제</option>
                              <option value="3년제">3년제</option>
                              <option value="4년제">4년제</option>
                            </>
                          )}
                          {education.type === "대학원" && (
                            <>
                              <option value="석사">석사</option>
                              <option value="박사">박사</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        학과
                      </label>
                      <input
                        type="text"
                        placeholder="예: 컴퓨터공학과"
                        value={education.major}
                        onChange={(e) => {
                          const newEducations = [...educations];
                          newEducations[index].major = e.target.value;
                          setEducations(newEducations);
                        }}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          입학일
                        </label>
                        <input
                          type="date"
                          value={education.startDate}
                          onChange={(e) => {
                            const newEducations = [...educations];
                            newEducations[index].startDate = e.target.value;
                            setEducations(newEducations);
                          }}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          졸업일
                        </label>
                        <input
                          type="date"
                          value={education.endDate}
                          onChange={(e) => {
                            const newEducations = [...educations];
                            newEducations[index].endDate = e.target.value;
                            setEducations(newEducations);
                          }}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => removeEducation(index)}
                        className="px-4 py-2 text-sm font-medium text-red-600 transition border-2 border-red-300 rounded-lg hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 경력 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">경력</h3>
                <button
                  onClick={addCareer}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  + 추가
                </button>
              </div>

              <div className="space-y-4">
                {careers.map((career, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-gray-300 rounded-lg"
                  >
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          시작일
                        </label>
                        <input
                          type="date"
                          value={career.startDate}
                          onChange={(e) => {
                            const newCareers = [...careers];
                            newCareers[index].startDate = e.target.value;
                            setCareers(newCareers);
                          }}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          퇴사일
                        </label>
                        <input
                          type="date"
                          value={career.endDate}
                          onChange={(e) => {
                            const newCareers = [...careers];
                            newCareers[index].endDate = e.target.value;
                            setCareers(newCareers);
                          }}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          회사명
                        </label>
                        <input
                          type="text"
                          placeholder="예: 네이버"
                          value={career.company}
                          onChange={(e) => {
                            const newCareers = [...careers];
                            newCareers[index].company = e.target.value;
                            setCareers(newCareers);
                          }}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          직책
                        </label>
                        <input
                          type="text"
                          placeholder="예: 대리, 팀장"
                          value={career.position}
                          onChange={(e) => {
                            const newCareers = [...careers];
                            newCareers[index].position = e.target.value;
                            setCareers(newCareers);
                          }}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        직무
                      </label>
                      <textarea
                        placeholder="담당했던 업무 및 직무를 자세히 작성해주세요"
                        value={career.role}
                        onChange={(e) => {
                          const newCareers = [...careers];
                          newCareers[index].role = e.target.value;
                          setCareers(newCareers);
                        }}
                        rows={4}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none resize-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => removeCareer(index)}
                        className="px-4 py-2 text-sm font-medium text-red-600 transition border-2 border-red-300 rounded-lg hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            

            {/* 포트폴리오 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">포트폴리오</h3>
                <button
                  onClick={handlePortfolioFileUpload}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  + 파일 업로드
                </button>
              </div>

              <input
                type="file"
                ref={portfolioFileInputRef}
                onChange={(e) => processFiles(e.target.files, "portfolio")}
                accept=".pdf,.docx"
                multiple
                className="hidden"
              />

              <div
                onDragOver={(e) => handleDragOver(e, "portfolio")}
                onDragLeave={() => handleDragLeave("portfolio")}
                onDrop={(e) => handleDrop(e, "portfolio")}
                className={`transition-all duration-200 ${
                  isPortfolioDragging ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                {portfolioFiles.length > 0 ? (
                  <div className="space-y-3">
                    {portfolioFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white border-2 border-gray-300 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {file.name.endsWith(".pdf") ? "📄" : "📃"}
                          </span>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePortfolioFile(index);
                          }}
                          className="px-4 py-2 text-sm font-medium text-red-600 transition border-2 border-red-300 rounded-lg hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-8 text-center border-2 border-gray-300 border-dashed rounded-lg ${isPortfolioDragging ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <p className="text-gray-500">
                      포트폴리오 파일을 업로드해주세요 (PDF, DOCX)
                    </p>
                    <p className="mt-1 text-xs text-blue-500">드래그 앤 드롭 가능</p>
                  </div>
                )}
              </div>
            </div>

            {/* 자기소개서 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">자기소개서</h3>
                <button
                  onClick={handleCoverLetterFileUpload}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  + 파일 업로드
                </button>
              </div>

              <input
                type="file"
                ref={coverLetterFileInputRef}
                onChange={(e) => processFiles(e.target.files, "coverLetter")}
                accept=".pdf,.docx"
                multiple
                className="hidden"
              />

              <div
                onDragOver={(e) => handleDragOver(e, "coverLetter")}
                onDragLeave={() => handleDragLeave("coverLetter")}
                onDrop={(e) => handleDrop(e, "coverLetter")}
                className={`transition-all duration-200 rounded-lg mb-4 ${
                  isCoverLetterDragging ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                {coverLetterFiles.length > 0 ? (
                  <div className="space-y-3">
                    {coverLetterFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white border-2 border-gray-300 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {file.name.endsWith(".pdf") ? "📄" : "📃"}
                          </span>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCoverLetterFile(index);
                          }}
                          className="px-4 py-2 text-sm font-medium text-red-600 transition border-2 border-red-300 rounded-lg hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-8 text-center border-2 border-gray-300 border-dashed rounded-lg ${isCoverLetterDragging ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <p className="text-gray-500">
                      자기소개서 파일을 업로드해주세요 (PDF, DOCX)
                    </p>
                    <p className="mt-1 text-xs text-blue-500">드래그 앤 드롭 가능</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="p-4 border-2 border-gray-300 rounded-lg">
                  <input
                    type="text"
                    value={coverLetterTitle}
                    onChange={(e) => setCoverLetterTitle(e.target.value)}
                    placeholder="자소서 제목"
                    className="w-full mb-2 font-medium outline-none"
                  />
                </div>
                <textarea
                  value={coverLetterContent}
                  onChange={(e) => setCoverLetterContent(e.target.value)}
                  placeholder="내용입력"
                  rows={6}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex items-end justify-between gap-10">
              <div className="flex-1">
                <h3 className="mb-4 text-lg font-bold">공개 설정</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setVisibility("PUBLIC")}
                    className={`flex-1 p-4 text-center border-2 rounded-lg transition ${
                      visibility === "PUBLIC"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="mb-2 text-2xl">🌐</div>
                    <div className="font-bold">공개</div>
                    <div className="mt-1 text-sm text-gray-600">
                      기업 인재 검색에 표시됩니다
                    </div>
                  </button>

                  <button
                    onClick={() => setVisibility("PRIVATE")}
                    className={`flex-1 p-4 text-center border-2 rounded-lg transition ${
                      visibility === "PRIVATE"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="mb-2 text-2xl">🔒</div>
                    <div className="font-bold">비공개</div>
                    <div className="mt-1 text-sm text-gray-600">
                      나만 볼 수 있습니다
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-end gap-6 mt-10">
                <button
                  onClick={handleCancel}
                  className="px-8 py-3 font-semibold text-gray-700 transition bg-gray-200 rounded-full hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 py-3 font-semibold text-white transition bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading
                    ? resumeId
                      ? "수정 중..."
                      : "등록 중..."
                    : resumeId
                      ? "수정"
                      : "등록"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
