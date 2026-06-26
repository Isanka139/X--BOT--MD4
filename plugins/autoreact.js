const { Sparky } = require("../lib");

// 🎭 Reaction Emojis ලැයිස්තුව
const STATUS_EMOJIS = ["❤️", "🔥", "🥰", "👑", "✨", "💯", "🙌", "🤩", "⚡", "🍭"];

/**
 * 🤖 Professional 24/7 Auto Status View & React System
 */
Sparky({
    on: "messages.upsert", // වඩාත්ම ස්ථාවර Baileys Event එක භාවිතය
    fromMe: false
}, async ({ m, client }) => {
    
    try {
        // 1. ලැබුණු මැසේජ් එක Status එකක්දැයි Strict ලෙස පරීක්ෂා කිරීම
        if (!m || !m.key || m.key.remoteJid !== "status@broadcast") return;
        if (m.key.fromMe) return; // තමන්ගේම ඒවට React වීම වැළැක්වීම

        // 2. Status එක දාපු කෙනාගේ JID එක නිවැරදිව වෙන් කර ගැනීම
        const statusSender = m.sender || m.key.participant || m.participant;
        if (!statusSender || statusSender.includes("net.whatsapp")) return;

        console.log(`[STATUS DETECTED] New status from: ${statusSender}`);

        // 3. AUTO VIEW STATUS (ස්ටේටස් එක මුලින්ම බැලූ බව WhatsApp සර්වර් එකට දැන්වීම)
        if (typeof client.readMessages === "function") {
            await client.readMessages([m.key]);
        } else {
            await client.sendReceipt(m.key.remoteJid, m.key.participant, [m.key.id], 'read');
        }

        // 4. RANDOM EMOJI SELECTOR
        const randomEmoji = STATUS_EMOJIS[Math.floor(Math.random() * STATUS_EMOJIS.length)];

        // 5. PROFESSIONAL STATUS REACTION SYSTEM (Strict Delay එකක් සහිතව)
        setTimeout(async () => {
            try {
                await client.sendMessage(
                    "status@broadcast",
                    {
                        react: {
                            text: randomEmoji,
                            key: m.key
                        }
                    },
                    { 
                        // වැදගත්: Status හිමිකරුගේ JID එක participant ලෙස අනිවාර්යයෙන්ම යා යුතුය
                        participant: statusSender 
                    }
                );
                console.log(`✅ [STATUS REACT SUCCESS] Reacted ${randomEmoji} to ${statusSender}`);
            } catch (reactErr) {
                console.error("[STATUS REACT SUB-ERROR]:", reactErr.message);
            }
        }, 2000); // ස්ටේටස් එක දැකලා තත්පර 2කින් React වන සේ සකස් කර ඇත (Natural Look)

    } catch (error) {
        // බොට් 24/7 ඔන්ලයින්ව තැබීමට Errors සියල්ල සයිලන්ට්ලි බයිපාස් කිරීම
        console.error("[STATUS SYSTEM CRITICAL ERROR]:", error.message);
    }
});
