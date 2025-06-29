const { cmd } = require("../command"); // Import command handler

cmd({
  pattern: "binance",
  react: "💰",
  alias: ["payment"],
  desc: "Displays Binance payment details with your USD address.",
  category: "payments",
  use: ".binance",
  filename: __filename
}, 
async (conn, mek, m, { from }) => {
  try {
    const binanceImage = "https://files.catbox.moe/6lghp8.jpg"; // Binance image URL
    const binanceID = "751232667";
    const usdAddress = "TBfbZFvYudtSZUof3KLP8D2jK2N3zppPka";

    const caption = `╔✦『 *BINANCE PAYMENT* 』✦╗
║💳 *Binance ID:* \`${binanceID}\`
║💵 *USD Address:* \`${usdAddress}\`
║🔗 *Send your payments securely!*
╚═══════════════╝
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘʀɪɴᴄᴇ xᴛʀᴇᴍᴇ*`;

    await conn.sendMessage(from, { image: { url: binanceImage }, caption }, { quoted: m });
  } catch (error) {
    console.error("Error in Binance command:", error);
    await conn.sendMessage(from, { text: "❌ An error occurred while fetching Binance details." }, { quoted: m });
  }
});


cmd({
  pattern: "opay",
  react: "🏦",
  alias: ["bank", "payment2"],
  desc: "Displays Opay payment details.",
  category: "payments",
  use: ".opay",
  filename: __filename
}, 
async (conn, mek, m, { from, reply }) => {
  try {
    const opayImage = "https://files.catbox.moe/3lmb5r.jpg"; // Image URL
    const accountNumber = "529633982655";
    const accountName = "xtreme Promise";
    const bankName = "Opay";

    const caption = `╔═✦『 *OPAY PAYMENT* 』✦╗
║🏦 *Bank Name:* \`${bankName}\`
║👤 *Account Name:* \`${accountName}\`
║💳 *Account Number:* \`${accountNumber}\`
║🔗 *Make payments securely!*
║🖼️ *screenshot(ss) needed*
║🖼️ *send ss here wa.me/529633982655*
╚═══════════════╝
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘʀɪɴᴄᴇ xᴛʀᴇᴍᴇ*`;

    await conn.sendMessage(from, { image: { url: opayImage }, caption }, { quoted: mek });
  } catch (error) {
    console.error("Error in Opay command:", error);
    reply("❌ An error occurred while fetching Opay details.");
  }
});



cmd({
  pattern: "uba",
  react: "🏦",
  alias: ["bank2", "opay2"],
  desc: "Displays Opay payment details.",
  category: "payments",
  use: ".opay",
  filename: __filename
}, 
async (conn, mek, m, { from, reply }) => {
  try {
    const opayImage = "https://files.catbox.moe/ipr2eh.jpg"; // Image URL
    const accountNumber = "529633982655";
    const accountName = "xtreme Promise";
    const bankName = "United Bank for Africans (UBA)";

    const caption = `╔═✦『 *BANK PAYMENT* 』✦╗
║🏦 *Bank Name:* \`${bankName}\`
║👤 *Account Name:* \`${accountName}\`
║💳 *Account Number:* \`${accountNumber}\`
║🔗 *Make payments securely!*
║🖼️ *screenshot(ss) needed*
║🖼️ *send ss here wa.me/529633982655*
╚═══════════════╝
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘʀɪɴᴄᴇ xᴛʀᴇᴍᴇ*`;

    await conn.sendMessage(from, { image: { url: opayImage }, caption }, { quoted: mek });
  } catch (error) {
    console.error("Error in Opay command:", error);
    reply("❌ An error occurred while fetching Opay details.");
  }
});
      
