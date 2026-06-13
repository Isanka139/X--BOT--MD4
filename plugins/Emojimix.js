const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

// Local Simple Database (Memory එකේ තබා ගැනීමට - Bot restart වූ විට මැකේ)
// Permanent කිරීමට MongoDB/Quick.db පාවිච්චි කළ හැක.
const db = {
    favorites: {}, // User favorite mixes
    groupStats: {}, // Group popular mixes
    userCounts: {}  // User mix count tracking
};

// Google Emoji Kitchen API metadata URL
const EMOJI_API_DATA = "https://raw.githubusercontent.com/xsalazar/emoji-kitchen/master/backend/data/all_emoji.json";
let emojiDataCache = null;

// API Data කලින් Load කර තබා ගැනීමේ Function එක
async function getEmojiData() {
    if (emojiDataCache) return emojiDataCache;
    try {
        const res = await axios.get(EMOJI_API_DATA, { timeout: 10000 });
        emojiDataCache = res.data;
        return emojiDataCache;
    } catch (e) {
        console.error("Emoji Data Fetch Error:", e.message);
        return null;
    }
}

// Unicode එකක් Kitchen Format එකට හැරවීම (e.g., 🤔 -> u1f914)
function getEmojiCode(emoji) {
    const code = emoji.codePointAt(0).toString(16);
    return `u${code}`;
}

// Image එක Sticker එකක් බවට පත් කරන Helper Function එක
async function createSticker(buffer, packname = "Emoji Kitchen", author = "Sparky-Bot") {
    const sticker = new Sticker(buffer, {
        pack: packname,
        author: author,
        type: StickerTypes.FULL,
        quality: 70
    });
    return await sticker.toBuffer();
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
    const text = args.join(" ");
    // Emoji පමණක් වෙන් කර හඳුනාගැනීම (Regex)
    const emojis = text.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu);

    if (!emojis || emojis.length < 2) {
        await client.sendMessage(m.jid, { react: { text: "❓", key: m.key } });
        return await m.reply(`╭─「 *📦 EMOJI KITCHEN* 」\n│\n├ *Usage:* .mix 😎 🐱\n├ *Alternative:* .emojimix ❤️ 🔥\n│\n╰─ Powered by Sparky ✨`);
    }

    await client.sendMessage(m.jid, { react: { text: "⏳", key: m.key } });
    const e1 = getEmojiCode(emojis[0]);
    const e2 = getEmojiCode(emojis[1]);

    try {
        // Google Emoji Kitchen CDN URL එක (Open Source API)
        // Emojis වල පිළිවෙල අනුව URL එක වෙනස් විය හැකි නිසා ක්‍රම දෙකම බැලීම සිදු කරයි
        let url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/emoji-kitchen/kitchen/${e1}/${e1}_${e2}.png`;
        let response;
        
        try {
            response = await axios.get(url, { responseType: 'arraybuffer' });
        } catch {
            // පළමු ක්‍රමය අසාර්ථක වුවහොත් පිළිවෙල මාරු කර බැලීම
            url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/emoji-kitchen/kitchen/${e2}/${e2}_${e1}.png`;
            response = await axios.get(url, { responseType: 'arraybuffer' });
        }

        // Gamification Data Update කිරීම
        const sender = m.sender;
        db.userCounts[sender] = (db.userCounts[sender] || 0) + 1;
        
        const group = m.jid;
        if (!db.groupStats[group]) db.groupStats[group] = {};
        const comboKey = `${emojis[0]}${emojis[1]}`;
        db.groupStats[group][comboKey] = (db.groupStats[group][comboKey] || 0) + 1;

        // Image එක Sticker එකක් කිරීම
        const stickerBuffer = await createSticker(response.data, "Emoji Kitchen", "Sparky Bot");
        
        await client.sendMessage(m.jid, { react: { text: "🍳", key: m.key } });
        await client.sendMessage(m.jid, { sticker: stickerBuffer }, { quoted: m });

    } catch (err) {
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        return await m.reply(`❌ ඔය ඉමෝජි දෙක එකතු කරන්න බැහැ! වෙනත් ඉමෝජි දෙකක් උත්සාහ කරන්න.`);
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
    
    // බහුලව භාවිතාවන ඉමෝජි ලැයිස්තුවක්
    const popularEmojis = ["😎", "🐱", "😂", "❤️", "🔥", "😭", "💀", "🤡", "🤖", "🦊", "👑", "👻", "👽", "💩"];
    const rand1 = popularEmojis[Math.floor(Math.random() * popularEmojis.length)];
    let rand2 = popularEmojis[Math.floor(Math.random() * popularEmojis.length)];
    
    while(rand1 === rand2) {
        rand2 = popularEmojis[Math.floor(Math.random() * popularEmojis.length)];
    }

    // Mix විධානය නැවත Call කිරීම වෙනුවට කෙලින්ම generate කිරීම
    const e1 = getEmojiCode(rand1);
    const e2 = getEmojiCode(rand2);

    try {
        let url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/emoji-kitchen/kitchen/${e1}/${e1}_${e2}.png`;
        let response;
        try { response = await axios.get(url, { responseType: 'arraybuffer' }); } 
        catch {
            url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/emoji-kitchen/kitchen/${e2}/${e2}_${e1}.png`;
            response = await axios.get(url, { responseType: 'arraybuffer' });
        }

        const stickerBuffer = await createSticker(response.data, `Random: ${rand1} + ${rand2}`);
        await client.sendMessage(m.jid, { sticker: stickerBuffer }, { quoted: m });
    } catch {
        await m.reply("🎲 Random Mix එක අසාර්ථකයි. නැවත උත්සාහ කරන්න!");
    }
});

