const { Sparky } = require("../lib");

Sparky({
    name: "creact",
    alias: ["channelreact"],
    category: "utility",
    desc: "Reply ක්‍රමයට හෝ සෘජුවම චැනල් පෝස්ට් වලට රියැක්ට් කිරීම.",
    fromMe: false
}, async ({ client, m, text }) => {
    try {
        let channelJid = "";
        let urlPostId = null;
        let emoji = "";
        let countInput = "";

        // 1. [REPLY MODE] මැසේජ් එකකට Reply (Quote) කර ඇති විට
        if (m.quoted) {
            let quotedText = m.quoted.text || "";
            let contextUrl = m.data?.message?.extendedTextMessage?.contextInfo?.canonicalUrl || 
                             m.msg?.contextInfo?.canonicalUrl;
            
            let detectedLink = "";
            if (contextUrl && contextUrl.includes("whatsapp.com/channel/")) {
                detectedLink = contextUrl;
            } else if (quotedText.includes("whatsapp.com/channel/")) {
                let linkMatch = quotedText.match(/https:\/\/whatsapp\.com\/channel\/[^\s\n]+/);
                if (linkMatch) detectedLink = linkMatch[0];
            }

            // ලින්ක් එකක් හමුවුනේ නම් JID එක සහ Post ID එක වෙන් කර ගැනීම
            if (detectedLink) {
                let urlClean = detectedLink.split('channel/')[1];
                if (urlClean) {
                    let linkParts = urlClean.split('/');
                    let inviteCode = linkParts[0];
                    urlPostId = linkParts[1] ? parseInt(linkParts[1]) : null;

                    // සර්වර් එකෙන් JID එක සෙවීම
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
            // ලින්ක් එකක් නෙවෙයි නම්, රිප්ලයි කරපු මැසේජ් එකේ සෘජුවම JID එකක් (@newsletter) තියෙනවද බැලීම
            else if (quotedText.includes('@newsletter')) {
                let jidMatch = quotedText.match(/[0-9]+@newsletter/);
                if (jidMatch) channelJid = jidMatch[0];
            }

            // Reply Mode එකේදී ටෙක්ස්ට් එකෙන් Emoji සහ Count එක ගැනීම (.creact 💗 10)
            if (text) {
                let cleanText = text.replace(/[\n\r]/g, ' ').trim();
                let parts = cleanText.split(/\s+/);
                emoji = parts[0];
                countInput = parts[1];
            }
        } 
        // 2. [DIRECT MODE] රිප්ලයි නොකර කෙලින්ම ලින්ක්/JID එක දමා ඇති විට (.creact JID/Link 💗 10)
        else if (text) {
            let cleanText = text.replace(/[\n\r]/g, ' ').trim();
            let parts = cleanText.split(/\s+/);

            if (parts[0].includes('whatsapp.com/channel/') || parts[0].includes('@newsletter')) {
                let firstPart = parts[0];
                emoji = parts[1];
                countInput = parts[2];

                if (firstPart.includes('@newsletter')) {
                    channelJid = firstPart;
                } else {
                    let urlClean = firstPart.split('channel/')[1];
                    if (urlClean) {
                        let linkParts = urlClean.split('/');
                        let inviteCode = linkParts[0];
                        urlPostId = linkParts[1] ? parseInt(linkParts[1]) : null;

                        let res = await client.query({
                            tag: 'newsletter',
                            attrs: { type: 'get', jid: 's.whatsapp.net' },
                            content: [{ tag: 'invite', attrs: { code: inviteCode } }]
                        }).catch(() => null);

                        if (res && res.content && res.content[0]) channelJid = res.content[0].attrs.id;
                    }
                }
            }
        }

        // ආරක්ෂිත වැරදි පණිවිඩය
        if (!channelJid || !emoji) {
            return await m.reply(`ℹ️ *Pro Channel React System* ℹ️\n\n` +
                `*ක්‍රමය 1 (Reply ක්‍රමය):*\nਚැනල් ලින්ක් එකට හෝ .cjid මැසේජ් එකට *Reply* කරමින්:\n` +
                `👉 \`.creact [Emoji] [Count]\`\n` +
                `*උදා:* \`.creact 💗 10\`\n\n` +
                `*Sub ක්‍රමය 2 (කෙලින්ම ලිවීම):*\n` +
                `👉 \`.creact [Link/JID] [Emoji] [Count]\``);
        }

        let count = parseInt(countInput);
        if (isNaN(count) || count <= 0) count = 1;
        if (count > 30) count = 30;

        await m.reply('🔄 සර්වර් ප්‍රොටොකෝලය සක්‍රිය කරමින් පවතිනවා...');

        // 3. පෝස්ට් ID එක සොයා ගැනීම
        let messageIds = [];
        if (urlPostId) {
            messageIds.push(urlPostId);
        } else {
            // ලින්ක් එකේ අගට පෝස්ට් ID එකක් නැත්නම් චැනල් එකේ දැනට තියෙන අලුත්ම පෝස්ට් 15 කියවා ගැනීම
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

        if (messageIds.length === 0) messageIds.push(1); // Fallback ID

        let selectedEmoji = Array.from(emoji)[0] || '❤️';

        await m.reply(`🚀 *ප්‍රතිචාර ක්‍රියාවලිය ආරම්භ විය!* \n\n• JID: \`${channelJid}\`\n• පෝස්ට් ගණන: ${messageIds.length}\n• එක් පෝස්ට් එකකට වාර: ${count}`);

        // 4. Raw Protocol Injector Loop
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
