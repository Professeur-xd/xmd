const { cmd } = require('../command');

const { loadSettings, saveSettings } = require('../lib/groupMessagesStorage');

// Load persistent settings.

let settings = loadSettings();

let welcomeSettings = settings.welcome || {};   // { groupJid: { enabled: true/false, message: "custom text" } }

let goodbyeSettings = settings.goodbye || {};   // { groupJid: { enabled: true/false, message: "custom text" } }

/**

 * Default messages (using placeholders):

 * {user} – will be replaced by the mention (e.g. @username)

 * {group} – will be replaced by the group name

 */

const defaultWelcomeMessage = "Welcome {user} to {group}! We're glad to have you here.";

const defaultGoodbyeMessage = "Goodbye {user}. We'll miss you in {group}.";

/**

 * Replace placeholders in the message template.

 */

function formatMessage(template, userMention, groupName) {

  return template.replace("{user}", userMention).replace("{group}", groupName);

}

/**

 * Command: welcome

 * Usage:

 *   - "welcome on" : Enables welcome messages with the default message.

 *   - "welcome off": Disables welcome messages.

 *   - "welcome <custom message>" : Sets a custom welcome message.

 */

cmd(

  {

    pattern: "welcome",

    desc: "Set or disable the welcome message for new members.\nUsage: welcome on | welcome off | welcome <custom message>",

    category: "group",

    filename: __filename,

  },

  async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins }) => {

    try {

      if (!isGroup) return reply("This command can only be used in groups.");

      if (!isBotAdmins) return reply("I'm not admin.");

      if (args.length === 0) {

        const setting = welcomeSettings[from];

        if (setting && setting.enabled) {

          return reply(`Welcome messages are ON.\nCustom message: ${setting.message}`);

        } else {

          return reply("Welcome messages are OFF.");

        }

      }

      const option = args[0].toLowerCase();

      if (option === "on") {

        welcomeSettings[from] = { enabled: true, message: defaultWelcomeMessage };

        settings.welcome = welcomeSettings;

        saveSettings(settings);

        return reply("Welcome messages enabled with default message.");

      } else if (option === "off") {

        welcomeSettings[from] = { enabled: false, message: "" };

        settings.welcome = welcomeSettings;

        saveSettings(settings);

        return reply("Welcome messages disabled.");

      } else {

        // Treat the entire arguments as the custom message.

        const customMsg = args.join(" ");

        welcomeSettings[from] = { enabled: true, message: customMsg };

        settings.welcome = welcomeSettings;

        saveSettings(settings);

        return reply(`Custom welcome message set:\n${customMsg}`);

      }

    } catch (e) {

      console.log(e);

      m.reply(`${e}`);

    }

  }

);

/**

 * Command: goodbye

 * Usage:

 *   - "goodbye on" : Enables goodbye messages with the default message.

 *   - "goodbye off": Disables goodbye messages.

 *   - "goodbye <custom message>" : Sets a custom goodbye message.

 */

cmd(

  {

    pattern: "goodbye",

    desc: "Set or disable the goodbye message for departing members.\nUsage: goodbye on | goodbye off | goodbye <custom message>",

    category: "group",

    filename: __filename,

  },

  async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins }) => {

    try {

      if (!isGroup) return reply("This command can only be used in groups.");

      if (!isBotAdmins) return reply("I'm not admin.");

      if (args.length === 0) {

        const setting = goodbyeSettings[from];

        if (setting && setting.enabled) {

          return reply(`Goodbye messages are ON.\nCustom message: ${setting.message}`);

        } else {

          return reply("Goodbye messages are OFF.");

        }

      }

      const option = args[0].toLowerCase();

      if (option === "on") {

        goodbyeSettings[from] = { enabled: true, message: defaultGoodbyeMessage };

        settings.goodbye = goodbyeSettings;

        saveSettings(settings);

        return reply("Goodbye messages enabled with default message.");

      } else if (option === "off") {

        goodbyeSettings[from] = { enabled: false, message: "" };

        settings.goodbye = goodbyeSettings;

        saveSettings(settings);

        return reply("Goodbye messages disabled.");

      } else {

        const customMsg = args.join(" ");

        goodbyeSettings[from] = { enabled: true, message: customMsg };

        settings.goodbye = goodbyeSettings;

        saveSettings(settings);

        return reply(`Custom goodbye message set:\n${customMsg}`);

      }

    } catch (e) {

      console.log(e);

      m.reply(`${e}`);

    }

  }

);

/**

 * Listen for group-participants update events.

 * This handler processes new members, departures, and admin changes.

 */

function registerGroupMessages(conn) {

  // Listen for participant updates.

  conn.ev.on("group-participants.update", async (update) => {

    const groupId = update.id;

    let groupMetadata = null;

    try {

      groupMetadata = await conn.groupMetadata(groupId);

    } catch (error) {

      console.error("Error fetching group metadata:", error);

    }

    const groupName = groupMetadata ? groupMetadata.subject : "this group";

    // Welcome new participants.

    if (update.action === "add") {

      for (let participant of update.participants) {

        const setting = welcomeSettings[groupId];

        if (setting && setting.enabled) {

          let dpUrl = "";

          try {

            dpUrl = await conn.profilePictureUrl(participant, "image");

          } catch (error) {

            dpUrl = "https://files.catbox.moe/49gzva.png"; // fallback image URL

          }

          const mention = `@${participant.split("@")[0]}`;

          const messageTemplate = setting.message || defaultWelcomeMessage;

          const welcomeText = formatMessage(messageTemplate, mention, groupName);

          await conn.sendMessage(groupId, {

            image: { url: dpUrl },

            caption: welcomeText,

            mentions: [participant]

          });

        }

      }

    }

    

    // Goodbye for departing participants.

    if (update.action === "remove") {

      for (let participant of update.participants) {

        const setting = goodbyeSettings[groupId];

        if (setting && setting.enabled) {

          let dpUrl = "";

          try {

            dpUrl = await conn.profilePictureUrl(participant, "image");

          } catch (error) {

            dpUrl = "https://files.catbox.moe/49gzva.png";

          }

          const mention = `@${participant.split("@")[0]}`;

          const messageTemplate = setting.message || defaultGoodbyeMessage;

          const goodbyeText = formatMessage(messageTemplate, mention, groupName);

          await conn.sendMessage(groupId, {

            image: { url: dpUrl },

            caption: goodbyeText,

            mentions: [participant]

          });

        }

      }

    }

    

    // Handle admin promotions.

    if (update.action === "promote") {

      for (let participant of update.participants) {

        const promoMsg = `Hey @${participant.split("@")[0]}, you're now an admin! Handle your responsibility with care and lead the way! 🎉`;

        await conn.sendMessage(groupId, {

          text: promoMsg,

          mentions: [participant]

        });

      }

    }

    // Handle admin demotions.

    if (update.action === "demote") {

      for (let participant of update.participants) {

        const demoMsg = `@${participant.split("@")[0]}, you've been demoted from admin. Time to step back and regroup. 😔`;

        await conn.sendMessage(groupId, {

          text: demoMsg,

          mentions: [participant]

        });

      }

    }

  });

}

module.exports = { registerGroupMessages };
