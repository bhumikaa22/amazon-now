import client from "./client";

export const getCart     = ()                       => client.get("/cart");
export const addToCart   = (productId, qty = 1)     => client.post("/cart", { productId, qty });
export const updateCart  = (productId, qty)         => client.put(`/cart/${productId}`, { qty });
export const removeItem  = (productId)              => client.delete(`/cart/${productId}`);
export const clearCart   = ()                       => client.delete("/cart");