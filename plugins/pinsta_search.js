const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

Sparky({
    name: "pinsta",
    alias: ["pinsearch"],
    category: "download",
    fromMe: isPublic,
    desc: "Pinterest වල පින්තූර සර්ච් කර ලබාගැනීම"
}, async ({ client, m, args }) => {
    try {
        const query = args.join(" ");
        if (!query) return await m.reply("❌ *මොනවගේ පොටෝ හෝ වීඩියෝ එකක්ද ඕනේ?*\n\n*භාවිතය:* `.pinsta nature wallpaper`");

        await client.sendMessage(m.jid, { react: { text: "🔍", key: m.key } });
        await m.reply(`🔍 *"${query}" සඳහා Pinterest හි සෙවුම් ප්‍රතිඵල ලබාගනිමින් පවතී...*`);

        const apiKey = 'zan_w8lSd1pK_t79f2pa52p';
        // සර්ච් කිරීම සඳහා API එක (මෙම API එක සර්ච් එක සඳහා සහය දක්වයි නම්)
        const apiUrl = `https://api.zanta-mini.store/api/pinterest/search?apiKey=${apiKey}&text=${encodeURIComponent(query)}`;

        const response = await axios.get(apiUrl);
        const results = response.data.results; // මෙතනට එන්නේ පින්තූර ලින්ක්ස් ටිකක්

        if (!results || results.length === 0) {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return await m.reply("❌ *කණගාටුයි, එම නමින් ප්‍රතිඵල සොයාගැනීමට නොහැකි විය.*");
        }

        // පින්තූර 5ක් පමණක් යැවීම
        for (let i = 0; i < Math.min(results.length, 5); i++) {
            await client.sendMessage(m.jid, { 
                image: { url: results[i] }, 
                caption: `🖼️ *Pinterest Search Result ${i + 1}*\n> Powered by X-KADIYA-MD` 
            });
        }

        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("Pinterest Search Error:", err);
        await m.reply("❌ *සෙවුමේ දෝෂයක්:* " + err.message);
    }
});

