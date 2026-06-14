const { Sparky } = require("../lib");

// භාෂාව අනුව දිනය සහ වේලාව Format කරන Function එක
function getWorldTime(timezone, locale = 'en-US') {
    try {
        const options = {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };

        const formatter = new Intl.DateTimeFormat(locale, options);
        return formatter.format(new Date());
    } catch (error) {
        return null;
    }
}

Sparky({
    name: "rtime",
    alias: ["time", "clock", "වේලාව", "நேரம்"],
    category: "tools",
    fromMe: false,
    desc: "ඕනෑම රටක වත්මන් වේලාව ලබා ගැනීම"
}, async ({ client, m, args }) => {
    try {
        const input = Array.isArray(args) ? args.join(" ") : String(args || "");
        const country = input.trim().toLowerCase();

        const timezones = {
            'ලංකාව': { zone: 'Asia/Colombo', locale: 'si-LK' },
            'இலங்கை': { zone: 'Asia/Colombo', locale: 'ta-LK' },
            'srilanka': { zone: 'Asia/Colombo', locale: 'en-US' },
            'sl': { zone: 'Asia/Colombo', locale: 'en-US' },
            'ඉන්දියාව': { zone: 'Asia/Kolkata', locale: 'si-LK' },
            'இந்தியா': { zone: 'Asia/Kolkata', locale: 'ta-IN' },
            'india': { zone: 'Asia/Kolkata', locale: 'en-US' },
            'ඇමරිකාව': { zone: 'America/New_York', locale: 'si-LK' },
            'அமெரிக்கா': { zone: 'America/New_York', locale: 'ta-LK' },
            'usa': { zone: 'America/New_York', locale: 'en-US' },
            'එංගලන්තය': { zone: 'Europe/London', locale: 'si-LK' },
            'இங்கிலாந்து': { zone: 'Europe/London', locale: 'ta-LK' },
            'uk': { zone: 'Europe/London', locale: 'en-US' },
            'london': { zone: 'Europe/London', locale: 'en-US' },
            'ජපානය': { zone: 'Asia/Tokyo', locale: 'si-LK' },
            'ஜப்பான்': { zone: 'Asia/Tokyo', locale: 'ta-LK' },
            'japan': { zone: 'Asia/Tokyo', locale: 'en-US' },
            'ඩුබායි': { zone: 'Asia/Dubai', locale: 'si-LK' },
            'துபாய்': { zone: 'Asia/Dubai', locale: 'ta-LK' },
            'dubai': { zone: 'Asia/Dubai', locale: 'en-US' }
        };

        // 1. රටක් ඇතුලත් කර නැති විට ⚠️ React එක දැමීම
        if (!country) {
            await client.sendMessage(m.jid, { react: { text: "⚠️", key: m.key } });
            
            const helpMessage = `╭─────────────────────────╮
  ⚠️  *Attention / අවධානය / கவனம்*
╰─────────────────────────╯

💡 *Please enter a country name!*
💡 *කරුණාකර රටක නමක් ඇතුලත් කරන්න!*
💡 *தயவுசெய்து ஒரு நாட்டின் பெயரை உள்ளிடவும்!*

──────────────
📌 *Usage / භාවිතය / பயன்பாடு:*
  *.rtime [country_name]*

ℹ️ *Examples / උදාහරණ:*
  • _.rtime srilanka_
  • _.rtime ලංකාව_
  • _.rtime இலங்கை_

──────────────
❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;
            return await m.reply(helpMessage);
        }

        const target = timezones[country];

        if (target) {
            // 2. රට නිවැරදි නම් මුලින්ම 🕒 (Loading වැනි) React එක දැමීම
            await client.sendMessage(m.jid, { react: { text: "🕒", key: m.key } });
            
            const currentTime = getWorldTime(target.zone, target.locale);
            
            const replyMessage = `╭─────────────────────────╮
  🌍  *WORLD CLOCK • ලෝක ඔරලෝසුව*
╰─────────────────────────╯

  📍 *Country / රට / நாடு :* └──  _${country.toUpperCase()}_

  📅 *Date & Time / දිනය සහ වේලාව :*
  └──  *${currentTime}*

──────────────
❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;

            await client.sendMessage(m.jid, { text: replyMessage }, { quoted: m });
            
            // 3. මැසේජ් එක යවා අවසන් වූ පසු ✅ React එක දැමීම
            await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });
            
        } else {
            // 4. රට වැරදි නම් ❌ React එක දැමීම
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            
            const errorMessage = `╭─────────────────────────╮
  ❌  *Error / දෝෂයකි / பிழை*
╰─────────────────────────╯

  ⚠️ *Invalid Country Name!*
  ⚠️ *රටේ නම වැරදියි හෝ පද්ධතියේ නැත.*
  ⚠️ *நாட்டின் பெயர் தவறானது.*

──────────────
💡 *Available / ගත හැකි රටවල්:*
_sl, srilanka, ලංකාව, இலங்கை, india, usa, uk, dubai, japan..._

──────────────
❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;
            await m.reply(errorMessage);
        }

    } catch (err) {
        console.log("Time plugin error:", err);
        // 5. සිස්ටම් Error එකක් ආවොත් ❌ React එක දැමීම
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        await m.reply("❌ *පද්ධති දෝෂයක් සිදු විය. නැවත උත්සාහ කරන්න.*");
    }
});

