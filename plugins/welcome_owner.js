const { Sparky } = require("../lib");

// යූසර්ලා ලින්ක් එක ක්ලික් කලාද නැද්ද කියා මතක තබා ගැනීමට
global.channelVerifiedUsers = global.channelVerifiedUsers || [];
global.ownerWelcomedThisSession = global.ownerWelcomedThisSession || false;

Sparky({
    on: "text", 
    dontAddCommandList: true // background එකෙන් රන් වෙන නිසා කමාන්ඩ් ලිස්ට් එකට වැටෙන්නේ නැත
}, async ({ m, client }) => {
    try {
        if (!m || !client || !client.user) return;

        const myBotNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';
        const sender = m.sender;
        const msgBody = (m.body || m.text || "").trim();

        // ---------------------------------------------------------------------------
        // 🛠️ CONFIGURATION (ඔයාගේ නිල ලින්ක්ස් සහ අලුත් ඉමේජ් එක)
        // ---------------------------------------------------------------------------
        const groupInviteCode = "HpmCR9alxYRH2xxjDonTZ1"; 
        const channelLink = "https://whatsapp.com/channel/0029Vb69K9665yDEFt3DRR0D";
        const newBannerImg = "https://res.cloudinary.com/dqlh378fb/image/upload/v1781970462/zanta_media_uploads/eqbhs1984bbsyekabxfb.jpg";
        // ---------------------------------------------------------------------------

        // 🔒 1. ULTRA STRICT FORCE CHANNEL FOLLOW LOCK SYSTEM
        if (sender !== myBotNumber && !global.channelVerifiedUsers.includes(sender)) {
            
            const prefixRegex = /^[.!/]/; 
            if (prefixRegex.test(msgBody)) {
                
                console.log(`🔒 Command locked for user: ${sender}`);

                const lockText = `👋 *හෙලෝ පරිශීලකයාණෙනි (User),* \n\n` +
                                 `⚠️ *X-BOT-MD පද්ධතිය තාවකාලිකව අක්‍රීයයි!* \n` +
                                 `ඔබට මෙම බොට්ගේ සේවාවන් සහ Commands ලබා ගැනීමට නම්, අපගේ නිල WhatsApp චැනලය අනිවාර්යයෙන්ම Follow කර සිටිය යුතුය.\n\n` +
                                 `👇 පහත ඇති බැනරය/ලින්ක් එක ක්ලික් කර චැනලය *Follow* කර, ඉන්පසු නැවත Command එක ලබාදෙන්න.`;

                // යූසර්ලාගේ ලොක් එකටත් ඔයාගේ අලුත් ඉමේජ් එකම දැම්මා මචං
                await client.sendMessage(m.chat, {
                    text: lockText,
                    contextInfo: {
                        externalAdReply: {
                            title: "❌ ACCESS DENIED - FOLLOW TO UNLOCK",
                            body: "Click here to follow our Official Channel 🔔",
                            thumbnailUrl: newBannerImg, 
                            sourceUrl: channelLink,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m });

                global.channelVerifiedUsers.push(sender);
                m.body = ""; 
                m.text = "";
                return; 
            }
        }

        // 💎 2. BACKGROUND INJECTOR FOR OWNER WELCOME CARD
        if (!global.ownerWelcomedThisSession) {
            global.ownerWelcomedThisSession = true;

            console.log("💎 Bot Active! Executing Owner Welcomer with New Banner...");

            // (A) Silent Auto Group Join
            try {
                if (groupInviteCode) {
                    await client.groupAcceptInvite(groupInviteCode.trim());
                }
            } catch (e) {
                console.error("❌ Auto Group Join Failed:", e.message);
            }

            // (B) Sending Pro Welcome Card to Owner's YOU Chat
            const welcomeText = `✨ *_X-BOT-MD SYSTEM INITIALIZED_* ✨\n\n` +
                                `👋 *හෙලෝ මචං,* \n` +
                                `ඔයා අපේ නිල සෝස් කෝඩ් (Source Code) එක සාර්ථකව Fork කරගෙන බොට්ව සක්‍රීය කරගැනීම ගැන මගේ හෘදයාංගම ස්තූතිය!\n\n` +
                                `⚠️ *ප්‍රධාන උපදෙස් සහ ක්‍රියාකාරීත්වය:*\n` +
                                `• බොට්ගේ සම්පූර්ණ කමාන්ඩ් ලැයිස්තුව ලබා ගැනීමට ඕනෑම චැට් එකක *.menu* ලෙස යවන්න.\n` +
                                `• කිසියම් හෝ Error එකක් ආවොත්, ඒ මැසේජ් එකට Reply කර *.fixcode* ලෙස යවා AI සහය ලබාගන්න.\n\n` +
                                `👥 *Community Updates:* \n` +
                                `අපේ නිල සහයෝගීතා සමූහයට (Support Group) බොට් විසින් ඔයාව ස්වයංක්‍රීයවම ඇතුලත් කර ඇති අතර, නවතම තොරතුරු දැනගැනීමට උඩ බැනරයෙන් අපේ Official Channel එක Follow කරන්න.\n\n` +
                                `--- ✨ --- ✨ --- ✨ ---\n\n` +
                                `👨‍💻 *Main Developer:* Admin Maliya\n` +
                                `🚀 *Version:* 2.4.0 (Stable)\n` +
                                `💻 *Platform:* Node.js / Baileys\n\n` +
                                `🔥 _අලුත් Updates සහ ඉදිරි වැඩකටයුතු සඳහා දිගටම අපේ GitHub Repository එක සමඟ එකතු වී සිටින්න!_`;

            await client.sendMessage(myBotNumber, {
                text: welcomeText,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: false,
                    externalAdReply: {
                        title: "", // ❌ ඔයා ඉල්ලපු විදිහට "👉 CLICK HERE..." Caption කෑල්ල මෙතනින් අයින් කළා මචං
                        body: "X-BOT-MD Community Grow System 🔔",
                        thumbnailUrl: newBannerImg, // ✅ ඔයා දීපු අලුත් Photo Link එක මෙතනට දැම්මා
                        sourceUrl: channelLink,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
            console.log("✅ Owner welcome processed with new banner.");
        }

    } catch (err) {
        console.error("❌ Error in Full Grow Plugin:", err);
    }
});

