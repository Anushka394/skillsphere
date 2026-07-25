import api from "./axios";
export const submitProposalApi = (gigId, data) => api.post(`/proposals`, { ...data, gigId });
export const getGigProposalsApi = (gigId) => api.get(`/proposals/gig/${gigId}`);
export const getMyProposalsApi = () => api.get("/proposals/my");
export const updateProposalStatusApi = (id, data) => api.put(`/proposals/${id}`, data);