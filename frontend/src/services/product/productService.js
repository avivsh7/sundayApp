import axios from 'axios';

const BASE_URL = 'http://localhost:30001';

export const productService = {

  getAllProducts: async () => {
    const response = await axios.get(`${BASE_URL}/getAll`);
    return response.data;
  },

  getAmountByName: async (name) => {
    const encodedName = encodeURIComponent(name);
    const response = await axios.get(`${BASE_URL}/get_product_amount/${encodedName}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await axios.post(`${BASE_URL}/write`, productData);
    return response.data;
  },

  deleteProduct: async (productName) => {
    const response = await axios.delete(`${BASE_URL}/delete/${encodeURIComponent(productName)}`);
    return response.data;
  }
};