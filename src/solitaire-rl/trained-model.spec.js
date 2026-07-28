// @vitest-environment node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { makeTrainedAgentFromModelPath } from "./rl.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelDir = path.resolve(__dirname, "../../public/model");
const modelPath = "/solitaire-rl-web/model/model.json";

const isTfjsNodeBackendNotice = (args) =>
  args.some(
    (arg) =>
      typeof arg === "string" &&
      arg.includes("running TensorFlow.js in Node.js")
  );

describe("trained model", () => {
  /** @type {import("vitest").MockInstance} */
  let warnSpy;

  beforeAll(() => {
    const originalWarn = console.warn.bind(console);
    warnSpy = vi.spyOn(console, "warn").mockImplementation((...args) => {
      if (isTfjsNodeBackendNotice(args)) {
        return;
      }
      originalWarn(...args);
    });

    vi.stubGlobal("fetch", async (url) => {
      const requestUrl = url.toString();
      if (requestUrl.includes("model.json")) {
        return new Response(readFileSync(path.join(modelDir, "model.json")));
      }
      if (requestUrl.includes("weights.bin")) {
        return new Response(readFileSync(path.join(modelDir, "weights.bin")));
      }
      throw new Error(`Unexpected fetch: ${requestUrl}`);
    });
  });

  afterAll(() => {
    warnSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it("should solve the puzzle with a greedy policy", async () => {
    const agent = await makeTrainedAgentFromModelPath(modelPath);

    while (!agent.done) {
      agent.step();
    }

    expect(agent.solved).toBe(true);
  });
});
