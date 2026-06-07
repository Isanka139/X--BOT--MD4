const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

Sparky({
    name: "dict",
    alias: ["meaning", "dictionary", "arthaya", "dic"],
    category: "tools",
    fromMe: isPublic,
    desc: "ඉංග්‍රීසි වචන වල තේරුම + උච්චාරණය + Level"
}, async ({ client, m, args }) => {
    const word = args.join(" ");

    if (!word) {
        await client.sendMessage(m.jid, { react: { text: "❓", key: m.key } });
        return await m.reply(`*📚 DICTIONARY BOT*\n\nවචනයක් type කරපන් මචන් 👇\nEx: *.dict apple*\nEx: *.dict beautiful*`);
    }

    try {
        await client.sendPresenceUpdate('composing', m.jid);
        await client.sendMessage(m.jid, { react: { text: "🔍", key: m.key } });

        const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`, { timeout: 10000 });
        const data = res.data[0];

        const wordTitle = data.word;
        const phonetic = data.phonetic || data.phonetics.find(p => p.text)?.text || "N/A";
        const meanings = data.meanings;

        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

        // Word frequency calculate කරනවා - letter count + common words check
        const commonWords = ["the", "be", "and", "of", "a", "in", "to", "have", "it", "i", "that", "for", "you", "he", "with", "on", "do", "say", "this", "they", "at", "but", "we", "his", "from", "that", "not", "by", "she", "or", "as", "what", "go", "their", "can", "who", "get", "if", "would", "her", "all", "my", "make", "about", "know", "will", "as", "up", "one", "time", "there", "year", "so", "think", "when", "which", "them", "some", "me", "people", "take", "out", "into", "just", "see", "him", "your", "come", "could", "now", "than", "like", "other", "how", "then", "its", "our", "two", "more", "these", "want", "way", "look", "first", "also", "new", "because", "day", "more", "use", "no", "man", "find", "here", "thing", "give", "many", "well"];
        let level = "Advanced";
        if (commonWords.includes(wordTitle.toLowerCase())) level = "A1 - Basic";
        else if (wordTitle.length <= 5) level = "A2 - Elementary";
        else if (wordTitle.length <= 8) level = "B1 - Intermediate";
        else level = "B2+ - Advanced";

        let text = `╭─「 *📚 DICTIONARY* 」\n`;
        text += `│\n`;
        text += `├ *වචනය:* ${wordTitle}\n`;
        text += `├ *උච්චාරණය:* ${phonetic}\n`;
        text += `├ *Level:* ${level}\n`; // 4 වෙනුවට මේක ආවා
        text += `│\n`;

        meanings.forEach((meaning, i) => {
            text += `├─ *${i+1}. ${meaning.partOfSpeech.toUpperCase()}*\n`;
            
            meaning.definitions.slice(0, 3).forEach((def, j) => { // 4 නෙවෙයි 3 විතරක්
                text += `│  ${j+1}) ${def.definition}\n`;
                if (def.example) {
                    text += `│  💡 _${def.example}_\n`;
                }
            });
            text += `│\n`;
        });

        const synonyms = [...new Set(meanings.flatMap(m => m.synonyms || []).filter(s => s))].slice(0, 5);
        const antonyms = [...new Set(meanings.flatMap(m => m.antonyms || []).filter(a => a))].slice(0, 5);
        
        if (synonyms.length > 0) text += `├ *සමාන වචන:* ${synonyms.join(", ")}\n`;
        if (antonyms.length > 0) text += `├ *විරුද්ධ වචන:* ${antonyms.join(", ")}\n`;

        text += `╰─ Powered by DictionaryAPI.dev`;

        const audio = data.phonetics.find(p => p.audio)?.audio;
        if (audio) {
            await client.sendMessage(m.jid, { audio: { url: audio }, mimetype: "audio/mpeg", ptt: false }, { quoted: m });
        }

        await client.sendMessage(m.jid, { text }, { quoted: m });
        await client.sendPresenceUpdate('paused', m.jid);

    } catch (err) {
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        if (err.response?.status === 404) {
            await m.reply(`❌ *"${word}"* වචනය හොයාගන්න බැරි උනා\nSpelling එක check කරපන්`);
        } else {
            await m.reply(`❌ Error: ${err.message}`);
        }
        await client.sendPresenceUpdate('paused', m.jid);
    }
});
