const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

// Local Simple Database
const db = {
    favorites: {},
    groupStats: {},
    userCounts: {}
};

// Sticker සාදන සුරක්ෂිත Helper Function එක
async function createSticker(buffer, packname = "Emoji Kitchen", author = "Sparky-Bot") {
    try {
        const sticker = new Sticker(buffer, {
            pack: packname,
            author: author,
            type: StickerTypes.FULL,
            quality: 60 // Quality එක තරමක් අඩු කලා වේගවත් වීමට සහ Error අවම වීමට
        });
        return await sticker.toBuffer();
    } catch (e) {
        console.error("Sticker Formatter Error:", e.message);
        return null;
    }
}

// Array එකකින් ඉමෝජි පමණක් වෙන් කරගන්නා සරල ශ්‍රිතයක්
function extractEmojis(text) {
    // සරලව text එක ඇතුළේ තියෙන හැම අක්ෂරයක්ම වෙන් කර ඉමෝජි පරීක්ෂා කරයි
    const regex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    return text.match(regex);
}

// ==========================================
// 1. MAIN MIX COMMAND (.mix / .emojimix)
// ==========================================
Sparky({
    name: "mix",
    alias: ["emojimix", "combine"],
    category: "fun",
    fromMe: isPublic,
    desc: "Combine 2 emojis to make a custom sticker"
}, async ({ client, m, args }) => {
    const text = args.join(" ").trim();
    const emojis = extractEmojis(text);

    // ඉමෝජි 2ක් නැත්නම් Error පණිවිඩය දේ
    if (!emojis || emojis.length < 2) {
        await client.sendMessage(m.jid, { react: { text: "❓", key: m.key } });
        return await m.reply(`╭─「 *📦 EMOJI KITCHEN* 」\n│\n├ *Usage:* .mix 😎 🐱\n├ *Example:* .mix ❤️ 🔥\n│\n╰─ Powered by Sparky ✨`);
    }

    await client.sendMessage(m.jid, { react: { text: "⏳", key: m.key } });
    
    // Vercel API Endpoint එක (පළමු ඉමෝජි දෙක පමණක් ගනී)
    const emo1 = emojis[0];
    const emo2 = emojis[1];
    const url = `https://emojik.vercel.app/s/${encodeURIComponent(emo1 + emo2)}?size=512`;

    try {
        // API එකෙන් Image Buffer එක ලබාගැනීම
        const response = await axios.get(url, { 
            responseType: 'arraybuffer', 
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' } // API Block වීම් වැලැක්වීමට
        });

        if (!response || !response.data || response.data.length < 100) {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return await m.reply(`❌ කණගාටුයි, [ ${emo1} + ${emo2} ] එකතුව සඳහා ස්ටිකරයක් නිර්මාණය කිරීමට Google Kitchen ඉඩ නොදේ.`);
        }

        // Stats Update
        const sender = m.sender;
        db.userCounts[sender] = (db.userCounts[sender] || 0) + 1;
        
        const group = m.jid;
        if (!db.groupStats[group]) db.groupStats[group] = {};
        const comboKey = `${emo1}${emo2}`;
        db.groupStats[group][comboKey] = (db.groupStats[group][comboKey] || 0) + 1;

        // WebP Sticker එකක් බවට හැරවීම
        const stickerBuffer = await createSticker(response.data, "Emoji Kitchen", "Sparky Bot");
        
        if (!stickerBuffer) {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return await m.reply(`❌ ස්ටිකර් පරිවර්තනය (WebP Conversion) අසාර්ථක විය. කරුණාකර වෙනත් ඉමෝජි දෙකක් බලන්න.`);
        }

        await client.sendMessage(m.jid, { react: { text: "🍳", key: m.key } });
        await client.sendMessage(m.jid, { sticker: stickerBuffer }, { quoted: m });

    } catch (err) {
        console.error("Mix Command Error:", err.message);
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        return await m.reply(`❌ ඔය ඉමෝජි දෙක එකතු කිරීමට Google Kitchen සහය දක්වන්නේ නැත.`);
    }
});

// ==========================================
// 2. RANDOM MIX COMMAND (.randommix)
// ==========================================
Sparky({
    name: "randommix",
    category: "fun",
    fromMe: isPublic,
    desc: "Generate a completely random emoji mix"
}, async ({ client, m }) => {
    await client.sendMessage(m.jid, { react: { text: "🎲", key: m.key } });
    
    const popularEmojis = ["😎", "🐱", "😂", "❤️", "🔥", "😭", "💀", "🤡", "🤖", "🦊", "👑", "👻", "👽", "🥑", "🐸", "🐷"];
    let rand1 = popularEmojis[Math.floor(Math.random() * popularEmojis.length)];
    let rand2 = popularEmojis[Math.floor(Math.random() * popularEmojis.length)];
    
    while(rand1 === rand2) {
        rand2 = popularEmojis[Math.floor(Math.random() * popularEmojis.length)];
    }

    const url = `https://emojik.vercel.app/s/${encodeURIComponent(rand1 + rand2)}?size=512`;

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
        const stickerBuffer = await createSticker(response.data, `Random: ${rand1} + ${rand2}`);
        if (!stickerBuffer) return await m.reply("🎲 ස්ටිකර් පරිවර්තන දෝෂයකි. නැවත උත්සාහ කරන්න.");
        
        await client.sendMessage(m.jid, { sticker: stickerBuffer }, { quoted: m });
    } catch {
        return await m.reply("🎲 ලැබුණු සසම්භාවී එකතුව අසාර්ථකයි. කරුණාකර නැවත `.randommix` යොදන්න.");
    }
});

