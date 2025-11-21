import { GoogleGenAI, Type } from "@google/genai";
import type { Question } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder for development. In a real environment, the key would be set.
  // We check here to avoid runtime errors if the key is missing.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getExplanationForQuestion = async (
  question: Question,
  userAnswer: string
): Promise<string> => {
  try {
    const prompt = `
      Bạn là một trợ giảng AI chuyên nghiệp. Hãy giải thích câu hỏi sau đây một cách rõ ràng và dễ hiểu cho một học sinh.
      Tuyệt đối KHÔNG trả lời bằng tiếng Anh. Chỉ sử dụng tiếng Việt.

      Câu hỏi: "${question.text}"
      Đáp án đúng: "${question.answer}"
      Câu trả lời của học sinh: "${userAnswer}"

      Nhiệm vụ của bạn:
      1. Xác nhận câu trả lời của học sinh là sai.
      2. Giải thích tại sao đáp án "${question.answer}" là đúng.
      3. Giải thích tại sao câu trả lời "${userAnswer}" của học sinh là sai.
      4. Cung cấp một lời giải thích súc tích, tập trung vào khái niệm cốt lõi.
      
      Giữ cho câu trả lời ngắn gọn, trực diện và mang tính giáo dục.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Không có phản hồi từ AI.";
  } catch (error) {
    console.error("Error fetching explanation from Gemini API:", error);
    return "Đã xảy ra lỗi khi tạo giải thích. Vui lòng thử lại.";
  }
};

export const generateQuestionsFromText = async (
  text: string,
  count: number = 5
): Promise<Omit<Question, 'id'>[]> => {
  try {
    const prompt = `
      Tạo ${count} câu hỏi kiểm tra kiến thức dựa trên văn bản được cung cấp dưới đây.
      
      Yêu cầu:
      1. Tạo hỗn hợp các loại câu hỏi: Trắc nghiệm (MULTIPLE_CHOICE), Đúng/Sai (TRUE_FALSE), và Điền từ (FILL_IN_THE_BLANK).
      2. Với câu hỏi MULTIPLE_CHOICE, phải cung cấp chính xác 4 lựa chọn, trong đó có 1 đáp án đúng.
      3. Với câu hỏi TRUE_FALSE, đáp án phải là "Đúng" hoặc "Sai".
      4. Ngôn ngữ: Tiếng Việt hoàn toàn.
      5. "topic" nên tóm tắt nội dung chính mà câu hỏi đề cập đến (ngắn gọn).
      
      Văn bản nguồn:
      "${text}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "Nội dung câu hỏi" },
              type: { 
                type: Type.STRING, 
                enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_THE_BLANK'],
                description: "Loại câu hỏi"
              },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Danh sách các lựa chọn cho câu hỏi trắc nghiệm (để trống nếu không phải trắc nghiệm)"
              },
              answer: { type: Type.STRING, description: "Đáp án chính xác" },
              topic: { type: Type.STRING, description: "Chủ đề của câu hỏi" }
            },
            required: ["text", "type", "answer", "topic"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Omit<Question, 'id'>[];
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
};
