import api from "./axios";
export const getGigsApi = (params) => api.get("/gigs", { params });
export const getGigByIdApi = (id) => api.get(`/gigs/${id}`);
export const createGigApi = (data) => api.post("/gigs", data);
export const updateGigApi = (id, data) => api.put(`/gigs/${id}`, data);
export const deleteGigApi = (id) => api.delete(`/gigs/${id}`);
export const getMyGigsApi = () => api.get("/gigs/my");
