const { Sparky } = require("../lib");

Sparky({
    name: "creact",
    alias: ["creact", "chreact"],
    category: "utility",
    desc: "Reply කරන ලද චැනල් ලින්ක් එකකට වාර ගණනක් ප්‍රතිචාර දැක්වීම.",
    fromMe: false
}, async ({ client, m, text }) => {
    try {
        let channelLink = "";
        let emoji = "❤️";
        let countInput = "1";
        let delayInput = "1.5";

        // 1. පරිශීලකයා මැසේජ් එකකට Reply (Quote) කර ඇත්නම්
        if (m.quoted) {
            // Reply කරන ලද මැසේජ් එකේ ඇති text එක ලබා ගැනීම
            let quotedText = m.quoted.text || "";
            
            // ඒ text එක ඇතුළේ වට්සැප් චැනල් ලින්ක් එකක් තියෙනවාදැයි බැලීම
            if (quotedText.includes("whatsapp.com/channel/")) {
                // ලින්ක් එක පමණක් වෙන් කර ගැනීම
                let linkMatch = quotedText.match(/https:\/\/whatsapp\.com\/channel\/[^\s]+/);
                if (linkMatch) {
                    channelLink = linkMatch[0];
                }
            }

            // කමාන්ඩ් එක සමඟ එවූ දත්ත (Emoji, Count, Delay) වෙන් කර ගැනීම
            if (text) {
                let parts = text.trim().split(/\s+/);
                emoji = parts[0] || "❤️";
                countInput = parts[1] || "1";
                delayInput = parts[2] || "1.5";
            }
        } else {
            // Reply කර නැතිනම් (කෙලින්ම ලින්ක් එක සහ දත්ත එක පේළියේ එවා ඇත්නම්)
            if (!text) {
                return await m.reply(`ℹ️ *Pro Channel React පද්ධතිය* ℹ️\n\n` +
                    `*භාවිතය (Reply ක්‍රමය):*\n` +
                    `1. චැනල් ලින්ක් එක චැට් එකට දමන්න.\n` +
                    `2. එම ලින්ක් මැසේජ් එකට *Reply* කරමින් මෙසේ ගසන්න:\n` +
                    `👉 .creact [Emoji] [Count] [Delay]\n` +
                    `*උදාහරණ:* .creact ❤️‍🩹 10 1.5`);
            }

            let parts = text.trim().split(/\s+/);
            channelLink = parts[0];
            emoji = parts[1] || "❤️";
            countInput = parts[2] || "1";
            delayInput = parts[3] || "1.5";
        }

        // ලින්ක් එකක් හමු නොවුනේ නම්
        if (!channelLink || !channelLink.includes('whatsapp.com/channel/')) {
            return await m.reply('❌ කරුණාකර වලංගු WhatsApp Channel සබැඳියක් (Link) සහිත මැසේජ් එකකට Reply කරන්න.');
        }

        // Safe Parsing
        let count = parseInt(countInput);
        if (isNaN(count) || count <= 0) count = 1;
        if (count > 50) count = 50; // උපරිම සීමාව 50 කි

        let delaySec = parseFloat(delayInput);
        if (isNaN(delaySec) || delaySec < 0.5) delaySec = 0.5;

        await m.reply('🔄 නාලිකා දත්ත පරීක්ෂා කරමින් පවතිනවා...');

        // ලින්ක් එකෙන් invite code සහ post id වෙන් කර ගැනීම
        let match = channelLink.match(/channel\/([^\/]+)(?:\/(\d+))?/);
        if (!match) return await m.reply('❌ සබැඳියේ ආකෘතිය වැරදියි.');

        let inviteCode = match[1];
        let specificPostId = match[2];

        // චැනල් මෙටා දත්ත ලබා ගැනීම
        let queryResult = await client.newsletterMetadata('invite', inviteCode).catch(() => null);
        if (!queryResult || !queryResult.id) {
            return await m.reply('❌ නාලිකාව සොයා ගැනීමට නොහැකි විය.');
        }
        
        let channelJid = queryResult.id;
        let messageId;

        if (specificPostId) {
            messageId = parseInt(specificPostId);
        } else {
            let messages = await client.fetchMessagesFromNewsletter({ jid: channelJid, count: 1 }).catch(() => null);
            if (!messages || messages.length === 0) {
                return await m.reply('❌ මෙම නාලිකාව තුළ පණිවිඩ කිසිවක් නැත.');
            }
            messageId = messages[0].id;
        }

        let emojiList = Array.from(emoji).filter(e => e.trim() !== "");
        let selectedEmoji = emojiList.length > 0 ? emojiList[0] : '❤️';

        await m.reply(`🚀 *ප්‍රතිචාර ක්‍රියාවලිය ආරම්භ විය:*\n\n• නාලිකාව: ${queryResult.name}\n• ඉමෝජිය: ${selectedEmoji}\n• වාර ගණන: ${count}\n• ප්‍රමාදය: තත්පර ${delaySec}`);

        const customDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // ප්‍රතිචාර යැවීමේ ලූප් එක
        for (let i = 0; i < count; i++) {
            let success = false;
            try {
                await client.sendMessage(channelJid, {
                    react: {
                        text: selectedEmoji,
                        key: { remoteJid: channelJid, id: messageId, fromMe: false }
                    }
                });
                success = true;
            } catch (err) {}

            if (!success) {
                try {
                    await client.relayMessage(channelJid, {
                        reactionMessage: {
                            text: selectedEmoji,
                            messageId: messageId,
                            key: { remoteJid: channelJid, fromMe: false, id: messageId }
                        }
                    }, { messageId: client.generateMessageID() });
                } catch (err2) {}
            }
            await customDelay(delaySec * 1000);
        }

        return await m.reply(`✅ *ක්‍රියාවලිය සාර්ථකව අවසන් වුණා!*`);

    } catch (globalError) {
        return await m.reply(`❌ දෝෂයක් සිදු විය: ${globalError.message}`);
    }
});
