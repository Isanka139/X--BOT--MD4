const { Sparky, isPublic } = require("../lib");
const Photo360 = require('abir-photo360-apis');

const effects = {
    naruto: { url: 'https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html', desc: 'Naruto style text effect' },
    dragonball: { url: 'https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html', desc: 'Dragon Ball style text effect' },
    onepiece: { url: 'https://en.ephoto360.com/create-one-piece-logo-style-text-effect-online-814.html', desc: 'One Piece logo style text effect' },
    '3dcomic': { url: 'https://en.ephoto360.com/create-online-3d-comic-style-text-effects-817.html', desc: '3D Comic style text effect' },
    marvel: { url: 'https://en.ephoto360.com/create-3d-marvel-logo-style-text-effect-online-811.html', desc: 'Marvel logo style text effect' },
    deadpool: { url: 'https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html', desc: 'Deadpool logo style text effect' },
    blackpink: { url: 'https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html', desc: 'Blackpink style logo with signatures' },
    harrypotter: { url: 'https://en.ephoto360.com/create-harry-potter-logo-style-text-effect-online-815.html', desc: 'Harry Potter logo style text effect' },
    neon: { url: 'https://en.ephoto360.com/write-text-on-3d-neon-sign-board-online-805.html', desc: '3D Neon sign board text' },
    glitch: { url: 'https://en.ephoto360.com/create-a-glitch-text-effect-online-812.html', desc: 'Glitch text effect' },
    rainbow: { url: 'https://en.ephoto360.com/create-rainbow-text-effects-online-801.html', desc: 'Rainbow text effect' },
    glass: { url: 'https://en.ephoto360.com/create-glass-text-effect-online-821.html', desc: 'Transparent glass text effect' },
    frostedGlass: { url: 'https://en.ephoto360.com/create-frosted-glass-text-effect-online-822.html', desc: 'Frosted glass text effect' },
    neonGlass: { url: 'https://en.ephoto360.com/create-3d-neon-glass-text-effect-online-823.html', desc: '3D neon glass text effect' },
    gold: { url: 'https://en.ephoto360.com/create-golden-metal-text-effect-online-804.html', desc: 'Golden metal text effect' },
    silver: { url: 'https://en.ephoto360.com/create-silver-metal-text-effect-online-806.html', desc: 'Silver metal text effect' },
    diamond: { url: 'https://en.ephoto360.com/create-diamond-text-effect-online-807.html', desc: 'Diamond text effect' },
    fire: { url: 'https://en.ephoto360.com/create-burning-fire-text-effect-online-802.html', desc: 'Burning fire text effect' },
    water: { url: 'https://en.ephoto360.com/create-underwater-text-effect-online-803.html', desc: 'Underwater text effect' },
    smoke: { url: 'https://en.ephoto360.com/create-smoky-text-effect-online-799.html', desc: 'Smoky text effect' },
    ice: { url: 'https://en.ephoto360.com/create-ice-text-effect-online-824.html', desc: 'Frozen ice text effect' },
    crystal: { url: 'https://en.ephoto360.com/create-crystal-text-effect-online-825.html', desc: 'Shiny crystal text effect' },
    luxury: { url: 'https://en.ephoto360.com/create-luxury-gold-text-effect-online-800.html', desc: 'Luxury gold text effect' },
    modern: { url: 'https://en.ephoto360.com/create-modern-metallic-text-effect-online-819.html', desc: 'Modern metallic text effect' },
    christmas: { url: 'https://en.ephoto360.com/create-christmas-text-effect-online-798.html', desc: 'Christmas text effect' },
    halloween: { url: 'https://en.ephoto360.com/create-halloween-pumpkin-text-effect-online-796.html', desc: 'Halloween pumpkin text effect' },
    graffiti: { url: 'https://en.ephoto360.com/create-graffiti-text-effects-online-795.html', desc: 'Graffiti text effect' },
    sand: { url: 'https://en.ephoto360.com/write-text-on-the-beach-sand-online-794.html', desc: 'Beach sand text effect' },
    sky: { url: 'https://en.ephoto360.com/write-text-on-the-cloud-sky-online-793.html', desc: 'Cloud sky text effect' },
    space: { url: 'https://en.ephoto360.com/create-galaxy-text-effect-online-792.html', desc: 'Galaxy text effect' }
};

