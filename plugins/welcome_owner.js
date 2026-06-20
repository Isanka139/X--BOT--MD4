const { Sparky } = require("../lib");

// ගෝලීය විචල්‍යයක් (Global Variable) මඟින් සර්වර් එක Run වන වාරයක් පාසා එක පාරක් පමණක් පරීක්ෂා කිරීම
global.hasSentWelcome = global.hasSentWelcome || false;

// ======================================================
// 🚀 ADVANCED AUTO WELCOME FOR REPO FORKERS (STABLE PRO)
// ======================================================
Sparky({
    on: "text", 
    dontAddCommandList: true 
}, async ({ m, client }) => {
    try {
        // බොටා ඔන් වුණු මේ වාරයේ දැනටමත් මැසේජ් එක ගිහින් නම් ආයේ යවන්න එපා
        if (global.hasSentWelcome) return;

        // බොට් රන් වෙන පරිශීලකයාගේම (Owner/You) WhatsApp ID එක
        const myBotNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';

        // මැසේජ් එක යැවීම සලකුණු කිරීම (සර්වර් එක රීස්ටාර්ට් වනතුරු නැවත නොයවයි)
        global.hasSentWelcome = true;

        console.log("💎 Sending Professional Welcome Message to Bot Owner...");

        // බොට්ගේ Profile Picture එක ලබා ගැනීම (නැත්නම් Default එකක් දීම)
        let profilePic;
        try {
            profilePic = await client.profilePictureUrl(myBotNumber, "image");
        } catch {
            profilePic = "https://res.cloudinary.com/dqlh378fb/image/upload/v1781970462/zanta_media_uploads/eqbhs1984bbsyekabxfb.jpg"; 
        }

        // වෘත්තීය මට්ටමේ පණිවිඩය
        const welcomeText = `✨ *X-BOT-MD SYSTEM INITIALIZED* ✨\n\n` +
                            `👋 *හෙලෝ මචං,* \n` +
                            `ඔයා අපේ නිල සෝස් කෝඩ් (Source Code) එක සාර්ථකව Fork කරගෙන බොට්ව සක්‍රීය කරගැනීම ගැන මගේ hෘදයාංගම ස්තූතිය!\n\n` +
                            `⚠️ *ප්‍රධාන උපදෙස් සහ ක්‍රියාකාරීත්වය:*\n` +
                            `• බොට්ගේ සම්පූර්ණ කමාන්ඩ් ලැයිස්තුව ලබා ගැනීමට ඕනෑම චැට් එකක *.menu* ලෙස යවන්න.\n` +
                            `• කිසියම් හෝ Error එකක් ආවොත්, ඒ මැසේජ් එකට Reply කර *.fixcode* ලෙස යවා AI සහය ලබාගන්න.\n\n` +
                            `--- ✨ --- ✨ --- ✨ ---\n\n` +
                            `👨‍💻 *Main Developer:* Admin Maly\n` +
                            `🚀 *Version:* 2.4.0 (Stable)\n` +
                            `💻 *Platform:* Node.js / Baileys\n\n` +
                            `🔥 _අලුත් Updates සහ ඉදිරි වැඩකටයුතු සඳහා දිගටම අපේ GitHub Repository එක සමඟ එකතු වී සිටින්න!_`;

        // WhatsApp External AdReply (Pro Rich Link Preview) එකක් ලෙස මැසේජ් එක යැවීම
        await client.sendMessage(myBotNumber, {
            text: welcomeText,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: false,
                externalAdReply: {
                    title: "X-BOT-MD OFFICIAL SYSTEM",
                    body: "Deployment & Connection Successful ✅",
                    thumbnailUrl: profilePic,
                    sourceUrl: "https://github.com", 
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        console.log("✅ Professional Welcome message sent successfully!");

    } catch (err) {
        console.error("❌ Error in Pro Welcome Plugin:", err);
    }
});

