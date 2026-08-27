import { describe, expect, it } from "vitest";

import { pickDocumentsFieldError } from "@/lib/product-posts/pick-documents-field-error";

describe("pickDocumentsFieldError", () => {
  it("returns documents field message", () => {
    expect(
      pickDocumentsFieldError({
        documents: ["첨부서류를 1장 이상 등록해 주세요."],
      })
    ).toBe("첨부서류를 1장 이상 등록해 주세요.");
  });

  it("returns nested documents key message", () => {
    expect(
      pickDocumentsFieldError({
        "documents[0].documentType": ["지원하지 않는 서류 유형입니다."],
      })
    ).toBe("지원하지 않는 서류 유형입니다.");
  });
});