// යූසර් දෙන දත්ත ටික එකතු කරගන්න ෆන්ක්ෂන් එක
function getQuery(args) {
    if (!args) return "";
    if (Array.isArray(args)) return args.join(" ").trim();
    if (typeof args === "string") return args.trim();
    if (typeof args === "object") return Object.values(args).join(" ").trim();
    return "";
}

async function createLogo(effectUrl, text) {
    try {
        const generator = new Photo360(effectUrl);
        generator.setName(text);
        const result = await generator.execute();  
        if (result.status && result.imageUrl) {  
            return { success: true, imageUrl: result.imageUrl };  
        } else {  
            return { success: false, error: 'Failed to generate image' };  
        }  
    } catch (error) {  
        console.error('Photo360 Error:', error.message);  
        return { success: false, error: error.message };  
    }
}

// සියලුම ලෝගෝ ඉෆෙක්ට්ස් ලූප් එකක් මගින් රෙජිස්ටර් කිරීම
for (const [effectName, effectInfo] of Object.entries(effects)) {
    Sparky({
        name: effectName,
        category: "logo",
        fromMe: isPublic,
        desc: effectInfo.desc
    }, async ({ client, m, args }) => {
        try {
            let text = getQuery(args);
            if (!text) {
                return m.reply(`❌ කරුණාකර ටෙක්ස්ට් එකක් ඇතුලත් කරන්න.\n💡 උදාහරණ: ${m.prefix}${effectName} ඔබේ නම`);
            }

            await m.react("🎨");
            await m.reply(`⏳ ${effectName} ලෝගෝ එක හදමින් පවතිනවා, මොහොතක් රැඳී සිටින්න...`);  
              
            const result = await createLogo(effectInfo.url, text);  
              
            if (!result.success) {  
                return m.reply(`❌ ලෝගෝ එක හදන්න බැරි වුණා මචං: ${result.error}`);  
            }  

            await client.sendMessage(m.jid, {  
                image: { url: result.imageUrl },  
                caption: `✨ *${effectName.toUpperCase()} LOGO* \n\n📝 *Text:* ${text}`  
            });  

        } catch (e) {  
            console.error(e);  
            return m.reply(`❌ Error එකක් ආවා මචං: ${e.message}`);  
        }  
    });
}

Sparky({
    name: "logo-list",
    alias: ["logolist", "logos"],
    category: "logo",
    fromMe: isPublic,
    desc: "Show all available logo effects"
}, async ({ client, m }) => {
    try {
        await m.react("📋");
        let list = "🎨 *ලබාගත හැකි සියලුම ලෝගෝ වර්ග:*\n\n";

        const categories = {  
            '🎌 Anime & Movies': ['naruto', 'dragonball', 'onepiece', 'marvel', 'deadpool', 'harrypotter'],  
            '🎵 Music & Entertainment': ['blackpink'],  
            '✨ Glow & Effects': ['neon', 'glitch', 'rainbow'],  
            '💰 Metal & Luxury': ['gold', 'silver', 'diamond', 'luxury', 'modern'],  
            '🌿 Nature & Elements': ['fire', 'water', 'smoke', 'sand', 'sky', 'space'],  
            '🎄 Holidays': ['christmas', 'halloween'],  
            '🎨 Art & Design': ['3dcomic', 'graffiti']  
        };  
          
        for (const [category, effectList] of Object.entries(categories)) {  
            list += `*${category}:*\n`;  
            effectList.forEach(effect => {  
                if (effects[effect]) {  
                    list += `• ${m.prefix}${effect}\n`;  
                }  
            });  
            list += '\n';  
        }  
          
        list += "\n📝 *භාවිතය:* .[effect] [text]\n";  
        list += "📌 *උදාහරණ:* .naruto Sparky-Bot";  
          
        await m.reply(list);  
    } catch (e) {  
        return m.reply(`❌ Error: ${e.message}`);  
    }
});

