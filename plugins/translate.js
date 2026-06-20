const axios = require("axios");
const { Sparky, isPublic } = require("../lib"); 

// ======================================================
// 🌐 AI GRAMMAR CORRECTOR & TRANSLATOR (PROFESSIONAL)
// ======================================================
Sparky({
    name: "fixtext",
    alias: ["tosinhala", "translate", "grammar"],
    category: "tools",
    fromMe: isPublic,
    desc: "Reply to any text to fix grammar or translate it into professional Sinhala/English."
}, async ({ m, text, cmd }) => {
    try {
        let textToProcess = "";

        // 1. Reply (Quote) මැසේජ් එකෙන් Text එක ලබා ගැනීම
        if (m.quoted && (m.quoted.text || m.quoted.body)) {
            textToProcess = m.quoted.text || m.quoted.body;
        } else {
            textToProcess = (text || m.text || m.body || "").trim();
            if (textToProcess.startsWith(".")) {
                textToProcess = textToProcess.replace(/^\.\w+\s+/, "");
            }
        }

        if (!textToProcess || !textToProcess.trim()) {
            return m.reply(
                "❌ *කරුණාකර සකස් කිරීමට අවශ්‍ය Text එකට Reply (Quote) කරමින් .fixtext හෝ .tosinhala ලෙස යවන්න!*\n\n" +
                "💡 *Example:* \n.fixtext i gowing to school yesterday"
            );
        }

        await m.reply("🧠 *AI මඟින් ඔබේ පෙළ (Text) සකස් කරමින් පවතී... කරුණාකර මොහොතක් රැඳී සිටින්න.*");

        // 🔐 ඔයාගේ Hugging Face Token එක ආරක්ෂිතව ඇතුලත් කලා
        const hfToken = "Hf_YwKqWFiIXcAkAWuXltmvAqyHFOsQUqGxRW"; 
        
        // පරිශීලකයා ගැසූ Command එක අනුව AI එකට දෙන උපදෙස් වෙනස් කිරීම (Smart System)
        let systemInstruction = "";
        let headerTitle = "";

        if (cmd === "tosinhala" || textToProcess.includes("translate")) {
            systemInstruction = "[SYSTEM: You are a professional translator. Translate the following text accurately and naturally into professional, clear Sinhala language. Do not output anything else, just the translation.]\n\nText:\n";
            headerTitle = "🌐 *AI TEXT TRANSLATOR (SINHALA)*";
        } else {
            systemInstruction = "[SYSTEM: You are a professional editor. Fix any grammar, spelling, or structural mistakes in the following text. Keep the tone natural and professional. Return only the corrected text.]\n\nText:\n";
            headerTitle = "📝 *AI GRAMMAR & TEXT CORRECTOR*";
        }

        const fullPrompt = `${systemInstruction}${textToProcess.trim()}`;

        // Hugging Face Inference API Endpoint (Mistral AI Model)
        const apiUrl = "https://api-inference.huggingface.co/models/MistralAI/Mistral-7B-Instruct-v0.3";

        const response = await axios.post(apiUrl, 
            { 
                inputs: fullPrompt,
                parameters: { max_new_tokens: 800, return_full_text: false }
            }, 
            { 
                headers: { 
                    "Authorization": `Bearer ${hfToken}`,
                    "Content-Type": "application/json"
                },
                timeout: 60000 
            }
        );

        const data = response?.data;
        let aiResult = null;

        if (Array.isArray(data) && data[0]?.generated_text) {
            aiResult = data[0].generated_text.trim();
        } else if (data && data.generated_text) {
            aiResult = data.generated_text.trim();
        }

        if (!aiResult) {
            return m.reply("❌ පෙළ සකස් කිරීමට නොහැකි වුණා. Hugging Face වෙතින් නිසි ප්‍රතිචාරයක් ලැබුණේ නැත.");
        }

        const finalResponse = `${headerTitle}\n\n` +
                              `${aiResult}\n\n` +
                              `⚡ *Powered by Hugging Face AI*`;

        return await m.reply(finalResponse);

    } catch (err) {
        console.error("❌ Hugging Face Tool Error:", err);
        
        if (err.code === "ENOTFOUND" || err.message.includes("ENOTFOUND")) {
            return m.reply("⚠️ *Network Error:* සර්වර් එකට Hugging Face සමඟ සම්බන්ධ වීමට නොහැකි වුණා. කරුණාකර නැවත උත්සාහ කරන්න.");
        }

        return m.reply(
            "❌ Error occurred:\n" +
            (err.response?.data?.error || err.message || "Unknown error")
        );
    }
});
