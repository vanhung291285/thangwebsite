
import { GoogleGenAI } from "@google/genai";

export const generateSchoolContent = async (topic: string, type: 'news' | 'announcement'): Promise<string> => {
  // Use process.env.API_KEY directly as per guidelines
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("Gemini API Key missing");
    return "Vui lòng cấu hình API_KEY để sử dụng AI.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const prompt = type === 'news' 
      ? `Viết một bài báo ngắn (khoảng 200 từ) cho website trường học về chủ đề: "${topic}". Văn phong trang trọng, tích cực, phù hợp môi trường giáo dục Việt Nam. Định dạng Markdown.`
      : `Viết một thông báo chính thức (khoảng 150 từ) từ Ban giám hiệu về việc: "${topic}". Văn phong hành chính, rõ ràng, ngắn gọn. Định dạng Markdown.`;

    // Use ai.models.generateContent with model and contents as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Access .text property directly (not a method)
    return response.text || "Không thể tạo nội dung.";
  } catch (error) {
    console.error("Gemini Connection Error:", error);
    return "Đã xảy ra lỗi khi kết nối với AI Gemini.";
  }
};
