import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as sandcastle from "@ai-hero/sandcastle";

export const outputDir = (): string => process.env.OUTPUT_DIR ?? "/tmp";

export const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
};

export const writeJson = (filename: string, value: unknown): void => {
  fs.mkdirSync(outputDir(), { recursive: true });
  fs.writeFileSync(
    path.join(outputDir(), filename),
    JSON.stringify(value, null, 2)
  );
};

// Keep the gateway configuration and Codex sessions separate from any local
// Codex login. The factory uses no-sandbox, so Sandcastle must look for
// sessions in the same directory where Codex writes them.
export const agent = () => {
  const apiKey = required("AI_GATEWAY_API_KEY");
  const codexHome = fs.mkdtempSync(path.join(os.tmpdir(), "factory-codex-"));
  const sessions = path.join(codexHome, "sessions");
  fs.writeFileSync(
    path.join(codexHome, "config.toml"),
    `model_provider = "vercel"

[model_providers.vercel]
name = "Vercel AI Gateway"
base_url = "https://ai-gateway.vercel.sh/codex/v1"
env_key = "AI_GATEWAY_API_KEY"
wire_api = "responses"
`
  );
  process.once("exit", () =>
    fs.rmSync(codexHome, { recursive: true, force: true })
  );

  return sandcastle.codex("openai/gpt-6.1-terra", {
    env: { AI_GATEWAY_API_KEY: apiKey, CODEX_HOME: codexHome },
    sessionStorage: {
      hostSessionsDir: sessions,
      sandboxSessionsDir: sessions,
    },
  });
};
