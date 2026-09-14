import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("Wasal server", () => {
  it("returns healthy status", async () => {
    const app = createApp();

    const response = await app.request("/health");

    expect(response.status).toBe(200);

    expect(await response.json()).toEqual({
      status: "ok",
      service: "wasal-server"
    });
  });
});
