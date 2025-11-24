
import { GoogleGenAI, Type } from "@google/genai";
import { CourseModule, UserRole, Question, StudentProgress, Course } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to parse JSON from AI response that might be wrapped in Markdown
const parseAIResponse = (text: string | undefined): any => {
    if (!text) return null;
    try {
        let cleanText = text.trim();
        // Match code block with or without language identifier
        const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) {
            cleanText = match[1];
        }
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Failed to parse AI JSON response:", error);
        return null;
    }
};

// Generate structured course modules using Gemini 2.5 Flash and JSON Schema
export const generateCourseStructure = async (topic: string): Promise<{ modules: CourseModule[], description: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Buatkan kurikulum kursus yang detail dan deskripsi singkat untuk kursus berjudul "${topic}" dalam Bahasa Indonesia.
      Sertakan 3-5 modul. Campurkan tipe 'video', 'text', dan 'quiz'.
      Untuk kuis, sertakan 2 pertanyaan pilihan ganda.
      Untuk video, berikan transkrip tiruan (mock transcript).
      Untuk teks, berikan konten markdown.
      Deskripsinya harus berupa paragraf pendek yang merangkum proposisi nilai kursus.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["video", "text", "quiz", "live"] },
                  duration: { type: Type.STRING },
                  isCompleted: { type: Type.BOOLEAN },
                  // Optional fields depending on type
                  textContent: { type: Type.STRING },
                  transcript: { type: Type.STRING },
                  quizData: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      questions: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            text: { type: Type.STRING },
                            type: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.INTEGER }
                          }
                        }
                      }
                    }
                  }
                },
                required: ["title", "type", "duration"]
              }
            }
          },
          required: ["description", "modules"]
        }
      }
    });

    if (response.text) {
      const data = parseAIResponse(response.text);
      if (data && data.modules) {
          // Ensure unique IDs
          const modules = data.modules.map((m: any, i: number) => ({
            ...m,
            id: `gen-${Date.now()}-${i}`,
            isCompleted: false
          }));
          return { modules, description: data.description || '' };
      }
    }
    return { modules: [], description: '' };
  } catch (error) {
    console.error("AI Generation Error:", error);
    // Fallback if API fails or key is missing
    return {
      modules: [
        {
          id: `fallback-${Date.now()}`,
          title: `Pengantar ${topic}`,
          type: 'text',
          duration: '10:00',
          isCompleted: false,
          textContent: `# ${topic}\n\nKonten ini dibuat sebagai cadangan karena layanan AI tidak dapat dihubungi.`
        }
      ],
      description: `Pelajari dasar-dasar ${topic} dalam kursus komprehensif ini.`
    };
  }
};

export const generateQuizQuestions = async (topic: string, context?: string): Promise<Question[]> => {
  try {
    let prompt = `Buatkan 3 pertanyaan pilihan ganda untuk kuis tentang "${topic}" dalam Bahasa Indonesia.`;
    
    if (context) {
        prompt = `Berdasarkan konteks materi berikut:\n"${context}"\n\nBuatkan 3 pertanyaan pilihan ganda yang relevan untuk kuis tentang "${topic}" dalam Bahasa Indonesia.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${prompt}
      Sertakan 4 opsi untuk setiap pertanyaan dan tandai indeks jawaban yang benar (0-3).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.INTEGER }
                },
                required: ["text", "options", "correctAnswer"]
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const data = parseAIResponse(response.text);
      if (data && data.questions) {
          return data.questions.map((q: any, i: number) => ({
            ...q,
            id: `gen-q-${Date.now()}-${i}`,
            type: 'mcq'
          }));
      }
    }
    return [];
  } catch (error) {
    console.error("AI Quiz Gen Error:", error);
    return [];
  }
};

export const generateVideoScript = async (topic: string, audience: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Buatkan skrip video edukasi yang menarik tentang "${topic}" untuk audiens: ${audience}.
      Bahasa: Indonesia.
      Format Output: Markdown.
      
      Struktur:
      1. Hook (0-30 detik): Pembukaan yang menarik perhatian.
      2. Intro (30-60 detik): Perkenalan topik.
      3. Body (Isi Utama): Penjelasan 3 poin kunci dengan analogi.
      4. Conclusion & CTA: Ringkasan dan ajakan bertindak.
      
      Sertakan petunjuk visual [Visual Cue] dalam kurung siku.`,
    });
    return response.text || "Gagal membuat skrip.";
  } catch (error) {
    console.error("Script Gen Error:", error);
    return "Layanan AI tidak tersedia.";
  }
};

