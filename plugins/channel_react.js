const { Sparky } = require("../lib");

Sparky({
    name: "creact",
    alias: ["creact", "chreact"],
    category: "utility",
    desc: "WhatsApp Channels සඳහා ස්වයංක්‍රීය ප්‍රතිචාර දැක්වීම.",
    fromMe: false // හැමෝටම පාවිච්චි කළ හැක (Public)
}, async ({ client, m, text }) => {
    try {
        // 1. හිස් ආදාන පරීක්ෂාව
        if (!text || text.trim() === "") {
            return await m.reply(`ℹ️ *Pro Channel React පද්ධතිය* ℹ️\n\n` +
                `*භාවිතය (කොමා අනවශ්‍යයි):* .creact [Link] [Emoji] [Count] [Delay]\n` +
                `*උදාහරණ:* .creact https://whatsapp.com/channel/xxxx ❤️ 5 1.5`);
        }

        // 2. හිස්තැන් (Spaces) මඟින් ආරක්ෂිතව දත්ත වෙන් කර ගැනීම
        let parts = text.trim().split(/\s+/);
        let channelLink = parts[0];
        let emojiInput = parts[1] || '❤️';
        let countInput = parts[2] || '1';
        let delayInput = parts[3] || '1.5';

        // 3. ලින්ක් එක වලංගුදැයි පරීක්ෂාව
        if (!channelLink || !channelLink.includes('whatsapp.com/channel/')) {
            return await m.reply('❌ කරුණාකර වලංගු WhatsApp Channel සබැඳියක් (Link) ඇතුළත් කරන්න.');
        }

        // ආරක්ෂිතව අගයන් සකස් කර ගැනීම (Safe Parsing)
        let count = parseInt(countInput);
        if (isNaN(count) || count <= 0) count = 1;
        if (count > 30) count = 30; // Spam වීම වැළැක්වීමට උපරිම 30 කි

        let delaySec = parseFloat(delayInput);
        if (isNaN(delaySec) || delaySec < 0.5) delaySec = 0.5; // අවම ප්‍රමාදය තත්පර 0.5 කි

        await m.reply('🔄 නාලිකා දත්ත පරීක්ෂා කරමින් පවතිනවා. කරුණාකර රැඳී සිටින්න...');

        // 4. ලින්ක් එකෙන් අයිඩී එක වෙන් කර ගැනීම
        let urlClean = channelLink.split('channel/')[1];
        if (!urlClean) return await m.reply('❌ සබැඳියේ ආකෘතිය වැරදියි.');
        
        let linkParts = urlClean.split('/');
        let inviteCode = linkParts[0];
        let specificPostId = linkParts[1];

        // 5. චැනල් මෙටා දත්ත ලබා ගැනීම
        let queryResult = await client.newsletterMetadata('invite', inviteCode).catch(() => null);
        if (!queryResult || !queryResult.id) {
            return await m.reply('❌ නාලිකාව සොයා ගැනීමට නොහැකි විය. පුද්ගලික සබැඳියක් විය හැක.');
        }
        
        let channelJid = queryResult.id;
        let messageId;

        // 6. ඉලක්කගත පෝස්ට් එක තීරණය කිරීම
        if (specificPostId) {
            messageId = parseInt(specificPostId);
        } else {
            let messages = await client.fetchMessagesFromNewsletter({ jid: channelJid, count: 1 }).catch(() => null);
            if (!messages || messages.length === 0) {
                return await m.reply('❌ මෙම නාලිකාව තුළ කිසිදු පණිවිඩයක් සොයා ගැනීමට නොහැකි විය.');
            }
            messageId = messages[0].id;
        }

        let emojiList = Array.from(emojiInput).filter(e => e.trim() !== "");
        if (emojiList.length === 0) emojiList = ['❤️'];

        await m.reply(`🚀 *ප්‍රතිචාර ක්‍රියාවලිය ආරම්භ විය:*\n\n• නාලිකාව: ${queryResult.name || 'WhatsApp Channel'}\n• වාර ගණන: ${count}\n• ප්‍රමාදය: තත්පර ${delaySec}`);

        const customDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // 7. ප්‍රතිචාර යැවීමේ ලූප් එක (ද්විත්ව ක්‍රමවේද ආරක්ෂාව සමඟ)
        for (let i = 0; i < count; i++) {
            let selectedEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
            let success = false;

            // ක්‍රමය 01: Standard Message React
            try {
                await client.sendMessage(channelJid, {
                    react: {
                        text: selectedEmoji,
                        key: { remoteJid: channelJid, id: messageId, fromMe: false }
                    }
                });
                success = true;
            } catch (err) {}

            // ක්‍රමය 02: Direct Relay Message (Fallback)
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
        console.error("Global Error: ", globalError);
        return await m.reply(`❌ පද්ධතිමය දෝෂයක් සිදු විය: ${globalError.message}`);
    }
});
