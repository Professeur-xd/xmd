const config = require('../config');
const { cmd } = require("../command");
const Notice = require("../models/Notice");
const mongoose = require("mongoose");
const axios = require("axios");

// Owner ID (only this user can add/delete notices)
const OWNER_ID = "2349133354644@s.whatsapp.net"; // Replace with the owner's WhatsApp number in the correct format

// Add Notice
cmd({
  pattern: "addnotice",
  react: "📩",
  alias: "noticeadd",
  desc: "Add a new notice to the noticeboard (Owner Only).",
  category: "utility",
  use: ".addnotice <message>",
  filename: __filename,
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    // Check if the user is the owner
    const sender = mek.participant || mek.key.remoteJid; // Get the sender's ID
    if (sender !== OWNER_ID) {
      return reply("*[❌] Ooops You are not authorized to add notices, only DavidX can.*");
    }

    const message = args.join(" ");
    if (!message) {
      return reply("❌ Please provide a notice message.");
    }

    // Save the notice to the database
    const newNotice = new Notice({ message });
    await newNotice.save();

    reply("*✅ Notice added successfully!*");
  } catch (error) {
    console.error("Error adding notice:", error);
    reply("❌ An error occurred while adding the notice.");
  }
});

// Delete Notice by Index
cmd({
  pattern: "noticedelete",
  alias: "deletenotice",
  react: "🗑️",
  desc: "Delete a notice by its index (Owner Only).",
  category: "utility",
  use: ".noticedelete <index>",
  filename: __filename,
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    // Check if the user is the owner
    const sender = mek.participant || mek.key.remoteJid; // Get the sender's ID
    if (sender !== OWNER_ID) {
      return reply("*[❌] You are not authorized to delete notices.*");
    }

    const index = parseInt(args[0]) - 1; // Convert index to zero-based
    if (isNaN(index) || index < 0) {
      return reply("❌ Please provide a valid notice index.");
    }

    // Fetch all notices
    const notices = await Notice.find().sort({ timestamp: -1 });
    if (index >= notices.length) {
      return reply("❌ Notice index out of range.");
    }

    // Delete the notice by index
    const noticeToDelete = notices[index];
    await Notice.findByIdAndDelete(noticeToDelete._id);

    reply("✅ Notice deleted successfully!");
  } catch (error) {
    console.error("Error deleting notice:", error);
    reply("❌ An error occurred while deleting the notice.");
  }
});

// View Noticeboard with Status Message Attachment
cmd({
  pattern: "noticeboard",
  alias: ["updates","changelog"],
  desc: "View the noticeboard with all updates.",
  category: "utility",
  use: ".noticeboard",
  filename: __filename,
}, async (conn, mek, msg, { from, reply }) => {
  try {
    // Fetch all notices from the database
    const notices = await Notice.find().sort({ timestamp: -1 });

    if (notices.length === 0) {
      return reply("*📭 No notices/Updates available.*");
    }

    // Format the notices into a message
    let noticeMessage = "⟣┄〔 𝐔𝐏𝐃𝐀𝐓𝐄𝐒 〕┅⟢\n\n";
    notices.forEach((notice, index) => {
      noticeMessage += `${index + 1}. ${notice.message}\n`;
    });

    // Add a footer to the message
    noticeMessage += "\n> x-ʙᴏᴛ-ᴍᴅ ᴜᴘᴅᴀᴛᴇs";

    // Send the noticeboard with an image (status message)
    await conn.sendMessage(from, {
      image: { url: `https://files.catbox.moe/yv8zy4.jpg` }, // Replace with your image URL
      caption: noticeMessage,
      contextInfo: {
        mentionedJid: [msg.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363348038810906@newsletter',
          newsletterName: '『NOTICE BOARD』',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

  } catch (error) {
    console.error("Error fetching notices:", error);
    reply("❌ An error occurred while fetching the noticeboard.");
  }
});
        
