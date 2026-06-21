import { sms } from '../lib/index.js'; // X-BOT-MD හි ප්‍රධාන මැසේජ් පද්ධතිය

sms({
    cmdname: "creact",
    desc: "WhatsApp Channels සඳහා ආරක්ෂිතව ස්වයංක්‍රීය ප්‍රතිචාර දැක්වීම.",
    category: "utility",
    use: '.channelreact [සබැඳිය] , [ඉමෝජි] , [වාර ගණන] , [ප්‍රමාදය]',
    filename: __filename
},
async (conn, m, text) => {
    
    // 1. හිස් ආදාන (Empty Input) නිසා Crash වීම වැළැක්වීම
    if (!text || text.trim() === "") {
        return m.reply(`ℹ️ *Pro Channel React පද්ධතිය* ℹ️\n\n` +
            `*භාවිතය:* .channelreact [Link] , [Emoji] , [Count] , [Delay]\n` +
            `*උදාහරණ:* .channelreact https://whatsapp.com/channel/xxxx , 🔥 , 5 , 2\n\n` +
            `• බහු-ඉමෝජි (Multi-Emoji): මාරුවෙන් මාරුවට වැටීමට ඉමෝජි කිහිපයක් ළඟ ළඟ යොදන්න (උදා: 🔥❤️👍).`);
    }

    // 2. ආරක්ෂිතව දත්ත වෙන් කර ගැනීම (Safe Splitting)
    let parts = text.split(',').map(p => p ? p.trim() : '');
    let channelLink = parts[0];
    let emojiInput = parts[1] || '❤️';
    let countInput = parts[2] || '1';
    let delayInput = parts[3] || '1.5';

    // 3. සබැඳිය (Link) වැරදි වීම නිසා සිදුවන දෝෂ වැළැක්වීම
    if (!channelLink || !channelLink.includes('whatsapp.com/channel/')) {
        return m.reply('❌ කරුණාකර වලංගු WhatsApp Channel සබැඳියක් (Link) ඇතුළත් කරන්න.');
    }

    // 4. අගයන් නිවැරදි සංඛ්‍යාවන් බවට පත් කිරීම (Safe Parsing)
    let count = parseInt(countInput);
    if (isNaN(count) || count <= 0) count = 1; // අකුරු ගැහුවොත් Crash නොවී 1 ලෙස ගනී
    if (count > 30) count = 30; // WhatsApp සීමාවන් ඉක්මවා ගොස් Block වීම වැළැක්වීමට (Max 30)

    let delaySec = parseFloat(delayInput);
    if (isNaN(delaySec) || delaySec < 0.5) delaySec = 0.5; // අවම ප්‍රමාදය තත්පර 0.5 කි

    try {
        m.reply('🔄 නාලිකා දත්ත සහ පණිවිඩ පරීක්ෂා කරමින් පවතිනවා. කරුණාකර රැඳී සිටින්න...');

        // 5. ලින්ක් එක ආරක්ෂිතව වෙන් කර ගැනීම
        let urlClean = channelLink.split('channel/')[1];
        if (!urlClean) return m.reply('❌ සබැඳියේ ආකෘතිය (Link Format) වැරදියි.');
        
        let linkParts = urlClean.split('/');
        let inviteCode = linkParts[0];
        let specificPostId = linkParts[1];

        // 6. චැනල් මෙටා දත්ත පරීක්ෂාව (Crash Protection for Un-found Channels)
        if (!conn.newsletterMetadata) {
            return m.reply('❌ ඔබගේ බොට් බේස් එක (Baileys Version) WhatsApp Channels සඳහා සහය දක්වන්නේ නැත.');
        }

        let queryResult;
        try {
            queryResult = await conn.newsletterMetadata('invite', inviteCode);
        } catch (e) {
            return m.reply('❌ නාලිකාව (Channel) සොයා ගැනීමට නොහැකි විය. පුද්ගලික හෝ වැරදි සබැඳියක් විය හැක.');
        }

        if (!queryResult || !queryResult.id) {
            return m.reply('❌ නාලිකාවේ අනන්‍යතාවය (JID) තහවුරු කර ගැනීමට නොහැකි විය.');
        }
        
        let channelJid = queryResult.id;
        let messageId;

        // 7. පෝස්ට් එක ලබා ගැනීමේ ආරක්ෂිත ක්‍රියාවලිය
        if (specificPostId) {
            messageId = parseInt(specificPostId);
            if (isNaN(messageId)) return m.reply('❌ ලබා දී ඇති පෝස්ට් අංකය (Post ID) වලංගු නැත.');
        } else {
            let messages;
            try {
                messages = await conn.fetchMessagesFromNewsletter({ jid: channelJid, count: 1 });
            } catch (e) {
                return m.reply('❌ නාලිකාවේ පණිවිඩ (Messages) කියවීමට බොටාට අවසර නැත.');
            }

            if (!messages || messages.length === 0) {
                return m.reply('❌ මෙම නාලිකාව තුළ කිසිදු පණිවිඩයක් සොයා ගැනීමට නොහැකි විය.');
            }
            messageId = messages[0].id;
        }

        // 8. සැබෑ ඉමෝජි ලැයිස්තුවක් සාදා ගැනීම (Safe Array conversion for Emojis)
        let emojiList = Array.from(emojiInput).filter(e => e.trim() !== "");
        if (emojiList.length === 0) emojiList = ['❤️'];

        m.reply(`🚀 *ප්‍රතිචාර ක්‍රියාවලිය සාර්ථකව ආරම්භ විය:*\n\n• නාලිකාව: ${queryResult.name || 'WhatsApp Channel'}\n• පෝස්ට් අංකය: ${messageId}\n• වාර ගණන: ${count}\n• ප්‍රමාදය: තත්පර ${delaySec}`);

        // Custom Delay 
        const customDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // 9. ලූප් එක ඇතුළත සිදුවන දෝෂ වලින් මුළු සිස්ටම් එකම Crash වීම වැළැක්වීම
        for (let i = 0; i < count; i++) {
            try {
                let selectedEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];

                await conn.sendMessage(channelJid, {
                    react: {
                        text: selectedEmoji,
                        key: {
                            remoteJid: channelJid,
                            id: messageId,
                            fromMe: false
                        }
                    }
                });
            } catch (loopError) {
                console.error("Reaction Loop Error:", loopError);
                // එක් රියැක්ට් එකක් ෆේල් වුණත් මුළු බොටාම ක්‍රෑෂ් නොවී ඊළඟ එකට යයි.
            }
            await customDelay(delaySec * 1000);
        }

        return m.reply(`✅ *ක්‍රියාවලිය සාර්ථකව නිම කරන ලදී!*\nනාලිකාවේ පෝස්ට් එක සඳහා ප්‍රතිචාර යවා අවසන්.`);

    } catch (globalError) {
        console.error("Global Channel React Error:", globalError);
        return m.reply(`❌ බලාපොරොත්තු නොවූ පද්ධතිමය දෝෂයක් සිදු විය:\n\`${globalError.message || globalError}\``);
    }
});

