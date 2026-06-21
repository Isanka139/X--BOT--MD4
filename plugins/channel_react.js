import { cmd } from '../lib/plugins.js'; // ඔයාගේ බේස් එක අනුව මේ path එක වෙනස් විය හැක (උදා: '../lib/index.js')

cmd({
    pattern: "creact",
    alias: ["creact", "chreact"],
    desc: "WhatsApp Channels සඳහා ස්වයංක්‍රීය ප්‍රතිචාර දැක්වීම.",
    category: "utility",
    use: '.channelreact [සබැඳිය] , [ඉමෝජි] , [වාර ගණන] , [ප්‍රමාදය]',
    filename: __filename
},
async (conn, m, text, { isCreator }) => {
    try {
        // හිස් ආදාන පරීක්ෂාව
        if (!text || text.trim() === "") {
            return m.reply(`ℹ️ *Channel React පද්ධතිය* ℹ️\n\n` +
                `*භාවිතය:* .channelreact [Link] , [Emoji] , [Count] , [Delay]\n` +
                `*උදාහරණ:* .channelreact https://whatsapp.com/channel/xxxx , 🔥 , 5 , 1.5`);
        }

        // දත්ත වෙන් කර ගැනීම
        let parts = text.split(',').map(p => p ? p.trim() : '');
        let channelLink = parts[0];
        let emojiInput = parts[1] || '❤️';
        let countInput = parts[2] || '1';
        let delayInput = parts[3] || '1.5';

        if (!channelLink || !channelLink.includes('whatsapp.com/channel/')) {
            return m.reply('❌ කරුණාකර වලංගු WhatsApp Channel සබැඳියක් (Link) ඇතුළත් කරන්න.');
        }

        let count = parseInt(countInput);
        if (isNaN(count) || count <= 0) count = 1;
        if (count > 30) count = 30; // සීමාව ඉක්මවා යාම වැළැක්වීමට

        let delaySec = parseFloat(delayInput);
        if (isNaN(delaySec) || delaySec < 0.5) delaySec = 0.5;

        m.reply('🔄 නාලිකා දත්ත පරීක්ෂා කරමින් පවතිනවා...');

        let urlClean = channelLink.split('channel/')[1];
        if (!urlClean) return m.reply('❌ සබැඳියේ ආකෘතිය වැරදියි.');
        
        let linkParts = urlClean.split('/');
        let inviteCode = linkParts[0];
        let specificPostId = linkParts[1];

        // චැනල් මෙටා දත්ත ලබා ගැනීම
        let queryResult = await conn.newsletterMetadata('invite', inviteCode).catch(() => null);
        if (!queryResult || !queryResult.id) {
            return m.reply('❌ නාලිකාව සොයා ගැනීමට නොහැකි විය. පුද්ගලික සබැඳියක් විය හැක.');
        }
        
        let channelJid = queryResult.id;
        let messageId;

        // පෝස්ට් එක තෝරා ගැනීම
        if (specificPostId) {
            messageId = parseInt(specificPostId);
        } else {
            let messages = await conn.fetchMessagesFromNewsletter({ jid: channelJid, count: 1 }).catch(() => null);
            if (!messages || messages.length === 0) {
                return m.reply('❌ මෙම නාලිකාව තුළ කිසිදු පණිවිඩයක් සොයා ගැනීමට නොහැකි විය.');
            }
            messageId = messages[0].id;
        }

        let emojiList = Array.from(emojiInput).filter(e => e.trim() !== "");
        if (emojiList.length === 0) emojiList = ['❤️'];

        m.reply(`🚀 *ප්‍රතිචාර ක්‍රියාවලිය ආරම්භ විය:*\n\n• නාලිකාව: ${queryResult.name}\n• වාර ගණන: ${count}\n• ප්‍රමාදය: තත්පර ${delaySec}`);

        const customDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // ප්‍රතිචාර යැවීමේ ලූප් එක
        for (let i = 0; i < count; i++) {
            try {
                let selectedEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
                await conn.sendMessage(channelJid, {
                    react: {
                        text: selectedEmoji,
                        key: { remoteJid: channelJid, id: messageId, fromMe: false }
                    }
                });
            } catch (err) {
                console.error(err);
            }
            await customDelay(delaySec * 1000);
        }

        return m.reply(`✅ *ක්‍රියාවලිය සාර්ථකයි!*`);

    } catch (globalError) {
        console.error(globalError);
        return m.reply(`❌ පද්ධතිමය දෝෂයක්: ${globalError.message}`);
    }
});

