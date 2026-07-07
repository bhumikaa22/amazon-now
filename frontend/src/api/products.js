import client from "./client";

export const searchProducts = (q) => client.get(`/products/search?q=${encodeURIComponent(q)}`);
export const getAllProducts  = ()  => client.get("/products");