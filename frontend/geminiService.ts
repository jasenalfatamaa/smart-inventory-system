
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "./types";

// Initialize client safely - if key is missing, AI features will error gracefully when called, not crash app on load.
const API_KEY = process.env.API_KEY || "";

export const getAIInventoryInsights = async (products: Product[]) => {
  if (!API_KEY) {
    console.warn("Gemini API Key is missing.");
    return "AI Insights tidak tersedia (API Key missing).";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const inventorySummary = products.map(p => ({
      name: p.name,
      current: p.stock,
      min: p.minStock,
      category: p.category
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Analisis data inventaris ini dan berikan saran restock singkat (maks 3 poin): ${JSON.stringify(inventorySummary)}`,
      config: {
        systemInstruction: "Anda adalah asisten manajemen inventaris cerdas. Berikan wawasan strategis tentang stok barang.",
        temperature: 0.7,
      },
    });

    // Directly access the .text property as per the latest SDK requirements
    return response.text || "Tidak dapat memuat wawasan AI saat ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi AI Service.";
  }
};
