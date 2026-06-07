const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

const API_KEY = "4c973ebdcfbde98f36d684ebe7840062";

const weatherEmoji = {
    Thunderstorm: "⛈️", Drizzle: "🌦️", Rain: "🌧️", Snow: "❄️",
    Clear: "☀️", Clouds: "☁️", Mist: "🌫️", Smoke: "💨",
    Haze: "🌫️", Dust: "💨", Fog: "🌫️", Sand: "💨", Ash: "💨",
    Squall: "💨", Tornado: "🌪️"
};

Sparky({
    name: "weather",
    alias: ["w", "climate", "kawaguna"],
    category: "tools",
    fromMe: isPublic,
    desc: "City එකේ live weather + forecast"
}, async ({ client, m, args }) => {
    const city = args.join(" ");

    if (!city) {
        await client.sendMessage(m.jid, { react: { text: "❓", key: m.key } });
        return await m.reply(`╭─「 *🌤️ WEATHER PRO* 」\n│\n├ *Usage:*.w [city name]\n│\n├ *Examples:*\n│ 1).w colombo\n│ 2).w kandy\n│ 3).w tokyo\n│ 4).w london\n│\n╰─ Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`);
    }

    const startTime = Date.now();

    try {
        await client.sendPresenceUpdate('composing', m.jid);
        await client.sendMessage(m.jid, { react: { text: "🌐", key: m.key } });

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=en`;
        const res = await axios.get(url, { timeout: 10000 });
        const data = res.data;

        await client.sendMessage(m.jid, { react: { text: "⚙️", key: m.key } });

        const name = data.name;
        const country = data.sys.country;
        const temp = data.main.temp.toFixed(1);
        const feels = data.main.feels_like.toFixed(1);
        const min = data.main.temp_min.toFixed(1);
        const max = data.main.temp_max.toFixed(1);
        const humidity = data.main.humidity;
        const pressure = data.main.pressure;
        const wind = data.wind.speed;
        const desc = data.weather[0].description;
        const main = data.weather[0].main;
        const emoji = weatherEmoji[main] || "🌡️";
        const visibility = (data.visibility / 1000).toFixed(1);
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-LK', {hour: '2-digit', minute:'2-digit'});
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-LK', {hour: '2-digit', minute:'2-digit'});

        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

        const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

        let result = `╭─「 *🌤️ WEATHER PRO v2.0* 」\n`;
        result += `│\n`;
        result += `├ *City:* ${name}, ${country}\n`;
        result += `├ *Status:* ${emoji} ${desc.toUpperCase()}\n`;
        result += `│\n`;
        result += `├ *Temperature:*\n`;
        result += `│ 🌡️ Now: ${temp}°C\n`;
        result += `│ 🤔 Feels: ${feels}°C\n`;
        result += `│ 📉 Min: ${min}°C | 📈 Max: ${max}°C\n`;
        result += `│\n`;
        result += `├ *Details:*\n`;
        result += `│ 💧 Humidity: ${humidity}%\n`;
        result += `│ 🌬️ Wind: ${wind} m/s\n`;
        result += `│ 📊 Pressure: ${pressure} hPa\n`;
        result += `│ 👁️ Visibility: ${visibility} km\n`;
        result += `│\n`;
        result += `├ *Sun:* 🌅 ${sunrise} | 🌇 ${sunset}\n`;
        result += `├ *Speed:* ${timeTaken}s\n`;
        result += `│\n`;
        result += `╰─ Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;

        await client.sendMessage(m.jid, { text: result }, { quoted: m });
        await client.sendPresenceUpdate('paused', m.jid);

    } catch (err) {
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        console.error(err);

        if (err.response?.status === 404) {
            await m.reply(`❌ *"${city}"* city එක හොයාගන්න බැරි උනා\nSpelling එක හරියට type කරපන්\nEx: *.w colombo*`);
        } else {
            await m.reply(`❌ Weather data ගන්න බැරි උනා\nAPI limit ඉක්මවුනා වෙන්න පුළුවන්`);
        }
        await client.sendPresenceUpdate('paused', m.jid);
    }
});
