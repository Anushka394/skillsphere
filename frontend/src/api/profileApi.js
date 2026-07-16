import api from "./axios";
export const getMyProfileApi = () => api.get("/profile");
export const updateMyProfileApi = (data) => api.put("/profile", data);
export const updateFreelancerProfileApi = (data) => api.put("/profile/freelancer", data);
export const updateClientProfileApi = (data) => api.put("/profile/client", data);
export const getPublicProfileApi = (userId) => api.get(`/profile/freelancer/${userId}`);
