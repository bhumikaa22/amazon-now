import client from "./client";

export const checkout  = ()  => client.post("/orders/checkout");
export const getOrders = ()  => client.get("/orders");
export const reorder   = (id) => client.post(`/orders/${id}/reorder`);