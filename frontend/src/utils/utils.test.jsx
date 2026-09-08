import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { fetchWithTokenRefresh } from "./utils";

describe("fetchWithTokenRefresh", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("returns original response when request succeeds", async () => {
    const response = {
      ok: true,
      status: 200,
    };

    fetch.mockResolvedValue(response);

    const result = await fetchWithTokenRefresh("/profile", {
      headers: {
        Authorization: "Bearer token",
      },
    });

    expect(result).toBe(response);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("refreshes expired access token and retries request", async () => {
    localStorage.setItem("refresh_token", "refresh-token");

    const expiredResponse = {
      ok: false,
      status: 401,
    };

    const refreshResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        access_token: "new-access-token",
      }),
    };

    const retriedResponse = {
      ok: true,
      status: 200,
    };

    fetch
      .mockResolvedValueOnce(expiredResponse)
      .mockResolvedValueOnce(refreshResponse)
      .mockResolvedValueOnce(retriedResponse);

    const options = {
      headers: {
        Authorization: "Bearer expired-token",
      },
    };

    const result = await fetchWithTokenRefresh("/profile", options);

    expect(localStorage.getItem("token")).toBe("new-access-token");

    expect(fetch).toHaveBeenNthCalledWith(2, "/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer refresh-token",
      },
    });

    expect(fetch).toHaveBeenNthCalledWith(3, "/profile", {
      headers: {
        Authorization: "Bearer new-access-token",
      },
    });

    expect(result).toBe(retriedResponse);
  });

  test("clears tokens when refresh fails", async () => {
    localStorage.setItem("token", "expired-token");
    localStorage.setItem("refresh_token", "bad-refresh-token");

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

    await fetchWithTokenRefresh("/profile", {
      headers: {
        Authorization: "Bearer expired-token",
      },
    });

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("Token refresh failed");
  });
});
