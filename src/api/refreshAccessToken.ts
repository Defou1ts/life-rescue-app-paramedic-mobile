import { AUTH_REFRESH_URL } from "@/api/apiHost";
import { tokenStorage } from "@/store/tokenStorage";
import { isAccessTokenExpiringSoon } from "@/utils/jwt";
import axios from "axios";
import { router } from "expo-router";

let refreshPromise: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = await tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    const response = await axios.post(AUTH_REFRESH_URL, { refreshToken });
    const { access_token, refresh_token } = response.data;

    await tokenStorage.setTokens(access_token, refresh_token);

    return access_token as string;
  })();

  try {
    return await refreshPromise;
  } catch (error) {
    await tokenStorage.clearTokens();
    router.replace("/signIn");
    throw error;
  } finally {
    refreshPromise = null;
  }
}

/** Returns a valid access token for SignalR negotiate / reconnect. */
export async function getHubAccessToken(): Promise<string> {
  const token = await tokenStorage.getAccessToken();

  if (token && !isAccessTokenExpiringSoon(token)) {
    return token;
  }

  if (!token) {
    return "";
  }

  try {
    return await refreshAccessToken();
  } catch {
    return token;
  }
}
