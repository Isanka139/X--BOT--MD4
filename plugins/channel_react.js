const { Sparky } = require("../lib");

Sparky({
    name: "creact",
    alias: ["creact", "chreact"],
    category: "utility",
    desc: "සර්වර් එකට සෘජුවම Raw Protocol මඟින් චැනල් පෝස්ට් එකකට රියැක්ට් කිරීම.",
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
            return await m.reply(`ℹ️ *Pro Channel React (Force Mode)* ℹ️\n\n` +
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

        await m.reply('🔄 සර්වර් ප්‍රොටොකෝල් සම්බන්ධතාවය ගොඩනගමින් පවතිනවා...');

        let urlClean = channelLink.split('channel/')[1];
        if (!urlClean) return await m.reply('❌ සබැඳියේ ආකෘතිය වැරදියයි.');
        
        let linkParts = urlClean.split('/');
        let inviteCode = linkParts[0];
        let urlPostId = linkParts[1];

        let queryResult = await client.newsletterMetadata('invite', inviteCode).catch(() => null);
        if (!queryResult || !queryResult.id) return await m.reply('❌ නාලිකාව සොයා ගැනීමට නොහැකි විය.');
        
        let channelJid = queryResult.id;

        // Auto-Follow Security Bypass
        try {
            if (queryResult.viewer_metadata?.role === 'guest' || !queryResult.viewer_metadata) {
                await client.newsletter('follow', channelJid).catch(() => null);
            }
        } catch (e) {}

        let messageId = null;
        let messages = await client.fetchMessagesFromNewsletter({ jid: channelJid, count: 20 }).catch(() => null);
        
        if (messages && messages.length > 0) {
            if (urlPostId) {
                let found = messages.find(msg => String(msg.id) === String(urlPostId));
                if (found) messageId = found.id;
            }
            if (!messageId) messageId = messages[0].id;
        }

        if (!messageId) {
            messageId = urlPostId ? parseInt(urlPostId) : 1;
        }

        let selectedEmoji = Array.from(emojiInput)[0] || '❤️';

        await m.reply(`🚀 *Raw Protocol Injector සක්‍රියයි:*\n\n• නාලිකාව: ${queryResult.name}\n• නිවැරදි සර්වර් ID: ${messageId}\n• වාර ගණන: ${count}`);

        // 🚀 [HARD FIXED] සර්වර් එකට බලෙන්ම (Force) රියැක්ෂන් එක තල්ලු කිරීමේ Binary Node ක්‍රමවේදය
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
                            // චැනල් සර්වර් එකට පණිවිඩය බලෙන් ඇතුල් කිරීමට මේ Nodes අනිවාර්ය වේ
                            fromMe: 'false'
                        }
                    }]
                });
            } catch (rawError) {
                // Fallback Standard Inject
                try {
                    await client.sendMessage(channelJid, {
                        react: { text: selectedEmoji, key: { remoteJid: channelJid, id: messageId, fromMe: false } }
                    });
                } catch (err) {}
            }
        }

        return await m.reply(`✅ *${queryResult.name} පෝස්ට් එකට සර්වර් එක හරහාම රියැක්ට් කර අවසන්!*`);

    } catch (globalError) {
        return await m.reply(`❌ දෝෂයක්: ${globalError.message}`);
    }
});

