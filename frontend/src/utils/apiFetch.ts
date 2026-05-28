const AUTH_CHANGE_EVENT = "authchange";

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("authToken");
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      localStorage.removeItem("authToken");
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
      return response;
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => {
        return apiFetch(url, options);
      }).catch(err => {
        throw err;
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await fetch("http://localhost:8000/api/auth/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        localStorage.setItem("authToken", refreshData.access);
        if (refreshData.refresh) {
          localStorage.setItem("refreshToken", refreshData.refresh);
        }
        processQueue(null, refreshData.access);
        isRefreshing = false;
        // Retry the original request
        return apiFetch(url, options);
      } else {
        processQueue(refreshResponse, null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
        isRefreshing = false;
        return response;
      }
    } catch (error) {
      processQueue(error, null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
      isRefreshing = false;
      return response;
    }
  }

  return response;
}
