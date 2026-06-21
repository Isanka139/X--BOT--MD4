const { Sparky } = require("../lib");

Sparky({
    name: "creact",
    alias: ["channelreact"],
    category: "utility",
    desc: "උසස් Regex මඟින් ඕනෑම ආකෘතියකින් JID/Link හඳුනාගෙන රියැක්ට් කිරීම.",
    fromMe: false
}, async ({ client, m, text }) => {
    try {
        let channelJid = "";
        let urlPostId = null;
        let combinedText = "";

        // 1. රිප්ලයි මැසේජ් එකකින් හෝ වත්මන් ටෙක්ස්ට් එකෙන් ලින්ක් එක/JID එක සෙවීම
        if (m.quoted) {
            let quotedText = m.quoted.text || "";
            let contextUrl = m.data?.message?.extendedTextMessage?.contextInfo?.canonicalUrl || 
                             m.msg?.contextInfo?.canonicalUrl;
            
            if (contextUrl && contextUrl.includes("whatsapp.com/channel/")) {
                combinedText += " " + contextUrl;
            }
            if (quotedText) combinedText += " " + quotedText;
        }

        if (text) combinedText += " " + text;

        // පිරිසිදු කිරීම සහ එකම පේළියකට ගැනීම
        combinedText = combinedText.replace(/[\n\r]/g, ' ').trim();

        // 🚀 [THE ADVANCED REGEX FIX] ලින්ක් එක හෝ JID එක කොතැන තිබුණත් සොයා ගැනීම
        let jidMatch = combinedText.match(/[0-9]+@newsletter/);
        let linkMatch = combinedText.match(/https:\/\/whatsapp\.com\/channel\/[^\s]+/);

        if (jidMatch) {
            channelJid = jidMatch[0];
        } else if (linkMatch) {
            let urlClean = linkMatch[0].split('channel/')[1];
            if (urlClean) {
                let linkParts = urlClean.split('/');
                let inviteCode = linkParts[0];
                urlPostId = linkParts[1] ? parseInt(linkParts[1]) : null;

                let res = await client.query({
                    tag: 'newsletter',
                    attrs: { type: 'get', jid: 's.whatsapp.net' },
                    content: [{ tag: 'invite', attrs: { code: inviteCode } }]
                }).catch(() => null);

                if (res && res.content && res.content[0]) {
                    channelJid = res.content[0].attrs.id;
                }
            }
        }

        // ටෙක්ස්ට් එකෙන් JID හෝ ලින්ක් කොටස් ඉවත් කර ඉතිරි ටෙක්ස්ට් එකෙන් Emoji සහ Count සෙවීම
        let remainingText = text ? text.replace(/[\n\r]/g, ' ').trim() : "";
        if (jidMatch) remainingText = remainingText.replace(jidMatch[0], "");
        if (linkMatch) remainingText = remainingText.replace(linkMatch[0], "");
        
        let parts = remainingText.trim().split(/\s+/).filter(p => p.length > 0);
        
        // Default අගයන්
        let emoji = parts[0] || "❤️";
        let countInput = parts[1] || "5";

        // රිප්ලයි මෝඩ් එකේදී .creact 💗 10 ලෙස පමණක් දුන් විට
        if (m.quoted && (!text || !text.includes('@newsletter') && !text.includes('whatsapp.com/channel/'))) {
            if (text) {
                let replyParts = text.trim().split(/\s+/);
                emoji = replyParts[0] || "❤️";
                countInput = replyParts[1] || "5";
            }
        }

        // ආරක්ෂිත වැරදි පණිවිඩය (අවම වශයෙන් චැනල් එකක්වත් හමු වී නොමැති නම්)
        if (!channelJid) {
            return await m.reply(`ℹ️ *Pro Channel React System* ℹ️\n\n` +
                `*ක්‍රමය 1 (Reply ක්‍රමය):*\nචැනල් ලින්ක් එකට හෝ JID මැසේජ් එකට *Reply* කරමින්:\n` +
                `👉 \`.creact [Emoji] [Count]\`\n` +
                `*උදා:* \`.creact 💗 10\`\n\n` +
                `*ක්‍රමය 2 (කෙලින්ම ලිවීම):*\n` +
                `👉 \`.creact [Link හෝ JID] [Emoji] [Count]\``);
        }

        let count = parseInt(countInput);
        if (isNaN(count) || count <= 0) count = 5;
        if (count > 30) count = 30;

        await m.reply('🔄 වට්සැප් සර්වර් එක සමඟ සම්බන්ධ වෙමින් පවතිනවා...');

        // පෝස්ට් ID ලැයිස්තුව ලබා ගැනීම
        let messageIds = [];
        if (urlPostId) {
            messageIds.push(urlPostId);
        } else {
            try {
                let response = await client.query({
                    tag: 'newsletter',
                    attrs: { type: 'get', jid: channelJid },
                    content: [{ tag: 'messages', attrs: { count: '15' } }]
                });
                let nodes = response?.content?.[0]?.content || [];
                nodes.forEach(n => { if (n.attrs && n.attrs.id) messageIds.push(n.attrs.id); });
            } catch (e) {}
        }

        if (messageIds.length === 0) messageIds.push(1);

        let selectedEmoji = Array.from(emoji)[0] || '❤️';

        await m.reply(`🚀 *ප්‍රතිචාර ක්‍රියාවලිය ආරම්භ විය!* \n\n• JID: \`${channelJid}\`\n• පෝස්ට් ගණන: ${messageIds.length}\n• එක් පෝස්ට් එකකට වාර: ${count}`);

        // Binary Node Injector Loop
        for (let mid of messageIds) {
            for (let i = 0; i < count; i++) {
                try {
                    await client.query({
                        tag: 'message',
                        attrs: { to: channelJid, type: 'reaction', id: client.generateMessageID() },
                        content: [{ 
                            tag: 'reaction', 
                            attrs: { text: selectedEmoji, type: 'add', encMsgId: mid.toString(), fromMe: 'false' } 
                        }]
                    });
                } catch (e) {}
            }
        }

        await m.reply(`✅ *සාර්ථකව ප්‍රතිචාර යවා අවසන් කර ඇත!*`);

    } catch (e) {
        await m.reply(`❌ දෝෂයක්: ${e.message}`);
    }
});