Sparky({
    name: "logo-search",
    alias: ["logosearch"],
    category: "logo",
    fromMe: isPublic,
    desc: "Search for logo effects"
}, async ({ client, m, args }) => {
    try {
        let searchTerm = getQuery(args).toLowerCase();
        if (!searchTerm) {
            return m.reply(`❌ කරුණාකර සෙවිය යුතු නම ඇතුලත් කරන්න.\n💡 උදාහරණ: ${m.prefix}logo-search neon`);
        }

        await m.react("🔍");
        const results = [];  
          
        for (const [effect, info] of Object.entries(effects)) {  
            if (effect.includes(searchTerm) || info.desc.toLowerCase().includes(searchTerm)) {  
                results.push(`• ${m.prefix}${effect} - ${info.desc}`);  
            }  
        }  
          
        if (results.length > 0) {  
            await m.reply(`🔍 *"${searchTerm}" සඳහා ලැබුණු ප්‍රතිඵල ${results.length}:*\n\n${results.join('\n')}`);  
        } else {  
            await m.reply(`❌ "${searchTerm}" සඳහා ගැලපෙන ඉෆෙක්ට් එකක් හමු වුණේ නැහැ මචං.\nUse *${m.prefix}logo-list* ඔක්කොම බලන්න.`);  
        }  
    } catch (e) {  
        return m.reply(`❌ Error: ${e.message}`);  
    }
});

Sparky({
    name: "logo-random",
    alias: ["logorandom"],
    category: "logo",
    fromMe: isPublic,
    desc: "Create random logo effect"
}, async ({ client, m, args }) => {
    try {
        let text = getQuery(args);
        if (!text) {
            return m.reply(`❌ කරුණාකර ටෙක්ස්ට් එකක් ඇතුලත් කරන්න.\n💡 උදාහරණ: ${m.prefix}logo-random My Text`);
        }

        await m.react("🎲");
        const effectKeys = Object.keys(effects);  
        const randomEffect = effectKeys[Math.floor(Math.random() * effectKeys.length)];  
        const effectInfo = effects[randomEffect];  
          
        await m.reply(`🎲 Random විදිහට *${randomEffect}* ලෝගෝ එක හදන්න ගත්තා...`);  
          
        const result = await createLogo(effectInfo.url, text);  
          
        if (!result.success) {  
            return m.reply(`❌ ලෝගෝ එක හදන්න බැරි වුණා මචං: ${result.error}`);  
        }  

        await client.sendMessage(m.jid, {  
            image: { url: result.imageUrl },  
            caption: `✨ *${randomEffect.toUpperCase()} LOGO (RANDOM)*\n\n📝 *Text:* ${text}`  
        });  
    } catch (e) {  
        return m.reply(`❌ Error: ${e.message}`);  
    }
});

