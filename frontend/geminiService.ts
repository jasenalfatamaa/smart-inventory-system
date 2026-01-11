
/// <reference types="vite/client" />
import { Product } from "./types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const getAIInventoryInsights = async (products: Product[]) => {
  const token = localStorage.getItem('inventory_token');

  try {
    const inventorySummary = products.map(p => ({
      name: p.name,
      current: p.stock,
      min: p.minStock,
      category: p.category
    }));

    const response = await fetch(`${API_URL}/ai/insights/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ inventorySummary })
    });

    if (!response.ok) throw new Error('AI Service error');

    const data = await response.json();
    return data.text || "Tidak dapat memuat wawasan AI saat ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi AI Service.";
  }
};
