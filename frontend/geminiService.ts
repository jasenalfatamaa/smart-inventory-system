
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "./types";

// Always initialize the client with process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIInventoryInsights = async (products: Product[]) => {
  try {
    const inventorySummary = products.map(p => ({
      name: p.name,
      current: p.stock,
      min: p.minStock,
      category: p.category
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
