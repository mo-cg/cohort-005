import * as fs from "node:fs";
import * as path from "node:path";
import { expect, it, vi } from "vitest";
import { agent } from "./common";

it("finds a Codex session written in the no-sandbox home for resumption", async () => {
  vi.stubEnv("AI_GATEWAY_API_KEY", "test-key");
  const provider = agent();
  const codexHome = provider.env.CODEX_HOME;
  const sessionDir = path.join(codexHome, "sessions", "2026", "11", "19");
  const sessionId = "test-session";
  try {
    fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(
      path.join(sessionDir, `rollout-test-${sessionId}.jsonl`),
      "{}"
    );
    expect(
      await provider.sessionStorage.existsOnHost(process.cwd(), sessionId)
    ).toBe(true);
  } finally {
    fs.rmSync(codexHome, { recursive: true, force: true });
    vi.unstubAllEnvs();
  }
});
