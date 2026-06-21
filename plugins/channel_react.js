// Baileys import එක ඉවත් කර ඇත. 

export default {
    name: 'channelreact',
    category: 'owner',
    description: 'WhatsApp නාලිකාවල (Channels) පවතින නවතම පණිවිඩ සඳහා ස්වයංක්‍රීය ප්‍රතිචාර (Auto-React) දැක්වීම.',
    usage: '.channelreact [නාලිකා සබැඳිය] , [ප්‍රතිචාර සංකේතය] , [වාර ගණන]',

    function: async (instance, message, { text, prefix, command }) => {
        
        // 1. ප්‍රවේශ බලය පරීක්ෂා කිරීම
        if (!message.isOwner) {
            return message.reply('⚠️ මෙම විශේෂාංගය භාවිත කිරීමේ බලය ඇත්තේ බොට් හිමිකරුට (Bot Owner) පමණි.');
        }

        // 2. ආදාන දත්ත පරික්ෂා කිරීම
        if (!text) {
            return message.reply(`ℹ️ මෙම විශේෂාංගය නිවැරදිව භාවිත කිරීමට පහත ආකෘතිය (Format) අනුගමනය කරන්න:\n\n*පරිශීලන ක්‍රමය:* ${prefix}${command} [Channel Link] , [Emoji] , [Count]\n*උදාහරණයක්:* ${prefix}${command} https://whatsapp.com/channel/xxxx , 🔥 , 5`);
        }

        let parts = text.split(',').map(p => p.trim());
        let channelLink = parts[0];
        let emoji = parts[1] || '❤️'; 
        let count = parseInt(parts[2]) || 1; 

        if (!channelLink.includes('whatsapp.com/channel/')) {
            return message.reply('❌ කරුණාකර වලංගු WhatsApp Channel සබැඳියක් (Link) ඇතුළත් කරන්න.');
        }

        try {
            message.reply('🔄 නාලිකා දත්ත සහ නවතම පණිවිඩය (Latest Post) පරීක්ෂා කරමින් පවතිනවා. කරුණාකර රැඳී සිටින්න...');
            
            let inviteCode = channelLink.split('channel/')[1];
            let queryResult = await instance.conn.newsletterMetadata('invite', inviteCode);
            
            if (!queryResult || !queryResult.id) {
                return message.reply('❌ අදාළ නාලිකාව (Channel) සොයා ගැනීමට නොහැකි විය. කරුණාකර සබැඳිය නැවත පරීක්ෂා කරන්න.');
            }

            let channelJid = queryResult.id;

            let messages = await instance.conn.fetchMessagesFromNewsletter({
                jid: channelJid,
                count: 1
            });

            if (!messages || messages.length === 0) {
                return message.reply('❌ මෙම නාලිකාව තුළ කිසිදු පණිවිඩයක් සොයා ගැනීමට නොහැකි විය.');
            }

            let latestMessage = messages[0];
            let messageId = latestMessage.id;

            message.reply(`🚀  ක්‍රියාවලිය සාර්ථකයි!\n\n*නාලිකාව:* ${queryResult.name || 'WhatsApp Channel'}\n*ප්‍රතිචාරය:* ${emoji}\n*වාර ගණන:* ${count}\n\nස්වයංක්‍රීය ප්‍රතිචාර දැක්වීමේ ක්‍රියාවලිය දැන් ආරම්භ වේ...`);

            // JavaScript මඟින්ම ක්‍රියාත්මක වන delay function එකක් සකස් කිරීම
            const customDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            // 7. නියමිත වාර ගණන අනුව ප්‍රතිචාර යැවීම
            for (let i = 0; i < count; i++) {
                await instance.conn.sendMessage(channelJid, {
                    react: {
                        text: emoji,
                        key: {
                            remoteJid: channelJid,
                            id: messageId,
                            fromMe: false
                        }
                    }
                });
                
                // තත්පර 1.5 ක ප්‍රමාදයක් තැබීම
                await customDelay(1500); 
            }

            return message.reply(`✅ ක්‍රියාවලිය සාර්ථකව අවසන් කරන ලදී!\nනවතම පණිවිඩය සඳහා ${emoji} ප්‍රතිචාර ${count} වතාවක් ලබා දී ඇත.`);

        } catch (error) {
            console.error('Channel React System Error:', error);
            return message.reply(`❌ පද්ධතිමය දෝෂයක් (System Error) සිදු විය:\n\`${error.message || error}\``);
        }
    }
};
