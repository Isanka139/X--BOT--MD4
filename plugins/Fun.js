const { Sparky, isPublic } = require("../lib");

const questions = [
    { q: "ලංකාවේ අගනුවර මොකක්ද?", a: ["colombo", "කොළඹ", "sri jayawardenepura", "ශ්‍රී ජයවර්ධනපුර"] },
    { q: "1 + 1 x 0 = කීයද?", a: ["1", "one"] },
    { q: "පාට 7ක් තියෙන දෙයක් මොකක්ද?", a: ["rainbow", "දේදුන්න", "indradhanushaya"] },
    { q: "අතක් නෑ පායක් නෑ, පන තියෙනවා... මොකක්ද?", a: ["fish", "මාලුවා", "මාළු"] },
    { q: "ලෝකේ උසම කන්ද මොකක්ද?", a: ["everest", "එවරස්ට්"] }
];

const riddles = [
    "ම ගන්නකොට තෙමෙනවා, දාගන්නකොට වියළෙනවා. මම කවුද? - පිළිතුර: තුවාය",
    "කට තියෙනවා කන්න බෑ, නාසය තියෙනවා හුස්ම ගන්න බෑ. මොකක්ද? - පිළිතුර: බෝතලය",
    "එක පාරක් පාවිච්චි කරලා විසි කරන දෙයක් මොකක්ද? - පිළිතුර: තැපැල් මුද්දරය"
];

const activeGames = new Map(); // jid+sender එකට game track කරන්න

Sparky({
    name: "fun",
    alias: ["games", "game"],
    category: "fun",
    fromMe: isPublic,
    desc: "Fun games ගහන්න..fun quiz |.fun riddle |.fun guess"
}, async ({ client, m, args }) => {
    const gameType = args[0]?.toLowerCase();
    const gameId = m.jid + m.sender;

    // Game නවත්තනවා නම්
    if (gameType === "stop") {
        activeGames.delete(gameId);
        return await m.reply("🛑 Game එක නැවැත්තුවා!");
    }

    // දැනට game එකක් run වෙනවා නම්
    if (activeGames.has(gameId)) {
        return await m.reply("⚠️ දැනටමත් game එකක් run වෙනවා! ඉවර කරන්න.fun stop ගහපන්");
    }

    // Quiz Game
    if (gameType === "quiz" ||!gameType) {
        const q = questions[Math.floor(Math.random() * questions.length)];
        activeGames.set(gameId, { type: "quiz", answer: q.a, time: Date.now() });

        await client.sendMessage(m.jid, {
            text: `*🎮 QUIZ TIME!* 🎮\n\n❓ ${q.q}\n\n⏱️ තත්පර 20 ඇතුලත උත්තරේ type කරපන්\n🛑 නවත්තන්න:.fun stop`
        }, { quoted: m });

        // 20s timer
        setTimeout(() => {
            if (activeGames.has(gameId)) {
                activeGames.delete(gameId);
                client.sendMessage(m.jid, { text: `⏰ Time's up!\n✅ හරි උත්තරේ: *${q.a[0]}*` }, { quoted: m });
            }
        }, 20000);

        // Answer listener
        const handler = async (chatUpdate) => {
            const msg = chatUpdate.messages?.[0];
            if (!msg?.message || msg.key.remoteJid!== m.jid || msg.key.fromMe) return;

            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase().trim();
            const game = activeGames.get(gameId);

            if (game?.type === "quiz") {
                if (game.answer.some(a => text.includes(a.toLowerCase()))) {
                    client.ev.off("messages.upsert", handler);
                    activeGames.delete(gameId);
                    await client.sendMessage(m.jid, { text: `🎉 හරි! උඹ දින්නා! ✅\nඋත්තරේ: *${game.answer[0]}*` }, { quoted: msg });
                }
            }
        };
        client.ev.on("messages.upsert", handler);

    // Riddle Game
    } else if (gameType === "riddle") {
        const r = riddles[Math.floor(Math.random() * riddles.length)];
        await client.sendMessage(m.jid, {
            text: `*🧩 බුද්ධි ප්‍රහේලිකාව* 🧩\n\n${r}`
        }, { quoted: m });

    // Guess Number Game
    } else if (gameType === "guess") {
        const number = Math.floor(Math.random() * 10) + 1;
        activeGames.set(gameId, { type: "guess", answer: number, tries: 3 });

        await client.sendMessage(m.jid, {
            text: `*🎲 Guess the Number!* 🎲\n\n1 සිට 10 දක්වා number එකක් හිතාගත්තා\nඋඹට උත්සාහ 3යි\nNumber එක type කරපන්...\n🛑 නවත්තන්න:.fun stop`
        }, { quoted: m });

        const handler = async (chatUpdate) => {
            const msg = chatUpdate.messages?.[0];
            if (!msg?.message || msg.key.remoteJid!== m.jid || msg.key.fromMe) return;

            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
            const game = activeGames.get(gameId);

            if (game?.type === "guess" &&!isNaN(text)) {
                const guess = parseInt(text);
                game.tries--;

                if (guess === game.answer) {
                    client.ev.off("messages.upsert", handler);
                    activeGames.delete(gameId);
                    await client.sendMessage(m.jid, { text: `🎉 සුපිරිය! ${game.answer} හරි! උඹ දින්නා! 🏆` }, { quoted: msg });
                } else if (game.tries <= 0) {
                    client.ev.off("messages.upsert", handler);
                    activeGames.delete(gameId);
                    await client.sendMessage(m.jid, { text: `😢 උත්සාහ ඉවරයි!\nහරි number එක: *${game.answer}*` }, { quoted: msg });
                } else {
                    await client.sendMessage(m.jid, { text: guess > game.answer? "📈 අඩු කරපන්" : "📉 වැඩි කරපන්", quoted: msg });
                }
            }
        };
        client.ev.on("messages.upsert", handler);

    } else {
        await m.reply(`*🎮 FUN GAMES* 🎮\n\nCommands:\n1. *.fun quiz* - ප්‍රශ්න අහනවා\n2. *.fun riddle* - බුද්ධි ප්‍රහේලිකා\n3. *.fun guess* - Number guess කරන්න\n4. *.fun stop* - Game එක නවත්තනවා`);
    }
});

// Reply එකට answer check කරන listener - quiz/guess වලට
Sparky({
    name: "funreply",
    fromMe: false,
    dontAddCommandList: true
}, async ({ m }) => {
    // Alive plugin එකේ වගේ reply listener.
    // Active game එකක් තියෙනවා නම් උඩ handler එකෙන්ම handle වෙනවා
});
