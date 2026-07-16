import { createSlice } from "@reduxjs/toolkit";

const userFromStorage = localStorage.getItem("ss_user")
  ? JSON.parse(localStorage.getItem("ss_user"))
  : null;
const accessToken = localStorage.getItem("ss_accessToken") || null;

const initialState = {
  user: userFromStorage,
  accessToken,
  refreshToken: localStorage.getItem("ss_refreshToken") || null,
  requires2FA: false,
  tempUserId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.requires2FA = false;
      localStorage.setItem("ss_user", JSON.stringify(user));
      localStorage.setItem("ss_accessToken", accessToken);
      localStorage.setItem("ss_refreshToken", refreshToken);
    },
    set2FARequired: (state, action) => {
      state.requires2FA = true;
      state.tempUserId = action.payload.userId;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("ss_user");
      localStorage.removeItem("ss_accessToken");
      localStorage.removeItem("ss_refreshToken");
    },
  },
});

export const { setCredentials, set2FARequired, logout } = authSlice.actions;
export default authSlice.reducer;
