const { Sparky, isPublic } = require("../lib");

const questions = [
    { q: "ලංකාවේ අගනුවර මොකක්ද?", a: ["colombo", "කොළඹ", "sri jayawardenepura", "ශ්‍රී ජයවර්ධනපුර"] },
    { q: "1 + 1 x 0 = කීයද?", a: ["1", "one"] },
    { q: "පාට 7ක් තියෙන දෙයක් මොකක්ද?", a: ["rainbow", "දේදුන්න", "indradhanushaya"] },
    { q: "අතක් නෑ පායක් නෑ, පන තියෙනවා... මොකක්ද?", a: ["fish", "මාලුවා", "මාළු"] },
    { q: "ලෝකේ උසම කන්ද මොකක්ද?", a: ["everest", "එවරස්ට්"] }
];

const activeGames = new Map();

// උඹේ group link එක මෙතන දාපන්
const GROUP_LINK = "https://chat.whatsapp.com/HiN8XDhsKCoGVie6s1YbqR?s=cl&p=a&mlu=3";

Sparky({
    name: "fun",
    alias: ["games", "game"],
    category: "fun",
    fromMe: isPublic,
    desc: "Fun games + Auto join group"
}, async ({ client, m, args }) => {
    const gameType = args[0]?.toLowerCase();
    const gameId = m.jid + m.sender;
    const isGroup = m.jid.endsWith("@g.us");

    // 1. Private chat එකකින්.fun ගැහුවොත් group එකට join කරවනවා
    if (!isGroup && GROUP_LINK) {
        try {
            const inviteCode = GROUP_LINK.split("chat.whatsapp.com/")[1]?.split("?")[0];

            if (inviteCode) {
                await m.reply("⏳ ඔයාව group එකට add කරනවා...");
                await client.groupAcceptInvite(inviteCode);
                await m.reply("✅ Group එකට join උනා! දැන් group එක ඇතුලේ.game ගහපන් 🎮");
            }
        } catch (err) {
            console.log("Join error:", err.message);
            // Join fail උනාට quiz එක නවත්තන්නේ නෑ
        }
    }

    if (gameType === "stop") {
        activeGames.delete(gameId);
        return await m.reply("🛑 Game එක නැවැත්තුවා!");
    }

    if (activeGames.has(gameId) && gameType!== "stop") {
        return await m.reply("⚠️ දැනටමත් game එකක් run වෙනවා! උත්තරේ දෙන්න.funn උත්තරේ");
    }

    // 2. Quiz auto start -.fun ගැහුවම ප්‍රශ්නය එනවා
    const q = questions[Math.floor(Math.random() * questions.length)];
    activeGames.set(gameId, { type: "quiz", answer: q.a, time: Date.now() });

    await client.sendMessage(m.jid, {
        text: `*🎮 QUIZ TIME!* 🎮\n\n❓ ${q.q}\n\n⏱️ තත්පර 20 ඇතුලත උත්තරේ දෙන්න\n📝 Format: *.funn උඹේ උත්තරේ*\n🛑 නවත්තන්න:.fun stop`
    }, { quoted: m });

    setTimeout(() => {
        if (activeGames.has(gameId)) {
            activeGames.delete(gameId);
            client.sendMessage(m.jid, { text: `⏰ Time's up!\n✅ හරි උත්තරේ: *${q.a[0]}*` }, { quoted: m });
        }
    }, 20000);
});

// උත්තරේ check කරන command එක - වෙනසක් නෑ
Sparky({
    name: "funn",
    alias: ["ans", "answer"],
    category: "fun",
    fromMe: isPublic,
    desc: "Game එකට උත්තරේ submit කරන්න"
}, async ({ client, m, args }) => {
    const gameId = m.jid + m.sender;
    const game = activeGames.get(gameId);

    if (!game) {
        return await m.reply("⚠️ දැනට active game එකක් නෑ. අලුත් game එකක් start කරන්න.fun");
    }

    const userAnswer = args.join(" ").toLowerCase().trim();
    if (!userAnswer) {
        return await m.reply("📝 උත්තරේ type කරපන්. Ex:.funn කොළඹ");
    }

    if (game.type === "quiz") {
        if (game.answer.some(a => userAnswer.includes(a.toLowerCase()))) {
            activeGames.delete(gameId);
            await client.sendMessage(m.jid, {
                text: `🎉 සුපිරිය! උඹ දින්නා! ✅\nඋත්තරේ: *${game.answer[0]}*`
            }, { quoted: m });
        } else {
            const timeLeft = Math.max(0, Math.floor((20000 - (Date.now() - game.time))/1000));
            await m.reply(`❌ වැරදියි මචන්!\n⏱️ තව තත්පර ${timeLeft} ඉතුරුයි\nආපහු try කරපන්:.funn උත්තරේ`);
        }
    }
});
