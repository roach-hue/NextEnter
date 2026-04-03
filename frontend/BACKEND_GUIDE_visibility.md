# 백엔드 수정 가이드: visibility 필드 추가

## 문제 상황
프론트엔드에서 `visibility: "PUBLIC"` 또는 `"PRIVATE"`를 전송하고 있지만, 백엔드에서 이를 저장하지 않아 항상 PRIVATE로 표시됩니다.

## 필요한 수정 사항

### 1. Resume 엔티티에 visibility 필드 추가

```java
@Entity
@Table(name = "resumes")
public class Resume {
    // ... 기존 필드들
    
    @Column(nullable = false)
    private String visibility = "PUBLIC"; // 기본값: 공개
    
    // Getter & Setter
    public String getVisibility() {
        return visibility;
    }
    
    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }
}
```

### 2. ResumeDTO에 visibility 필드 추가

```java
public class ResumeDTO {
    // ... 기존 필드들
    
    private String visibility;
    
    // Getter & Setter
    public String getVisibility() {
        return visibility;
    }
    
    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }
}
```

### 3. Resume 생성/수정 시 visibility 저장

#### ResumeService.java

```java
// 이력서 생성
public ResumeResponseDTO createResume(ResumeCreateDTO dto, Long userId) {
    Resume resume = new Resume();
    resume.setTitle(dto.getTitle());
    resume.setJobCategory(dto.getJobCategory());
    resume.setVisibility(dto.getVisibility() != null ? dto.getVisibility() : "PUBLIC");
    // ... 나머지 필드 설정
    
    Resume savedResume = resumeRepository.save(resume);
    return convertToDTO(savedResume);
}

// 이력서 수정
public ResumeResponseDTO updateResume(Long resumeId, ResumeCreateDTO dto, Long userId) {
    Resume resume = resumeRepository.findById(resumeId)
        .orElseThrow(() -> new RuntimeException("이력서를 찾을 수 없습니다"));
    
    resume.setTitle(dto.getTitle());
    resume.setJobCategory(dto.getJobCategory());
    
    // ✅ visibility 업데이트 추가
    if (dto.getVisibility() != null) {
        resume.setVisibility(dto.getVisibility());
    }
    
    // ... 나머지 필드 업데이트
    
    Resume updatedResume = resumeRepository.save(resume);
    return convertToDTO(updatedResume);
}
```

### 4. 인재 검색 API 구현 (중요!)

기업이 공개된 이력서만 검색할 수 있도록 새 엔드포인트를 구현해야 합니다.

#### ResumeRepository.java

```java
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    
    // 공개된 이력서만 검색
    @Query("SELECT r FROM Resume r WHERE r.visibility = 'PUBLIC' " +
           "AND (:jobCategory IS NULL OR r.jobCategory = :jobCategory) " +
           "AND (:keyword IS NULL OR r.title LIKE %:keyword% OR r.structuredData LIKE %:keyword%)")
    Page<Resume> searchPublicResumes(
        @Param("jobCategory") String jobCategory,
        @Param("keyword") String keyword,
        Pageable pageable
    );
}
```

#### TalentSearchDTO.java (새로 생성)

```java
public class TalentSearchDTO {
    private Long resumeId;
    private Long userId;
    private String name;           // 마스킹된 이름 (예: 김**)
    private String jobCategory;
    private List<String> skills;
    private String location;
    private Integer experienceYears;
    private String salaryRange;
    private Double matchScore;     // 매칭 점수 (0-100)
    private Boolean isAvailable;   // 연락 가능 여부
    private Integer viewCount;
    
    // Getters & Setters
}
```

#### ResumeController.java

```java
@RestController
@RequestMapping("/api/resume")
public class ResumeController {
    
    @Autowired
    private ResumeService resumeService;
    
    // 공개된 이력서 검색 (기업용)
    @GetMapping("/search")
    public ResponseEntity<Page<TalentSearchDTO>> searchPublicResumes(
        @RequestParam(required = false) String jobCategory,
        @RequestParam(required = false) String keyword,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TalentSearchDTO> results = resumeService.searchPublicResumes(
            jobCategory, keyword, pageable
        );
        return ResponseEntity.ok(results);
    }
}
```

