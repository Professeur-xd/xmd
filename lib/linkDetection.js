const fs = require("fs");
const path = require("path");

const linkDetectionFile = path.join(__dirname, "database/linkDetection.json");

// Ensure file exists
const ensureLinkDetectionFile = () => {
    if (!fs.existsSync(linkDetectionFile)) {
        fs.writeFileSync(linkDetectionFile, JSON.stringify({}));
    }
};

// Load active group settings
const getLinkDetectionSettings = () => {
    ensureLinkDetectionFile();
    return JSON.parse(fs.readFileSync(linkDetectionFile, "utf-8"));
};

// Enable link detection with a specific mode
const enableLinkDetection = (groupJid, mode) => {
    const settings = getLinkDetectionSettings();
    settings[groupJid] = mode;
    fs.writeFileSync(linkDetectionFile, JSON.stringify(settings));
};

// Disable link detection
const disableLinkDetection = (groupJid) => {
    const settings = getLinkDetectionSettings();
    delete settings[groupJid];
    fs.writeFileSync(linkDetectionFile, JSON.stringify(settings));
};

// Get mode (kick, delete, warn)
const getLinkDetectionMode = (groupJid) => {
    const settings = getLinkDetectionSettings();
    return settings[groupJid] || null;
};

module.exports = {
    enableLinkDetection,
    disableLinkDetection,
    getLinkDetectionMode
};
