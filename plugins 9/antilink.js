const { cmd } = require("../command");
const { enableLinkDetection, disableLinkDetection, getLinkDetectionMode } = require("../lib/linkDetection");

cmd({
    pattern: "antilinkop",
    desc: "Manage anti-link settings in a group.",
    category: "moderation",
    filename: __filename
}, async (conn, mek, m, { from, args, isGroup, isAdmins, reply }) => {
    if (!isGroup) return reply("*This command can only be used in groups!*");
    if (!isAdmins) return reply("*You must be an admin to use this command!*");

    const mode = args[0]?.toLowerCase();
    if (!mode || !["kick", "delete", "warn", "off"].includes(mode)) {
        return reply("*Usage: antilinkop [kick/delete/warn/off]*");
    }

    if (mode === "off") {
        disableLinkDetection(from);
        return reply("*Antilink has been disabled for this group.*");
    }

    enableLinkDetection(from, mode);
    return reply(`*Antilink is now set to '${mode}' mode in this group.*`);
});
