const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');

cmd({
  on: "body"
}, async (conn, m, { isGroup }) => {
  try {
    if (config.MENTION_REPLY !== 'true' || !isGroup) return;
    if (!m.mentionedJid || m.mentionedJid.length === 0) return;

    const voiceClips = [
      "https://files.catbox.moe/fcweo1.mp3",
      "https://files.catbox.moe/kceqcs.mp4",
      "https://files.catbox.moe/u2166x.mp4",
      "https://files.catbox.moe/93mris.mp4",
      "https://files.catbox.moe/ighy8b.mp4",

"https://files.catbox.moe/fqie8i.mp4",
 "https://files.catbox.moe/f6jczi.mp4",

"https://files.catbox.moe/exmbsn.mp4",
 "https://files.catbox.moe/fipilb.mp4",
   "https://files.catbox.moe/35pvwm.mp4",
 "https://files.catbox.moe/pammd4.mp4",
      "https://files.catbox.moe/p9uyjx.mp3",
      "https://files.catbox.moe/tpvxix.mp3"
    ];

    const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];
    const botNumber = conn.user.id.split(":")[0] + '@s.whatsapp.net';

    if (m.mentionedJid.includes(botNumber)) {
      const thumbnailRes = await axios.get(config.MENU_IMAGE_URL || "https://files.catbox.moe/c836ws.png", {
        responseType: 'arraybuffer'
      });
      const thumbnailBuffer = Buffer.from(thumbnailRes.data, 'binary');

      await conn.sendMessage(m.chat, {
        audio: { url: randomClip },
        mimetype: 'audio/mp4',
        ptt: true,
        waveform: [99, 0, 99, 0, 99]
        }, { quoted: m });
    }
  } catch (e) {
    console.error(e);
    const ownerJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    await conn.sendMessage(ownerJid, {
      text: `*Bot Error in Mention Handler:*\n${e.message}`
    });
  }
});