// ==========================================
// 3. SAVE FAVORITE MIX (.savemix)
// ==========================================
Sparky({
    name: "savemix",
    category: "fun",
    fromMe: isPublic,
    desc: "Save a combination as your favorite"
}, async ({ m, args }) => {
    const quotedText = m.quoted ? m.quoted.text : null;
    if (!quotedText) return await m.reply("❌ කරුණාකර ඔබ කලින් යෙදූ ඉමෝජි පණිවිඩයට (Example: .mix 😎 🐱) Reply කර මෙම විධානය ලබාදෙන්න.");
    
    const name = args.join(" ").trim();
    if (!name) return await m.reply("❌ කරුණාකර මෙම එකතුව සුරැකීමට නමක් ලබාදෙන්න. (.savemix මගේම)");

    const emojis = extractEmojis(quotedText);
    if (!emojis || emojis.length < 2) return await m.reply("❌ Reply කරන ලද පණිවිඩය තුළ ඉමෝජි යුගලක් සොයාගත නොහැක.");

    if (!db.favorites[m.sender]) db.favorites[m.sender] = {};
    db.favorites[m.sender][name.toLowerCase()] = [emojis[0], emojis[1]];

    return await m.reply(`❤️ සුරැකුණා! දැන් ඔබට එම ඉමෝජි වෙනුවට \`.favmix ${name.toLowerCase()}\` ලෙස යොදා කෙලින්ම ස්ටිකරය ලබාගත හැක.`);
});

// ==========================================
// 4. GET FAVORITE MIX (.favmix)
// ==========================================
Sparky({
    name: "favmix",
    category: "fun",
    fromMe: isPublic,
    desc: "Get your saved favorite mix"
}, async ({ client, m, args }) => {
    const name = args.join(" ").trim().toLowerCase();
    if (!name) return await m.reply("❌ කරුණාකර ඔබ සුරකින ලද නම ලබාදෙන්න. (.favmix <නම>)");

    if (!db.favorites[m.sender] || !db.favorites[m.sender][name]) {
        return await m.reply("❌ එම නමින් සුරැකි එකතුවක් සොයාගත නොහැක.");
    }

    const [emo1, emo2] = db.favorites[m.sender][name];
    const url = `https://emojik.vercel.app/s/${encodeURIComponent(emo1 + emo2)}?size=512`;

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const stickerBuffer = await createSticker(response.data, `Fav: ${name}`);
        await client.sendMessage(m.jid, { sticker: stickerBuffer }, { quoted: m });
    } catch {
        return await m.reply("❌ ස්ටිකර් දත්ත ලබාගැනීම අසාර්ථකයි.");
    }
});

// ==========================================
// 5. GAMIFICATION (.topmix)
// ==========================================
Sparky({
    name: "topmix",
    category: "fun",
    fromMe: isPublic,
    desc: "Show top users and popular mixes"
}, async ({ m }) => {
    let output = `🏆 *EMOJI KITCHEN LEADERBOARD* 🏆\n\n`;
    
    output += `👑 *Top Creators:*\n`;
    const sortedUsers = Object.entries(db.userCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if(sortedUsers.length === 0) output += `  - දත්ත තවමත් නොමැත -\n`;
    else {
        sortedUsers.forEach(([user, count], index) => {
            output += `${index + 1}. @${user.split("@")[0]} : ${count} වාරයක්\n`;
        });
    }

    output += `\n🔥 *Group Popular Mixes:*\n`;
    if (!db.groupStats[m.jid] || Object.keys(db.groupStats[m.jid]).length === 0) {
        output += `  - දත්ත තවමත් නොමැත -\n`;
    } else {
        const sortedCombos = Object.entries(db.groupStats[m.jid]).sort((a, b) => b[1] - a[1]).slice(0, 5);
        sortedCombos.forEach(([combo, count], index) => {
            output += `${index + 1}. [ ${combo} ] -> භාවිතා වාර: ${count}\n`;
        });
    }

    return await m.reply(output);
});

// ==========================================
// 6. GUIDE COMMAND (.helpmix)
// ==========================================
Sparky({
    name: "helpmix",
    category: "fun",
    fromMe: isPublic,
    desc: "Emoji Kitchen Guide"
}, async ({ m }) => {
    let help = `🍳 *EMOJI KITCHEN USER GUIDE* 🍳\n\n`;
    help += `• \`.mix 👑 🐱\` - ඉමෝජි 2ක් එකතු කරයි.\n`;
    help += `• \`.randommix\` - සසම්භාවී එකතුවක් සාදයි.\n`;
    help += `• \`.savemix <නම>\` - අවසන් mix එක save කරයි (Reply).\n`;
    help += `• \`.favmix <නම>\` - සේව් කල ස්ටිකරය ලබාගනී.\n`;
    help += `• \`.topmix\` - දක්ෂතම නිර්මාණකරුවන් ලැයිස්තුව.\n`;
    return await m.reply(help);
});