export const chatWithAI = async (message: string, role: UserRole, imageData?: string): Promise<string> => {
  try {
    let contents: any = { parts: [] };
    
    if (imageData) {
        // Remove data:image/png;base64, prefix if present
        const base64Data = imageData.split(',')[1] || imageData;
        contents.parts.push({
            inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
            }
        });
    }
    
    contents.parts.push({ text: message });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: `Anda adalah asisten LMS cerdas "PUB-Latih AI". 
        Peran: Mentor Profesional untuk ${role}. 
        Bahasa: Bahasa Indonesia.
        
        Konteks Keahlian Anda mencakup:
        1. Teknik Konstruksi & Sipil (Engineering).
        2. Manajemen Kewirausahaan & Bisnis Jasa Konstruksi.
        3. Manajemen Rantai Pasok (Supply Chain Management) & Pengadaan.
        4. Strategi Tender & Pemenangan Proyek.
        5. Konstruksi Berkelanjutan (4KL: Kesehatan, Keselamatan, Keberlanjutan, Lingkungan).
        
        Tujuan: Membantu pengguna meningkatkan kompetensi teknis sekaligus kemampuan manajerial bisnis mereka.
        Berikan jawaban yang praktis, profesional, dan mudah diterapkan di industri konstruksi Indonesia.`
      }
    });
    return response.text || "Saya sedang kesulitan berpikir saat ini.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "Saya sedang offline. Mohon periksa koneksi Anda.";
  }
};

export const generateLiveSummary = async (transcript: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Buatkan ringkasan transkrip rapat berikut menjadi poin-poin penting keputusan dan tindakan dalam Bahasa Indonesia: ${transcript}`,
      config: {
        maxOutputTokens: 200
      }
    });
    return response.text || "Tidak dapat membuat ringkasan.";
  } catch (error) {
    return "Ringkasan AI tidak tersedia saat offline.";
  }
};

export const explainConcept = async (concept: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Jelaskan konsep "${concept}" dalam konteks Teknik Sipil/Konstruksi/Bisnis Konstruksi dalam Bahasa Indonesia. Buat sederhana dan di bawah 3 kalimat.`,
    });
    return response.text || "Definisi tidak ditemukan.";
  } catch (error) {
    return "Penjelasan AI tidak tersedia.";
  }
};

// New Feature: AI Essay Grading
export const gradeEssay = async (question: string, answer: string): Promise<{score: number, feedback: string}> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Anda adalah instruktur ahli. Nilai jawaban esai singkat ini.
            Pertanyaan: "${question}"
            Jawaban Siswa: "${answer}"
            
            Berikan skor dari 0 hingga 100 dan umpan balik singkat (maks 2 kalimat) yang konstruktif.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER },
                        feedback: { type: Type.STRING }
                    },
                    required: ["score", "feedback"]
                }
            }
        });
        
        if (response.text) {
            const data = parseAIResponse(response.text);
            if (data) return data;
        }
        return { score: 0, feedback: "Gagal menilai jawaban." };
    } catch (error) {
        console.error("Grading Error:", error);
        return { score: 0, feedback: "Layanan penilaian AI tidak tersedia." };
    }
};

