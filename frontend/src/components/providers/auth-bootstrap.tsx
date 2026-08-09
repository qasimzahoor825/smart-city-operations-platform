"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { tokenStore } from "@/services/token-storage";
import { authApi } from "@/services/auth";
import { setCredentials, setUser, setInitialized } from "@/store/slices/auth-slice";

/**
 * On mount, if an access token exists, fetch the current user profile and
 * hydrate the Redux store. Errors are swallowed (token refresh via the axios
 * interceptor will redirect to /login if the session is genuinely invalid).
 */
export function AuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    let active = true;
    const accessToken = tokenStore.getAccessToken();

    if (!accessToken) {
      dispatch(setInitialized());
      return;
    }

    (async () => {
      try {
        const user = await authApi.getMe();
        if (!active) return;
        dispatch(setUser(user));
        dispatch(
          setCredentials({
            user,
            accessToken: tokenStore.getAccessToken() ?? accessToken,
          }),
        );
      } catch {
        if (!active) return;
        dispatch(setInitialized());
      }
    })();

    return () => {
      active = false;
    };
  }, [dispatch]);

  return null;
}