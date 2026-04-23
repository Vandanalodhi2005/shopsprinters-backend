const asyncHandler = require('express-async-handler');
const SiteSettings = require('../models/SiteSettings');

// Helper: get-or-create the single settings document
const getSettings = async () => {
    let settings = await SiteSettings.findOne({ key: 'global' });
    if (!settings) {
        settings = await SiteSettings.create({ key: 'global' });
    }
    return settings;
};

// @desc  GET current site settings (public — read-only)
// @route GET /admin/header-visibility
// @access Public
const getHeaderVisibility = asyncHandler(async (req, res) => {
    const settings = await getSettings();
    res.json({
        showHeader:       settings.showHeader !== false,
        showLogo:         settings.showLogo !== false,
        allowModelSearch: settings.allowModelSearch !== false,
        allowInstallationFailed: settings.allowInstallationFailed !== false,
        allowCompleteSetup: settings.allowCompleteSetup !== false,
    });
});

// @desc  UPDATE site settings
// @route PUT /admin/header-visibility
// @access Private/Admin
const updateHeaderVisibility = asyncHandler(async (req, res) => {
    const { showHeader, showLogo, allowModelSearch, allowInstallationFailed, allowCompleteSetup } = req.body;

    const settings = await getSettings();

    if (showHeader       !== undefined) settings.showHeader       = showHeader;
    if (showLogo         !== undefined) settings.showLogo         = showLogo;
    if (allowModelSearch !== undefined) settings.allowModelSearch = allowModelSearch;
    if (allowInstallationFailed !== undefined) settings.allowInstallationFailed = allowInstallationFailed;
    if (allowCompleteSetup !== undefined) settings.allowCompleteSetup = allowCompleteSetup;

    const updated = await settings.save();

    res.json({
        showHeader:       updated.showHeader,
        showLogo:         updated.showLogo,
        allowModelSearch: updated.allowModelSearch,
        allowInstallationFailed: updated.allowInstallationFailed,
        allowCompleteSetup: updated.allowCompleteSetup,
        message:          'Settings updated successfully',
    });
});

module.exports = { getHeaderVisibility, updateHeaderVisibility };