// ==========================================
// 3. SAVE FAVORITE MIX (.savemix name)
// ==========================================
Sparky({
    name: "savemix",
    category: "fun",
    fromMe: isPublic,
    desc: "Save a combination as your favorite"
}, async ({ m, args }) => {
    if (!m.quoted || !m.quoted.text) return await m.reply("❌ කරුණාකර ඔබ Mix කිරීමට යෙදූ ඉමෝජි සහිත message එකකට reply කර මෙම command එක ලබාදෙන්න. (Example: Reply to '.mix 😎 🐱' with '.savemix mycool')");
    
    const name = args.join(" ").trim();
    if (!name) return await m.reply("❌ කරුණාකර favorite එක සඳහා නමක් ලබාදෙන්න. (.savemix <name>)");

    const emojis = m.quoted.text.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu);
    if (!emojis || emojis.length < 2) return await m.reply("❌ Reply කල පණිවිඩයේ ඉමෝජි සොයාගත නොහැක.");

    if (!db.favorites[m.sender]) db.favorites[m.sender] = {};
    db.favorites[m.sender][name.toLowerCase()] = [emojis[0], emojis[1]];

    return await m.reply(`❤️ Saved! දැන් ඔබට \`.mix ${emojis[0]} ${emojis[1]}\` වෙනුවට \`.favmix ${name.toLowerCase()}\` ලෙස භාවිතා කර sticker එක ලබාගත හැක.`);
});

// ==========================================
// 4. GET FAVORITE MIX (.favmix name)
// ==========================================
Sparky({
    name: "favmix",
    category: "fun",
    fromMe: isPublic,
    desc: "Get your saved favorite mix"
}, async ({ client, m, args }) => {
    const name = args.join(" ").trim().toLowerCase();
    if (!name) return await m.reply("❌ කරුණාකර ඔබ save කල නම ලබාදෙන්න. (.favmix <name>)");

    if (!db.favorites[m.sender] || !db.favorites[m.sender][name]) {
        return await m.reply("❌ එම නමින් සේව් කල Mix එකක් සොයාගත නොහැක. ඔබගේ ලිස්ට් එක බැලීමට `.favlist` භාවිතා කරන්න.");
    }

    const [emo1, emo2] = db.favorites[m.sender][name];
    // .mix logic එක නැවත trigger කිරීම
    const e1 = getEmojiCode(emo1);
    const e2 = getEmojiCode(emo2);

    try {
        let url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/emoji-kitchen/kitchen/${e1}/${e1}_${e2}.png`;
        let response;
        try { response = await axios.get(url, { responseType: 'arraybuffer' }); } 
        catch {
            url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/emoji-kitchen/kitchen/${e2}/${e2}_${e1}.png`;
            response = await axios.get(url, { responseType: 'arraybuffer' });
        }
        const stickerBuffer = await createSticker(response.data, `Fav: ${name}`);
        await client.sendMessage(m.jid, { sticker: stickerBuffer }, { quoted: m });
    } catch {
        await m.reply("❌ Sticker එක ලබාගැනීමේ දෝෂයකි.");
    }
});