Sparky({
    name: "logo-batch",
    alias: ["logobatch"],
    category: "logo",
    fromMe: isPublic,
    desc: "Create multiple effects at once"
}, async ({ client, m, args }) => {
    try {
        let input = getQuery(args);
        let parts = input.split(/ /);
        let effectsPart = parts[0];
        let text = parts.slice(1).join(" ");

        if (!effectsPart || !text) {
            return m.reply(`❌ භාවිතය: ${m.prefix}logo-batch [effect1,effect2] [text]\n💡 උදාහරණ: ${m.prefix}logo-batch naruto,dragonball,neon Hello`);
        }

        const effectsList = effectsPart.split(',').map(e => e.trim().toLowerCase());  
        const validEffects = [];  
        const invalidEffects = [];  
          
        for (const effect of effectsList) {  
            if (effects[effect]) {  
                validEffects.push(effect);  
            } else {  
                invalidEffects.push(effect);  
            }  
        }  
          
        if (validEffects.length === 0) {  
            return m.reply(`❌ වලංගු ලෝගෝ ඉෆෙක්ට් එකක්වත් නැහැ මචං. වලංගු නොවන ඒවා: ${invalidEffects.join(', ')}`);  
        }  
          
        if (invalidEffects.length > 0) {  
            await m.reply(`⚠️ මේවා වලංගු නැති නිසා අත්හැරියා: ${invalidEffects.join(', ')}`);  
        }  
          
        await m.react("🔄");
        await m.reply(`🔄 ලෝගෝ ${validEffects.length}ක් හදන්න පටන් ගත්තා...`);  
          
        const createdLogos = [];  
          
        for (const effect of validEffects) {  
            try {  
                const result = await createLogo(effects[effect].url, text);  
                  
                if (result.success) {  
                    createdLogos.push({ effect: effect, imageUrl: result.imageUrl });  
                      
                    await client.sendMessage(m.jid, {  
                        image: { url: result.imageUrl },  
                        caption: `✨ *${effect.toUpperCase()}* : ${text} (${createdLogos.length}/${validEffects.length})`  
                    });  
                      
                    await new Promise(resolve => setTimeout(resolve, 1000));  
                }  
            } catch (e) {  
                console.error(`Failed to create ${effect}:`, e.message);  
            }  
        }  
          
        if (createdLogos.length === 0) {  
            return m.reply("❌ එක ලෝගෝ එකක්වත් හදන්න බැරි වුණා.");  
        }  
          
        await m.reply(`✅ ලෝගෝ ${createdLogos.length}/${validEffects.length}ක් සාර්ථකව සාදා නිම කලා!`);  
          
    } catch (e) {  
        return m.reply(`❌ Error: ${e.message}`);  
    }
});

Sparky({
    name: "logo-info",
    alias: ["logoinfo"],
    category: "logo",
    fromMe: isPublic,
    desc: "Get information about a logo effect"
}, async ({ client, m, args }) => {
    try {
        let effect = getQuery(args).toLowerCase();
        if (!effect) {
            return m.reply(`❌ කරුණාකර ලෝගෝ වර්ගයක් ඇතුලත් කරන්න.\n💡 උදාහරණ: ${m.prefix}logo-info naruto`);
        }

        if (!effects[effect]) {  
            return m.reply(`❌ "${effect}" කියන ඉෆෙක්ට් එක හොයාගන්න නැහැ මචං.`);  
        }  
          
        await m.react("ℹ️");
        const info = effects[effect];  
        const message = `ℹ️ *${effect.toUpperCase()} Effect Info*\n\n` +  
                       `📝 *විස්තරය:* ${info.desc}\n` +  
                       `🔗 *ලින්ක් එක:* ${info.url}\n\n` +  
                       `💡 *භාවිතය:* ${m.prefix}${effect} [text]`;  
          
        await m.reply(message);  
    } catch (e) {  
        return m.reply(`❌ Error: ${e.message}`);  
    }
});

Sparky({
    name: "logo-help",
    alias: ["logohelp"],
    category: "logo",
    fromMe: isPublic,
    desc: "Help for logo commands"
}, async ({ client, m }) => {
    await m.react("❓");
    const helpText = `🎨 *Logo Generator Help Menu*\n\n` +
        `*commands:*\n` +
        `• ${m.prefix}[effect] [text] - ලෝගෝ එකක් සෑදීමට\n` +
        `• ${m.prefix}logo-list - සියලුම ලෝගෝ වර්ග බැලීමට\n` +
        `• ${m.prefix}logo-search [නම] - ලෝගෝ සෙවීමට\n` +
        `• ${m.prefix}logo-random [text] - Random ලෝගෝ එකක් සෑදීමට\n` +
        `• ${m.prefix}logo-batch [effects] [text] - ලෝගෝ කිහිපයක් එකවර සෑදීමට\n` +
        `• ${m.prefix}logo-info [effect] - ලෝගෝ එකක විස්තර බැලීමට\n\n` +
        `*📌 උදාහරණ:*\n` +
        `• ${m.prefix}naruto Uzumaki\n` +
        `• ${m.prefix}neon Welcome\n\n` +
        `_Note: ලෝගෝ සෑදීමට තත්පර කිහිපයක් ගතවිය හැක._`;

    await m.reply(helpText);
});

