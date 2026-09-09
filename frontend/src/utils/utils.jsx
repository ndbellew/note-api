export const fetchWithTokenRefresh = async (url, options = {}) => {
  let response = await fetch(url, options);

  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refresh_token");

    const refreshResponse = await fetch("/api/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!refreshResponse.ok) {
      console.error("Token refresh failed");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      return;
    }

    const refreshData = await refreshResponse.json();
    localStorage.setItem("token", refreshData.access_token);

    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${refreshData.access_token}`,
      },
    });
  }

  return response;
};