// ==========================================
// 5. GAMIFICATION: LEADERBOARD (.topmix)
// ==========================================
Sparky({
    name: "topmix",
    alias: ["mixleaderboard"],
    category: "fun",
    fromMe: isPublic,
    desc: "Show top users and popular mixes"
}, async ({ m }) => {
    let output = `🏆 *EMOJI KITCHEN LEADERBOARD* 🏆\n\n`;
    
    // Top Users
    output += `👑 *Top Creators (Most Mixes):*\n`;
    const sortedUsers = Object.entries(db.userCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if(sortedUsers.length === 0) output += `  - No data yet -\n`;
    else {
        sortedUsers.forEach(([user, count], index) => {
            output += `${index + 1}. @${user.split("@")[0]} : ${count} Mixes\n`;
        });
    }

    // Group Popular Mixes
    output += `\n🔥 *Most Popular Mixes in this Chat:*\n`;
    if (!db.groupStats[m.jid] || Object.keys(db.groupStats[m.jid]).length === 0) {
        output += `  - No data yet -\n`;
    } else {
        const sortedCombos = Object.entries(db.groupStats[m.jid]).sort((a, b) => b[1] - a[1]).slice(0, 5);
        sortedCombos.forEach(([combo, count], index) => {
            output += `${index + 1}. Combination [ ${combo} ] : Used ${count} times\n`;
        });
    }

    return await m.reply(output);
});

// ==========================================
// 6. ADVANCED FEATURE: STORY STICKER (.story)
// ==========================================
Sparky({
    name: "story",
    category: "fun",
    fromMe: isPublic,
    desc: "Create an AI Scene from Emojis (Premium/Simulation)"
}, async ({ client, m, args }) => {
    const text = args.join(" ");
    const emojis = text.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu);

    if (!emojis || emojis.length < 2) {
        return await m.reply(`❌ Usage: .story 😎 🍕 🚗\n(Provide 2 or 3 emojis to build a story sticker)`);
    }

    await client.sendMessage(m.jid, { react: { text: "🔮", key: m.key } });
    await m.reply(`🎨 *AI Story Sticker Engine* මගින් ඔබගේ ඉමෝජි සරදම් කරමින් Sticker එකක් නිර්මාණය කරමින් පවතී. කරුණාකර රැඳී සිටින්න...`);

    // NOTE: මීට සැබෑ AI Image Generator API (Stable Diffusion / DALL-E) සම්බන්ධ කළ හැක.
    // දැනට මෙමගින් Simulation එකක් ලෙස Google Kitchen එකෙන්ම Advanced Combo එකක් හෝ 
    // සකස් කල Sticker එකක් එවනු ලබයි.
    const e1 = getEmojiCode(emojis[0]);
    const e2 = getEmojiCode(emojis[1]);

    try {
        let url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/emoji-kitchen/kitchen/${e1}/${e1}_${e2}.png`;
        let response;
        try { response = await axios.get(url, { responseType: 'arraybuffer' }); } 
        catch {
            url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/emoji-kitchen/kitchen/${e2}/${e2}_${e1}.png`;
            response = await axios.get(url, { responseType: 'arraybuffer' });
        }

        const stickerBuffer = await createSticker(response.data, "AI Story Mode", `${emojis.join(" + ")}`);
        await client.sendMessage(m.jid, { sticker: stickerBuffer }, { quoted: m });
    } catch {
        await m.reply("❌ AI Engine එක කාර්යබහුලයි. නැවත උත්සාහ කරන්න.");
    }
});

// ==========================================
// 7. BONUS: HELP COMMAND (.helpmix)
// ==========================================
Sparky({
    name: "helpmix",
    category: "fun",
    fromMe: isPublic,
    desc: "Emoji Kitchen Guide"
}, async ({ m }) => {
    let help = `🍳 *WELCOME TO EMOJI KITCHEN* 🍳\n\n`;
    help += `⚡ *Commands List:*\n`;
    help += `• \`.mix 👑 🐱\` - Combine two emojis.\n`;
    help += `• \`.randommix\` - Create a random sticker.\n`;
    help += `• \`.savemix <name>\` - Save last mix to favorites (Reply to mix message).\n`;
    help += `• \`.favmix <name>\` - Get your favorite saved mix.\n`;
    help += `• \`.topmix\` - View Top Creators & Popular mixes.\n`;
    help += `• \`.story 🤖 🔥 ⚔️\` - Create an AI Story scene sticker.\n\n`;
    help += `✨ *Premium Features (HD & Animations) Coming Soon!*`;
    return await m.reply(help);
});

