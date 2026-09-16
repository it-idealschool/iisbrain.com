import api from "./api";

export type DocumentCategory = { id: number; name: string; description?: string };
export type PolicyDocument = {
  id: number; code: string; title: string; document_type: string; category: number;
  category_name: string; summary: string; owner_department: string; version: string;
  status: string; effective_date?: string; review_date?: string; external_url?: string;
  file?: string; updated_at: string;
};

export const getDocumentCategories = async () => (await api.get("/governance/categories/")).data;
export const createDocumentCategory = async (data: Partial<DocumentCategory>) => (await api.post("/governance/categories/", data)).data;
export const getPolicyDocuments = async () => (await api.get("/governance/documents/")).data;
export const createPolicyDocument = async (data: FormData) => (await api.post("/governance/documents/", data, { headers: { "Content-Type": "multipart/form-data" } })).data;
export const approvePolicyDocument = async (id: number) => (await api.post(`/governance/documents/${id}/approve/`, {})).data;
