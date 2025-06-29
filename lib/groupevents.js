// Made by khan, modified by DavidX, give credits while using 

const { isJidGroup } = require('baileys');
const config = require('../config');

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363398101781980@newsletter',
            newsletterName: '𝗛𝗔𝗜𝗞𝗢 𝗫𝗠𝗗',
            serverMessageId: 143,
        },
    };
};

const ppUrls = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

const GroupEvents = async (conn, update) => {
    try {
        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants.length;

        let ppUrl;

        for (const num of participants) {
            const userName = num.split("@")[0];
            const ppUrl = await conn.profilePictureUrl(num, "image");
            const timestamp = new Date().toLocaleString();

            if (update.action === "add" && config.WELCOME === "true") {
                const WelcomeText = `Hey @${userName} 👋\n` +
                    `Welcome to *${metadata.subject}*.\n\n` +
                    `You are member number ${groupMembersCount} in this group. 🙏\n\n` +
                    `Time joined: *${timestamp}*\n\n` +
                    `Description ⤵️:\n\n` +
                    `*${desc}*\n\n` +
                    `> *Powered by ${config.BOT_NAME}*`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "remove" && config.WELCOME === "true") {
                const GoodbyeText = `Goodbye @${userName}. 😔\n\n` +
                    `Another member has left the group.\n\n` +
                    `Time left: *${timestamp}*\n\n` +
                    `The group now has *${groupMembersCount}* members.`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                const demoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `*Admin Event*\n\n` +
                          `@${demoter} has demoted @${userName} from admin. 👀\n` +
                          `Time: ${timestamp}\n` +
                          `*Group:* ${metadata.subject}`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });

            } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                const promoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `*Admin Event*\n\n` +
                          `@${promoter} has promoted @${userName} to admin. 🎉\n` +
                          `Time: ${timestamp}\n` +
                          `*Group:* ${metadata.subject}`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
