const mongoose = require('mongoose');

const setupSettingSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'global' },
    showHeader: { type: Boolean, default: true },
    showLogo: { type: Boolean, default: true },
    allowModelSearch: { type: Boolean, default: true },
    showCompleteSetupPage: { type: Boolean, default: true },
    showInstallationErrorPage: { type: Boolean, default: true },
  },
  {
    collection: 'setup_settings',
    versionKey: false,
  }
);

module.exports = mongoose.models.SetupSetting || mongoose.model('SetupSetting', setupSettingSchema);
