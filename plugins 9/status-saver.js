const { cmd } = require("../command");
const { downloadMediaMessage } = require("../lib/msg");

// ✅ Define regex pattern using `new RegExp`
const regexSend = new RegExp(`\\b(send|share|snd|give|save|sendme|forward)\\b`, "i");

// ✅ Save WhatsApp Status (Manual Command)
cmd({
  pattern: "ssave",
  desc: "Save WhatsApp status",
  category: "utility",
  filename: __filename,
}, async (conn, mek, m, { sender, reply }) => {
  try {
    if (!m.quoted) return reply("*Reply to a WhatsApp status to save it.*");

    const { msg, type } = m.quoted;
    if (!msg || !type) return reply("*This message has no content to save.*");

    const mediaTypes = ["imageMessage", "videoMessage", "audioMessage", "stickerMessage", "documentMessage"];

    if (mediaTypes.includes(type)) {
      const mediaBuffer = await m.quoted.download();
      if (!mediaBuffer) return reply("*Failed to download media.*");
      await conn.sendMessage(sender, { [type.replace("Message", "")]: mediaBuffer }, { quoted: mek });
    } else if (type === "conversation" || type === "extendedTextMessage") {
      await conn.sendMessage(sender, { text: msg.text || msg }, { quoted: mek });
    }
  } catch (e) {
    console.error("❌ Error while saving status:", e);
  }
});

// ✅ Auto-Detect and Forward Based on Regex (Now Matches Your Example)
cmd({ on: "quoted" }, async (conn, mek, m, { text, sender }) => {
  try {
    if (!m.quoted || !text) return;

    console.log(`📥 Received Text: ${text}`); // Debugging log
    console.log(`🔍 Regex Match: ${regexSend.test(text.toLowerCase())}`); // Debugging log

    if (!regexSend.test(text.toLowerCase())) return;

    const { msg, type } = m.quoted;
    if (!msg || !type) return;

    const mediaTypes = ["imageMessage", "videoMessage", "audioMessage", "stickerMessage", "documentMessage"];

    if (mediaTypes.includes(type)) {
      const mediaBuffer = await m.quoted.download();
      if (!mediaBuffer) return reply("*Failed to download media.*");
      await conn.sendMessage(sender, { [type.replace("Message", "")]: mediaBuffer }, { quoted: mek });
    } else if (type === "conversation" || type === "extendedTextMessage") {
      await conn.sendMessage(sender, { text: msg.text || msg }, { quoted: mek });
    }
  } catch (e) {
    console.error("❌ Error while forwarding message:", e);
  }
});
