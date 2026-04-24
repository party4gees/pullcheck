const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DEFAULTS = {
  staleDaysThreshold: 3,
  reminderDaysThreshold: 7,
  slackChannel: '#engineering',
  ignoreLabels: ['wip', 'draft', 'on-hold'],
  reviewerMapPath: './reviewer-map.json',
};

/**
 * Loads and validates the pullcheck config file (YAML or JSON).
 * Falls back to defaults for any missing fields.
 *
 * @param {string} [configPath] - Path to config file. Defaults to pullcheck.yml in cwd.
 * @returns {object} Merged config object.
 */
function loadConfig(configPath) {
  const resolvedPath = configPath
    ? path.resolve(configPath)
    : path.resolve(process.cwd(), 'pullcheck.yml');

  let userConfig = {};

  if (fs.existsSync(resolvedPath)) {
    const raw = fs.readFileSync(resolvedPath, 'utf8');
    const ext = path.extname(resolvedPath).toLowerCase();
    userConfig = ext === '.json' ? JSON.parse(raw) : yaml.load(raw) || {};
  }

  const config = { ...DEFAULTS, ...userConfig };

  if (typeof config.staleDaysThreshold !== 'number' || config.staleDaysThreshold < 0) {
    throw new Error(`Invalid staleDaysThreshold: ${config.staleDaysThreshold}`);
  }

  if (typeof config.reminderDaysThreshold !== 'number' || config.reminderDaysThreshold < 0) {
    throw new Error(`Invalid reminderDaysThreshold: ${config.reminderDaysThreshold}`);
  }

  if (!Array.isArray(config.ignoreLabels)) {
    throw new Error('ignoreLabels must be an array');
  }

  return config;
}

module.exports = { loadConfig, DEFAULTS };
