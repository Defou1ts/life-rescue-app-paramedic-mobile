import { axiosInstance } from "@/api/axiosInstance";
import { queryClient } from "@/config/queryClient";
import { tokenStorage } from "@/store/tokenStorage";
import { router } from "expo-router";

export const logout = async () => {
  try {
    /**
     * GET REFRESH TOKEN
     */
    const refreshToken = await tokenStorage.getRefreshToken();

    /**
     * BACKEND LOGOUT
     */
    if (refreshToken) {
      await axiosInstance.post("/auth/logout", {
        refreshToken,
      });
    }
  } catch (e) {
    console.log("LOGOUT_REQUEST_ERROR", e);
  } finally {
    /**
     * CLEAR TOKENS
     */
    await tokenStorage.clearTokens();

    /**
     * CLEAR AXIOS AUTH HEADER
     */
    delete axiosInstance.defaults.headers.common.Authorization;

    /**
     * CLEAR REACT QUERY CACHE
     */
    queryClient.clear();

    /**
     * REDIRECT
     */
    router.replace("/signIn");
  }
};
