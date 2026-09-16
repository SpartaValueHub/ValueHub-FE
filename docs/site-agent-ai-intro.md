# Site Agent AI 프로젝트 개요

> 현장 근무자용 AI 에이전트 RAG 서비스(FastAPI) 현재 구현 상태를 구조화한 문서입니다.  
> 원 저장소: [p4rksk/Site_agent_ai](https://github.com/p4rksk/Site_agent_ai) (README 없음) · 코드 스냅샷 (2026-05-01)

---

## 1. 프로젝트 요약

| 항목              | 내용                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| **프로젝트명**    | site-agent-ai                                                               |
| **역할**          | 현장 근무자용 AI 에이전트 — 현장 PDF 질의응답 (텍스트 + 도면/사진)          |
| **스택**          | FastAPI 0.135 · Uvicorn · LangChain 1.2 · FAISS · Google Gemini             |
| **인증**          | 없음 (CORS `*`)                                                             |
| **패키지 매니저** | pip (`requirements.txt`)                                                    |
| **백엔드 연동**   | Site_agent `POST /upload-pdf` · Gemini (`GOOGLE_API_KEY`)                   |

---

## 2. 디렉터리 구조

```
Site_agent_ai/
├── app/
│   ├── main.py            # FastAPI · CORS · /upload-pdf · /ask · /download
│   └── rag.py             # PDF lazy_load → 텍스트/이미지 청크 → FAISS
├── requirements.txt       # FastAPI, LangChain, FAISS, google-genai, PyMuPDF
├── test.pdf               # RAG 테스트 PDF
└── test_image.jpeg        # 이미지 OCR 테스트 샘플
```

### 데이터 플로우 (3-Layer)

```
FastAPI Route (/upload-pdf, /ask)
  → create_rag_chain / retriever     (페이지 단위 lazy_load · 유사도 검색)
  → FAISS + ChatGoogleGenerativeAI
  → pdf_url / GOOGLE_API_KEY
```

- **Route**: `site_id`별 인메모리 `rag_chains` 보관
- **RAG**: `PyMuPDFLoader.lazy_load()`로 페이지별 텍스트 + 이미지 OCR
- **검색**: `similarity_score_threshold` (`score_threshold=0.5`, `k=3`)

---

## 3. 라우팅 & 레이아웃

### 페이지 라우트

이 저장소는 API 서버입니다. UI는 프론트(`site-agent-front`)에서 FastAPI를 직접 호출합니다.

| 경로                            | 레이아웃            | 설명             | BE 연동                  |
| ------------------------------- | ------------------- | ---------------- | ------------------------ |
| `/docs`                         | FastAPI OpenAPI     | Swagger UI       | ❌                       |
| `/redoc`                        | FastAPI ReDoc       | ReDoc            | ❌                       |

### API Route (BFF)

| 경로                      | 메서드 | 역할                                    |
| ------------------------- | ------ | --------------------------------------- |
| `/`                       | GET    | 헬스 체크 (`{ "status": "ok" }`)        |
| `/upload-pdf`             | POST   | `{ site_id, pdf_url }` → RAG 체인 생성  |
| `/ask`                    | POST   | `{ site_id, question }` → answer + sources |
| `/download/{filename}`    | GET    | 로컬 `data/{filename}` PDF 다운로드     |

### 레이아웃 구조

```
FastAPI app
├── CORSMiddleware (allow_origins=["*"])
├── rag_chains[site_id] = { retriever, llm, prompt }
└── create_rag_chain(pdf_url)
    ├── lazy_load 텍스트 청크 (PyMuPDFLoader, 페이지 단위)
    └── 이미지 청크 (Gemini Vision OCR)
```

### 라우트 보호

- JWT·API 키 검증 없음. 네트워크/게이트웨이에서 막아야 함
- CORS: 전 출처 허용 (`allow_methods/headers="*"`)
- `.env`의 `GOOGLE_API_KEY`만 서버에서 사용 (`python-dotenv`)

---

## 4. 구현된 기능

개발 과정에서 PDF에 포함된 도면이나 사진도 답변에 활용할 수 있도록 이미지 분석 기능을 추가했습니다. 처음에는 PDF 전체를 한 번에 메모리에 올린 뒤 OCR을 호출하는 구조였고, 이 방식에서 과부하가 발생했습니다.

이를 해결하기 위해 LangChain 공식 문서를 찾아 학습하고 전체 코드를 LangChain 기반으로 리팩토링했습니다. 그 과정에서 `load`는 PDF 전체 페이지를 한 번에 메모리에 올리는 방식이고, `lazy_load`는 한 페이지씩 순차적으로 처리하는 방식입니다.

`load`를 적용했을 때는 페이지마다 OCR이 호출되는 구조에서 동일한 메모리 과부하가 다시 발생했습니다. 이를 계기로 `lazy_load`로 전환하고 페이지별 처리 구조를 적용해 메모리 사용량을 줄이고 안정적으로 동작하도록 개선했습니다.

| 방식          | 동작                                         | 결과                    |
| ------------- | -------------------------------------------- | ----------------------- |
| `load`        | PDF 전체 페이지를 한 번에 메모리에 적재      | 페이지별 OCR 시 과부하  |
| `lazy_load`   | 한 페이지씩 순차 처리                        | 메모리 감소, 안정 동작  |
