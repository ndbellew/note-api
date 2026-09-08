export const fetchWithTokenRefresh = async (url, options = {}) => {
  let response = await fetch(url, options);

  // If token is expired, try to refresh it
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refresh_token");
    const refreshResponse = await fetch("/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      localStorage.setItem("token", refreshData.access_token);

      // Retry the original request with the new token
      options.headers["Authorization"] = `Bearer ${refreshData.access_token}`;
      response = await fetch(url, options);
    } else {
      // Handle refresh token failure (e.g., log out user)
      console.error("Token refresh failed");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      return;
    }
  }

  return response;
};
