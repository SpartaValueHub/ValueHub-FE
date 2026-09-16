# Site Agent AI 프로젝트 개요

> 현장 근무자용 AI 에이전트 **RAG 서비스**(FastAPI). 현장 PDF를 벡터로 인덱싱하고, 문서 근거 기반 질문에 답합니다.  
> 원 저장소: [p4rksk/Site_agent_ai](https://github.com/p4rksk/Site_agent_ai) · 기본 브랜치 `master` · GitHub 설명: *현장 근무자들을 위한 AI 에이전트*  
> **GitHub README는 없음** — `app/main.py`, `app/rag.py`, `requirements.txt` 기준으로 정리했습니다.  
> 최종 갱신 기준: GitHub `master` 스냅샷 (2026-05-01, 커밋 `5f33b53` 유사도 임계값 조정)

---

## 1. 프로젝트 요약

| 항목 | 내용 |
| --- | --- |
| **프로젝트명** | Site_agent_ai |
| **역할** | 현장 안전/작업 PDF RAG — 업로드·질문·출처(페이지) 반환 |
| **스택** | FastAPI 0.135 · Uvicorn · LangChain 1.2 · LangGraph · FAISS · Google Gemini |
| **LLM** | `gemini-2.5-flash` (답변 + PDF 이미지 OCR) |
| **임베딩** | `gemini-embedding-001` (`GoogleGenerativeAIEmbeddings`) |
| **벡터 DB** | FAISS 인메모리 (`site_id`별 `rag_chains` 딕셔너리) |
| **문서 로더** | PyMuPDF 텍스트 + Gemini Vision 이미지 텍스트 추출 |
| **인증** | 없음 (CORS `*`). 호출 주체는 Spring 백엔드 / 프론트 |
| **백엔드 연동** | Site_agent가 현장 PDF 수정 시 `POST /upload-pdf` 호출 |

---

## 2. 디렉터리 구조

```
Site_agent_ai/
├── app/
│   ├── main.py          # FastAPI 앱 · CORS · /upload-pdf · /ask · /download
│   └── rag.py           # PDF 다운로드 → 청크 → 이미지 OCR → FAISS → retriever
├── requirements.txt     # FastAPI, LangChain, FAISS, google-genai, PyMuPDF 등
├── test.pdf             # RAG 테스트용 PDF
├── test_image.jpeg      # 이미지 OCR 테스트 샘플
└── .gitignore           # venv, .env, __pycache__
```

원 저장소에는 Dockerfile·README·테스트 코드가 없습니다.

### 데이터 플로우

```
Spring (Site_agent)
  PUT /admin/sites/{id}  (PDF 첨부)
    → Supabase 공개 URL
    → POST {FASTAPI_URL}/upload-pdf  { site_id, pdf_url }

프론트 / 클라이언트
  POST /ask  { site_id, question }
    → retriever (유사도 임계값 0.5, k=3)
    → Gemini 답변 + sources[{ page, file, content }]
```

RAG 파이프라인 (`create_rag_chain`):

```
pdf_url (HTTP GET)
  → 임시 PDF 파일
  → PyMuPDFLoader(page) + RecursiveCharacterTextSplitter(1000 / overlap 100)
  → extract_images_from_pdf (fitz + Gemini Vision)
  → FAISS.from_documents
  → retriever: similarity_score_threshold, score_threshold=0.5, k=3
  → ChatPromptTemplate (문서에 없으면 "찾을 수 없습니다")
```

- 인덱스는 **프로세스 메모리**에만 존재합니다. 재시작 시 `POST /upload-pdf`를 다시 호출해야 합니다.
- 문서에 답이 없거나 Gemini가 3회 실패하면 `sources`는 빈 배열입니다.

---

## 3. 라우팅 & API

### 페이지 라우트

이 저장소는 UI가 없는 API 서버입니다. FastAPI 기본 문서: `/docs` (OpenAPI), `/redoc`.

### API Route

| 경로 | 메서드 | 요청 | 응답 | 설명 |
| --- | --- | --- | --- | --- |
| `/` | GET | — | `{ "status": "ok" }` | 헬스 체크 |
| `/upload-pdf` | POST | `{ site_id: int, pdf_url: str }` | `{ "message": "업로드 완료. 질문할 수 있어요!" }` | URL에서 PDF를 받아 해당 `site_id` RAG 체인 생성 |
| `/ask` | POST | `{ site_id: int, question: str }` | `{ answer, sources }` 또는 `{ error }` | 현장 문서 질문. 미등록 시 `"등록된 PDF가 없습니다."` |
| `/download/{filename}` | GET | path `filename` | PDF 파일 또는 에러 | 로컬 `data/{filename}` 다운로드 (이 레포에는 `data/` 없음) |

`/ask` 성공 시 `sources` 항목:

| 필드 | 의미 |
| --- | --- |
| `page` | PDF 페이지 (LangChain 0-based + 1) |
| `file` | 소스 파일 basename |
| `content` | 검색된 청크 본문 |

Gemini 호출은 최대 3회 재시도(2초 간격). 모두 실패하면 안내 문구만 반환합니다.

### 레이아웃 구조

```
FastAPI app
├── CORSMiddleware (allow_origins=["*"])
├── rag_chains: dict[site_id] = { retriever, llm, prompt }
└── create_rag_chain(pdf_url)
     ├── 텍스트 청크 (PyMuPDF)
     └── 이미지 청크 (Gemini Vision OCR)
```

### 라우트 보호

- JWT·API 키 검증 **없음**. 네트워크 접근 제어 또는 게이트웨이에서 막아야 합니다.
- CORS는 전 출처 허용 (`allow_methods/headers="*"`).
- `.env`의 `GOOGLE_API_KEY`만 서버 로컬에서 사용 (`python-dotenv`).

---

## 4. 구현된 기능

| 기능 | 상태 | 구현 위치 |
| --- | --- | --- |
| PDF URL 인덱싱 | 완료 | `POST /upload-pdf` → `create_rag_chain` |
| 현장별 RAG 질문 | 완료 | `POST /ask`, `site_id` 키 |
| 텍스트 PDF 청크 | 완료 | `PyMuPDFLoader` + splitter |
| PDF 내 이미지 OCR | 완료 | `extract_images_from_pdf` (Gemini Vision) |
| 유사도 필터 | 완료 | `score_threshold=0.5`, `k=3` |
| 출처 페이지 반환 | 완료 | `sources` (문서에 답 없으면 빈 배열) |
| Gemini 과부하 재시도 | 완료 | 3회 / 2초 |
| 로컬 PDF 다운로드 | 부분 | `/download/{filename}` — `data/` 디렉터리 전제 |
| 디스크 벡터 영속화 | 미구현 | 재시작 시 인덱스 소실 |
| 인증 / rate limit | 미구현 | 공개 API |

### Site_agent 내장 사본과의 차이

[Site_agent](https://github.com/p4rksk/Site_agent) `app/rag.py`는 이 레포와 **다른 RAG 구현**입니다.

| 항목 | Site_agent_ai (이 저장소) | Site_agent `app/rag.py` |
| --- | --- | --- |
| 이미지 처리 | `fitz` + Gemini Vision 수동 OCR | `LLMImageBlobParser` (LangChain) |
| 검색 임계값 | `0.5`, `k=3` | `0.6`, `k=2` |
| 임시파일 삭제 | `try/except`로 unlink | `finally`에서 unlink |

운영 RAG는 **이 저장소**를 기준으로 보는 것이 맞습니다. Spring은 `FASTAPI_URL`로 이 서비스를 호출합니다.

---

## 5. 환경 변수 (주요)

| 변수 | 용도 | 노출 |
| --- | --- | --- |
| `GOOGLE_API_KEY` | Gemini 임베딩·채팅·Vision | 서버 `.env` (커밋 금지) |

그 외 앱 설정 파일은 없습니다. 포트는 Uvicorn 실행 인자로 정합니다.

---

## 6. 로컬 실행

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
echo 'GOOGLE_API_KEY=...' > .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

동작 확인:

```bash
curl http://localhost:8000/
# {"status":"ok"}

curl -X POST http://localhost:8000/upload-pdf \
  -H 'Content-Type: application/json' \
  -d '{"site_id":1,"pdf_url":"https://example.com/safety.pdf"}'

curl -X POST http://localhost:8000/ask \
  -H 'Content-Type: application/json' \
  -d '{"site_id":1,"question":"안전모 착용 기준이 어떻게 되나요?"}'
```

의존성 하이라이트: `fastapi`, `uvicorn`, `langchain`, `langchain-google-genai`, `langchain-community`, `faiss-cpu`, `PyMuPDF`, `google-genai`, `python-dotenv`.

---

## 7. 관련 저장소

| 저장소 | 역할 |
| --- | --- |
| [p4rksk/Site_agent_ai](https://github.com/p4rksk/Site_agent_ai) | 이 문서의 대상 (RAG FastAPI) |
| [p4rksk/Site_agent](https://github.com/p4rksk/Site_agent) | Spring 백엔드 — [site-agent-intro.md](./site-agent-intro.md) |
| `site-agent-front` (Vercel) | 대화 UI. CORS는 AI 서버에서 `*` |
