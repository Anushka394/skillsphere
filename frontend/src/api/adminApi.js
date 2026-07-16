import api from "./axios";
export const getAdminStatsApi = () => api.get("/admin/stats");
export const getUsersApi = (params) => api.get("/admin/users", { params });
export const suspendUserApi = (id, reason) => api.put(`/admin/users/${id}/suspend`, { reason });
export const verifyFreelancerApi = (id) => api.put(`/admin/freelancers/${id}/verify`);
export const getAdminGigsApi = (params) => api.get("/admin/gigs", { params });
export const approveGigApi = (id) => api.put(`/admin/gigs/${id}/approve`);
export const getDisputesApi = () => api.get("/admin/disputes");
export const resolveDisputeApi = (id, data) => api.put(`/admin/disputes/${id}/resolve`, data);
