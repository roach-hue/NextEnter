# NextEnter AI - AI 매칭 엔진 서버

> **NEXT ENTER - AI 기반 매칭 구인구직 플랫폼 (2026.01 - 2026.02)**

## 소개

구직자의 이력서를 분석하고, 기업 공고와의 매칭 점수를 산출하는 AI 엔진 서버입니다.
FastAPI 기반으로 구축되었으며, 이력서 파싱, AI 매칭, AI 모의면접 기능을 제공합니다.

## 주요 기능

- **이력서 분석 및 매칭 엔진** : 이력서와 채용공고 간 AI 기반 매칭 점수 산출
- **AI 모의면접 엔진** : 직무/이력서 기반 맞춤형 면접 질문 생성 및 답변 평가
- **파일 파싱** : PDF, DOCX 등 이력서 파일 파싱 지원

## 사용 기술

- Python, FastAPI, Uvicorn
- Google Generative AI (Gemini)
- Sentence Transformers, scikit-learn
- MySQL

## 프로젝트 구조

```
python/
├── app/
│   ├── api/          # API 라우터
│   ├── core/         # 핵심 설정
│   ├── data/         # 데이터
│   ├── schemas/      # Pydantic 스키마
│   ├── services/     # AI 엔진 (매칭, 면접, 파일 파싱)
│   └── main.py       # FastAPI 앱 엔트리포인트
├── tests/            # 테스트
├── scripts/          # 유틸리티 스크립트
└── requirements.txt
```

## 실행 방법

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
