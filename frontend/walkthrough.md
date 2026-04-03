# Refactoring Report: Job Title & Skills Update

## Summary

Successfully refactored the application to replace "Data Analyst" with **"AI/LLM Engineer"** and added new AI-specific skills.

## Changes Implemented

### 1. Job Title Update (Data Analyst -> AI/LLM Engineer)

Replaced all hardcoded job category lists with a unified `JOB_CATEGORIES` constant in:

- `ResumeFormPage.tsx`
- `TalentSearchPage.tsx`
- `JobPostingCreatePage.tsx`
- `JobPostingEditPage.tsx`
- `ApplicantManagementPage.tsx`
- `JobSearchFilter.tsx`
- `CompanySearchFilter.tsx`

### 2. Skill Set Expansion

Updated `AVAILABLE_SKILLS` constant to include:

- **Frameworks**: PyTorch, TensorFlow, LangChain, Hugging Face
- **Concepts**: Vector DB, RAG, Fine-tuning, LLMOps
- **Tools**: OpenAI API, Weights & Biases

All forms (Resume, Job Posting) now automatically reflect these new skills.

### 3. Refactoring

- Removed scattered hardcoded lists of job categories and skills.
- Centralized management into `constants/jobConstants.ts`.
- Improved maintainability: Future updates to job titles or skills only need to be done in one place.

## Verification

- Verified that "데이터 분석가" no longer exists in the codebase.
- Verified that all key pages import and use the new constants.
