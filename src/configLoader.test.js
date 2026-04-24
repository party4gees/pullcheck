const fs = require('fs');
const path = require('path');
const { loadConfig, DEFAULTS } = require('./configLoader');

jest.mock('fs');

describe('loadConfig', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns defaults when no config file exists', () => {
    fs.existsSync.mockReturnValue(false);
    const config = loadConfig('/nonexistent/pullcheck.yml');
    expect(config).toEqual(DEFAULTS);
  });

  it('merges user config over defaults from YAML', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('staleDaysThreshold: 5\nslackChannel: "#alerts"');
    const config = loadConfig('/some/pullcheck.yml');
    expect(config.staleDaysThreshold).toBe(5);
    expect(config.slackChannel).toBe('#alerts');
    expect(config.reminderDaysThreshold).toBe(DEFAULTS.reminderDaysThreshold);
  });

  it('parses JSON config when extension is .json', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify({ staleDaysThreshold: 2 }));
    const config = loadConfig('/some/pullcheck.json');
    expect(config.staleDaysThreshold).toBe(2);
  });

  it('throws on invalid staleDaysThreshold', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('staleDaysThreshold: -1');
    expect(() => loadConfig('/some/pullcheck.yml')).toThrow('Invalid staleDaysThreshold');
  });

  it('throws on invalid reminderDaysThreshold', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('reminderDaysThreshold: "soon"');
    expect(() => loadConfig('/some/pullcheck.yml')).toThrow('Invalid reminderDaysThreshold');
  });

  it('throws when ignoreLabels is not an array', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('ignoreLabels: "wip"');
    expect(() => loadConfig('/some/pullcheck.yml')).toThrow('ignoreLabels must be an array');
  });

  it('handles empty YAML file gracefully', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('');
    const config = loadConfig('/some/pullcheck.yml');
    expect(config).toEqual(DEFAULTS);
  });
});
