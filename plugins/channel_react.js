const { Sparky } = require("../lib");

Sparky({
    name: "creact",
    alias: ["creact", "chreact"],
    category: "utility",
    desc: "Reply කරන ලද ලින්ක් එකකට රියැක්ට් කිරීම (ප්‍රමාදයකින් තොරව).",
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
            return await m.reply(`ℹ️ *Pro Channel React* ℹ️\n\n` +
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

        await m.reply('🔄 දත්ත පරීක්ෂා කරමින් පවතිනවා...');

        let urlClean = channelLink.split('channel/')[1];
        if (!urlClean) return await m.reply('❌ සබැඳියේ ආකෘතිය වැරදියි.');
        
        let linkParts = urlClean.split('/');
        let inviteCode = linkParts[0];
        let specificPostId = linkParts[1];

        let queryResult = await client.newsletterMetadata('invite', inviteCode).catch(() => null);
        if (!queryResult || !queryResult.id) return await m.reply('❌ නාලිකාව සොයා ගැනීමට නොහැකි විය.');
        
        let channelJid = queryResult.id;
        let messageId;

        if (specificPostId) {
            messageId = parseInt(specificPostId);
        } else {
            let messages = await client.fetchMessagesFromNewsletter({ jid: channelJid, count: 1 }).catch(() => null);
            if (!messages || messages.length === 0) return await m.reply('❌ පණිවිඩයක් නැත.');
            messageId = messages[0].id;
        }

        let selectedEmoji = Array.from(emojiInput)[0] || '❤️';

        await m.reply(`🚀 *ප්‍රතිචාර ක්‍රියාවලිය ආරම්භ විය:*\n• නාලිකාව: ${queryResult.name}\n• ඉමෝජිය: ${selectedEmoji}\n• වාර ගණන: ${count}`);

        for (let i = 0; i < count; i++) {
            try {
                await client.sendMessage(channelJid, {
                    react: { text: selectedEmoji, key: { remoteJid: channelJid, id: messageId, fromMe: false } }
                });
            } catch (err) {}
        }

        return await m.reply(`✅ *ක්‍රියාවලිය සාර්ථකයි!*`);

    } catch (globalError) {
        return await m.reply(`❌ දෝෂයක්: ${globalError.message}`);
    }
});

