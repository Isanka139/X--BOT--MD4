const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

Sparky({
    name: "pinsta",
    alias: ["pinsearch", "pinterestsearch"],
    category: "download",
    fromMe: isPublic,
    desc: "Pinterest පින්තූර සුරක්ෂිතව සර්ච් කර ලබාගැනීම"
}, async ({ client, m, args }) => {
    try {
        const query = Array.isArray(args) ? args.join(" ") : args.toString();
        
        if (!query || query.trim() === "") {
            return await m.reply("❌ *මොනවගේ පොටෝ එකක්ද ඕනේ?*\n\n*භාවිතය:* `.pinsta nature wallpaper`");
        }

        // සර්ච් එක ආරම්භයේදී 🔍 රියැක්ට් කිරීම
        await client.sendMessage(m.jid, { react: { text: "🔍", key: m.key } });
        await m.reply(`🔍 *"${query}" සඳහා Pinterest හි පින්තූර සොයමින් පවතිනවා...*`);

        // Google Image API එක මගින් Pinterest පින්තූර පමණක් Filter කර සෙවීම (Safe & No 403 Block)
        const searchUrl = `https://api.zanta-mini.store/api/google/image?apiKey=zan_w8lSd1pK_t79f2pa52p&text=${encodeURIComponent(query + " site:pinterest.com")}`;

        const response = await axios.get(searchUrl);
        const results = response.data?.results || response.data; // API Response Format එක අනුව

        if (!results || results.length === 0) {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return await m.reply("❌ *කණගාටුයි, එම නමින් පින්තූර සොයාගැනීමට නොහැකි විය.*");
        }

        // ලැබෙන ප්‍රතිඵල වලින් පින්තූර 5ක් තෝරාගෙන යැවීම
        const maxImages = Math.min(results.length, 5);
        for (let i = 0; i < maxImages; i++) {
            const imgUrl = typeof results[i] === 'object' ? results[i].url : results[i];
            
            if (imgUrl) {
                await client.sendMessage(m.jid, { 
                    image: { url: imgUrl }, 
                    caption: `🖼️ *Pinterest Search:* ${query}\n📌 *Result:* ${i + 1}/${maxImages}\n\n> Powered by X-KADIYA-MD` 
                });
            }
        }

        // සාර්ථක වූ පසු ✅ රියැක්ට් කිරීම
        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("Pinterest Search Fixed Error:", err);
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        await m.reply("❌ *සෙවුමේ දෝෂයක් ඇතිවිය:* " + err.message);
    }
});
