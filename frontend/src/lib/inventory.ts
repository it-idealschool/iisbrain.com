import api from "./api";

export type ItemCategory = { id: number; name: string; description?: string };
export type InventoryItem = {
  id: number; sku: string; name: string; category: number; category_name: string;
  unit: string; stock_quantity: string; reorder_level: string; unit_cost: string;
  location: string; is_low_stock: boolean;
};
export type RequestLine = { id?: number; item: number | null; item_name?: string; requested_item_name: string; quantity: string; notes?: string };
export type ItemRequest = {
  id: number; requester_name: string; department: string; purpose: string;
  priority: string; status: string; status_label: string; created_at: string;
  lines: RequestLine[]; actions: { id: number; actor_name: string; action: string; comment: string; created_at: string }[];
};

export const getItemCategories = async () => (await api.get("/inventory/categories/")).data;
export const createItemCategory = async (data: Partial<ItemCategory>) => (await api.post("/inventory/categories/", data)).data;
export const getInventoryItems = async () => (await api.get("/inventory/items/")).data;
export const createInventoryItem = async (data: Partial<InventoryItem>) => (await api.post("/inventory/items/", data)).data;
export const getItemRequests = async () => (await api.get("/inventory/requests/")).data;
export const createItemRequest = async (data: { department: string; purpose: string; priority: string; lines: RequestLine[] }) => (await api.post("/inventory/requests/", data)).data;
export const approveItemRequest = async (id: number, comment = "") => (await api.post(`/inventory/requests/${id}/approve/`, { comment })).data;
export const rejectItemRequest = async (id: number, comment: string) => (await api.post(`/inventory/requests/${id}/reject/`, { comment })).data;
export const issueItemRequest = async (id: number, comment = "") => (await api.post(`/inventory/requests/${id}/issue/`, { comment })).data;
