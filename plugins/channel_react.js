const { Sparky } = require("../lib");

Sparky({
    name: "creact",
    alias: ["creact", "chreact"],
    category: "utility",
    desc: "Baileys දෝෂ මඟහරවා සෘජුවම චැනල් පෝස්ට් එකකට රියැක්ට් කිරීම.",
    fromMe: false
}, async ({ client, m, text }) => {
    try {
        let channelLink = "";

        if (m.quoted) {
            let contextUrl = m.data?.message?.extendedTextMessage?.contextInfo?.canonicalUrl || 
                             m.msg?.contextInfo?.canonicalUrl;
            if (contextUrl && contextUrl.includes("whatsapp.com/channel/")) {
                channelLink = contextUrl;
            } else if (m.quoted.text && m.quoted.text.includes("whatsapp.com/channel/")) {
                let linkMatch = m.quoted.text.match(/https:\/\/whatsapp\.com\/channel\/[^\s\n]+/);
                if (linkMatch) channelLink = linkMatch[0];
            }
        } else if (text) {
            let parts = text.trim().split(/\s+/);
            if (parts[0].includes("whatsapp.com/channel/")) channelLink = parts[0];
        }

        if (!channelLink) {
            return await m.reply(`ℹ️ *Pro Channel React (Fixed)* ℹ️\n\n` +
                `*භාවිතය:* ලින්ක් මැසේජ් එකට Reply කරමින්:\n` +
                `👉 .creact [Emoji] [Count]\n` +
                `*උදා:* .creact 🥲 10`);
        }

        let parts = text ? text.trim().split(/\s+/) : [];
        let emojiInput = parts[0] || "❤️";
        let countInput = parts[1] || "1";

        let count = parseInt(countInput);
        if (isNaN(count) || count <= 0) count = 1;
        if (count > 50) count = 50;

        await m.reply('🔄 නාලිකා ආරක්ෂණ පද්ධතිය පරීක්ෂා කරමින් පවතිනවා...');

        let urlClean = channelLink.split('channel/')[1];
        if (!urlClean) return await m.reply('❌ සබැඳියේ ආකෘතිය වැරදියි.');
        
        let linkParts = urlClean.split('/');
        let inviteCode = linkParts[0];
        let urlPostId = linkParts[1]; // ලින්ක් එකේ තියෙන අංකය (උදා: 193)

        // 1. චැනල් එකේ මෙටා දත්ත ලබා ගැනීම
        let queryResult = await client.newsletterMetadata('invite', inviteCode).catch(() => null);
        if (!queryResult || !queryResult.id) return await m.reply('❌ නාලිකාව සොයා ගැනීමට නොහැකි විය.');
        
        let channelJid = queryResult.id;

        // Auto-Follow ක්‍රියාවලිය
        try {
            if (queryResult.viewer_metadata?.role === 'guest' || !queryResult.viewer_metadata) {
                await client.newsletter('follow', channelJid).catch(() => null);
            }
        } catch (e) {}

        // 2. 🚀 [FIXED] fetchMessagesFromNewsletter වෙනුවට ආරක්ෂිතව ලින්ක් එකේ ඇති ID එක භාවිතය
        let messageId = urlPostId ? parseInt(urlPostId) : null;

        // ලින්ක් එකේ පෝස්ට් ID එකක් නැත්නම් විතරක් සර්වර් එකෙන් අලුත්ම එක query කරගන්න ට්‍රයි කිරීම
        if (!messageId) {
            try {
                let response = await client.query({
                    tag: 'newsletter',
                    attrs: { type: 'get', jid: channelJid },
                    content: [{ tag: 'messages', attrs: { count: '1' } }]
                });
                let msgNode = response?.content?.[0]?.content?.[0];
                if (msgNode && msgNode.attrs && msgNode.attrs.id) {
                    messageId = parseInt(msgNode.attrs.id);
                }
            } catch (e) {
                messageId = 1; // Fallback ID
            }
        }

        if (!messageId) messageId = 1;

        let selectedEmoji = Array.from(emojiInput)[0] || '❤️';

        await m.reply(`🚀 *ප්‍රතිචාර යැවීම ආරම්භ විය:*\n\n• නාලිකාව: ${queryResult.name}\n• පෝස්ට් ID: ${messageId}\n• වාර ගණන: ${count}`);

        // 3. Raw Protocol Injector එකෙන් සර්වර් එකට කෙලින්ම රියැක්ෂන් යැවීම
        for (let i = 0; i < count; i++) {
            try {
                await client.query({
                    tag: 'message',
                    attrs: { to: channelJid, type: 'reaction', id: client.generateMessageID() },
                    content: [{
                        tag: 'reaction',
                        attrs: { 
                            text: selectedEmoji, 
                            type: 'add', 
                            encMsgId: messageId.toString(),
                            fromMe: 'false'
                        }
                    }]
                });
            } catch (rawError) {
                // සෘජු ක්‍රමය (Standard Method)
                try {
                    await client.sendMessage(channelJid, {
                        react: { text: selectedEmoji, key: { remoteJid: channelJid, id: messageId, fromMe: false } }
                    });
                } catch (err) {}
            }
        }

        return await m.reply(`✅ *${queryResult.name} පෝස්ට් එකට ප්‍රතිචාර යවා අවසන්!*`);

    } catch (globalError) {
        return await m.reply(`❌ දෝෂයක් සිදු විය: ${globalError.message}`);
    }
});

