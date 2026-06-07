const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const FormData = require("form-data");

Sparky({
    name: "tourl",
    category: "tools",
    fromMe: isPublic,
    desc: "Convert replied image to URL"
}, async ({ m, client }) => {
    try {
        const quoted = m.quoted;

        if (!quoted) {
            return await m.reply("❌ Photo එකකට reply කරලා .tourl කියන්න.");
        }

        const mime = quoted.mimetype || "";

        if (!mime.startsWith("image")) {
            return await m.reply("❌ Image එකකට විතරයි support කරන්නෙ.");
        }

        await m.reply("⏳ Uploading image...");

        const buffer = await quoted.download();

        const form = new FormData();
        form.append("file", buffer, "image.jpg");

        const { data } = await axios.post(
            "https://api.imgbb.com/1/upload?key=c8bffc242bc925085cde1cc97dc6bec8",
            form,
            {
                headers: form.getHeaders()
            }
        );

        if (!data?.success) {
            return await m.reply("❌ Upload failed.");
        }

        await m.reply(
            `✅ Image Uploaded Successfully\n\n🔗 URL:\n${data.data.url}`
        );

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});
