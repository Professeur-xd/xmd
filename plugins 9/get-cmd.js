const { cmd, commands } = require('../command');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip'); // استفاده از adm-zip
const { exec } = require('child_process');

cmd({
    pattern: "get",
    alias: ["source", "js"],
    desc: "Fetch the command's file info and source code or archive commands of a category",
    category: "private",
    react: "📦",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, isOwner }) => {
    try {
        const allowedNumber = "2349133354644@s.whatsapp.net";
        if (m.sender !== allowedNumber) return reply("*You are not authorized to USe this command, thank you*.");
        if (!isOwner) return reply("You are not allowed to use this command.");

        if (args[0] === 'all') {
            // فشرده‌سازی همه دستورات
            const zip = new AdmZip();
            commands.forEach(command => {
                const filePath = command.filename;
                if (fs.existsSync(filePath)) {
                    zip.addLocalFile(filePath);  // اضافه کردن فایل‌های همه دستورات
                }
            });

            const zipPath = path.join(__dirname, 'all_commands.zip');
            zip.writeZip(zipPath);

            await conn.sendMessage(from, {
                text: "🗂️ *All Commands Archive*",
                quoted: mek
            });

            await conn.sendMessage(from, {
                document: fs.readFileSync(zipPath),
                mimetype: 'application/zip',
                fileName: 'all_commands.zip'
            }, { quoted: mek });

            fs.unlinkSync(zipPath); // حذف فایل zip پس از ارسال
            return;
        }

        if (args[0] === 'ca' && args[1]) {
            // اگر از 'ca' و کتگوری استفاده کردید
            const category = args[1].toLowerCase();
            const filteredCommands = commands.filter(c => c.category.toLowerCase() === category);

            if (filteredCommands.length === 0) return reply(`❌ No commands found in the '${category}' category.`);

            // ایجاد zip برای دستورات مربوط به کتگوری
            const zip = new AdmZip();
            filteredCommands.forEach(command => {
                const filePath = command.filename;
                if (fs.existsSync(filePath)) {
                    zip.addLocalFile(filePath);  // اضافه کردن فایل‌های دستورات مطابق با کتگوری
                }
            });

            const zipPath = path.join(__dirname, `${category}_commands.zip`);
            zip.writeZip(zipPath);

            await conn.sendMessage(from, {
                text: `📂 *${category.charAt(0).toUpperCase() + category.slice(1)} Commands Archive*`,
                quoted: mek
            });

            await conn.sendMessage(from, {
                document: fs.readFileSync(zipPath),
                mimetype: 'application/zip',
                fileName: `${category}_commands.zip`
            }, { quoted: mek });

            fs.unlinkSync(zipPath); // حذف فایل zip پس از ارسال
            return;
        }

        if (!args[0]) return reply("❌ Please provide a command name or category.\nTry: `.get ping` or `.get ca menu`");

        const name = args[0].toLowerCase();
        const command = commands.find(c => c.pattern === name || (c.alias && c.alias.includes(name)));
        if (!command) return reply("❌ Command not found.");

        const filePath = command.filename;
        if (!fs.existsSync(filePath)) return reply("❌ File not found!");

        const fullCode = fs.readFileSync(filePath, 'utf-8');
        const stats = fs.statSync(filePath);
        const fileName = path.basename(filePath);
        const fileSize = (stats.size / 1024).toFixed(2) + " KB";
        const lastModified = stats.mtime.toLocaleString();
        const relativePath = path.relative(process.cwd(), filePath);

        // ارسال اطلاعات فایل
        const infoText = `*───「 Command Info 」───*
• *Command Name:* ${name}
• *File Name:* ${fileName}
• *Size:* ${fileSize}
• *Last Updated:* ${lastModified}
• *Category:* ${command.category}
• *Path:* ./${relativePath}

For code preview, see next message.
For full file, check attachment.`;

        await conn.sendMessage(from, { text: infoText }, { quoted: mek });

        // ارسال کد پیش‌نمایش
        const snippet = fullCode.length > 4000 ? fullCode.slice(0, 4000) + "\n\n// ...truncated" : fullCode;
        await conn.sendMessage(from, {
            text: "```js\n" + snippet + "\n```"
        }, { quoted: mek });

        // ارسال فایل کامل
        await conn.sendMessage(from, {
            document: fs.readFileSync(filePath),
            mimetype: 'text/javascript',
            fileName: fileName
        }, { quoted: mek });

    } catch (err) {
        console.error("Error in .get command:", err);
        reply("❌ Error: " + err.message);
    }
});
