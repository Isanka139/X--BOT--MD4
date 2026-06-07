const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const FormData = require("form-data");

Sparky({
    name: "tourl",
    category: "tools",
    fromMe: isPublic,
    desc: "Convert image to URL"
}, async ({ m }) => {
    try {
        let imageMsg;

        // Reply කරලා නම්
        if (m.quoted && (m.quoted.mimetype || "").startsWith("image")) {
            imageMsg = m.quoted;
        }
        // Image එකට caption එකක් විදියට .tourl දීලා නම්
        else if ((m.mimetype || "").startsWith("image")) {
            imageMsg = m;
        }

        if (!imageMsg) {
            return await m.reply(
                "❌ Photo එකකට reply කරලා හෝ photo එක caption එකේ .tourl දීලා use කරන්න."
            );
        }

        await m.reply("⏳ Uploading image...");

        const buffer = await imageMsg.download();

        const form = new FormData();
        form.append("image", buffer, "image.jpg");

        const { data } = await axios.post(
            "https://api.imgbb.com/1/upload?key=c8bffc242bc925085cde1cc97dc6bec8",
            form,
            {
                headers: form.getHeaders()
            }
        );

        if (!data.success) {
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
