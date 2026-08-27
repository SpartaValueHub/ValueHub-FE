import { describe, expect, it } from "vitest";

import { classifyBumpFailMessage } from "@/lib/product-posts/bump-error";

describe("classifyBumpFailMessage", () => {
  it("classifies cooldown with minutes", () => {
    const view = classifyBumpFailMessage(
      "끌올 쿨다운 중입니다. 90분 후 다시 시도해주세요."
    );
    expect(view.kind).toBe("cooldown");
    expect(view.remainingLabel).toBe("1시간 30분 후");
  });

  it("classifies daily limit", () => {
    const view = classifyBumpFailMessage("일일 끌올 한도를 초과했습니다.");
    expect(view.kind).toBe("daily_limit");
  });
});