#### ResumeService.java

```java
public Page<TalentSearchDTO> searchPublicResumes(
    String jobCategory, 
    String keyword, 
    Pageable pageable
) {
    Page<Resume> resumes = resumeRepository.searchPublicResumes(
        jobCategory, keyword, pageable
    );
    
    return resumes.map(this::convertToTalentSearchDTO);
}

private TalentSearchDTO convertToTalentSearchDTO(Resume resume) {
    TalentSearchDTO dto = new TalentSearchDTO();
    dto.setResumeId(resume.getId());
    dto.setUserId(resume.getUserId());
    
    // 이름 마스킹 (김철수 -> 김**)
    dto.setName(maskName(resume.getName()));
    
    dto.setJobCategory(resume.getJobCategory());
    dto.setSkills(parseSkills(resume.getSkills()));
    dto.setLocation(extractLocation(resume.getStructuredData()));
    dto.setExperienceYears(calculateExperience(resume.getStructuredData()));
    dto.setSalaryRange(extractSalaryRange(resume.getStructuredData()));
    dto.setMatchScore(calculateMatchScore(resume)); // 간단한 매칭 점수
    dto.setIsAvailable(resume.getVisibility().equals("PUBLIC"));
    dto.setViewCount(resume.getViewCount());
    
    return dto;
}

private String maskName(String name) {
    if (name == null || name.length() < 2) return "**";
    return name.substring(0, 1) + "**";
}
```

### 5. DB 마이그레이션 (필요시)

기존 이력서 데이터가 있다면 visibility 컬럼을 추가하고 기본값을 설정해야 합니다.

```sql
-- MySQL
ALTER TABLE resumes 
ADD COLUMN visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC';

-- PostgreSQL
ALTER TABLE resumes 
ADD COLUMN visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC';
```

## 테스트 방법

### 1. 이력서 생성 테스트
```bash
POST /api/resume
Headers: userId: 1
Body: {
  "title": "테스트 이력서",
  "jobCategory": "Backend",
  "visibility": "PUBLIC",
  "sections": "{...}",
  "status": "COMPLETED"
}
```

### 2. 이력서 조회 테스트
```bash
GET /api/resume/list
Headers: userId: 1

# 응답에서 visibility 필드 확인
```

### 3. 인재 검색 테스트
```bash
GET /api/resume/search?jobCategory=Backend&page=0&size=20

# 공개된 이력서만 반환되는지 확인
```

## 프론트엔드 확인 사항

백엔드 수정 후 다음을 확인하세요:

1. **브라우저 F12 → Console 확인**
   - `✅ [API] 이력서 수정 응답:` 에서 visibility가 제대로 저장되었는지 확인
   - `📄 [API] 이력서 목록:` 에서 각 이력서의 visibility 확인
   - `✅ [인재검색] 검색 결과:` 에서 공개된 이력서만 나오는지 확인

2. **UI 확인**
   - 개인 페이지 → 이력서 목록에서 "공개" 배지 표시 확인
   - 기업 페이지 → 인재 검색에서 공개된 이력서만 표시 확인

## 체크리스트

- [ ] Resume 엔티티에 visibility 필드 추가
- [ ] ResumeDTO에 visibility 필드 추가
- [ ] 이력서 생성 시 visibility 저장
- [ ] 이력서 수정 시 visibility 업데이트
- [ ] DB에 visibility 컬럼 추가 (마이그레이션)
- [ ] /api/resume/search 엔드포인트 구현
- [ ] TalentSearchDTO 생성
- [ ] 이름 마스킹 기능 구현
- [ ] 테스트 완료
- [ ] 프론트엔드에서 정상 작동 확인

## 참고 사항

- **visibility 값**: "PUBLIC" (공개) 또는 "PRIVATE" (비공개)
- **기본값**: PUBLIC (새로운 이력서는 기본적으로 공개)
- **보안**: 비공개 이력서는 절대로 검색 결과에 포함되면 안 됨
- **이름 마스킹**: 개인정보 보호를 위해 이름은 마스킹 처리 (예: 김철수 → 김**)