// New Feature: Personalized Learning Recommendation
export const getLearningRecommendations = async (progress: StudentProgress[], allCourses: Course[]): Promise<string> => {
    try {
        const progressSummary = progress.map(p => `${p.courseTitle}: ${p.progress}%, Avg Quiz: ${p.quizAverage}`).join('\n');
        
        // Filter courses that the student has not enrolled in yet
        const enrolledIds = progress.map(p => p.courseId);
        const availableCoursesList = allCourses.filter(c => !enrolledIds.includes(c.id));
        
        if (availableCoursesList.length === 0) {
             return "Luar biasa! Anda telah mengambil semua kursus yang tersedia. Fokuslah untuk menyelesaikan modul yang tersisa atau tinjau kembali materi untuk memperdalam pemahaman.";
        }

        const availableCourses = availableCoursesList
            .map(c => `- ${c.title} (${c.category})`)
            .join('\n');

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Bertindak sebagai Penasihat Akademik Profesional di PUB-Latih AI.
            
            Analisis data berikut:
            1. Riwayat Pembelajaran Siswa:
            ${progressSummary || "Belum ada riwayat pembelajaran."}
            
            2. Katalog Kursus Tersedia (Belum Diambil):
            ${availableCourses}
            
            Tugas:
            Pilih SATU kursus dari katalog yang paling logis untuk diambil selanjutnya guna melengkapi kompetensi siswa (Teknis -> Manajerial -> Bisnis).
            Berikan rekomendasi dalam 1 kalimat yang personal, menyemangati, dan menyebutkan judul kursus secara spesifik.`,
        });
        return response.text || "Jelajahi katalog kursus untuk menemukan topik baru yang menarik!";
    } catch (error) {
        console.error("Recommendation Error:", error);
        return "Jelajahi katalog kursus untuk menemukan topik baru.";
    }
}

// New Feature: Systematic Executive Summary
export const generateStrategicQuestions = async (topic: string, context: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Bertindak selaku Peneliti dan Penulis Best Seller. Buatlah daftar 10 pertanyaan inti yang sangat mendalam untuk membentuk sebuah karya tulis, paper, atau penelitian berkualitas tinggi tentang: "${topic}".
      
      Sumber Materi yang Dianalisis (Konteks):
      ${context} (Bisa berupa Video Pembelajaran, Live Streaming, atau Tatap Muka/Offline)

      Instruksi:
      1. Pertanyaan harus mencakup: Latar Belakang, Analisis Materi Utama (70% fokus), Metodologi/Pendekatan, dan Rekomendasi Strategis.
      2. Pertanyaan harus dirancang sedemikian rupa sehingga jika dijawab, akan menghasilkan konten yang sangat detail dan berbobot.
      3. Bahasa: Indonesia Baku dan Akademis.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      const data = parseAIResponse(response.text);
      if (data && data.questions) return data.questions;
    }
    return ["Gagal membuat daftar pertanyaan."];
  } catch (error) {
    console.error("Question Gen Error:", error);
    return ["Layanan AI tidak tersedia."];
  }
};

export const generateDeepReport = async (topic: string, context: string, questions: string[], format: string = 'Laporan Eksekutif'): Promise<string> => {
  try {
    let formatGuide = "";
    if (format === 'Paper Ilmiah') {
        formatGuide = "Format IMRAD (Introduction, Method, Result, Analysis, Discussion). Gaya bahasa Akademik Ilmiah.";
    } else if (format === 'Laporan Proyek Lapangan') {
        formatGuide = "Format Laporan Teknis: Data Proyek, Pelaksanaan, Kendala, Solusi, Dokumentasi. Gaya bahasa Formal Lapangan.";
    } else if (format === 'Skrip Presentasi') {
        formatGuide = "Format Outline Slide PowerPoint (Slide 1, Slide 2, dst) dengan Speaker Notes. Buat ringkas dan poin-poin.";
    } else if (format === 'Modul Pembelajaran') {
        formatGuide = "Format Modul Ajar: Tujuan Pembelajaran, Materi Inti (terstruktur), Studi Kasus, Latihan/Tugas, Rangkuman. Gaya bahasa Edukatif dan Instruksional.";
    } else {
        formatGuide = "Format Laporan Eksekutif: Ringkasan Eksekutif (1 Halaman), Analisis Masalah, Temuan Utama, Rekomendasi Strategis. Gaya bahasa Bisnis Profesional.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Bertindaklah sebagai Penulis Best Seller dan Peneliti Senior.
      Tugas: Buat ${format} Lengkap tentang "${topic}".
      
      Sumber Materi (Video Pembelajaran / Live Streaming / Tatap Muka):
      ${context}
      
      Gunakan panduan pertanyaan berikut untuk menyusun konten:
      ${questions.join('\n')}
      
      Persyaratan Format & Panjang:
      1. ${formatGuide}
      2. Konten harus MENDETAIL, KOMPREHENSIF, dan PANJANG (Kecuali Skrip Presentasi).
      3. Gunakan format Markdown profesional (H1, H2, H3, Bullet points).
      `,
    });
    return response.text || "Gagal membuat laporan.";
  } catch (error) {
    console.error("Report Gen Error:", error);
    return "Layanan AI tidak tersedia.";
  }
};

// New Feature: Transcript Summary
export const generateTranscriptSummary = async (transcript: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Bertindak sebagai asisten belajar cerdas. Buatkan ringkasan materi yang padat, jelas, dan terstruktur dari transkrip berikut dalam Bahasa Indonesia. 
      
      Format Output:
      1. Poin-poin kunci (Bullet points)
      2. Definisi istilah penting (jika ada)
      3. Kesimpulan singkat
      
      Transkrip:
      ${transcript}`,
    });
    return response.text || "Gagal membuat ringkasan.";
  } catch (error) {
    console.error("Summary Gen Error:", error);
    return "Layanan AI tidak tersedia.";
  }
};
