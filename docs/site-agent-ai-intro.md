# Site Agent AI 프로젝트 개요

> 현장 근무자용 AI 에이전트 RAG 서비스(FastAPI) 현재 구현 상태를 구조화한 문서입니다.  
> 원 저장소: [p4rksk/Site_agent_ai](https://github.com/p4rksk/Site_agent_ai) (README 없음, 설명: 현장 근무자들을 위한 AI 에이전트) · 코드 스냅샷 (2026-05-01)

---

## 1. 프로젝트 요약

| 항목              | 내용                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| **프로젝트명**    | site-agent-ai                                                               |
| **역할**          | 현장 PDF RAG (인덱싱·질문·출처 페이지 반환)                                 |
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
│   └── rag.py             # PDF 로드 → 텍스트/이미지 청크 → FAISS → retriever
├── requirements.txt       # FastAPI, LangChain, FAISS, google-genai, PyMuPDF
├── test.pdf               # RAG 테스트 PDF
└── test_image.jpeg        # 이미지 OCR 테스트 샘플
```

### 데이터 플로우 (3-Layer)

```
FastAPI Route (/upload-pdf, /ask)
  → create_rag_chain / retriever     (청크 · 유사도 검색)
  → FAISS + ChatGoogleGenerativeAI
  → pdf_url / GOOGLE_API_KEY
```

- **Route**: `site_id`별 인메모리 `rag_chains` 보관
- **RAG**: PyMuPDF 텍스트 + Gemini Vision 이미지 OCR → splitter(1000/100)
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

`/ask` `sources`: `{ page, file, content }`. 미등록 `site_id`는 `"등록된 PDF가 없습니다."`  
Gemini는 최대 3회 재시도(2초). 문서에 없으면 `sources` 빈 배열.

### 레이아웃 구조

```
FastAPI app
├── CORSMiddleware (allow_origins=["*"])
├── rag_chains[site_id] = { retriever, llm, prompt }
└── create_rag_chain(pdf_url)
    ├── 텍스트 청크 (PyMuPDFLoader)
    └── 이미지 청크 (Gemini Vision OCR)
```

인덱스는 프로세스 메모리만 사용합니다. 재시작 후 `POST /upload-pdf`를 다시 호출해야 합니다.

### 라우트 보호

- JWT·API 키 검증 없음. 네트워크/게이트웨이에서 막아야 함
- CORS: 전 출처 허용 (`allow_methods/headers="*"`)
- `.env`의 `GOOGLE_API_KEY`만 서버에서 사용 (`python-dotenv`)
