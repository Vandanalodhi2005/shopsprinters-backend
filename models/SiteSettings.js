const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            default: 'global',
        },
        showHeader: {
            type: Boolean,
            default: true,
        },
        showLogo: {
            type: Boolean,
            default: true,
        },
        allowModelSearch: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

module.exports = SiteSettings;
