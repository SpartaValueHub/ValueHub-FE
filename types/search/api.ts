/**
 * Product-Post-Service 검색어 API DTO (lib/api 전용).
 * BE SearchTermsResponseVo 와 1:1 — { terms: string[] }
 */

export interface ApiSearchTermsResponse {
  terms: string[];
}
