"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const path = require("path");
const events = require("events");
const fs = require("fs");
const WebSocket = require("ws");
const os = require("os");
const promises = require("fs/promises");
const crypto$1 = require("crypto");
const https = require("https");
const child_process = require("child_process");
const node_fs = require("node:fs");
const node_os = require("node:os");
const node_path = require("node:path");
const crypto$2 = require("node:crypto");
const node_child_process = require("node:child_process");
const module$1 = require("module");
const zlib = require("zlib");
const electronUpdater = require("electron-updater");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
const PORTS = {
  /** ClawX GUI development server port */
  CLAWX_DEV: 5173,
  /** ClawX GUI production port (for reference) */
  CLAWX_GUI: 23333,
  /** OpenClaw Gateway port */
  OPENCLAW_GATEWAY: 18789
};
let currentLevel = 0;
let logFilePath = null;
let logDir = null;
const RING_BUFFER_SIZE = 500;
const recentLogs = [];
let writeBuffer = [];
let flushTimer = null;
let flushing = false;
const FLUSH_INTERVAL_MS = 500;
const FLUSH_SIZE_THRESHOLD = 20;
async function flushBuffer() {
  if (flushing || writeBuffer.length === 0 || !logFilePath) return;
  flushing = true;
  const batch = writeBuffer.join("");
  writeBuffer = [];
  try {
    await promises.appendFile(logFilePath, batch);
  } catch {
  } finally {
    flushing = false;
  }
}
function flushBufferSync() {
  if (writeBuffer.length === 0 || !logFilePath) return;
  try {
    fs.appendFileSync(logFilePath, writeBuffer.join(""));
  } catch {
  }
  writeBuffer = [];
}
process.on("exit", flushBufferSync);
function initLogger() {
  try {
    if (electron.app.isPackaged && currentLevel < 1) {
      currentLevel = 1;
    }
    logDir = path.join(electron.app.getPath("userData"), "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    logFilePath = path.join(logDir, `clawx-${timestamp}.log`);
    const sessionHeader = `
${"=".repeat(80)}
[${(/* @__PURE__ */ new Date()).toISOString()}] === ClawX Session Start (v${electron.app.getVersion()}) ===
${"=".repeat(80)}
`;
    fs.appendFileSync(logFilePath, sessionHeader);
  } catch (error2) {
    console.error("Failed to initialize logger:", error2);
  }
}
function setLogLevel(level) {
  currentLevel = level;
}
function getLogDir() {
  return logDir;
}
function getLogFilePath() {
  return logFilePath;
}
function formatMessage(level, message, ...args) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const formattedArgs = args.length > 0 ? " " + args.map((arg) => {
    if (arg instanceof Error) {
      return `${arg.message}
${arg.stack || ""}`;
    }
    if (typeof arg === "object") {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(" ") : "";
  return `[${timestamp}] [${level.padEnd(5)}] ${message}${formattedArgs}`;
}
function writeLog(formatted) {
  recentLogs.push(formatted);
  if (recentLogs.length > RING_BUFFER_SIZE) {
    recentLogs.shift();
  }
  if (logFilePath) {
    writeBuffer.push(formatted + "\n");
    if (writeBuffer.length >= FLUSH_SIZE_THRESHOLD) {
      void flushBuffer();
    } else if (!flushTimer) {
      flushTimer = setTimeout(() => {
        flushTimer = null;
        void flushBuffer();
      }, FLUSH_INTERVAL_MS);
    }
  }
}
function debug(message, ...args) {
  if (currentLevel <= 0) {
    const formatted = formatMessage("DEBUG", message, ...args);
    console.debug(formatted);
    writeLog(formatted);
  }
}
function info(message, ...args) {
  if (currentLevel <= 1) {
    const formatted = formatMessage("INFO", message, ...args);
    console.info(formatted);
    writeLog(formatted);
  }
}
function warn(message, ...args) {
  if (currentLevel <= 2) {
    const formatted = formatMessage("WARN", message, ...args);
    console.warn(formatted);
    writeLog(formatted);
  }
}
function error(message, ...args) {
  if (currentLevel <= 3) {
    const formatted = formatMessage("ERROR", message, ...args);
    console.error(formatted);
    writeLog(formatted);
  }
}
function getRecentLogs(count, minLevel) {
  const filtered = minLevel != null ? recentLogs.filter((line) => {
    if (minLevel <= 0) return true;
    if (minLevel === 1) return !line.includes("] [DEBUG");
    if (minLevel === 2) return line.includes("] [WARN") || line.includes("] [ERROR");
    return line.includes("] [ERROR");
  }) : recentLogs;
  return count ? filtered.slice(-count) : [...filtered];
}
async function readLogFile(tailLines = 200) {
  if (!logFilePath) return "(No log file found)";
  try {
    const content = await promises.readFile(logFilePath, "utf-8");
    const lines = content.split("\n");
    if (lines.length <= tailLines) return content;
    return lines.slice(-tailLines).join("\n");
  } catch (err) {
    return `(Failed to read log file: ${err})`;
  }
}
async function listLogFiles() {
  if (!logDir) return [];
  try {
    const files = await promises.readdir(logDir);
    const results = [];
    for (const f of files) {
      if (!f.endsWith(".log")) continue;
      const fullPath = path.join(logDir, f);
      const s = await promises.stat(fullPath);
      results.push({
        name: f,
        path: fullPath,
        size: s.size,
        modified: s.mtime.toISOString()
      });
    }
    return results.sort((a, b) => b.modified.localeCompare(a.modified));
  } catch {
    return [];
  }
}
const logger = {
  debug,
  info,
  warn,
  error,
  setLevel: setLogLevel,
  init: initLogger,
  getLogDir,
  getLogFilePath,
  getRecentLogs,
  readLogFile,
  listLogFiles
};
function quoteForCmd(value) {
  if (process.platform !== "win32") return value;
  if (!value.includes(" ")) return value;
  if (value.startsWith('"') && value.endsWith('"')) return value;
  return `"${value}"`;
}
function needsWinShell(bin) {
  if (process.platform !== "win32") return false;
  return !path.win32.isAbsolute(bin);
}
function normalizeNodeRequirePathForNodeOptions(modulePath) {
  if (process.platform !== "win32") return modulePath;
  return modulePath.replace(/\\/g, "/");
}
function appendNodeRequireToNodeOptions(nodeOptions, modulePath) {
  const normalized = normalizeNodeRequirePathForNodeOptions(modulePath);
  return `${nodeOptions ?? ""} --require "${normalized}"`.trim();
}
function getOpenClawConfigDir() {
  return path.join(os.homedir(), ".openclaw");
}
function getOpenClawSkillsDir() {
  return path.join(getOpenClawConfigDir(), "skills");
}
function ensureDir$2(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
function getResourcesDir() {
  if (electron.app.isPackaged) {
    return path.join(process.resourcesPath, "resources");
  }
  return path.join(__dirname, "../../resources");
}
function getOpenClawDir() {
  if (electron.app.isPackaged) {
    return path.join(process.resourcesPath, "openclaw");
  }
  return path.join(__dirname, "../../node_modules/openclaw");
}
function getOpenClawResolvedDir() {
  const dir = getOpenClawDir();
  if (!fs.existsSync(dir)) {
    return dir;
  }
  try {
    return fs.realpathSync(dir);
  } catch {
    return dir;
  }
}
function getOpenClawEntryPath() {
  return path.join(getOpenClawDir(), "openclaw.mjs");
}
function getClawHubCliEntryPath() {
  return path.join(electron.app.getAppPath(), "node_modules", "clawhub", "bin", "clawdhub.js");
}
function getClawHubCliBinPath() {
  const binName = process.platform === "win32" ? "clawhub.cmd" : "clawhub";
  return path.join(electron.app.getAppPath(), "node_modules", ".bin", binName);
}
function isOpenClawPresent() {
  const dir = getOpenClawDir();
  const pkgJsonPath = path.join(dir, "package.json");
  return fs.existsSync(dir) && fs.existsSync(pkgJsonPath);
}
function isOpenClawBuilt() {
  const dir = getOpenClawDir();
  const distDir = path.join(dir, "dist");
  const hasDist = fs.existsSync(distDir);
  return hasDist;
}
function getOpenClawStatus() {
  const dir = getOpenClawDir();
  let version;
  try {
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      version = pkg.version;
    }
  } catch {
  }
  const status = {
    packageExists: isOpenClawPresent(),
    isBuilt: isOpenClawBuilt(),
    entryPath: getOpenClawEntryPath(),
    dir,
    version
  };
  logger.info("OpenClaw status:", status);
  return status;
}
let settingsStoreInstance = null;
function generateToken() {
  return `clawx-${crypto$1.randomBytes(16).toString("hex")}`;
}
const defaults = {
  // General
  theme: "system",
  language: "en",
  startMinimized: false,
  launchAtStartup: false,
  // Gateway
  gatewayAutoStart: true,
  gatewayPort: 18789,
  gatewayToken: generateToken(),
  proxyEnabled: false,
  proxyServer: "",
  proxyHttpServer: "",
  proxyHttpsServer: "",
  proxyAllServer: "",
  proxyBypassRules: "<local>;localhost;127.0.0.1;::1",
  // Update
  updateChannel: "stable",
  autoCheckUpdate: true,
  autoDownloadUpdate: false,
  skippedVersions: [],
  // UI State
  sidebarCollapsed: false,
  devModeUnlocked: false,
  // Presets
  selectedBundles: ["productivity", "developer"],
  enabledSkills: [],
  disabledSkills: []
};
async function getSettingsStore() {
  if (!settingsStoreInstance) {
    const Store = (await import("electron-store")).default;
    settingsStoreInstance = new Store({
      name: "settings",
      defaults
    });
  }
  return settingsStoreInstance;
}
async function getSetting(key) {
  const store = await getSettingsStore();
  return store.get(key);
}
async function setSetting(key, value) {
  const store = await getSettingsStore();
  store.set(key, value);
}
async function getAllSettings() {
  const store = await getSettingsStore();
  return store.store;
}
async function resetSettings() {
  const store = await getSettingsStore();
  store.clear();
}
const BUILTIN_PROVIDER_TYPES = [
  "anthropic",
  "openai",
  "google",
  "openrouter",
  "ark",
  "moonshot",
  "siliconflow",
  "minimax-portal",
  "minimax-portal-cn",
  "qwen-portal",
  "ollama"
];
const REGISTRY = {
  anthropic: {
    envVar: "ANTHROPIC_API_KEY",
    defaultModel: "anthropic/claude-opus-4-6"
    // anthropic is built-in to OpenClaw's model registry, no provider config needed
  },
  openai: {
    envVar: "OPENAI_API_KEY",
    defaultModel: "openai/gpt-5.2",
    providerConfig: {
      baseUrl: "https://api.openai.com/v1",
      api: "openai-responses",
      apiKeyEnv: "OPENAI_API_KEY"
    }
  },
  google: {
    envVar: "GEMINI_API_KEY",
    defaultModel: "google/gemini-3.1-pro-preview"
    // google is built-in to OpenClaw's pi-ai catalog, no providerConfig needed.
    // Adding models.providers.google overrides the built-in and can break Gemini.
  },
  openrouter: {
    envVar: "OPENROUTER_API_KEY",
    defaultModel: "openrouter/anthropic/claude-opus-4.6",
    providerConfig: {
      baseUrl: "https://openrouter.ai/api/v1",
      api: "openai-completions",
      apiKeyEnv: "OPENROUTER_API_KEY",
      headers: {
        "HTTP-Referer": "https://claw-x.com",
        "X-Title": "ClawX"
      }
    }
  },
  ark: {
    envVar: "ARK_API_KEY",
    providerConfig: {
      baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
      api: "openai-completions",
      apiKeyEnv: "ARK_API_KEY"
    }
  },
  moonshot: {
    envVar: "MOONSHOT_API_KEY",
    defaultModel: "moonshot/kimi-k2.5",
    providerConfig: {
      baseUrl: "https://api.moonshot.cn/v1",
      api: "openai-completions",
      apiKeyEnv: "MOONSHOT_API_KEY",
      models: [
        {
          id: "kimi-k2.5",
          name: "Kimi K2.5",
          reasoning: false,
          input: ["text"],
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
          contextWindow: 256e3,
          maxTokens: 8192
        }
      ]
    }
  },
  siliconflow: {
    envVar: "SILICONFLOW_API_KEY",
    defaultModel: "siliconflow/deepseek-ai/DeepSeek-V3",
    providerConfig: {
      baseUrl: "https://api.siliconflow.cn/v1",
      api: "openai-completions",
      apiKeyEnv: "SILICONFLOW_API_KEY"
    }
  },
  "minimax-portal": {
    envVar: "MINIMAX_API_KEY",
    defaultModel: "minimax-portal/MiniMax-M2.5",
    providerConfig: {
      baseUrl: "https://api.minimax.io/anthropic",
      api: "anthropic-messages",
      apiKeyEnv: "MINIMAX_API_KEY"
    }
  },
  "minimax-portal-cn": {
    envVar: "MINIMAX_CN_API_KEY",
    defaultModel: "minimax-portal/MiniMax-M2.5",
    providerConfig: {
      baseUrl: "https://api.minimaxi.com/anthropic",
      api: "anthropic-messages",
      apiKeyEnv: "MINIMAX_CN_API_KEY"
    }
  },
  "qwen-portal": {
    envVar: "QWEN_API_KEY",
    defaultModel: "qwen-portal/coder-model",
    providerConfig: {
      baseUrl: "https://portal.qwen.ai/v1",
      api: "openai-completions",
      apiKeyEnv: "QWEN_API_KEY"
    }
  },
  custom: {
    envVar: "CUSTOM_API_KEY"
  },
  // Additional providers with env var mappings but no default model
  groq: { envVar: "GROQ_API_KEY" },
  deepgram: { envVar: "DEEPGRAM_API_KEY" },
  cerebras: { envVar: "CEREBRAS_API_KEY" },
  xai: { envVar: "XAI_API_KEY" },
  mistral: { envVar: "MISTRAL_API_KEY" }
};
function getProviderEnvVar(type) {
  return REGISTRY[type]?.envVar;
}
function getProviderDefaultModel(type) {
  return REGISTRY[type]?.defaultModel;
}
function getProviderConfig(type) {
  return REGISTRY[type]?.providerConfig;
}
function getKeyableProviderTypes() {
  return Object.entries(REGISTRY).filter(([, meta]) => meta.envVar).map(([type]) => type);
}
const AUTH_STORE_VERSION = 1;
const AUTH_PROFILE_FILENAME = "auth-profiles.json";
async function fileExists$4(p) {
  try {
    await promises.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
async function ensureDir$1(dir) {
  if (!await fileExists$4(dir)) {
    await promises.mkdir(dir, { recursive: true });
  }
}
async function readJsonFile(filePath) {
  try {
    if (!await fileExists$4(filePath)) return null;
    const raw = await promises.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
async function writeJsonFile(filePath, data) {
  await ensureDir$1(path.join(filePath, ".."));
  await promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
function getAuthProfilesPath(agentId = "main") {
  return path.join(os.homedir(), ".openclaw", "agents", agentId, "agent", AUTH_PROFILE_FILENAME);
}
async function readAuthProfiles(agentId = "main") {
  const filePath = getAuthProfilesPath(agentId);
  try {
    const data = await readJsonFile(filePath);
    if (data?.version && data.profiles && typeof data.profiles === "object") {
      return data;
    }
  } catch (error2) {
    console.warn("Failed to read auth-profiles.json, creating fresh store:", error2);
  }
  return { version: AUTH_STORE_VERSION, profiles: {} };
}
async function writeAuthProfiles(store, agentId = "main") {
  await writeJsonFile(getAuthProfilesPath(agentId), store);
}
async function discoverAgentIds() {
  const agentsDir = path.join(os.homedir(), ".openclaw", "agents");
  try {
    if (!await fileExists$4(agentsDir)) return ["main"];
    const entries = await promises.readdir(agentsDir, { withFileTypes: true });
    const ids = [];
    for (const d of entries) {
      if (d.isDirectory() && await fileExists$4(path.join(agentsDir, d.name, "agent"))) {
        ids.push(d.name);
      }
    }
    return ids.length > 0 ? ids : ["main"];
  } catch {
    return ["main"];
  }
}
const OPENCLAW_CONFIG_PATH$1 = path.join(os.homedir(), ".openclaw", "openclaw.json");
async function readOpenClawJson() {
  return await readJsonFile(OPENCLAW_CONFIG_PATH$1) ?? {};
}
async function writeOpenClawJson(config) {
  await writeJsonFile(OPENCLAW_CONFIG_PATH$1, config);
}
async function saveOAuthTokenToOpenClaw(provider, token, agentId) {
  const agentIds = await discoverAgentIds();
  if (agentIds.length === 0) agentIds.push("main");
  for (const id of agentIds) {
    const store = await readAuthProfiles(id);
    const profileId = `${provider}:default`;
    store.profiles[profileId] = {
      type: "oauth",
      provider,
      access: token.access,
      refresh: token.refresh,
      expires: token.expires
    };
    if (!store.order) store.order = {};
    if (!store.order[provider]) store.order[provider] = [];
    if (!store.order[provider].includes(profileId)) {
      store.order[provider].push(profileId);
    }
    if (!store.lastGood) store.lastGood = {};
    store.lastGood[provider] = profileId;
    await writeAuthProfiles(store, id);
  }
  console.log(`Saved OAuth token for provider "${provider}" to OpenClaw auth-profiles (agents: ${agentIds.join(", ")})`);
}
async function saveProviderKeyToOpenClaw(provider, apiKey, agentId) {
  const OAUTH_PROVIDERS = ["qwen-portal", "minimax-portal", "minimax-portal-cn"];
  if (OAUTH_PROVIDERS.includes(provider) && !apiKey) {
    console.log(`Skipping auth-profiles write for OAuth provider "${provider}" (no API key provided, using OAuth)`);
    return;
  }
  const agentIds = await discoverAgentIds();
  if (agentIds.length === 0) agentIds.push("main");
  for (const id of agentIds) {
    const store = await readAuthProfiles(id);
    const profileId = `${provider}:default`;
    store.profiles[profileId] = { type: "api_key", provider, key: apiKey };
    if (!store.order) store.order = {};
    if (!store.order[provider]) store.order[provider] = [];
    if (!store.order[provider].includes(profileId)) {
      store.order[provider].push(profileId);
    }
    if (!store.lastGood) store.lastGood = {};
    store.lastGood[provider] = profileId;
    await writeAuthProfiles(store, id);
  }
  console.log(`Saved API key for provider "${provider}" to OpenClaw auth-profiles (agents: ${agentIds.join(", ")})`);
}
async function removeProviderFromOpenClaw(provider) {
  const agentIds = await discoverAgentIds();
  if (agentIds.length === 0) agentIds.push("main");
  for (const id of agentIds) {
    const store = await readAuthProfiles(id);
    const profileId = `${provider}:default`;
    if (store.profiles[profileId]) {
      delete store.profiles[profileId];
      if (store.order?.[provider]) {
        store.order[provider] = store.order[provider].filter((aid) => aid !== profileId);
        if (store.order[provider].length === 0) delete store.order[provider];
      }
      if (store.lastGood?.[provider] === profileId) delete store.lastGood[provider];
      await writeAuthProfiles(store, id);
    }
  }
  for (const id of agentIds) {
    const modelsPath = path.join(os.homedir(), ".openclaw", "agents", id, "agent", "models.json");
    try {
      if (await fileExists$4(modelsPath)) {
        const raw = await promises.readFile(modelsPath, "utf-8");
        const data = JSON.parse(raw);
        const providers = data.providers;
        if (providers && providers[provider]) {
          delete providers[provider];
          await promises.writeFile(modelsPath, JSON.stringify(data, null, 2), "utf-8");
          console.log(`Removed models.json entry for provider "${provider}" (agent "${id}")`);
        }
      }
    } catch (err) {
      console.warn(`Failed to remove provider ${provider} from models.json (agent "${id}"):`, err);
    }
  }
  try {
    const config = await readOpenClawJson();
    let modified = false;
    const plugins = config.plugins;
    const entries = plugins?.entries ?? {};
    const pluginName = `${provider}-auth`;
    if (entries[pluginName]) {
      entries[pluginName].enabled = false;
      modified = true;
      console.log(`Disabled OpenClaw plugin: ${pluginName}`);
    }
    const models = config.models;
    const providers = models?.providers ?? {};
    if (providers[provider]) {
      delete providers[provider];
      modified = true;
      console.log(`Removed OpenClaw provider config: ${provider}`);
    }
    if (modified) {
      await writeOpenClawJson(config);
    }
  } catch (err) {
    console.warn(`Failed to remove provider ${provider} from openclaw.json:`, err);
  }
}
async function setOpenClawDefaultModel(provider, modelOverride, fallbackModels = []) {
  const config = await readOpenClawJson();
  const model = modelOverride || getProviderDefaultModel(provider);
  if (!model) {
    console.warn(`No default model mapping for provider "${provider}"`);
    return;
  }
  const modelId = model.startsWith(`${provider}/`) ? model.slice(provider.length + 1) : model;
  const fallbackModelIds = fallbackModels.filter((fallback) => fallback.startsWith(`${provider}/`)).map((fallback) => fallback.slice(provider.length + 1));
  const agents = config.agents || {};
  const defaults2 = agents.defaults || {};
  defaults2.model = {
    primary: model,
    fallbacks: fallbackModels
  };
  agents.defaults = defaults2;
  config.agents = agents;
  const providerCfg = getProviderConfig(provider);
  if (providerCfg) {
    const models = config.models || {};
    const providers = models.providers || {};
    const existingProvider = providers[provider] && typeof providers[provider] === "object" ? providers[provider] : {};
    const existingModels = Array.isArray(existingProvider.models) ? existingProvider.models : [];
    const registryModels = (providerCfg.models ?? []).map((m) => ({ ...m }));
    const mergedModels = [...registryModels];
    for (const item of existingModels) {
      const id = typeof item?.id === "string" ? item.id : "";
      if (id && !mergedModels.some((m) => m.id === id)) {
        mergedModels.push(item);
      }
    }
    for (const candidateModelId of [modelId, ...fallbackModelIds]) {
      if (candidateModelId && !mergedModels.some((m) => m.id === candidateModelId)) {
        mergedModels.push({ id: candidateModelId, name: candidateModelId });
      }
    }
    const providerEntry = {
      ...existingProvider,
      baseUrl: providerCfg.baseUrl,
      api: providerCfg.api,
      apiKey: providerCfg.apiKeyEnv,
      models: mergedModels
    };
    if (providerCfg.headers && Object.keys(providerCfg.headers).length > 0) {
      providerEntry.headers = providerCfg.headers;
    }
    providers[provider] = providerEntry;
    console.log(`Configured models.providers.${provider} with baseUrl=${providerCfg.baseUrl}, model=${modelId}`);
    models.providers = providers;
    config.models = models;
  } else {
    const models = config.models || {};
    const providers = models.providers || {};
    if (providers[provider]) {
      delete providers[provider];
      console.log(`Removed stale models.providers.${provider} (built-in provider)`);
      models.providers = providers;
      config.models = models;
    }
  }
  const gateway = config.gateway || {};
  if (!gateway.mode) gateway.mode = "local";
  config.gateway = gateway;
  await writeOpenClawJson(config);
  console.log(`Set OpenClaw default model to "${model}" for provider "${provider}"`);
}
async function syncProviderConfigToOpenClaw(provider, modelId, override) {
  const config = await readOpenClawJson();
  if (override.baseUrl && override.api) {
    const models = config.models || {};
    const providers = models.providers || {};
    const nextModels = [];
    if (modelId) nextModels.push({ id: modelId, name: modelId });
    const nextProvider = {
      baseUrl: override.baseUrl,
      api: override.api,
      models: nextModels
    };
    if (override.apiKeyEnv) nextProvider.apiKey = override.apiKeyEnv;
    if (override.headers && Object.keys(override.headers).length > 0) {
      nextProvider.headers = override.headers;
    }
    providers[provider] = nextProvider;
    models.providers = providers;
    config.models = models;
  }
  if (provider === "minimax-portal" || provider === "qwen-portal") {
    const plugins = config.plugins || {};
    const pEntries = plugins.entries || {};
    pEntries[`${provider}-auth`] = { enabled: true };
    plugins.entries = pEntries;
    config.plugins = plugins;
  }
  await writeOpenClawJson(config);
}
async function setOpenClawDefaultModelWithOverride(provider, modelOverride, override, fallbackModels = []) {
  const config = await readOpenClawJson();
  const model = modelOverride || getProviderDefaultModel(provider);
  if (!model) {
    console.warn(`No default model mapping for provider "${provider}"`);
    return;
  }
  const modelId = model.startsWith(`${provider}/`) ? model.slice(provider.length + 1) : model;
  const fallbackModelIds = fallbackModels.filter((fallback) => fallback.startsWith(`${provider}/`)).map((fallback) => fallback.slice(provider.length + 1));
  const agents = config.agents || {};
  const defaults2 = agents.defaults || {};
  defaults2.model = {
    primary: model,
    fallbacks: fallbackModels
  };
  agents.defaults = defaults2;
  config.agents = agents;
  if (override.baseUrl && override.api) {
    const models = config.models || {};
    const providers = models.providers || {};
    const nextModels = [];
    for (const candidateModelId of [modelId, ...fallbackModelIds]) {
      if (candidateModelId && !nextModels.some((entry) => entry.id === candidateModelId)) {
        nextModels.push({ id: candidateModelId, name: candidateModelId });
      }
    }
    const nextProvider = {
      baseUrl: override.baseUrl,
      api: override.api,
      models: nextModels
    };
    if (override.apiKeyEnv) nextProvider.apiKey = override.apiKeyEnv;
    if (override.headers && Object.keys(override.headers).length > 0) {
      nextProvider.headers = override.headers;
    }
    if (override.authHeader !== void 0) {
      nextProvider.authHeader = override.authHeader;
    }
    providers[provider] = nextProvider;
    models.providers = providers;
    config.models = models;
  }
  const gateway = config.gateway || {};
  if (!gateway.mode) gateway.mode = "local";
  config.gateway = gateway;
  if (provider === "minimax-portal" || provider === "qwen-portal") {
    const plugins = config.plugins || {};
    const pEntries = plugins.entries || {};
    pEntries[`${provider}-auth`] = { enabled: true };
    plugins.entries = pEntries;
    config.plugins = plugins;
  }
  await writeOpenClawJson(config);
  console.log(
    `Set OpenClaw default model to "${model}" for provider "${provider}" (runtime override)`
  );
}
async function getActiveOpenClawProviders() {
  const activeProviders = /* @__PURE__ */ new Set();
  try {
    const config = await readOpenClawJson();
    const providers = config.models?.providers;
    if (providers && typeof providers === "object") {
      for (const key of Object.keys(providers)) {
        activeProviders.add(key);
      }
    }
    const plugins = config.plugins?.entries;
    if (plugins && typeof plugins === "object") {
      for (const [pluginId, meta] of Object.entries(plugins)) {
        if (pluginId.endsWith("-auth") && meta.enabled) {
          activeProviders.add(pluginId.replace(/-auth$/, ""));
        }
      }
    }
  } catch (err) {
    console.warn("Failed to read openclaw.json for active providers:", err);
  }
  return activeProviders;
}
async function syncGatewayTokenToConfig(token) {
  const config = await readOpenClawJson();
  const gateway = config.gateway && typeof config.gateway === "object" ? { ...config.gateway } : {};
  const auth = gateway.auth && typeof gateway.auth === "object" ? { ...gateway.auth } : {};
  auth.mode = "token";
  auth.token = token;
  gateway.auth = auth;
  if (!gateway.mode) gateway.mode = "local";
  config.gateway = gateway;
  await writeOpenClawJson(config);
  console.log("Synced gateway token to openclaw.json");
}
async function syncBrowserConfigToOpenClaw() {
  const config = await readOpenClawJson();
  const browser = config.browser && typeof config.browser === "object" ? { ...config.browser } : {};
  let changed = false;
  if (browser.enabled === void 0) {
    browser.enabled = true;
    changed = true;
  }
  if (browser.defaultProfile === void 0) {
    browser.defaultProfile = "openclaw";
    changed = true;
  }
  if (!changed) return;
  config.browser = browser;
  await writeOpenClawJson(config);
  console.log("Synced browser config to openclaw.json");
}
async function updateAgentModelProvider(providerType, entry) {
  const agentIds = await discoverAgentIds();
  for (const agentId of agentIds) {
    const modelsPath = path.join(os.homedir(), ".openclaw", "agents", agentId, "agent", "models.json");
    let data = {};
    try {
      data = await readJsonFile(modelsPath) ?? {};
    } catch {
    }
    const providers = data.providers && typeof data.providers === "object" ? data.providers : {};
    const existing = providers[providerType] && typeof providers[providerType] === "object" ? { ...providers[providerType] } : {};
    const existingModels = Array.isArray(existing.models) ? existing.models : [];
    const mergedModels = (entry.models ?? []).map((m) => {
      const prev = existingModels.find((e) => e.id === m.id);
      return prev ? { ...prev, id: m.id, name: m.name } : { ...m };
    });
    if (entry.baseUrl !== void 0) existing.baseUrl = entry.baseUrl;
    if (entry.api !== void 0) existing.api = entry.api;
    if (mergedModels.length > 0) existing.models = mergedModels;
    if (entry.apiKey !== void 0) existing.apiKey = entry.apiKey;
    if (entry.authHeader !== void 0) existing.authHeader = entry.authHeader;
    providers[providerType] = existing;
    data.providers = providers;
    try {
      await writeJsonFile(modelsPath, data);
      console.log(`Updated models.json for agent "${agentId}" provider "${providerType}"`);
    } catch (err) {
      console.warn(`Failed to update models.json for agent "${agentId}":`, err);
    }
  }
}
async function sanitizeOpenClawConfig() {
  const config = await readOpenClawJson();
  let modified = false;
  const skills = config.skills;
  if (skills && typeof skills === "object" && !Array.isArray(skills)) {
    const skillsObj = skills;
    const KNOWN_INVALID_SKILLS_ROOT_KEYS = ["enabled", "disabled"];
    for (const key of KNOWN_INVALID_SKILLS_ROOT_KEYS) {
      if (key in skillsObj) {
        console.log(`[sanitize] Removing misplaced key "skills.${key}" from openclaw.json`);
        delete skillsObj[key];
        modified = true;
      }
    }
  }
  if (modified) {
    await writeOpenClawJson(config);
    console.log("[sanitize] openclaw.json sanitized successfully");
  }
}
let providerStore = null;
async function getProviderStore() {
  if (!providerStore) {
    const Store = (await import("electron-store")).default;
    providerStore = new Store({
      name: "clawx-providers",
      defaults: {
        providers: {},
        apiKeys: {},
        defaultProvider: null
      }
    });
  }
  return providerStore;
}
async function storeApiKey(providerId, apiKey) {
  try {
    const s = await getProviderStore();
    const keys = s.get("apiKeys") || {};
    keys[providerId] = apiKey;
    s.set("apiKeys", keys);
    return true;
  } catch (error2) {
    console.error("Failed to store API key:", error2);
    return false;
  }
}
async function getApiKey(providerId) {
  try {
    const s = await getProviderStore();
    const keys = s.get("apiKeys") || {};
    return keys[providerId] || null;
  } catch (error2) {
    console.error("Failed to retrieve API key:", error2);
    return null;
  }
}
async function deleteApiKey(providerId) {
  try {
    const s = await getProviderStore();
    const keys = s.get("apiKeys") || {};
    delete keys[providerId];
    s.set("apiKeys", keys);
    return true;
  } catch (error2) {
    console.error("Failed to delete API key:", error2);
    return false;
  }
}
async function hasApiKey(providerId) {
  const s = await getProviderStore();
  const keys = s.get("apiKeys") || {};
  return providerId in keys;
}
async function saveProvider(config) {
  const s = await getProviderStore();
  const providers = s.get("providers");
  providers[config.id] = config;
  s.set("providers", providers);
}
async function getProvider(providerId) {
  const s = await getProviderStore();
  const providers = s.get("providers");
  return providers[providerId] || null;
}
async function getAllProviders() {
  const s = await getProviderStore();
  const providers = s.get("providers");
  return Object.values(providers);
}
async function deleteProvider(providerId) {
  try {
    await deleteApiKey(providerId);
    const s = await getProviderStore();
    const providers = s.get("providers");
    delete providers[providerId];
    s.set("providers", providers);
    if (s.get("defaultProvider") === providerId) {
      s.delete("defaultProvider");
    }
    return true;
  } catch (error2) {
    console.error("Failed to delete provider:", error2);
    return false;
  }
}
async function setDefaultProvider(providerId) {
  const s = await getProviderStore();
  s.set("defaultProvider", providerId);
}
async function getDefaultProvider() {
  const s = await getProviderStore();
  return s.get("defaultProvider");
}
async function getAllProvidersWithKeyInfo() {
  const providers = await getAllProviders();
  const results = [];
  const activeOpenClawProviders = await getActiveOpenClawProviders();
  for (const provider of providers) {
    const isBuiltin = BUILTIN_PROVIDER_TYPES.includes(provider.type);
    const openClawKey = provider.type === "custom" || provider.type === "ollama" ? `${provider.type}-${provider.id.replace(/-/g, "").slice(0, 8)}` : provider.type === "minimax-portal-cn" ? "minimax-portal" : provider.type;
    if (!isBuiltin && !activeOpenClawProviders.has(provider.type) && !activeOpenClawProviders.has(provider.id) && !activeOpenClawProviders.has(openClawKey)) {
      console.log(`[Sync] Provider ${provider.id} (${provider.type}) missing from OpenClaw, dropping from ClawX UI`);
      await deleteProvider(provider.id);
      continue;
    }
    const apiKey = await getApiKey(provider.id);
    let keyMasked = null;
    if (apiKey) {
      if (apiKey.length > 12) {
        keyMasked = `${apiKey.substring(0, 4)}${"*".repeat(apiKey.length - 8)}${apiKey.substring(apiKey.length - 4)}`;
      } else {
        keyMasked = "*".repeat(apiKey.length);
      }
    }
    results.push({
      ...provider,
      hasKey: !!apiKey,
      keyMasked
    });
  }
  return results;
}
var GatewayEventType = /* @__PURE__ */ ((GatewayEventType2) => {
  GatewayEventType2["STATUS_CHANGED"] = "gateway.status_changed";
  GatewayEventType2["CHANNEL_STATUS_CHANGED"] = "channel.status_changed";
  GatewayEventType2["MESSAGE_RECEIVED"] = "chat.message_received";
  GatewayEventType2["MESSAGE_SENT"] = "chat.message_sent";
  GatewayEventType2["TOOL_CALL_STARTED"] = "tool.call_started";
  GatewayEventType2["TOOL_CALL_COMPLETED"] = "tool.call_completed";
  GatewayEventType2["ERROR"] = "error";
  return GatewayEventType2;
})(GatewayEventType || {});
function isResponse(message) {
  return typeof message === "object" && message !== null && "jsonrpc" in message && message.jsonrpc === "2.0" && "id" in message && ("result" in message || "error" in message);
}
function isNotification(message) {
  return typeof message === "object" && message !== null && "jsonrpc" in message && message.jsonrpc === "2.0" && "method" in message && !("id" in message);
}
const UV_MIRROR_ENV = {
  UV_PYTHON_INSTALL_MIRROR: "https://registry.npmmirror.com/-/binary/python-build-standalone/",
  UV_INDEX_URL: "https://pypi.tuna.tsinghua.edu.cn/simple/"
};
const GOOGLE_204_HOST = "www.google.com";
const GOOGLE_204_PATH = "/generate_204";
const GOOGLE_204_TIMEOUT_MS = 2e3;
let cachedOptimized = null;
let cachedPromise = null;
let loggedOnce = false;
function getLocaleAndTimezone() {
  const locale = electron.app.getLocale?.() || "";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  return { locale, timezone };
}
function isRegionOptimized(locale, timezone) {
  if (timezone) return timezone === "Asia/Shanghai";
  return locale === "zh-CN";
}
function probeGoogle204(timeoutMs) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      resolve(value);
    };
    const req = https.request(
      {
        method: "GET",
        hostname: GOOGLE_204_HOST,
        path: GOOGLE_204_PATH
      },
      (res) => {
        const status = res.statusCode || 0;
        res.resume();
        finish(status >= 200 && status < 300);
      }
    );
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error("google_204_timeout"));
    });
    req.on("error", () => finish(false));
    req.end();
  });
}
async function computeOptimization() {
  const { locale, timezone } = getLocaleAndTimezone();
  if (isRegionOptimized(locale, timezone)) {
    if (!loggedOnce) {
      logger.info(`Region optimization enabled via locale/timezone (locale=${locale || "unknown"}, tz=${timezone || "unknown"})`);
      loggedOnce = true;
    }
    return true;
  }
  const reachable = await probeGoogle204(GOOGLE_204_TIMEOUT_MS);
  const isOptimized = !reachable;
  if (!loggedOnce) {
    const reason = reachable ? "google_204_reachable" : "google_204_unreachable";
    logger.info(`Network optimization probe: ${reason} (locale=${locale || "unknown"}, tz=${timezone || "unknown"})`);
    loggedOnce = true;
  }
  return isOptimized;
}
async function shouldOptimizeNetwork() {
  if (cachedOptimized !== null) return cachedOptimized;
  if (cachedPromise) return cachedPromise;
  if (!electron.app.isReady()) {
    await electron.app.whenReady();
  }
  cachedPromise = computeOptimization().then((result) => {
    cachedOptimized = result;
    return result;
  }).catch((err) => {
    logger.warn("Network optimization check failed, defaulting to enabled:", err);
    cachedOptimized = true;
    return true;
  }).finally(() => {
    cachedPromise = null;
  });
  return cachedPromise;
}
async function getUvMirrorEnv() {
  const isOptimized = await shouldOptimizeNetwork();
  return isOptimized ? { ...UV_MIRROR_ENV } : {};
}
async function warmupNetworkOptimization() {
  try {
    await shouldOptimizeNetwork();
  } catch {
  }
}
function getBundledUvPath() {
  const platform = process.platform;
  const arch = process.arch;
  const target = `${platform}-${arch}`;
  const binName = platform === "win32" ? "uv.exe" : "uv";
  if (electron.app.isPackaged) {
    return path.join(process.resourcesPath, "bin", binName);
  } else {
    return path.join(process.cwd(), "resources", "bin", target, binName);
  }
}
function resolveUvBin() {
  const bundled = getBundledUvPath();
  if (electron.app.isPackaged) {
    if (fs.existsSync(bundled)) {
      return { bin: bundled, source: "bundled" };
    }
    logger.warn(`Bundled uv binary not found at ${bundled}, falling back to system PATH`);
  }
  const found = findUvInPathSync();
  if (found) return { bin: "uv", source: "path" };
  if (fs.existsSync(bundled)) {
    return { bin: bundled, source: "bundled-fallback" };
  }
  return { bin: "uv", source: "path" };
}
function findUvInPathSync() {
  try {
    const cmd = process.platform === "win32" ? "where.exe uv" : "which uv";
    child_process.execSync(cmd, { stdio: "ignore", timeout: 5e3, windowsHide: true });
    return true;
  } catch {
    return false;
  }
}
async function checkUvInstalled() {
  const { bin, source } = resolveUvBin();
  if (source === "bundled" || source === "bundled-fallback") {
    return fs.existsSync(bin);
  }
  return findUvInPathSync();
}
async function installUv() {
  const isAvailable = await checkUvInstalled();
  if (!isAvailable) {
    const bin = getBundledUvPath();
    throw new Error(`uv not found in system PATH and bundled binary missing at ${bin}`);
  }
  logger.info("uv is available and ready to use");
}
async function isPythonReady() {
  const { bin: uvBin } = resolveUvBin();
  const useShell = needsWinShell(uvBin);
  return new Promise((resolve) => {
    try {
      const child = child_process.spawn(useShell ? quoteForCmd(uvBin) : uvBin, ["python", "find", "3.12"], {
        shell: useShell,
        windowsHide: true
      });
      child.on("close", (code) => resolve(code === 0));
      child.on("error", () => resolve(false));
    } catch {
      resolve(false);
    }
  });
}
async function runPythonInstall(uvBin, env, label) {
  const useShell = needsWinShell(uvBin);
  return new Promise((resolve, reject) => {
    const stderrChunks = [];
    const stdoutChunks = [];
    const child = child_process.spawn(useShell ? quoteForCmd(uvBin) : uvBin, ["python", "install", "3.12"], {
      shell: useShell,
      env,
      windowsHide: true
    });
    child.stdout?.on("data", (data) => {
      const line = data.toString().trim();
      if (line) {
        stdoutChunks.push(line);
        logger.debug(`[python-setup:${label}] stdout: ${line}`);
      }
    });
    child.stderr?.on("data", (data) => {
      const line = data.toString().trim();
      if (line) {
        stderrChunks.push(line);
        logger.info(`[python-setup:${label}] stderr: ${line}`);
      }
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        const stderr = stderrChunks.join("\n");
        const stdout = stdoutChunks.join("\n");
        const detail = stderr || stdout || "(no output captured)";
        reject(new Error(
          `Python installation failed with code ${code} [${label}]
  uv binary: ${uvBin}
  platform: ${process.platform}/${process.arch}
  output: ${detail}`
        ));
      }
    });
    child.on("error", (err) => {
      reject(new Error(
        `Python installation spawn error [${label}]: ${err.message}
  uv binary: ${uvBin}
  platform: ${process.platform}/${process.arch}`
      ));
    });
  });
}
async function setupManagedPython() {
  const { bin: uvBin, source } = resolveUvBin();
  const uvEnv = await getUvMirrorEnv();
  const hasMirror = Object.keys(uvEnv).length > 0;
  logger.info(
    `Setting up managed Python 3.12 (uv=${uvBin}, source=${source}, arch=${process.arch}, mirror=${hasMirror})`
  );
  const baseEnv = { ...process.env };
  try {
    await runPythonInstall(uvBin, { ...baseEnv, ...uvEnv }, hasMirror ? "mirror" : "default");
  } catch (firstError) {
    logger.warn("Python install attempt 1 failed:", firstError);
    if (hasMirror) {
      logger.info("Retrying Python install without mirror...");
      try {
        await runPythonInstall(uvBin, baseEnv, "no-mirror");
      } catch (secondError) {
        logger.error("Python install attempt 2 (no mirror) also failed:", secondError);
        throw secondError;
      }
    } else {
      throw firstError;
    }
  }
  const verifyShell = needsWinShell(uvBin);
  try {
    const findPath = await new Promise((resolve) => {
      const child = child_process.spawn(verifyShell ? quoteForCmd(uvBin) : uvBin, ["python", "find", "3.12"], {
        shell: verifyShell,
        env: { ...process.env, ...uvEnv },
        windowsHide: true
      });
      let output = "";
      child.stdout?.on("data", (data) => {
        output += data;
      });
      child.on("close", () => resolve(output.trim()));
    });
    if (findPath) {
      logger.info(`Managed Python 3.12 installed at: ${findPath}`);
    }
  } catch (err) {
    logger.warn("Could not determine Python path after install:", err);
  }
}
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");
function base64UrlEncode(buf) {
  return buf.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}
function derivePublicKeyRaw(publicKeyPem) {
  const spki = crypto$1.createPublicKey(publicKeyPem).export({ type: "spki", format: "der" });
  if (spki.length === ED25519_SPKI_PREFIX.length + 32 && spki.subarray(0, ED25519_SPKI_PREFIX.length).equals(ED25519_SPKI_PREFIX)) {
    return spki.subarray(ED25519_SPKI_PREFIX.length);
  }
  return spki;
}
function fingerprintPublicKey(publicKeyPem) {
  const raw = derivePublicKeyRaw(publicKeyPem);
  return crypto$1.createHash("sha256").update(raw).digest("hex");
}
async function fileExists$3(p) {
  try {
    await promises.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
async function generateIdentity() {
  const { publicKey, privateKey } = await new Promise(
    (resolve, reject) => {
      crypto$1.generateKeyPair("ed25519", (err, publicKey2, privateKey2) => {
        if (err) reject(err);
        else resolve({ publicKey: publicKey2, privateKey: privateKey2 });
      });
    }
  );
  const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();
  const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  return {
    deviceId: fingerprintPublicKey(publicKeyPem),
    publicKeyPem,
    privateKeyPem
  };
}
async function loadOrCreateDeviceIdentity(filePath) {
  try {
    if (await fileExists$3(filePath)) {
      const raw = await promises.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed?.version === 1 && typeof parsed.deviceId === "string" && typeof parsed.publicKeyPem === "string" && typeof parsed.privateKeyPem === "string") {
        const derivedId = fingerprintPublicKey(parsed.publicKeyPem);
        if (derivedId && derivedId !== parsed.deviceId) {
          const updated = { ...parsed, deviceId: derivedId };
          await promises.writeFile(filePath, `${JSON.stringify(updated, null, 2)}
`, { mode: 384 });
          return { deviceId: derivedId, publicKeyPem: parsed.publicKeyPem, privateKeyPem: parsed.privateKeyPem };
        }
        return { deviceId: parsed.deviceId, publicKeyPem: parsed.publicKeyPem, privateKeyPem: parsed.privateKeyPem };
      }
    }
  } catch {
  }
  const identity = await generateIdentity();
  const dir = path.dirname(filePath);
  if (!await fileExists$3(dir)) await promises.mkdir(dir, { recursive: true });
  const stored = { version: 1, ...identity, createdAtMs: Date.now() };
  await promises.writeFile(filePath, `${JSON.stringify(stored, null, 2)}
`, { mode: 384 });
  try {
    await promises.chmod(filePath, 384);
  } catch {
  }
  return identity;
}
function signDevicePayload(privateKeyPem, payload) {
  const key = crypto$1.createPrivateKey(privateKeyPem);
  return base64UrlEncode(crypto$1.sign(null, Buffer.from(payload, "utf8"), key));
}
function publicKeyRawBase64UrlFromPem(publicKeyPem) {
  return base64UrlEncode(derivePublicKeyRaw(publicKeyPem));
}
function buildDeviceAuthPayload(params) {
  const version = params.version ?? (params.nonce ? "v2" : "v1");
  const scopes = params.scopes.join(",");
  const token = params.token ?? "";
  const base = [
    version,
    params.deviceId,
    params.clientId,
    params.clientMode,
    params.role,
    scopes,
    String(params.signedAtMs),
    token
  ];
  if (version === "v2") base.push(params.nonce ?? "");
  return base.join("|");
}
function trimValue(value) {
  return typeof value === "string" ? value.trim() : "";
}
function normalizeProxyServer(proxyServer) {
  const value = trimValue(proxyServer);
  if (!value) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return value;
  return `http://${value}`;
}
function resolveProxySettings(settings) {
  const legacyProxy = normalizeProxyServer(settings.proxyServer);
  const allProxy = normalizeProxyServer(settings.proxyAllServer);
  const httpProxy = normalizeProxyServer(settings.proxyHttpServer) || legacyProxy || allProxy;
  const httpsProxy = normalizeProxyServer(settings.proxyHttpsServer) || legacyProxy || allProxy;
  return {
    httpProxy,
    httpsProxy,
    allProxy: allProxy || legacyProxy,
    bypassRules: trimValue(settings.proxyBypassRules)
  };
}
function buildElectronProxyConfig(settings) {
  if (!settings.proxyEnabled) {
    return { mode: "direct" };
  }
  const resolved = resolveProxySettings(settings);
  const rules = [];
  if (resolved.httpProxy) {
    rules.push(`http=${resolved.httpProxy}`);
  }
  if (resolved.httpsProxy) {
    rules.push(`https=${resolved.httpsProxy}`);
  }
  const fallbackProxy = resolved.allProxy || resolved.httpsProxy || resolved.httpProxy;
  if (fallbackProxy) {
    rules.push(fallbackProxy);
  }
  if (rules.length === 0) {
    return { mode: "direct" };
  }
  return {
    mode: "fixed_servers",
    proxyRules: rules.join(";"),
    ...resolved.bypassRules ? { proxyBypassRules: resolved.bypassRules } : {}
  };
}
function buildProxyEnv(settings) {
  const blank = {
    HTTP_PROXY: "",
    HTTPS_PROXY: "",
    ALL_PROXY: "",
    http_proxy: "",
    https_proxy: "",
    all_proxy: "",
    NO_PROXY: "",
    no_proxy: ""
  };
  if (!settings.proxyEnabled) {
    return blank;
  }
  const resolved = resolveProxySettings(settings);
  const noProxy = resolved.bypassRules.split(/[,\n;]/).map((rule) => rule.trim()).filter(Boolean).join(",");
  return {
    HTTP_PROXY: resolved.httpProxy,
    HTTPS_PROXY: resolved.httpsProxy,
    ALL_PROXY: resolved.allProxy,
    http_proxy: resolved.httpProxy,
    https_proxy: resolved.httpsProxy,
    all_proxy: resolved.allProxy,
    NO_PROXY: noProxy,
    no_proxy: noProxy
  };
}
async function proxyAwareFetch(input, init) {
  if (process.versions.electron) {
    try {
      const { net } = await import("electron");
      return await net.fetch(input, init);
    } catch {
    }
  }
  return await fetch(input, init);
}
const OPENCLAW_DIR = path.join(os.homedir(), ".openclaw");
const CONFIG_FILE = path.join(OPENCLAW_DIR, "openclaw.json");
const PLUGIN_CHANNELS = ["whatsapp"];
async function fileExists$2(p) {
  try {
    await promises.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
async function ensureConfigDir() {
  if (!await fileExists$2(OPENCLAW_DIR)) {
    await promises.mkdir(OPENCLAW_DIR, { recursive: true });
  }
}
async function readOpenClawConfig() {
  await ensureConfigDir();
  if (!await fileExists$2(CONFIG_FILE)) {
    return {};
  }
  try {
    const content = await promises.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error$1) {
    error("Failed to read OpenClaw config", error$1);
    console.error("Failed to read OpenClaw config:", error$1);
    return {};
  }
}
async function writeOpenClawConfig(config) {
  await ensureConfigDir();
  try {
    await promises.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (error$1) {
    error("Failed to write OpenClaw config", error$1);
    console.error("Failed to write OpenClaw config:", error$1);
    throw error$1;
  }
}
async function saveChannelConfig(channelType, config) {
  const currentConfig = await readOpenClawConfig();
  if (channelType === "dingtalk") {
    if (!currentConfig.plugins) {
      currentConfig.plugins = {};
    }
    currentConfig.plugins.enabled = true;
    const allow = Array.isArray(currentConfig.plugins.allow) ? currentConfig.plugins.allow : [];
    if (!allow.includes("dingtalk")) {
      currentConfig.plugins.allow = [...allow, "dingtalk"];
    }
  }
  if (channelType === "dingtalk") {
    if (!currentConfig.plugins) {
      currentConfig.plugins = {};
    }
    currentConfig.plugins.enabled = true;
    const allow = Array.isArray(currentConfig.plugins.allow) ? currentConfig.plugins.allow : [];
    if (!allow.includes("dingtalk")) {
      currentConfig.plugins.allow = [...allow, "dingtalk"];
    }
  }
  if (PLUGIN_CHANNELS.includes(channelType)) {
    if (!currentConfig.plugins) {
      currentConfig.plugins = {};
    }
    if (!currentConfig.plugins.entries) {
      currentConfig.plugins.entries = {};
    }
    currentConfig.plugins.entries[channelType] = {
      ...currentConfig.plugins.entries[channelType],
      enabled: config.enabled ?? true
    };
    await writeOpenClawConfig(currentConfig);
    info("Plugin channel config saved", {
      channelType,
      configFile: CONFIG_FILE,
      path: `plugins.entries.${channelType}`
    });
    console.log(`Saved plugin channel config for ${channelType}`);
    return;
  }
  if (!currentConfig.channels) {
    currentConfig.channels = {};
  }
  let transformedConfig = { ...config };
  if (channelType === "discord") {
    const { guildId, channelId, ...restConfig } = config;
    transformedConfig = { ...restConfig };
    transformedConfig.groupPolicy = "allowlist";
    transformedConfig.dm = { enabled: false };
    transformedConfig.retry = {
      attempts: 3,
      minDelayMs: 500,
      maxDelayMs: 3e4,
      jitter: 0.1
    };
    if (guildId && typeof guildId === "string" && guildId.trim()) {
      const guildConfig = {
        users: ["*"],
        requireMention: true
      };
      if (channelId && typeof channelId === "string" && channelId.trim()) {
        guildConfig.channels = {
          [channelId.trim()]: { allow: true, requireMention: true }
        };
      } else {
        guildConfig.channels = {
          "*": { allow: true, requireMention: true }
        };
      }
      transformedConfig.guilds = {
        [guildId.trim()]: guildConfig
      };
    }
  }
  if (channelType === "telegram") {
    const { allowedUsers, ...restConfig } = config;
    transformedConfig = { ...restConfig };
    if (allowedUsers && typeof allowedUsers === "string") {
      const users = allowedUsers.split(",").map((u) => u.trim()).filter((u) => u.length > 0);
      if (users.length > 0) {
        transformedConfig.allowFrom = users;
      }
    }
  }
  if (channelType === "feishu") {
    const existingConfig = currentConfig.channels[channelType] || {};
    transformedConfig.dmPolicy = transformedConfig.dmPolicy ?? existingConfig.dmPolicy ?? "open";
    let allowFrom = transformedConfig.allowFrom ?? existingConfig.allowFrom ?? ["*"];
    if (!Array.isArray(allowFrom)) {
      allowFrom = [allowFrom];
    }
    if (transformedConfig.dmPolicy === "open" && !allowFrom.includes("*")) {
      allowFrom = [...allowFrom, "*"];
    }
    transformedConfig.allowFrom = allowFrom;
  }
  currentConfig.channels[channelType] = {
    ...currentConfig.channels[channelType],
    ...transformedConfig,
    enabled: transformedConfig.enabled ?? true
  };
  await writeOpenClawConfig(currentConfig);
  info("Channel config saved", {
    channelType,
    configFile: CONFIG_FILE,
    rawKeys: Object.keys(config),
    transformedKeys: Object.keys(transformedConfig),
    enabled: currentConfig.channels[channelType]?.enabled
  });
  console.log(`Saved channel config for ${channelType}`);
}
async function getChannelConfig(channelType) {
  const config = await readOpenClawConfig();
  return config.channels?.[channelType];
}
async function getChannelFormValues(channelType) {
  const saved = await getChannelConfig(channelType);
  if (!saved) return void 0;
  const values = {};
  if (channelType === "discord") {
    if (saved.token && typeof saved.token === "string") {
      values.token = saved.token;
    }
    const guilds = saved.guilds;
    if (guilds) {
      const guildIds = Object.keys(guilds);
      if (guildIds.length > 0) {
        values.guildId = guildIds[0];
        const guildConfig = guilds[guildIds[0]];
        const channels = guildConfig?.channels;
        if (channels) {
          const channelIds = Object.keys(channels).filter((id) => id !== "*");
          if (channelIds.length > 0) {
            values.channelId = channelIds[0];
          }
        }
      }
    }
  } else if (channelType === "telegram") {
    if (Array.isArray(saved.allowFrom)) {
      values.allowedUsers = saved.allowFrom.join(", ");
    }
    for (const [key, value] of Object.entries(saved)) {
      if (typeof value === "string" && key !== "enabled") {
        values[key] = value;
      }
    }
  } else {
    for (const [key, value] of Object.entries(saved)) {
      if (typeof value === "string" && key !== "enabled") {
        values[key] = value;
      }
    }
  }
  return Object.keys(values).length > 0 ? values : void 0;
}
async function deleteChannelConfig(channelType) {
  const currentConfig = await readOpenClawConfig();
  if (currentConfig.channels?.[channelType]) {
    delete currentConfig.channels[channelType];
    await writeOpenClawConfig(currentConfig);
    console.log(`Deleted channel config for ${channelType}`);
  } else if (PLUGIN_CHANNELS.includes(channelType)) {
    if (currentConfig.plugins?.entries?.[channelType]) {
      delete currentConfig.plugins.entries[channelType];
      if (Object.keys(currentConfig.plugins.entries).length === 0) {
        delete currentConfig.plugins.entries;
      }
      if (currentConfig.plugins && Object.keys(currentConfig.plugins).length === 0) {
        delete currentConfig.plugins;
      }
      await writeOpenClawConfig(currentConfig);
      console.log(`Deleted plugin channel config for ${channelType}`);
    }
  }
  if (channelType === "whatsapp") {
    try {
      const whatsappDir = path.join(os.homedir(), ".openclaw", "credentials", "whatsapp");
      if (await fileExists$2(whatsappDir)) {
        await promises.rm(whatsappDir, { recursive: true, force: true });
        console.log("Deleted WhatsApp credentials directory");
      }
    } catch (error2) {
      console.error("Failed to delete WhatsApp credentials:", error2);
    }
  }
}
async function listConfiguredChannels() {
  const config = await readOpenClawConfig();
  const channels = [];
  if (config.channels) {
    channels.push(...Object.keys(config.channels).filter(
      (channelType) => config.channels[channelType]?.enabled !== false
    ));
  }
  try {
    const whatsappDir = path.join(os.homedir(), ".openclaw", "credentials", "whatsapp");
    if (await fileExists$2(whatsappDir)) {
      const entries = await promises.readdir(whatsappDir);
      const hasSession = await (async () => {
        for (const entry of entries) {
          try {
            const s = await promises.stat(path.join(whatsappDir, entry));
            if (s.isDirectory()) return true;
          } catch {
          }
        }
        return false;
      })();
      if (hasSession && !channels.includes("whatsapp")) {
        channels.push("whatsapp");
      }
    }
  } catch {
  }
  return channels;
}
async function setChannelEnabled(channelType, enabled) {
  const currentConfig = await readOpenClawConfig();
  if (PLUGIN_CHANNELS.includes(channelType)) {
    if (!currentConfig.plugins) currentConfig.plugins = {};
    if (!currentConfig.plugins.entries) currentConfig.plugins.entries = {};
    if (!currentConfig.plugins.entries[channelType]) currentConfig.plugins.entries[channelType] = {};
    currentConfig.plugins.entries[channelType].enabled = enabled;
    await writeOpenClawConfig(currentConfig);
    console.log(`Set plugin channel ${channelType} enabled: ${enabled}`);
    return;
  }
  if (!currentConfig.channels) currentConfig.channels = {};
  if (!currentConfig.channels[channelType]) currentConfig.channels[channelType] = {};
  currentConfig.channels[channelType].enabled = enabled;
  await writeOpenClawConfig(currentConfig);
  console.log(`Set channel ${channelType} enabled: ${enabled}`);
}
async function validateChannelCredentials(channelType, config) {
  switch (channelType) {
    case "discord":
      return validateDiscordCredentials(config);
    case "telegram":
      return validateTelegramCredentials(config);
    default:
      return { valid: true, errors: [], warnings: ["No online validation available for this channel type."] };
  }
}
async function validateDiscordCredentials(config) {
  const result = { valid: true, errors: [], warnings: [], details: {} };
  const token = config.token?.trim();
  if (!token) {
    return { valid: false, errors: ["Bot token is required"], warnings: [] };
  }
  try {
    const meResponse = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bot ${token}` }
    });
    if (!meResponse.ok) {
      if (meResponse.status === 401) {
        return { valid: false, errors: ["Invalid bot token. Please check and try again."], warnings: [] };
      }
      const errorData = await meResponse.json().catch(() => ({}));
      const msg = errorData.message || `Discord API error: ${meResponse.status}`;
      return { valid: false, errors: [msg], warnings: [] };
    }
    const meData = await meResponse.json();
    if (!meData.bot) {
      return { valid: false, errors: ["The provided token belongs to a user account, not a bot. Please use a bot token."], warnings: [] };
    }
    result.details.botUsername = meData.username || "Unknown";
    result.details.botId = meData.id || "";
  } catch (error2) {
    return { valid: false, errors: [`Connection error when validating bot token: ${error2 instanceof Error ? error2.message : String(error2)}`], warnings: [] };
  }
  const guildId = config.guildId?.trim();
  if (guildId) {
    try {
      const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
        headers: { Authorization: `Bot ${token}` }
      });
      if (!guildResponse.ok) {
        if (guildResponse.status === 403 || guildResponse.status === 404) {
          result.errors.push(`Cannot access guild (server) with ID "${guildId}". Make sure the bot has been invited to this server.`);
          result.valid = false;
        } else {
          result.errors.push(`Failed to verify guild ID: Discord API returned ${guildResponse.status}`);
          result.valid = false;
        }
      } else {
        const guildData = await guildResponse.json();
        result.details.guildName = guildData.name || "Unknown";
      }
    } catch (error2) {
      result.warnings.push(`Could not verify guild ID: ${error2 instanceof Error ? error2.message : String(error2)}`);
    }
  }
  const channelId = config.channelId?.trim();
  if (channelId) {
    try {
      const channelResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
        headers: { Authorization: `Bot ${token}` }
      });
      if (!channelResponse.ok) {
        if (channelResponse.status === 403 || channelResponse.status === 404) {
          result.errors.push(`Cannot access channel with ID "${channelId}". Make sure the bot has permission to view this channel.`);
          result.valid = false;
        } else {
          result.errors.push(`Failed to verify channel ID: Discord API returned ${channelResponse.status}`);
          result.valid = false;
        }
      } else {
        const channelData = await channelResponse.json();
        result.details.channelName = channelData.name || "Unknown";
        if (guildId && channelData.guild_id && channelData.guild_id !== guildId) {
          result.errors.push(`Channel "${channelData.name}" does not belong to the specified guild. It belongs to a different server.`);
          result.valid = false;
        }
      }
    } catch (error2) {
      result.warnings.push(`Could not verify channel ID: ${error2 instanceof Error ? error2.message : String(error2)}`);
    }
  }
  return result;
}
async function validateTelegramCredentials(config) {
  const botToken = config.botToken?.trim();
  const allowedUsers = config.allowedUsers?.trim();
  if (!botToken) return { valid: false, errors: ["Bot token is required"], warnings: [] };
  if (!allowedUsers) return { valid: false, errors: ["At least one allowed user ID is required"], warnings: [] };
  try {
    const response = await proxyAwareFetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await response.json();
    if (data.ok) {
      return { valid: true, errors: [], warnings: [], details: { botUsername: data.result?.username || "Unknown" } };
    }
    return { valid: false, errors: [data.description || "Invalid bot token"], warnings: [] };
  } catch (error2) {
    return { valid: false, errors: [`Connection error: ${error2 instanceof Error ? error2.message : String(error2)}`], warnings: [] };
  }
}
async function validateChannelConfig(channelType) {
  const { exec } = await import("child_process");
  const result = { valid: true, errors: [], warnings: [] };
  try {
    const openclawPath2 = getOpenClawResolvedDir();
    const output = await new Promise((resolve, reject) => {
      exec(
        `node openclaw.mjs doctor --json 2>&1`,
        {
          cwd: openclawPath2,
          encoding: "utf-8",
          timeout: 3e4,
          windowsHide: true
        },
        (err, stdout) => {
          if (err) reject(err);
          else resolve(stdout);
        }
      );
    });
    const lines = output.split("\n");
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes(channelType) && lowerLine.includes("error")) {
        result.errors.push(line.trim());
        result.valid = false;
      } else if (lowerLine.includes(channelType) && lowerLine.includes("warning")) {
        result.warnings.push(line.trim());
      } else if (lowerLine.includes("unrecognized key") && lowerLine.includes(channelType)) {
        result.errors.push(line.trim());
        result.valid = false;
      }
    }
    const config = await readOpenClawConfig();
    if (!config.channels?.[channelType]) {
      result.errors.push(`Channel ${channelType} is not configured`);
      result.valid = false;
    } else if (!config.channels[channelType].enabled) {
      result.warnings.push(`Channel ${channelType} is disabled`);
    }
    if (channelType === "discord") {
      const discordConfig = config.channels?.discord;
      if (!discordConfig?.token) {
        result.errors.push("Discord: Bot token is required");
        result.valid = false;
      }
    } else if (channelType === "telegram") {
      const telegramConfig = config.channels?.telegram;
      if (!telegramConfig?.botToken) {
        result.errors.push("Telegram: Bot token is required");
        result.valid = false;
      }
      const allowedUsers = telegramConfig?.allowFrom;
      if (!allowedUsers || allowedUsers.length === 0) {
        result.errors.push("Telegram: Allowed User IDs are required");
        result.valid = false;
      }
    }
    if (result.errors.length === 0 && result.warnings.length === 0) {
      result.valid = true;
    }
  } catch (error2) {
    const errorMessage = error2 instanceof Error ? error2.message : String(error2);
    if (errorMessage.includes("Unrecognized key") || errorMessage.includes("invalid config")) {
      result.errors.push(errorMessage);
      result.valid = false;
    } else if (errorMessage.includes("ENOENT")) {
      result.errors.push("OpenClaw not found. Please ensure OpenClaw is installed.");
      result.valid = false;
    } else {
      console.warn("Doctor command failed:", errorMessage);
      const config = await readOpenClawConfig();
      if (config.channels?.[channelType]) {
        result.valid = true;
      } else {
        result.errors.push(`Channel ${channelType} is not configured`);
        result.valid = false;
      }
    }
  }
  return result;
}
async function syncProxyConfigToOpenClaw(settings) {
  const config = await readOpenClawConfig();
  const telegramConfig = config.channels?.telegram;
  if (!telegramConfig) {
    return;
  }
  const resolved = resolveProxySettings(settings);
  const nextProxy = settings.proxyEnabled ? resolved.allProxy || resolved.httpsProxy || resolved.httpProxy : "";
  const currentProxy = typeof telegramConfig.proxy === "string" ? telegramConfig.proxy : "";
  if (!nextProxy && !currentProxy) {
    return;
  }
  if (!config.channels) {
    config.channels = {};
  }
  config.channels.telegram = {
    ...telegramConfig
  };
  if (nextProxy) {
    config.channels.telegram.proxy = nextProxy;
  } else {
    delete config.channels.telegram.proxy;
  }
  await writeOpenClawConfig(config);
  logger.info(`Synced Telegram proxy to OpenClaw config (${nextProxy || "disabled"})`);
}
const INVALID_CONFIG_PATTERNS = [
  /\binvalid config\b/i,
  /\bconfig invalid\b/i,
  /\bunrecognized key\b/i,
  /\brun:\s*openclaw doctor --fix\b/i
];
function normalizeLogLine(value) {
  return value.trim();
}
function isInvalidConfigSignal(text) {
  const normalized = normalizeLogLine(text);
  if (!normalized) return false;
  return INVALID_CONFIG_PATTERNS.some((pattern) => pattern.test(normalized));
}
function hasInvalidConfigFailureSignal(startupError, startupStderrLines) {
  for (const line of startupStderrLines) {
    if (isInvalidConfigSignal(line)) {
      return true;
    }
  }
  const errorText = startupError instanceof Error ? `${startupError.name}: ${startupError.message}` : String(startupError ?? "");
  return isInvalidConfigSignal(errorText);
}
function shouldAttemptConfigAutoRepair(startupError, startupStderrLines, alreadyAttempted) {
  if (alreadyAttempted) return false;
  return hasInvalidConfigFailureSignal(startupError, startupStderrLines);
}
function nextLifecycleEpoch(currentEpoch) {
  return currentEpoch + 1;
}
function isLifecycleSuperseded(expectedEpoch, currentEpoch) {
  return expectedEpoch !== currentEpoch;
}
function getReconnectSkipReason(context) {
  if (!context.shouldReconnect) {
    return "auto-reconnect disabled";
  }
  if (isLifecycleSuperseded(context.scheduledEpoch, context.currentEpoch)) {
    return `stale reconnect callback (scheduledEpoch=${context.scheduledEpoch}, currentEpoch=${context.currentEpoch})`;
  }
  return null;
}
function shouldDeferRestart(context) {
  return context.startLock || context.state === "starting" || context.state === "reconnecting";
}
function getDeferredRestartAction(context) {
  if (!context.hasPendingRestart) return "none";
  if (shouldDeferRestart(context)) return "wait";
  if (!context.shouldReconnect) return "drop";
  return "execute";
}
const DEFAULT_RECONNECT_CONFIG = {
  maxAttempts: 10,
  baseDelay: 1e3,
  maxDelay: 3e4
};
const GATEWAY_FETCH_PRELOAD_SOURCE = `'use strict';
(function () {
  var _f = globalThis.fetch;
  if (typeof _f !== 'function') return;
  if (globalThis.__clawxFetchPatched) return;
  globalThis.__clawxFetchPatched = true;

  globalThis.fetch = function clawxFetch(input, init) {
    var url =
      typeof input === 'string' ? input
        : input && typeof input === 'object' && typeof input.url === 'string'
          ? input.url : '';

    if (url.indexOf('openrouter.ai') !== -1) {
      init = init ? Object.assign({}, init) : {};
      var prev = init.headers;
      var flat = {};
      if (prev && typeof prev.forEach === 'function') {
        prev.forEach(function (v, k) { flat[k] = v; });
      } else if (prev && typeof prev === 'object') {
        Object.assign(flat, prev);
      }
      delete flat['http-referer'];
      delete flat['HTTP-Referer'];
      delete flat['x-title'];
      delete flat['X-Title'];
      flat['HTTP-Referer'] = 'https://claw-x.com';
      flat['X-Title'] = 'ClawX';
      init.headers = flat;
    }
    return _f.call(globalThis, input, init);
  };

  // Global monkey-patch for child_process to enforce windowsHide: true on Windows.
  // This prevents OpenClaw's tools (e.g. Terminal, Python) from flashing black
  // command boxes during AI conversations, without triggering AVs.
  //
  // Node child_process signatures vary:
  //   spawn(cmd[, args][, options])
  //   exec(cmd[, options][, callback])
  //   execFile(file[, args][, options][, callback])
  //   *Sync variants omit the callback
  //
  // Strategy: scan arguments for the first plain-object (the options param).
  // If found, set windowsHide on it. If absent, insert a new options object
  // before any trailing callback so the signature stays valid.
  if (process.platform === 'win32') {
    try {
      var cp = require('child_process');
      if (!cp.__clawxPatched) {
        cp.__clawxPatched = true;
        ['spawn', 'exec', 'execFile', 'fork', 'spawnSync', 'execSync', 'execFileSync'].forEach(function(method) {
          var original = cp[method];
          if (typeof original !== 'function') return;
          cp[method] = function() {
            var args = Array.prototype.slice.call(arguments);
            var optIdx = -1;
            for (var i = 1; i < args.length; i++) {
              var a = args[i];
              if (a && typeof a === 'object' && !Array.isArray(a)) {
                optIdx = i;
                break;
              }
            }
            if (optIdx >= 0) {
              args[optIdx].windowsHide = true;
            } else {
              var opts = { windowsHide: true };
              if (typeof args[args.length - 1] === 'function') {
                args.splice(args.length - 1, 0, opts);
              } else {
                args.push(opts);
              }
            }
            return original.apply(this, args);
          };
        });
      }
    } catch (e) {
      // ignore
    }
  }
})();
`;
function ensureGatewayFetchPreload() {
  const dest = path.join(electron.app.getPath("userData"), "gateway-fetch-preload.cjs");
  try {
    fs.writeFileSync(dest, GATEWAY_FETCH_PRELOAD_SOURCE, "utf-8");
  } catch {
  }
  return dest;
}
class LifecycleSupersededError extends Error {
  constructor(message) {
    super(message);
    this.name = "LifecycleSupersededError";
  }
}
class GatewayManager extends events.EventEmitter {
  process = null;
  processExitCode = null;
  // set by exit event, replaces exitCode/signalCode
  ownsProcess = false;
  ws = null;
  status = { state: "stopped", port: PORTS.OPENCLAW_GATEWAY };
  reconnectTimer = null;
  pingInterval = null;
  healthCheckInterval = null;
  reconnectAttempts = 0;
  reconnectConfig;
  shouldReconnect = true;
  startLock = false;
  lastSpawnSummary = null;
  recentStartupStderrLines = [];
  pendingRequests = /* @__PURE__ */ new Map();
  deviceIdentity = null;
  restartDebounceTimer = null;
  lifecycleEpoch = 0;
  deferredRestartPending = false;
  restartInFlight = null;
  constructor(config) {
    super();
    this.reconnectConfig = { ...DEFAULT_RECONNECT_CONFIG, ...config };
  }
  async initDeviceIdentity() {
    if (this.deviceIdentity) return;
    try {
      const identityPath = path.join(electron.app.getPath("userData"), "clawx-device-identity.json");
      this.deviceIdentity = await loadOrCreateDeviceIdentity(identityPath);
      logger.debug(`Device identity loaded (deviceId=${this.deviceIdentity.deviceId})`);
    } catch (err) {
      logger.warn("Failed to load device identity, scopes will be limited:", err);
    }
  }
  sanitizeSpawnArgs(args) {
    const sanitized = [...args];
    const tokenIdx = sanitized.indexOf("--token");
    if (tokenIdx !== -1 && tokenIdx + 1 < sanitized.length) {
      sanitized[tokenIdx + 1] = "[redacted]";
    }
    return sanitized;
  }
  formatExit(code, signal) {
    if (code !== null) return `code=${code}`;
    if (signal) return `signal=${signal}`;
    return "code=null signal=null";
  }
  classifyStderrMessage(message) {
    const msg = message.trim();
    if (!msg) return { level: "drop", normalized: msg };
    if (msg.includes("openclaw-control-ui") && msg.includes("token_mismatch")) return { level: "drop", normalized: msg };
    if (msg.includes("closed before connect") && msg.includes("token mismatch")) return { level: "drop", normalized: msg };
    if (msg.includes("ExperimentalWarning")) return { level: "debug", normalized: msg };
    if (msg.includes("DeprecationWarning")) return { level: "debug", normalized: msg };
    if (msg.includes("Debugger attached")) return { level: "debug", normalized: msg };
    if (msg.includes("NODE_OPTIONs are not supported in packaged apps")) return { level: "debug", normalized: msg };
    return { level: "warn", normalized: msg };
  }
  recordStartupStderrLine(line) {
    const normalized = line.trim();
    if (!normalized) return;
    this.recentStartupStderrLines.push(normalized);
    const MAX_STDERR_LINES = 120;
    if (this.recentStartupStderrLines.length > MAX_STDERR_LINES) {
      this.recentStartupStderrLines.splice(0, this.recentStartupStderrLines.length - MAX_STDERR_LINES);
    }
  }
  bumpLifecycleEpoch(reason) {
    this.lifecycleEpoch = nextLifecycleEpoch(this.lifecycleEpoch);
    logger.debug(`Gateway lifecycle epoch advanced to ${this.lifecycleEpoch} (${reason})`);
    return this.lifecycleEpoch;
  }
  assertLifecycleEpoch(expectedEpoch, phase) {
    if (isLifecycleSuperseded(expectedEpoch, this.lifecycleEpoch)) {
      throw new LifecycleSupersededError(
        `Gateway ${phase} superseded (expectedEpoch=${expectedEpoch}, currentEpoch=${this.lifecycleEpoch})`
      );
    }
  }
  isRestartDeferred() {
    return shouldDeferRestart({
      state: this.status.state,
      startLock: this.startLock
    });
  }
  markDeferredRestart(reason) {
    if (!this.deferredRestartPending) {
      logger.info(
        `Deferring Gateway restart (${reason}) until startup/reconnect settles (state=${this.status.state}, startLock=${this.startLock})`
      );
    } else {
      logger.debug(
        `Gateway restart already deferred; keeping pending request (${reason}, state=${this.status.state}, startLock=${this.startLock})`
      );
    }
    this.deferredRestartPending = true;
  }
  flushDeferredRestart(trigger) {
    const action = getDeferredRestartAction({
      hasPendingRestart: this.deferredRestartPending,
      state: this.status.state,
      startLock: this.startLock,
      shouldReconnect: this.shouldReconnect
    });
    if (action === "none") return;
    if (action === "wait") {
      logger.debug(
        `Deferred Gateway restart still waiting (${trigger}, state=${this.status.state}, startLock=${this.startLock})`
      );
      return;
    }
    this.deferredRestartPending = false;
    if (action === "drop") {
      logger.info(
        `Dropping deferred Gateway restart (${trigger}) because lifecycle already recovered (state=${this.status.state}, shouldReconnect=${this.shouldReconnect})`
      );
      return;
    }
    logger.info(`Executing deferred Gateway restart now (${trigger})`);
    void this.restart().catch((error2) => {
      logger.warn("Deferred Gateway restart failed:", error2);
    });
  }
  /**
   * Get current Gateway status
   */
  getStatus() {
    return { ...this.status };
  }
  /**
   * Check if Gateway is connected and ready
   */
  isConnected() {
    return this.status.state === "running" && this.ws?.readyState === WebSocket.OPEN;
  }
  /**
   * Start Gateway process
   */
  async start() {
    if (this.startLock) {
      logger.debug("Gateway start ignored because a start flow is already in progress");
      return;
    }
    if (this.status.state === "running") {
      logger.debug("Gateway already running, skipping start");
      return;
    }
    this.startLock = true;
    const startEpoch = this.bumpLifecycleEpoch("start");
    logger.info(`Gateway start requested (port=${this.status.port})`);
    this.lastSpawnSummary = null;
    this.shouldReconnect = true;
    await this.initDeviceIdentity();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
      logger.debug("Cleared pending reconnect timer because start was requested manually");
    }
    this.reconnectAttempts = 0;
    this.setStatus({ state: "starting", reconnectAttempts: 0 });
    let configRepairAttempted = false;
    void isPythonReady().then((pythonReady) => {
      if (!pythonReady) {
        logger.info("Python environment missing or incomplete, attempting background repair...");
        void setupManagedPython().catch((err) => {
          logger.error("Background Python repair failed:", err);
        });
      }
    }).catch((err) => {
      logger.error("Failed to check Python environment:", err);
    });
    try {
      let startAttempts = 0;
      const MAX_START_ATTEMPTS = 3;
      while (true) {
        startAttempts++;
        this.assertLifecycleEpoch(startEpoch, "start");
        this.recentStartupStderrLines = [];
        try {
          logger.debug("Checking for existing Gateway...");
          const existing = await this.findExistingGateway();
          this.assertLifecycleEpoch(startEpoch, "start/find-existing");
          if (existing) {
            logger.debug(`Found existing Gateway on port ${existing.port}`);
            await this.connect(existing.port, existing.externalToken);
            this.assertLifecycleEpoch(startEpoch, "start/connect-existing");
            this.ownsProcess = false;
            this.setStatus({ pid: void 0 });
            this.startHealthCheck();
            return;
          }
          logger.debug("No existing Gateway found, starting new process...");
          if (process.platform === "win32") {
            await this.waitForPortFree(this.status.port);
            this.assertLifecycleEpoch(startEpoch, "start/wait-port");
          }
          await this.startProcess();
          this.assertLifecycleEpoch(startEpoch, "start/start-process");
          await this.waitForReady();
          this.assertLifecycleEpoch(startEpoch, "start/wait-ready");
          await this.connect(this.status.port);
          this.assertLifecycleEpoch(startEpoch, "start/connect");
          this.startHealthCheck();
          logger.debug("Gateway started successfully");
          return;
        } catch (error2) {
          if (error2 instanceof LifecycleSupersededError) {
            throw error2;
          }
          if (shouldAttemptConfigAutoRepair(error2, this.recentStartupStderrLines, configRepairAttempted)) {
            configRepairAttempted = true;
            logger.warn(
              "Detected invalid OpenClaw config during Gateway startup; running doctor repair before retry"
            );
            const repaired = await this.runOpenClawDoctorRepair();
            if (repaired) {
              logger.info("OpenClaw doctor repair completed; retrying Gateway startup");
              this.setStatus({ state: "starting", error: void 0, reconnectAttempts: 0 });
              continue;
            }
            logger.error("OpenClaw doctor repair failed; not retrying Gateway startup");
          }
          const errMsg = String(error2);
          const isTransientError = errMsg.includes("WebSocket closed before handshake") || errMsg.includes("ECONNREFUSED") || errMsg.includes("Gateway process exited before becoming ready") || errMsg.includes("Timed out waiting for connect.challenge") || errMsg.includes("Connect handshake timeout");
          if (startAttempts < MAX_START_ATTEMPTS && isTransientError) {
            logger.warn(`Transient start error: ${errMsg}. Retrying... (${startAttempts}/${MAX_START_ATTEMPTS})`);
            await new Promise((r) => setTimeout(r, 1e3));
            continue;
          }
          throw error2;
        }
      }
    } catch (error2) {
      if (error2 instanceof LifecycleSupersededError) {
        logger.debug(error2.message);
        return;
      }
      logger.error(
        `Gateway start failed (port=${this.status.port}, reconnectAttempts=${this.reconnectAttempts}, spawn=${this.lastSpawnSummary ?? "n/a"})`,
        error2
      );
      this.setStatus({ state: "error", error: String(error2) });
      throw error2;
    } finally {
      this.startLock = false;
      this.flushDeferredRestart("start:finally");
    }
  }
  /**
   * Stop Gateway process
   */
  async stop() {
    logger.info("Gateway stop requested");
    this.bumpLifecycleEpoch("stop");
    this.shouldReconnect = false;
    this.clearAllTimers();
    if (!this.ownsProcess && this.ws?.readyState === WebSocket.OPEN) {
      try {
        await this.rpc("shutdown", void 0, 5e3);
      } catch (error2) {
        logger.warn("Failed to request shutdown for externally managed Gateway:", error2);
      }
    }
    if (this.ws) {
      this.ws.close(1e3, "Gateway stopped by user");
      this.ws = null;
    }
    if (this.process && this.ownsProcess) {
      const child = this.process;
      let exited = false;
      await new Promise((resolve) => {
        child.once("exit", () => {
          exited = true;
          resolve();
        });
        const pid = child.pid;
        logger.info(`Sending kill to Gateway process (pid=${pid ?? "unknown"})`);
        try {
          child.kill();
        } catch {
        }
        const timeout = setTimeout(() => {
          if (!exited) {
            logger.warn(`Gateway did not exit in time, force-killing (pid=${pid ?? "unknown"})`);
            if (pid) {
              try {
                process.kill(pid, "SIGKILL");
              } catch {
              }
            }
          }
          resolve();
        }, 5e3);
        child.once("exit", () => {
          clearTimeout(timeout);
        });
      });
      if (this.process === child) {
        this.process = null;
      }
    }
    this.ownsProcess = false;
    for (const [, request] of this.pendingRequests) {
      clearTimeout(request.timeout);
      request.reject(new Error("Gateway stopped"));
    }
    this.pendingRequests.clear();
    this.deferredRestartPending = false;
    this.setStatus({ state: "stopped", error: void 0, pid: void 0, connectedAt: void 0, uptime: void 0 });
  }
  /**
   * Restart Gateway process
   */
  async restart() {
    if (this.isRestartDeferred()) {
      this.markDeferredRestart("restart");
      return;
    }
    if (this.restartInFlight) {
      logger.debug("Gateway restart already in progress, joining existing request");
      await this.restartInFlight;
      return;
    }
    logger.debug("Gateway restart requested");
    this.restartInFlight = (async () => {
      await this.stop();
      await this.start();
    })();
    try {
      await this.restartInFlight;
    } finally {
      this.restartInFlight = null;
      this.flushDeferredRestart("restart:finally");
    }
  }
  /**
   * Debounced restart — coalesces multiple rapid restart requests into a
   * single restart after `delayMs` of inactivity.  This prevents the
   * cascading stop/start cycles that occur when provider:save,
   * provider:setDefault and channel:saveConfig all fire within seconds
   * of each other during setup.
   */
  debouncedRestart(delayMs = 2e3) {
    if (this.restartDebounceTimer) {
      clearTimeout(this.restartDebounceTimer);
    }
    logger.debug(`Gateway restart debounced (will fire in ${delayMs}ms)`);
    this.restartDebounceTimer = setTimeout(() => {
      this.restartDebounceTimer = null;
      void this.restart().catch((err) => {
        logger.warn("Debounced Gateway restart failed:", err);
      });
    }, delayMs);
  }
  /**
   * Clear all active timers
   */
  clearAllTimers() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    if (this.restartDebounceTimer) {
      clearTimeout(this.restartDebounceTimer);
      this.restartDebounceTimer = null;
    }
  }
  /**
   * Make an RPC call to the Gateway
   * Uses OpenClaw protocol format: { type: "req", id: "...", method: "...", params: {...} }
   */
  async rpc(method, params, timeoutMs = 3e4) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("Gateway not connected"));
        return;
      }
      const id = crypto.randomUUID();
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`RPC timeout: ${method}`));
      }, timeoutMs);
      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout
      });
      const request = {
        type: "req",
        id,
        method,
        params
      };
      try {
        this.ws.send(JSON.stringify(request));
      } catch (error2) {
        this.pendingRequests.delete(id);
        clearTimeout(timeout);
        reject(new Error(`Failed to send RPC request: ${error2}`));
      }
    });
  }
  /**
   * Start health check monitoring
   */
  startHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.healthCheckInterval = setInterval(async () => {
      if (this.status.state !== "running") {
        return;
      }
      try {
        const health = await this.checkHealth();
        if (!health.ok) {
          logger.warn(`Gateway health check failed: ${health.error ?? "unknown"}`);
          this.emit("error", new Error(health.error || "Health check failed"));
        }
      } catch (error2) {
        logger.error("Gateway health check error:", error2);
      }
    }, 3e4);
  }
  /**
   * Check Gateway health via WebSocket ping
   * OpenClaw Gateway doesn't have an HTTP /health endpoint
   */
  async checkHealth() {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const uptime = this.status.connectedAt ? Math.floor((Date.now() - this.status.connectedAt) / 1e3) : void 0;
        return { ok: true, uptime };
      }
      return { ok: false, error: "WebSocket not connected" };
    } catch (error2) {
      return { ok: false, error: String(error2) };
    }
  }
  /**
   * Unload the system-managed openclaw gateway launchctl service if it is
   * loaded.  Without this, killing the process only causes launchctl to
   * respawn it, leading to an infinite reconnect loop.
   */
  async unloadLaunchctlService() {
    if (process.platform !== "darwin") return;
    try {
      const uid = process.getuid?.();
      if (uid === void 0) return;
      const LAUNCHD_LABEL = "ai.openclaw.gateway";
      const serviceTarget = `gui/${uid}/${LAUNCHD_LABEL}`;
      const loaded = await new Promise((resolve) => {
        import("child_process").then((cp) => {
          cp.exec(`launchctl print ${serviceTarget}`, { timeout: 5e3 }, (err) => {
            resolve(!err);
          });
        }).catch(() => resolve(false));
      });
      if (!loaded) return;
      logger.info(`Unloading launchctl service ${serviceTarget} to prevent auto-respawn`);
      await new Promise((resolve) => {
        import("child_process").then((cp) => {
          cp.exec(`launchctl bootout ${serviceTarget}`, { timeout: 1e4 }, (err) => {
            if (err) {
              logger.warn(`Failed to bootout launchctl service: ${err.message}`);
            } else {
              logger.info("Successfully unloaded launchctl gateway service");
            }
            resolve();
          });
        }).catch(() => resolve());
      });
      await new Promise((r) => setTimeout(r, 2e3));
      try {
        const { homedir } = await import("os");
        const plistPath = path.join(homedir(), "Library", "LaunchAgents", `${LAUNCHD_LABEL}.plist`);
        const { access, unlink } = await import("fs/promises");
        await access(plistPath);
        await unlink(plistPath);
        logger.info(`Removed legacy launchd plist to prevent reload on next login: ${plistPath}`);
      } catch {
      }
    } catch (err) {
      logger.warn("Error while unloading launchctl gateway service:", err);
    }
  }
  /**
   * Find existing Gateway process by attempting a WebSocket connection
   */
  async findExistingGateway() {
    try {
      const port = PORTS.OPENCLAW_GATEWAY;
      try {
        const cmd = process.platform === "win32" ? `netstat -ano | findstr :${port}` : `lsof -i :${port} -sTCP:LISTEN -t`;
        const { stdout } = await new Promise((resolve, reject) => {
          import("child_process").then((cp) => {
            cp.exec(cmd, { timeout: 5e3, windowsHide: true }, (err, stdout2) => {
              if (err) resolve({ stdout: "" });
              else resolve({ stdout: stdout2 });
            });
          }).catch(reject);
        });
        if (stdout.trim()) {
          let pids = [];
          if (process.platform === "win32") {
            const lines = stdout.trim().split(/\r?\n/);
            for (const line of lines) {
              const parts = line.trim().split(/\s+/);
              if (parts.length >= 5 && parts[3] === "LISTENING") {
                pids.push(parts[4]);
              }
            }
          } else {
            pids = stdout.trim().split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
          }
          pids = [...new Set(pids)];
          if (pids.length > 0) {
            if (!this.process || !pids.includes(String(this.process.pid))) {
              logger.info(`Found orphaned process listening on port ${port} (PIDs: ${pids.join(", ")}), attempting to kill...`);
              if (process.platform === "darwin") {
                await this.unloadLaunchctlService();
              }
              for (const pid of pids) {
                try {
                  if (process.platform === "win32") {
                    import("child_process").then((cp) => {
                      cp.exec(
                        `taskkill /F /PID ${pid} /T`,
                        { timeout: 5e3, windowsHide: true },
                        () => {
                        }
                      );
                    }).catch(() => {
                    });
                  } else {
                    process.kill(parseInt(pid), "SIGTERM");
                  }
                } catch {
                }
              }
              await new Promise((r) => setTimeout(r, process.platform === "win32" ? 2e3 : 3e3));
              if (process.platform !== "win32") {
                for (const pid of pids) {
                  try {
                    process.kill(parseInt(pid), 0);
                    process.kill(parseInt(pid), "SIGKILL");
                  } catch {
                  }
                }
                await new Promise((r) => setTimeout(r, 1e3));
              }
              return null;
            }
          }
        }
      } catch (err) {
        logger.warn("Error checking for existing process on port:", err);
      }
      return await new Promise((resolve) => {
        const testWs = new WebSocket(`ws://localhost:${port}/ws`);
        const timeout = setTimeout(() => {
          testWs.close();
          resolve(null);
        }, 2e3);
        testWs.on("open", () => {
          clearTimeout(timeout);
          testWs.close();
          resolve({ port });
        });
        testWs.on("error", () => {
          clearTimeout(timeout);
          resolve(null);
        });
      });
    } catch {
    }
    return null;
  }
  /**
   * Attempt to repair invalid OpenClaw config using the built-in doctor command.
   * Returns true when doctor exits successfully.
   */
  async runOpenClawDoctorRepair() {
    const openclawDir = getOpenClawDir();
    const entryScript = getOpenClawEntryPath();
    if (!fs.existsSync(entryScript)) {
      logger.error(`Cannot run OpenClaw doctor repair: entry script not found at ${entryScript}`);
      return false;
    }
    const platform = process.platform;
    const arch = process.arch;
    const target = `${platform}-${arch}`;
    const binPath = electron.app.isPackaged ? path.join(process.resourcesPath, "bin") : path.join(process.cwd(), "resources", "bin", target);
    const binPathExists = fs.existsSync(binPath);
    const finalPath = binPathExists ? `${binPath}${path.delimiter}${process.env.PATH || ""}` : process.env.PATH || "";
    const uvEnv = await getUvMirrorEnv();
    const doctorArgs = ["doctor", "--fix", "--yes", "--non-interactive"];
    logger.info(
      `Running OpenClaw doctor repair (entry="${entryScript}", args="${doctorArgs.join(" ")}", cwd="${openclawDir}", bundledBin=${binPathExists ? "yes" : "no"})`
    );
    return new Promise((resolve) => {
      const forkEnv = {
        ...process.env,
        PATH: finalPath,
        ...uvEnv,
        OPENCLAW_NO_RESPAWN: "1"
      };
      const child = electron.utilityProcess.fork(entryScript, doctorArgs, {
        cwd: openclawDir,
        stdio: "pipe",
        env: forkEnv
      });
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };
      const timeout = setTimeout(() => {
        logger.error("OpenClaw doctor repair timed out after 120000ms");
        try {
          child.kill();
        } catch {
        }
        finish(false);
      }, 12e4);
      child.on("error", (err) => {
        clearTimeout(timeout);
        logger.error("Failed to spawn OpenClaw doctor repair process:", err);
        finish(false);
      });
      child.stdout?.on("data", (data) => {
        const raw = data.toString();
        for (const line of raw.split(/\r?\n/)) {
          const normalized = line.trim();
          if (!normalized) continue;
          logger.debug(`[Gateway doctor stdout] ${normalized}`);
        }
      });
      child.stderr?.on("data", (data) => {
        const raw = data.toString();
        for (const line of raw.split(/\r?\n/)) {
          const normalized = line.trim();
          if (!normalized) continue;
          logger.warn(`[Gateway doctor stderr] ${normalized}`);
        }
      });
      child.on("exit", (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          logger.info("OpenClaw doctor repair completed successfully");
          finish(true);
          return;
        }
        logger.warn(`OpenClaw doctor repair exited (code=${code})`);
        finish(false);
      });
    });
  }
  /**
   * Start Gateway process
   * Uses OpenClaw npm package from node_modules (dev) or resources (production)
   */
  /**
   * Wait until the gateway port is no longer held by the OS.
   * On Windows, TCP TIME_WAIT can keep a port occupied for up to 2 minutes
   * after the owning process exits, causing the new Gateway to hang on bind.
   */
  async waitForPortFree(port, timeoutMs = 3e4) {
    const net = await import("net");
    const start = Date.now();
    const pollInterval = 500;
    let logged = false;
    while (Date.now() - start < timeoutMs) {
      const available = await new Promise((resolve) => {
        const server = net.createServer();
        server.once("error", () => resolve(false));
        server.once("listening", () => {
          server.close(() => resolve(true));
        });
        server.listen(port, "127.0.0.1");
      });
      if (available) {
        const elapsed = Date.now() - start;
        if (elapsed > pollInterval) {
          logger.info(`Port ${port} became available after ${elapsed}ms`);
        }
        return;
      }
      if (!logged) {
        logger.info(`Waiting for port ${port} to become available (Windows TCP TIME_WAIT)...`);
        logged = true;
      }
      await new Promise((r) => setTimeout(r, pollInterval));
    }
    logger.warn(`Port ${port} still occupied after ${timeoutMs}ms, proceeding anyway`);
  }
  async startProcess() {
    await this.unloadLaunchctlService();
    const openclawDir = getOpenClawDir();
    const entryScript = getOpenClawEntryPath();
    if (!isOpenClawPresent()) {
      const errMsg = `OpenClaw package not found at: ${openclawDir}`;
      logger.error(errMsg);
      throw new Error(errMsg);
    }
    const appSettings = await getAllSettings();
    const gatewayToken = appSettings.gatewayToken;
    await syncProxyConfigToOpenClaw(appSettings);
    try {
      await sanitizeOpenClawConfig();
    } catch (err) {
      logger.warn("Failed to sanitize openclaw.json:", err);
    }
    try {
      await syncGatewayTokenToConfig(gatewayToken);
    } catch (err) {
      logger.warn("Failed to sync gateway token to openclaw.json:", err);
    }
    try {
      await syncBrowserConfigToOpenClaw();
    } catch (err) {
      logger.warn("Failed to sync browser config to openclaw.json:", err);
    }
    if (!fs.existsSync(entryScript)) {
      const errMsg = `OpenClaw entry script not found at: ${entryScript}`;
      logger.error(errMsg);
      throw new Error(errMsg);
    }
    const gatewayArgs = ["gateway", "--port", String(this.status.port), "--token", gatewayToken, "--allow-unconfigured"];
    const mode = electron.app.isPackaged ? "packaged" : "dev";
    const platform = process.platform;
    const arch = process.arch;
    const target = `${platform}-${arch}`;
    const binPath = electron.app.isPackaged ? path.join(process.resourcesPath, "bin") : path.join(process.cwd(), "resources", "bin", target);
    const binPathExists = fs.existsSync(binPath);
    const finalPath = binPathExists ? `${binPath}${path.delimiter}${process.env.PATH || ""}` : process.env.PATH || "";
    const providerEnv = {};
    const providerTypes = getKeyableProviderTypes();
    let loadedProviderKeyCount = 0;
    try {
      const defaultProviderId = await getDefaultProvider();
      if (defaultProviderId) {
        const defaultProvider = await getProvider(defaultProviderId);
        const defaultProviderType = defaultProvider?.type;
        const defaultProviderKey = await getApiKey(defaultProviderId);
        if (defaultProviderType && defaultProviderKey) {
          const envVar = getProviderEnvVar(defaultProviderType);
          if (envVar) {
            providerEnv[envVar] = defaultProviderKey;
            loadedProviderKeyCount++;
          }
        }
      }
    } catch (err) {
      logger.warn("Failed to load default provider key for environment injection:", err);
    }
    for (const providerType of providerTypes) {
      try {
        const key = await getApiKey(providerType);
        if (key) {
          const envVar = getProviderEnvVar(providerType);
          if (envVar) {
            providerEnv[envVar] = key;
            loadedProviderKeyCount++;
          }
        }
      } catch (err) {
        logger.warn(`Failed to load API key for ${providerType}:`, err);
      }
    }
    const uvEnv = await getUvMirrorEnv();
    const proxyEnv = buildProxyEnv(appSettings);
    const resolvedProxy = resolveProxySettings(appSettings);
    logger.info(
      `Starting Gateway process (mode=${mode}, port=${this.status.port}, entry="${entryScript}", args="${this.sanitizeSpawnArgs(gatewayArgs).join(" ")}", cwd="${openclawDir}", bundledBin=${binPathExists ? "yes" : "no"}, providerKeys=${loadedProviderKeyCount}, proxy=${appSettings.proxyEnabled ? `http=${resolvedProxy.httpProxy || "-"}, https=${resolvedProxy.httpsProxy || "-"}, all=${resolvedProxy.allProxy || "-"}` : "disabled"})`
    );
    this.lastSpawnSummary = `mode=${mode}, entry="${entryScript}", args="${this.sanitizeSpawnArgs(gatewayArgs).join(" ")}", cwd="${openclawDir}"`;
    return new Promise((resolve, reject) => {
      this.processExitCode = null;
      const { NODE_OPTIONS: _nodeOptions, ...baseEnv } = process.env;
      const forkEnv = {
        ...baseEnv,
        PATH: finalPath,
        ...providerEnv,
        ...uvEnv,
        ...proxyEnv,
        OPENCLAW_GATEWAY_TOKEN: gatewayToken,
        OPENCLAW_SKIP_CHANNELS: "",
        CLAWDBOT_SKIP_CHANNELS: "",
        // Prevent OpenClaw from respawning itself inside the utility process
        OPENCLAW_NO_RESPAWN: "1"
      };
      if (!electron.app.isPackaged) {
        try {
          const preloadPath = ensureGatewayFetchPreload();
          if (fs.existsSync(preloadPath)) {
            forkEnv["NODE_OPTIONS"] = appendNodeRequireToNodeOptions(
              forkEnv["NODE_OPTIONS"],
              preloadPath
            );
          }
        } catch (err) {
          logger.warn("Failed to set up OpenRouter headers preload:", err);
        }
      }
      this.process = electron.utilityProcess.fork(entryScript, gatewayArgs, {
        cwd: openclawDir,
        stdio: "pipe",
        env: forkEnv,
        serviceName: "OpenClaw Gateway"
      });
      const child = this.process;
      this.ownsProcess = true;
      child.on("error", (error2) => {
        this.ownsProcess = false;
        logger.error("Gateway process spawn error:", error2);
        reject(error2);
      });
      child.on("exit", (code) => {
        this.processExitCode = code;
        const expectedExit = !this.shouldReconnect || this.status.state === "stopped";
        const level = expectedExit ? logger.info : logger.warn;
        level(`Gateway process exited (code=${code}, expected=${expectedExit ? "yes" : "no"})`);
        this.ownsProcess = false;
        if (this.process === child) {
          this.process = null;
        }
        this.emit("exit", code);
        if (this.status.state === "running") {
          this.setStatus({ state: "stopped" });
          this.scheduleReconnect();
        }
      });
      child.stderr?.on("data", (data) => {
        const raw = data.toString();
        for (const line of raw.split(/\r?\n/)) {
          this.recordStartupStderrLine(line);
          const classified = this.classifyStderrMessage(line);
          if (classified.level === "drop") continue;
          if (classified.level === "debug") {
            logger.debug(`[Gateway stderr] ${classified.normalized}`);
            continue;
          }
          logger.warn(`[Gateway stderr] ${classified.normalized}`);
        }
      });
      child.on("spawn", () => {
        logger.info(`Gateway process started (pid=${child.pid})`);
        this.setStatus({ pid: child.pid });
      });
      resolve();
    });
  }
  /**
   * Wait for Gateway to be ready by checking if the port is accepting connections
   */
  async waitForReady(retries = 2400, interval = 250) {
    const child = this.process;
    for (let i = 0; i < retries; i++) {
      if (child && this.processExitCode !== null) {
        const code = this.processExitCode;
        logger.error(`Gateway process exited before ready (code=${code})`);
        throw new Error(`Gateway process exited before becoming ready (code=${code})`);
      }
      try {
        const ready = await new Promise((resolve) => {
          const testWs = new WebSocket(`ws://localhost:${this.status.port}/ws`);
          const timeout = setTimeout(() => {
            testWs.close();
            resolve(false);
          }, 2e3);
          testWs.on("open", () => {
            clearTimeout(timeout);
            testWs.close();
            resolve(true);
          });
          testWs.on("error", () => {
            clearTimeout(timeout);
            resolve(false);
          });
        });
        if (ready) {
          logger.debug(`Gateway ready after ${i + 1} attempt(s)`);
          return;
        }
      } catch {
      }
      if (i > 0 && i % 10 === 0) {
        logger.debug(`Still waiting for Gateway... (attempt ${i + 1}/${retries})`);
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    logger.error(`Gateway failed to become ready after ${retries} attempts on port ${this.status.port}`);
    throw new Error(`Gateway failed to start after ${retries} retries (port ${this.status.port})`);
  }
  /**
   * Connect WebSocket to Gateway
   */
  async connect(port, _externalToken) {
    logger.debug(`Connecting Gateway WebSocket (ws://localhost:${port}/ws)`);
    return new Promise((resolve, reject) => {
      const wsUrl = `ws://localhost:${port}/ws`;
      this.ws = new WebSocket(wsUrl);
      let handshakeComplete = false;
      let connectId = null;
      let handshakeTimeout = null;
      let settled = false;
      let challengeTimer = null;
      const cleanupHandshakeRequest = () => {
        if (challengeTimer) {
          clearTimeout(challengeTimer);
          challengeTimer = null;
        }
        if (handshakeTimeout) {
          clearTimeout(handshakeTimeout);
          handshakeTimeout = null;
        }
        if (connectId && this.pendingRequests.has(connectId)) {
          const request = this.pendingRequests.get(connectId);
          if (request) {
            clearTimeout(request.timeout);
          }
          this.pendingRequests.delete(connectId);
        }
      };
      const resolveOnce = () => {
        if (settled) return;
        settled = true;
        cleanupHandshakeRequest();
        resolve();
      };
      const rejectOnce = (error2) => {
        if (settled) return;
        settled = true;
        cleanupHandshakeRequest();
        const err = error2 instanceof Error ? error2 : new Error(String(error2));
        reject(err);
      };
      const sendConnectHandshake = async (challengeNonce) => {
        logger.debug("Sending connect handshake with challenge nonce");
        const currentToken = await getSetting("gatewayToken");
        connectId = `connect-${Date.now()}`;
        const role = "operator";
        const scopes = ["operator.admin"];
        const signedAtMs = Date.now();
        const clientId = "gateway-client";
        const clientMode = "ui";
        const device = (() => {
          if (!this.deviceIdentity) return void 0;
          const payload = buildDeviceAuthPayload({
            deviceId: this.deviceIdentity.deviceId,
            clientId,
            clientMode,
            role,
            scopes,
            signedAtMs,
            token: currentToken ?? null,
            nonce: challengeNonce
          });
          const signature = signDevicePayload(this.deviceIdentity.privateKeyPem, payload);
          return {
            id: this.deviceIdentity.deviceId,
            publicKey: publicKeyRawBase64UrlFromPem(this.deviceIdentity.publicKeyPem),
            signature,
            signedAt: signedAtMs,
            nonce: challengeNonce
          };
        })();
        const connectFrame = {
          type: "req",
          id: connectId,
          method: "connect",
          params: {
            minProtocol: 3,
            maxProtocol: 3,
            client: {
              id: clientId,
              displayName: "ClawX",
              version: "0.1.0",
              platform: process.platform,
              mode: clientMode
            },
            auth: {
              token: currentToken
            },
            caps: [],
            role,
            scopes,
            device
          }
        };
        this.ws?.send(JSON.stringify(connectFrame));
        const requestTimeout = setTimeout(() => {
          if (!handshakeComplete) {
            logger.error("Gateway connect handshake timed out");
            this.ws?.close();
            rejectOnce(new Error("Connect handshake timeout"));
          }
        }, 1e4);
        handshakeTimeout = requestTimeout;
        this.pendingRequests.set(connectId, {
          resolve: (_result) => {
            handshakeComplete = true;
            logger.debug("Gateway connect handshake completed");
            this.setStatus({
              state: "running",
              port,
              connectedAt: Date.now()
            });
            this.startPing();
            resolveOnce();
          },
          reject: (error2) => {
            logger.error("Gateway connect handshake failed:", error2);
            rejectOnce(error2);
          },
          timeout: requestTimeout
        });
      };
      challengeTimer = setTimeout(() => {
        if (!challengeReceived && !settled) {
          logger.error("Gateway connect.challenge not received within timeout");
          this.ws?.close();
          rejectOnce(new Error("Timed out waiting for connect.challenge from Gateway"));
        }
      }, 1e4);
      this.ws.on("open", () => {
        logger.debug("Gateway WebSocket opened, waiting for connect.challenge...");
      });
      let challengeReceived = false;
      this.ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (!challengeReceived && typeof message === "object" && message !== null && message.type === "event" && message.event === "connect.challenge") {
            challengeReceived = true;
            if (challengeTimer) {
              clearTimeout(challengeTimer);
              challengeTimer = null;
            }
            const nonce = message.payload?.nonce;
            if (!nonce) {
              rejectOnce(new Error("Gateway connect.challenge missing nonce"));
              return;
            }
            logger.debug("Received connect.challenge, sending handshake");
            sendConnectHandshake(nonce);
            return;
          }
          this.handleMessage(message);
        } catch (error2) {
          logger.debug("Failed to parse Gateway WebSocket message:", error2);
        }
      });
      this.ws.on("close", (code, reason) => {
        const reasonStr = reason?.toString() || "unknown";
        logger.warn(`Gateway WebSocket closed (code=${code}, reason=${reasonStr}, handshake=${handshakeComplete ? "ok" : "pending"})`);
        if (!handshakeComplete) {
          rejectOnce(new Error(`WebSocket closed before handshake: ${reasonStr}`));
          return;
        }
        cleanupHandshakeRequest();
        if (this.status.state === "running") {
          this.setStatus({ state: "stopped" });
          this.scheduleReconnect();
        }
      });
      this.ws.on("error", (error2) => {
        if (error2.message?.includes("closed before handshake") || error2.code === "ECONNREFUSED") {
          logger.debug(`Gateway WebSocket connection error (transient): ${error2.message}`);
        } else {
          logger.error("Gateway WebSocket error:", error2);
        }
        if (!handshakeComplete) {
          rejectOnce(error2);
        }
      });
    });
  }
  /**
   * Handle incoming WebSocket message
   */
  handleMessage(message) {
    if (typeof message !== "object" || message === null) {
      logger.debug("Received non-object Gateway message");
      return;
    }
    const msg = message;
    if (msg.type === "res" && typeof msg.id === "string") {
      if (this.pendingRequests.has(msg.id)) {
        const request = this.pendingRequests.get(msg.id);
        clearTimeout(request.timeout);
        this.pendingRequests.delete(msg.id);
        if (msg.ok === false || msg.error) {
          const errorObj = msg.error;
          const errorMsg = errorObj?.message || JSON.stringify(msg.error) || "Unknown error";
          request.reject(new Error(errorMsg));
        } else {
          request.resolve(msg.payload ?? msg);
        }
        return;
      }
    }
    if (msg.type === "event" && typeof msg.event === "string") {
      this.handleProtocolEvent(msg.event, msg.payload);
      return;
    }
    if (isResponse(message) && message.id && this.pendingRequests.has(String(message.id))) {
      const request = this.pendingRequests.get(String(message.id));
      clearTimeout(request.timeout);
      this.pendingRequests.delete(String(message.id));
      if (message.error) {
        const errorMsg = typeof message.error === "object" ? message.error.message || JSON.stringify(message.error) : String(message.error);
        request.reject(new Error(errorMsg));
      } else {
        request.resolve(message.result);
      }
      return;
    }
    if (isNotification(message)) {
      this.handleNotification(message);
      return;
    }
    this.emit("message", message);
  }
  /**
   * Handle OpenClaw protocol events
   */
  handleProtocolEvent(event, payload) {
    switch (event) {
      case "tick":
        break;
      case "chat":
        this.emit("chat:message", { message: payload });
        break;
      case "agent": {
        const p = payload;
        const data = p.data && typeof p.data === "object" ? p.data : {};
        const chatEvent = {
          ...data,
          runId: p.runId ?? data.runId,
          sessionKey: p.sessionKey ?? data.sessionKey,
          state: p.state ?? data.state,
          message: p.message ?? data.message
        };
        if (chatEvent.state || chatEvent.message) {
          this.emit("chat:message", { message: chatEvent });
        }
        this.emit("notification", { method: event, params: payload });
        break;
      }
      case "channel.status":
        this.emit("channel:status", payload);
        break;
      default:
        this.emit("notification", { method: event, params: payload });
    }
  }
  /**
   * Handle server-initiated notifications
   */
  handleNotification(notification) {
    this.emit("notification", notification);
    switch (notification.method) {
      case GatewayEventType.CHANNEL_STATUS_CHANGED:
        this.emit("channel:status", notification.params);
        break;
      case GatewayEventType.MESSAGE_RECEIVED:
        this.emit("chat:message", notification.params);
        break;
      case GatewayEventType.ERROR: {
        const errorData = notification.params;
        this.emit("error", new Error(errorData.message || "Gateway error"));
        break;
      }
      default:
        logger.debug(`Unknown Gateway notification: ${notification.method}`);
    }
  }
  /**
   * Start ping interval to keep connection alive
   */
  startPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 3e4);
  }
  /**
   * Schedule reconnection attempt with exponential backoff
   */
  scheduleReconnect() {
    if (!this.shouldReconnect) {
      logger.debug("Gateway reconnect skipped (auto-reconnect disabled)");
      return;
    }
    if (this.reconnectTimer) {
      return;
    }
    if (this.reconnectAttempts >= this.reconnectConfig.maxAttempts) {
      logger.error(`Gateway reconnect failed: max attempts reached (${this.reconnectConfig.maxAttempts})`);
      this.setStatus({
        state: "error",
        error: "Failed to reconnect after maximum attempts",
        reconnectAttempts: this.reconnectAttempts
      });
      return;
    }
    const delay = Math.min(
      this.reconnectConfig.baseDelay * Math.pow(2, this.reconnectAttempts),
      this.reconnectConfig.maxDelay
    );
    this.reconnectAttempts++;
    logger.warn(`Scheduling Gateway reconnect attempt ${this.reconnectAttempts}/${this.reconnectConfig.maxAttempts} in ${delay}ms`);
    this.setStatus({
      state: "reconnecting",
      reconnectAttempts: this.reconnectAttempts
    });
    const scheduledEpoch = this.lifecycleEpoch;
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      const skipReason = getReconnectSkipReason({
        scheduledEpoch,
        currentEpoch: this.lifecycleEpoch,
        shouldReconnect: this.shouldReconnect
      });
      if (skipReason) {
        logger.debug(`Skipping reconnect attempt: ${skipReason}`);
        return;
      }
      try {
        await this.start();
        this.reconnectAttempts = 0;
      } catch (error2) {
        logger.error("Gateway reconnection attempt failed:", error2);
        this.scheduleReconnect();
      }
    }, delay);
  }
  /**
   * Update status and emit event
   */
  setStatus(update) {
    const previousState = this.status.state;
    this.status = { ...this.status, ...update };
    if (this.status.state === "running" && this.status.connectedAt) {
      this.status.uptime = Date.now() - this.status.connectedAt;
    }
    this.emit("status", this.status);
    if (previousState !== this.status.state) {
      logger.debug(`Gateway state changed: ${previousState} -> ${this.status.state}`);
      this.flushDeferredRestart(`status:${previousState}->${this.status.state}`);
    }
  }
}
function escapeForDoubleQuotes(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
function quoteForPosix(value) {
  return `"${escapeForDoubleQuotes(value)}"`;
}
function quoteForPowerShell(value) {
  return `'${value.replace(/'/g, "''")}'`;
}
function getOpenClawCliCommand() {
  const entryPath = getOpenClawEntryPath();
  const platform = process.platform;
  if (platform === "darwin" || platform === "linux") {
    const localBinPath = node_path.join(node_os.homedir(), ".local", "bin", "openclaw");
    if (node_fs.existsSync(localBinPath)) {
      return quoteForPosix(localBinPath);
    }
  }
  if (platform === "linux") {
    if (node_fs.existsSync("/usr/local/bin/openclaw")) {
      return "/usr/local/bin/openclaw";
    }
  }
  if (!electron.app.isPackaged) {
    const openclawDir = getOpenClawDir();
    const nodeModulesDir = node_path.dirname(openclawDir);
    const binName = platform === "win32" ? "openclaw.cmd" : "openclaw";
    const binPath = node_path.join(nodeModulesDir, ".bin", binName);
    if (node_fs.existsSync(binPath)) {
      if (platform === "win32") {
        return `& ${quoteForPowerShell(binPath)}`;
      }
      return quoteForPosix(binPath);
    }
  }
  if (electron.app.isPackaged) {
    if (platform === "win32") {
      const cliDir = node_path.join(process.resourcesPath, "cli");
      const cmdPath = node_path.join(cliDir, "openclaw.cmd");
      if (node_fs.existsSync(cmdPath)) {
        return quoteForPowerShell(cmdPath);
      }
    }
    const execPath = process.execPath;
    if (platform === "win32") {
      return `$env:ELECTRON_RUN_AS_NODE=1; & ${quoteForPowerShell(execPath)} ${quoteForPowerShell(entryPath)}`;
    }
    return `ELECTRON_RUN_AS_NODE=1 ${quoteForPosix(execPath)} ${quoteForPosix(entryPath)}`;
  }
  if (platform === "win32") {
    return `node ${quoteForPowerShell(entryPath)}`;
  }
  return `node ${quoteForPosix(entryPath)}`;
}
function getPackagedCliWrapperPath() {
  if (!electron.app.isPackaged) return null;
  const platform = process.platform;
  if (platform === "darwin" || platform === "linux") {
    const wrapper = node_path.join(process.resourcesPath, "cli", "openclaw");
    return node_fs.existsSync(wrapper) ? wrapper : null;
  }
  if (platform === "win32") {
    const wrapper = node_path.join(process.resourcesPath, "cli", "openclaw.cmd");
    return node_fs.existsSync(wrapper) ? wrapper : null;
  }
  return null;
}
function getCliTargetPath() {
  return node_path.join(node_os.homedir(), ".local", "bin", "openclaw");
}
async function installOpenClawCli() {
  const platform = process.platform;
  if (platform === "win32") {
    return { success: false, error: "Windows CLI is configured by the installer." };
  }
  if (!electron.app.isPackaged) {
    return { success: false, error: "CLI install is only available in packaged builds." };
  }
  const wrapperSrc = getPackagedCliWrapperPath();
  if (!wrapperSrc) {
    return { success: false, error: "CLI wrapper not found in app resources." };
  }
  const targetDir = node_path.join(node_os.homedir(), ".local", "bin");
  const target = getCliTargetPath();
  try {
    node_fs.mkdirSync(targetDir, { recursive: true });
    if (node_fs.existsSync(target)) {
      node_fs.unlinkSync(target);
    }
    node_fs.symlinkSync(wrapperSrc, target);
    node_fs.chmodSync(wrapperSrc, 493);
    logger.info(`OpenClaw CLI symlink created: ${target} -> ${wrapperSrc}`);
    return { success: true, path: target };
  } catch (error2) {
    logger.error("Failed to install OpenClaw CLI:", error2);
    return { success: false, error: String(error2) };
  }
}
function isCliInstalled() {
  const platform = process.platform;
  if (platform === "win32") return true;
  const target = getCliTargetPath();
  if (!node_fs.existsSync(target)) return false;
  if (platform === "linux" && node_fs.existsSync("/usr/local/bin/openclaw")) return true;
  return true;
}
function ensureLocalBinInPath() {
  if (process.platform === "win32") return;
  const localBin = node_path.join(node_os.homedir(), ".local", "bin");
  const pathEnv = process.env.PATH || "";
  if (pathEnv.split(":").includes(localBin)) return;
  const shell = process.env.SHELL || "/bin/zsh";
  const profileFile = shell.includes("zsh") ? node_path.join(node_os.homedir(), ".zshrc") : shell.includes("fish") ? node_path.join(node_os.homedir(), ".config", "fish", "config.fish") : node_path.join(node_os.homedir(), ".bashrc");
  try {
    const marker = ".local/bin";
    let content = "";
    try {
      content = node_fs.readFileSync(profileFile, "utf-8");
    } catch {
    }
    if (content.includes(marker)) return;
    const line = shell.includes("fish") ? '\n# Added by ClawX\nfish_add_path "$HOME/.local/bin"\n' : '\n# Added by ClawX\nexport PATH="$HOME/.local/bin:$PATH"\n';
    node_fs.appendFileSync(profileFile, line);
    logger.info(`Added ~/.local/bin to PATH in ${profileFile}`);
  } catch (error2) {
    logger.warn("Failed to add ~/.local/bin to PATH:", error2);
  }
}
async function autoInstallCliIfNeeded(notify) {
  if (!electron.app.isPackaged) return;
  if (process.platform === "win32") return;
  const target = getCliTargetPath();
  const wrapperSrc = getPackagedCliWrapperPath();
  if (isCliInstalled()) {
    if (target && wrapperSrc && node_fs.existsSync(target)) {
      try {
        node_fs.unlinkSync(target);
        node_fs.symlinkSync(wrapperSrc, target);
        logger.debug(`Refreshed CLI symlink: ${target} -> ${wrapperSrc}`);
      } catch {
      }
    }
    return;
  }
  logger.info("Auto-installing openclaw CLI...");
  const result = await installOpenClawCli();
  if (result.success) {
    logger.info(`CLI auto-installed at ${result.path}`);
    ensureLocalBinInPath();
    if (result.path) notify?.(result.path);
  } else {
    logger.warn(`CLI auto-install failed: ${result.error}`);
  }
}
function getNodeExecForCli() {
  if (process.platform === "darwin" && electron.app.isPackaged) {
    const appName = electron.app.getName();
    const helperName = `${appName} Helper`;
    const helperPath = node_path.join(
      node_path.dirname(process.execPath),
      "../Frameworks",
      `${helperName}.app`,
      "Contents/MacOS",
      helperName
    );
    if (node_fs.existsSync(helperPath)) return helperPath;
  }
  return process.execPath;
}
function generateCompletionCache() {
  if (!electron.app.isPackaged) return;
  const entryPath = getOpenClawEntryPath();
  if (!node_fs.existsSync(entryPath)) return;
  const execPath = getNodeExecForCli();
  const child = node_child_process.spawn(execPath, [entryPath, "completion", "--write-state"], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      OPENCLAW_NO_RESPAWN: "1",
      OPENCLAW_EMBEDDED_IN: "ClawX"
    },
    stdio: "ignore",
    detached: false,
    windowsHide: true
  });
  child.on("close", (code) => {
    if (code === 0) {
      logger.info("OpenClaw completion cache generated");
    } else {
      logger.warn(`OpenClaw completion cache generation exited with code ${code}`);
    }
  });
  child.on("error", (err) => {
    logger.warn("Failed to generate completion cache:", err);
  });
}
function installCompletionToProfile() {
  if (!electron.app.isPackaged) return;
  if (process.platform === "win32") return;
  const entryPath = getOpenClawEntryPath();
  if (!node_fs.existsSync(entryPath)) return;
  const execPath = getNodeExecForCli();
  const child = node_child_process.spawn(
    execPath,
    [entryPath, "completion", "--install", "-y"],
    {
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        OPENCLAW_NO_RESPAWN: "1",
        OPENCLAW_EMBEDDED_IN: "ClawX"
      },
      stdio: "ignore",
      detached: false,
      windowsHide: true
    }
  );
  child.on("close", (code) => {
    if (code === 0) {
      logger.info("OpenClaw completion installed to shell profile");
    } else {
      logger.warn(`OpenClaw completion install exited with code ${code}`);
    }
  });
  child.on("error", (err) => {
    logger.warn("Failed to install completion to shell profile:", err);
  });
}
const OPENCLAW_CONFIG_PATH = path.join(os.homedir(), ".openclaw", "openclaw.json");
async function fileExists$1(p) {
  try {
    await promises.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
async function readConfig() {
  if (!await fileExists$1(OPENCLAW_CONFIG_PATH)) {
    return {};
  }
  try {
    const raw = await promises.readFile(OPENCLAW_CONFIG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read openclaw config:", err);
    return {};
  }
}
async function writeConfig(config) {
  const json = JSON.stringify(config, null, 2);
  await promises.writeFile(OPENCLAW_CONFIG_PATH, json, "utf-8");
}
async function getSkillConfig(skillKey) {
  const config = await readConfig();
  return config.skills?.entries?.[skillKey];
}
async function updateSkillConfig(skillKey, updates) {
  try {
    const config = await readConfig();
    if (!config.skills) {
      config.skills = {};
    }
    if (!config.skills.entries) {
      config.skills.entries = {};
    }
    const entry = config.skills.entries[skillKey] || {};
    if (updates.apiKey !== void 0) {
      const trimmed = updates.apiKey.trim();
      if (trimmed) {
        entry.apiKey = trimmed;
      } else {
        delete entry.apiKey;
      }
    }
    if (updates.env !== void 0) {
      const newEnv = {};
      for (const [key, value] of Object.entries(updates.env)) {
        const trimmedKey = key.trim();
        if (!trimmedKey) continue;
        const trimmedVal = value.trim();
        if (trimmedVal) {
          newEnv[trimmedKey] = trimmedVal;
        }
      }
      if (Object.keys(newEnv).length > 0) {
        entry.env = newEnv;
      } else {
        delete entry.env;
      }
    }
    config.skills.entries[skillKey] = entry;
    await writeConfig(config);
    return { success: true };
  } catch (err) {
    console.error("Failed to update skill config:", err);
    return { success: false, error: String(err) };
  }
}
async function getAllSkillConfigs() {
  const config = await readConfig();
  return config.skills?.entries || {};
}
const BUILTIN_SKILLS = [
  { slug: "feishu-doc", sourceExtension: "feishu" },
  { slug: "feishu-drive", sourceExtension: "feishu" },
  { slug: "feishu-perm", sourceExtension: "feishu" },
  { slug: "feishu-wiki", sourceExtension: "feishu" }
];
async function ensureBuiltinSkillsInstalled() {
  const skillsRoot = path.join(os.homedir(), ".openclaw", "skills");
  for (const { slug, sourceExtension } of BUILTIN_SKILLS) {
    const targetDir = path.join(skillsRoot, slug);
    const targetManifest = path.join(targetDir, "SKILL.md");
    if (fs.existsSync(targetManifest)) {
      continue;
    }
    const openclawDir = getOpenClawDir();
    const sourceDir = path.join(openclawDir, "extensions", sourceExtension, "skills", slug);
    if (!fs.existsSync(path.join(sourceDir, "SKILL.md"))) {
      logger.warn(`Built-in skill source not found, skipping: ${sourceDir}`);
      continue;
    }
    try {
      await promises.mkdir(targetDir, { recursive: true });
      await promises.cp(sourceDir, targetDir, { recursive: true });
      logger.info(`Installed built-in skill: ${slug} -> ${targetDir}`);
    } catch (error2) {
      logger.warn(`Failed to install built-in skill ${slug}:`, error2);
    }
  }
}
const require$1 = module$1.createRequire(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("index.js", document.baseURI).href);
const openclawPath = getOpenClawDir();
const openclawResolvedPath = getOpenClawResolvedDir();
const openclawRequire = module$1.createRequire(path.join(openclawResolvedPath, "package.json"));
function resolveOpenClawPackageJson(packageName) {
  const specifier = `${packageName}/package.json`;
  try {
    return openclawRequire.resolve(specifier);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Failed to resolve "${packageName}" from OpenClaw context. openclawPath=${openclawPath}, resolvedPath=${openclawResolvedPath}. ${reason}`,
      { cause: err }
    );
  }
}
const baileysPath = path.dirname(resolveOpenClawPackageJson("@whiskeysockets/baileys"));
const qrcodeTerminalPath = path.dirname(resolveOpenClawPackageJson("qrcode-terminal"));
const {
  default: makeWASocket,
  useMultiFileAuthState: initAuth,
  // Rename to avoid React hook linter error
  DisconnectReason,
  fetchLatestBaileysVersion
} = require$1(baileysPath);
const QRCodeModule = require$1(path.join(qrcodeTerminalPath, "vendor", "QRCode", "index.js"));
const QRErrorCorrectLevelModule = require$1(path.join(qrcodeTerminalPath, "vendor", "QRCode", "QRErrorCorrectLevel.js"));
const QRCode = QRCodeModule;
const QRErrorCorrectLevel = QRErrorCorrectLevelModule;
function createQrMatrix(input) {
  const qr = new QRCode(-1, QRErrorCorrectLevel.L);
  qr.addData(input);
  qr.make();
  return qr;
}
function fillPixel(buf, x, y, width, r, g, b, a = 255) {
  const idx = (y * width + x) * 4;
  buf[idx] = r;
  buf[idx + 1] = g;
  buf[idx + 2] = b;
  buf[idx + 3] = a;
}
function crcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
}
const CRC_TABLE = crcTable();
function crc32(buf) {
  let crc = 4294967295;
  for (let i = 0; i < buf.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 255] ^ crc >>> 8;
  }
  return (crc ^ 4294967295) >>> 0;
}
function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}
function encodePngRgba(buffer, width, height) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let row = 0; row < height; row += 1) {
    const rawOffset = row * (stride + 1);
    raw[rawOffset] = 0;
    buffer.copy(raw, rawOffset + 1, row * stride, row * stride + stride);
  }
  const compressed = zlib.deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}
async function renderQrPngBase64(input, opts = {}) {
  const { scale = 6, marginModules = 4 } = opts;
  const qr = createQrMatrix(input);
  const modules = qr.getModuleCount();
  const size = (modules + marginModules * 2) * scale;
  const buf = Buffer.alloc(size * size * 4, 255);
  for (let row = 0; row < modules; row += 1) {
    for (let col = 0; col < modules; col += 1) {
      if (!qr.isDark(row, col)) {
        continue;
      }
      const startX = (col + marginModules) * scale;
      const startY = (row + marginModules) * scale;
      for (let y = 0; y < scale; y += 1) {
        const pixelY = startY + y;
        for (let x = 0; x < scale; x += 1) {
          const pixelX = startX + x;
          fillPixel(buf, pixelX, pixelY, size, 0, 0, 0, 255);
        }
      }
    }
  }
  const png = encodePngRgba(buf, size, size);
  return png.toString("base64");
}
class WhatsAppLoginManager extends events.EventEmitter {
  socket = null;
  qr = null;
  accountId = null;
  active = false;
  retryCount = 0;
  maxRetries = 5;
  constructor() {
    super();
  }
  /**
   * Finish login: close socket and emit success after credentials are saved
   */
  async finishLogin(accountId) {
    if (!this.active) return;
    console.log("[WhatsAppLogin] Finishing login, closing socket to hand over to Gateway...");
    await this.stop();
    await new Promise((resolve) => setTimeout(resolve, 5e3));
    this.emit("success", { accountId });
  }
  /**
   * Start WhatsApp pairing process
   */
  async start(accountId = "default") {
    if (this.active && this.accountId === accountId) {
      if (this.qr) {
        const base64 = await renderQrPngBase64(this.qr);
        this.emit("qr", { qr: base64, raw: this.qr });
      }
      return;
    }
    if (this.active) {
      await this.stop();
    }
    this.accountId = accountId;
    this.active = true;
    this.qr = null;
    this.retryCount = 0;
    await this.connectToWhatsApp(accountId);
  }
  async connectToWhatsApp(accountId) {
    if (!this.active) return;
    try {
      const authDir = path.join(os.homedir(), ".openclaw", "credentials", "whatsapp", accountId);
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }
      console.log(`[WhatsAppLogin] Connecting for ${accountId} at ${authDir} (Attempt ${this.retryCount + 1})`);
      let pino;
      try {
        const baileysRequire = module$1.createRequire(path.join(baileysPath, "package.json"));
        pino = baileysRequire("pino");
      } catch (e) {
        console.warn("[WhatsAppLogin] Could not load pino from baileys, trying root", e);
        try {
          pino = require$1("pino");
        } catch {
          console.warn("[WhatsAppLogin] Pino not found, using console fallback");
          pino = () => ({
            trace: () => {
            },
            debug: () => {
            },
            info: () => {
            },
            warn: () => {
            },
            error: () => {
            },
            fatal: () => {
            },
            child: () => pino()
          });
        }
      }
      console.log("[WhatsAppLogin] Loading auth state...");
      const { state, saveCreds } = await initAuth(authDir);
      console.log("[WhatsAppLogin] Fetching latest version...");
      const { version } = await fetchLatestBaileysVersion();
      console.log(`[WhatsAppLogin] Starting login for ${accountId}, version: ${version}`);
      this.socket = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        // Silent logger
        connectTimeoutMs: 6e4
        // mobile: false,
        // browser: ['ClawX', 'Chrome', '1.0.0'],
      });
      let connectionOpened = false;
      let credsReceived = false;
      let credsTimeout = null;
      this.socket.ev.on("creds.update", async () => {
        await saveCreds();
        if (connectionOpened && !credsReceived) {
          credsReceived = true;
          if (credsTimeout) clearTimeout(credsTimeout);
          console.log("[WhatsAppLogin] Credentials saved after connection open, finishing login...");
          await new Promise((resolve) => setTimeout(resolve, 3e3));
          await this.finishLogin(accountId);
        }
      });
      this.socket.ev.on("connection.update", async (update) => {
        try {
          const { connection, lastDisconnect, qr } = update;
          if (qr) {
            this.qr = qr;
            console.log("[WhatsAppLogin] QR received");
            const base64 = await renderQrPngBase64(qr);
            if (this.active) this.emit("qr", { qr: base64, raw: qr });
          }
          if (connection === "close") {
            const error2 = lastDisconnect?.error;
            const statusCode = error2?.output?.statusCode;
            const isLoggedOut = statusCode === DisconnectReason.loggedOut;
            const shouldReconnect = !isLoggedOut || this.retryCount < 2;
            console.log(
              "[WhatsAppLogin] Connection closed.",
              "Reconnect:",
              shouldReconnect,
              "Active:",
              this.active,
              "Error:",
              error2?.message
            );
            if (shouldReconnect && this.active) {
              if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`[WhatsAppLogin] Reconnecting in 1s... (Attempt ${this.retryCount}/${this.maxRetries})`);
                setTimeout(() => this.connectToWhatsApp(accountId), 1e3);
              } else {
                console.log("[WhatsAppLogin] Max retries reached, stopping.");
                this.active = false;
                this.emit("error", "Connection failed after multiple retries");
              }
            } else {
              this.active = false;
              if (error2?.output?.statusCode === DisconnectReason.loggedOut) {
                try {
                  fs.rmSync(authDir, { recursive: true, force: true });
                } catch (err) {
                  console.error("[WhatsAppLogin] Failed to clear auth dir:", err);
                }
              }
              if (this.socket) {
                this.socket.end(void 0);
                this.socket = null;
              }
              this.emit("error", "Logged out");
            }
          } else if (connection === "open") {
            console.log("[WhatsAppLogin] Connection opened! Waiting for credentials to be saved...");
            this.retryCount = 0;
            connectionOpened = true;
            credsTimeout = setTimeout(async () => {
              if (!credsReceived && this.active) {
                console.warn("[WhatsAppLogin] Timed out waiting for creds.update after connection open, proceeding...");
                await this.finishLogin(accountId);
              }
            }, 15e3);
          }
        } catch (innerErr) {
          console.error("[WhatsAppLogin] Error in connection update:", innerErr);
        }
      });
    } catch (error2) {
      console.error("[WhatsAppLogin] Fatal Connect Error:", error2);
      if (this.active && this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => this.connectToWhatsApp(accountId), 2e3);
      } else {
        this.active = false;
        const msg = error2 instanceof Error ? error2.message : String(error2);
        this.emit("error", msg);
      }
    }
  }
  /**
   * Stop current login process
   */
  async stop() {
    this.active = false;
    this.qr = null;
    if (this.socket) {
      try {
        this.socket.ev.removeAllListeners("connection.update");
        try {
          this.socket.ws?.close();
        } catch {
        }
        this.socket.end(void 0);
      } catch {
      }
      this.socket = null;
    }
  }
}
const whatsAppLoginManager = new WhatsAppLoginManager();
const MINIMAX_OAUTH_CONFIG = {
  cn: {
    baseUrl: "https://api.minimaxi.com",
    clientId: "78257093-7e40-4613-99e0-527b14b39113"
  },
  global: {
    baseUrl: "https://api.minimax.io",
    clientId: "78257093-7e40-4613-99e0-527b14b39113"
  }
};
const MINIMAX_OAUTH_SCOPE = "group_id profile model.completion";
const MINIMAX_OAUTH_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:user_code";
function getOAuthEndpoints(region) {
  const config = MINIMAX_OAUTH_CONFIG[region];
  return {
    codeEndpoint: `${config.baseUrl}/oauth/code`,
    tokenEndpoint: `${config.baseUrl}/oauth/token`,
    clientId: config.clientId,
    baseUrl: config.baseUrl
  };
}
function toFormUrlEncoded$1(data) {
  return Object.entries(data).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
}
function generatePkce$1() {
  const verifier = crypto$2.randomBytes(32).toString("base64url");
  const challenge = crypto$2.createHash("sha256").update(verifier).digest("base64url");
  const state = crypto$2.randomBytes(16).toString("base64url");
  return { verifier, challenge, state };
}
async function requestOAuthCode(params) {
  const endpoints = getOAuthEndpoints(params.region);
  const response = await fetch(endpoints.codeEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "x-request-id": crypto$2.randomUUID()
    },
    body: toFormUrlEncoded$1({
      response_type: "code",
      client_id: endpoints.clientId,
      scope: MINIMAX_OAUTH_SCOPE,
      code_challenge: params.challenge,
      code_challenge_method: "S256",
      state: params.state
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MiniMax OAuth authorization failed: ${text || response.statusText}`);
  }
  const payload = await response.json();
  if (!payload.user_code || !payload.verification_uri) {
    throw new Error(
      payload.error ?? "MiniMax OAuth authorization returned an incomplete payload (missing user_code or verification_uri)."
    );
  }
  if (payload.state !== params.state) {
    throw new Error("MiniMax OAuth state mismatch: possible CSRF attack or session corruption.");
  }
  return payload;
}
async function pollOAuthToken(params) {
  const endpoints = getOAuthEndpoints(params.region);
  const response = await fetch(endpoints.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: toFormUrlEncoded$1({
      grant_type: MINIMAX_OAUTH_GRANT_TYPE,
      client_id: endpoints.clientId,
      user_code: params.userCode,
      code_verifier: params.verifier
    })
  });
  const text = await response.text();
  let payload;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = void 0;
    }
  }
  if (!response.ok) {
    return {
      status: "error",
      message: (payload?.base_resp?.status_msg ?? text) || "MiniMax OAuth failed to parse response."
    };
  }
  if (!payload) {
    return { status: "error", message: "MiniMax OAuth failed to parse response." };
  }
  const tokenPayload = payload;
  if (tokenPayload.status === "error") {
    return { status: "error", message: "An error occurred. Please try again later" };
  }
  if (tokenPayload.status != "success") {
    return { status: "pending", message: "current user code is not authorized" };
  }
  if (!tokenPayload.access_token || !tokenPayload.refresh_token || !tokenPayload.expired_in) {
    return { status: "error", message: "MiniMax OAuth returned incomplete token payload." };
  }
  return {
    status: "success",
    token: {
      access: tokenPayload.access_token,
      refresh: tokenPayload.refresh_token,
      expires: tokenPayload.expired_in,
      resourceUrl: tokenPayload.resource_url,
      notification_message: tokenPayload.notification_message
    }
  };
}
async function loginMiniMaxPortalOAuth(params) {
  const region = params.region ?? "global";
  const { verifier, challenge, state } = generatePkce$1();
  const oauth = await requestOAuthCode({ challenge, state, region });
  const verificationUrl = oauth.verification_uri;
  const noteLines = [
    `Open ${verificationUrl} to approve access.`,
    `If prompted, enter the code ${oauth.user_code}.`,
    `Interval: ${oauth.interval ?? "default (2000ms)"}, Expires at: ${oauth.expired_in} unix timestamp`
  ];
  await params.note(noteLines.join("\n"), "MiniMax OAuth");
  try {
    await params.openUrl(verificationUrl);
  } catch {
  }
  let pollIntervalMs = oauth.interval ? oauth.interval : 2e3;
  const expireTimeMs = oauth.expired_in;
  while (Date.now() < expireTimeMs) {
    params.progress.update("Waiting for MiniMax OAuth approval…");
    const result = await pollOAuthToken({
      userCode: oauth.user_code,
      verifier,
      region
    });
    if (result.status === "success") {
      return result.token;
    }
    if (result.status === "error") {
      throw new Error(`MiniMax OAuth failed: ${result.message}`);
    }
    if (result.status === "pending") {
      pollIntervalMs = Math.min(pollIntervalMs * 1.5, 1e4);
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
  throw new Error("MiniMax OAuth timed out waiting for authorization.");
}
const QWEN_OAUTH_BASE_URL = "https://chat.qwen.ai";
const QWEN_OAUTH_DEVICE_CODE_ENDPOINT = `${QWEN_OAUTH_BASE_URL}/api/v1/oauth2/device/code`;
const QWEN_OAUTH_TOKEN_ENDPOINT = `${QWEN_OAUTH_BASE_URL}/api/v1/oauth2/token`;
const QWEN_OAUTH_CLIENT_ID = "f0304373b74a44d2b584a3fb70ca9e56";
const QWEN_OAUTH_SCOPE = "openid profile email model.completion";
const QWEN_OAUTH_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code";
function toFormUrlEncoded(data) {
  return Object.entries(data).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
}
function generatePkce() {
  const verifier = crypto$2.randomBytes(32).toString("base64url");
  const challenge = crypto$2.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}
async function requestDeviceCode(params) {
  const response = await fetch(QWEN_OAUTH_DEVICE_CODE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "x-request-id": crypto$2.randomUUID()
    },
    body: toFormUrlEncoded({
      client_id: QWEN_OAUTH_CLIENT_ID,
      scope: QWEN_OAUTH_SCOPE,
      code_challenge: params.challenge,
      code_challenge_method: "S256"
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Qwen device authorization failed: ${text || response.statusText}`);
  }
  const payload = await response.json();
  if (!payload.device_code || !payload.user_code || !payload.verification_uri) {
    throw new Error(
      payload.error ?? "Qwen device authorization returned an incomplete payload (missing user_code or verification_uri)."
    );
  }
  return payload;
}
async function pollDeviceToken(params) {
  const response = await fetch(QWEN_OAUTH_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: toFormUrlEncoded({
      grant_type: QWEN_OAUTH_GRANT_TYPE,
      client_id: QWEN_OAUTH_CLIENT_ID,
      device_code: params.deviceCode,
      code_verifier: params.verifier
    })
  });
  if (!response.ok) {
    let payload;
    try {
      payload = await response.json();
    } catch {
      const text = await response.text();
      return { status: "error", message: text || response.statusText };
    }
    if (payload?.error === "authorization_pending") {
      return { status: "pending" };
    }
    if (payload?.error === "slow_down") {
      return { status: "pending", slowDown: true };
    }
    return {
      status: "error",
      message: payload?.error_description || payload?.error || response.statusText
    };
  }
  const tokenPayload = await response.json();
  if (!tokenPayload.access_token || !tokenPayload.refresh_token || !tokenPayload.expires_in) {
    return { status: "error", message: "Qwen OAuth returned incomplete token payload." };
  }
  return {
    status: "success",
    token: {
      access: tokenPayload.access_token,
      refresh: tokenPayload.refresh_token,
      expires: Date.now() + tokenPayload.expires_in * 1e3,
      resourceUrl: tokenPayload.resource_url
    }
  };
}
async function loginQwenPortalOAuth(params) {
  const { verifier, challenge } = generatePkce();
  const device = await requestDeviceCode({ challenge });
  const verificationUrl = device.verification_uri_complete || device.verification_uri;
  await params.note(
    [
      `Open ${verificationUrl} to approve access.`,
      `If prompted, enter the code ${device.user_code}.`
    ].join("\n"),
    "Qwen OAuth"
  );
  try {
    await params.openUrl(verificationUrl);
  } catch {
  }
  const start = Date.now();
  let pollIntervalMs = device.interval ? device.interval * 1e3 : 2e3;
  const timeoutMs = device.expires_in * 1e3;
  while (Date.now() - start < timeoutMs) {
    params.progress.update("Waiting for Qwen OAuth approval…");
    const result = await pollDeviceToken({
      deviceCode: device.device_code,
      verifier
    });
    if (result.status === "success") {
      return result.token;
    }
    if (result.status === "error") {
      throw new Error(`Qwen OAuth failed: ${result.message}`);
    }
    if (result.status === "pending" && result.slowDown) {
      pollIntervalMs = Math.min(pollIntervalMs * 1.5, 1e4);
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
  throw new Error("Qwen OAuth timed out waiting for authorization.");
}
class DeviceOAuthManager extends events.EventEmitter {
  activeProvider = null;
  active = false;
  mainWindow = null;
  setWindow(window) {
    this.mainWindow = window;
  }
  async startFlow(provider, region = "global") {
    if (this.active) {
      await this.stopFlow();
    }
    this.active = true;
    this.emit("oauth:start", { provider });
    this.activeProvider = provider;
    try {
      if (provider === "minimax-portal" || provider === "minimax-portal-cn") {
        const actualRegion = provider === "minimax-portal-cn" ? "cn" : region || "global";
        await this.runMiniMaxFlow(actualRegion, provider);
      } else if (provider === "qwen-portal") {
        await this.runQwenFlow();
      } else {
        throw new Error(`Unsupported OAuth provider type: ${provider}`);
      }
      return true;
    } catch (error2) {
      if (!this.active) {
        return false;
      }
      logger.error(`[DeviceOAuth] Flow error for ${provider}:`, error2);
      this.emitError(error2 instanceof Error ? error2.message : String(error2));
      this.active = false;
      this.activeProvider = null;
      return false;
    }
  }
  async stopFlow() {
    this.active = false;
    this.activeProvider = null;
    logger.info("[DeviceOAuth] Flow explicitly stopped");
  }
  // ─────────────────────────────────────────────────────────
  // MiniMax flow
  // ─────────────────────────────────────────────────────────
  async runMiniMaxFlow(region, providerType = "minimax-portal") {
    if (!isOpenClawPresent()) {
      throw new Error("OpenClaw package not found");
    }
    const provider = this.activeProvider;
    const token = await loginMiniMaxPortalOAuth({
      region,
      openUrl: async (url) => {
        logger.info(`[DeviceOAuth] MiniMax opening browser: ${url}`);
        electron.shell.openExternal(url).catch(
          (err) => logger.warn(`[DeviceOAuth] Failed to open browser:`, err)
        );
      },
      note: async (message, _title) => {
        if (!this.active) return;
        const { verificationUri, userCode } = this.parseNote(message);
        if (verificationUri && userCode) {
          this.emitCode({ provider, verificationUri, userCode, expiresIn: 300 });
        } else {
          logger.info(`[DeviceOAuth] MiniMax note: ${message}`);
        }
      },
      progress: {
        update: (msg) => logger.info(`[DeviceOAuth] MiniMax progress: ${msg}`),
        stop: (msg) => logger.info(`[DeviceOAuth] MiniMax progress done: ${msg ?? ""}`)
      }
    });
    if (!this.active) return;
    await this.onSuccess(providerType, {
      access: token.access,
      refresh: token.refresh,
      expires: token.expires,
      // MiniMax returns a per-account resourceUrl as the API base URL
      resourceUrl: token.resourceUrl,
      // Revert back to anthropic-messages
      api: "anthropic-messages",
      region
    });
  }
  // ─────────────────────────────────────────────────────────
  // Qwen flow
  // ─────────────────────────────────────────────────────────
  async runQwenFlow() {
    if (!isOpenClawPresent()) {
      throw new Error("OpenClaw package not found");
    }
    const provider = this.activeProvider;
    const token = await loginQwenPortalOAuth({
      openUrl: async (url) => {
        logger.info(`[DeviceOAuth] Qwen opening browser: ${url}`);
        electron.shell.openExternal(url).catch(
          (err) => logger.warn(`[DeviceOAuth] Failed to open browser:`, err)
        );
      },
      note: async (message, _title) => {
        if (!this.active) return;
        const { verificationUri, userCode } = this.parseNote(message);
        if (verificationUri && userCode) {
          this.emitCode({ provider, verificationUri, userCode, expiresIn: 300 });
        } else {
          logger.info(`[DeviceOAuth] Qwen note: ${message}`);
        }
      },
      progress: {
        update: (msg) => logger.info(`[DeviceOAuth] Qwen progress: ${msg}`),
        stop: (msg) => logger.info(`[DeviceOAuth] Qwen progress done: ${msg ?? ""}`)
      }
    });
    if (!this.active) return;
    await this.onSuccess("qwen-portal", {
      access: token.access,
      refresh: token.refresh,
      expires: token.expires,
      // Qwen returns a per-account resourceUrl as the API base URL
      resourceUrl: token.resourceUrl,
      // Qwen uses OpenAI Completions API format
      api: "openai-completions"
    });
  }
  // ─────────────────────────────────────────────────────────
  // Success handler
  // ─────────────────────────────────────────────────────────
  async onSuccess(providerType, token) {
    this.active = false;
    this.activeProvider = null;
    logger.info(`[DeviceOAuth] Successfully completed OAuth for ${providerType}`);
    try {
      const tokenProviderId = providerType.startsWith("minimax-portal") ? "minimax-portal" : providerType;
      await saveOAuthTokenToOpenClaw(tokenProviderId, {
        access: token.access,
        refresh: token.refresh,
        expires: token.expires
      });
    } catch (err) {
      logger.warn(`[DeviceOAuth] Failed to save OAuth token to OpenClaw:`, err);
    }
    const defaultBaseUrl = providerType === "minimax-portal" ? "https://api.minimax.io/anthropic" : providerType === "minimax-portal-cn" ? "https://api.minimaxi.com/anthropic" : "https://portal.qwen.ai/v1";
    let baseUrl = token.resourceUrl || defaultBaseUrl;
    if (baseUrl && !baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      baseUrl = "https://" + baseUrl;
    }
    if (providerType.startsWith("minimax-portal") && baseUrl) {
      baseUrl = baseUrl.replace(/\/v1$/, "").replace(/\/anthropic$/, "").replace(/\/$/, "") + "/anthropic";
    } else if (providerType === "qwen-portal" && baseUrl) {
      if (!baseUrl.endsWith("/v1")) {
        baseUrl = baseUrl.replace(/\/$/, "") + "/v1";
      }
    }
    try {
      const tokenProviderId = providerType.startsWith("minimax-portal") ? "minimax-portal" : providerType;
      await setOpenClawDefaultModelWithOverride(tokenProviderId, void 0, {
        baseUrl,
        api: token.api,
        // Tells OpenClaw's anthropic adapter to use `Authorization: Bearer` instead of `x-api-key`
        authHeader: providerType.startsWith("minimax-portal") ? true : void 0,
        // OAuth placeholder — tells Gateway to resolve credentials
        // from auth-profiles.json (type: 'oauth') instead of a static API key.
        apiKeyEnv: tokenProviderId === "minimax-portal" ? "minimax-oauth" : "qwen-oauth"
      });
    } catch (err) {
      logger.warn(`[DeviceOAuth] Failed to configure openclaw models:`, err);
    }
    const existing = await getProvider(providerType);
    const nameMap = {
      "minimax-portal": "MiniMax (Global)",
      "minimax-portal-cn": "MiniMax (CN)",
      "qwen-portal": "Qwen"
    };
    const providerConfig = {
      id: providerType,
      name: nameMap[providerType] || providerType,
      type: providerType,
      enabled: existing?.enabled ?? true,
      baseUrl,
      // Save the dynamically resolved URL (Global vs CN)
      model: existing?.model || getProviderDefaultModel(providerType),
      createdAt: existing?.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await saveProvider(providerConfig);
    this.emit("oauth:success", providerType);
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("oauth:success", { provider: providerType, success: true });
    }
  }
  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────
  /**
   * Parse user_code and verification_uri from the note message sent by
   * the OpenClaw extension's loginXxxPortalOAuth function.
   *
   * Note format (minimax-portal-auth/oauth.ts):
   *   "Open https://platform.minimax.io/oauth-authorize?user_code=dyMj_wOhpK&client=... to approve access.\n"
   *   "If prompted, enter the code dyMj_wOhpK.\n"
   *   ...
   *
   * user_code format: mixed-case alphanumeric with underscore, e.g. "dyMj_wOhpK"
   */
  parseNote(message) {
    const urlMatch = message.match(/Open\s+(https?:\/\/\S+?)\s+to/i);
    const verificationUri = urlMatch?.[1];
    let userCode;
    if (verificationUri) {
      try {
        const parsed = new URL(verificationUri);
        const qp = parsed.searchParams.get("user_code");
        if (qp) userCode = qp;
      } catch {
      }
    }
    if (!userCode) {
      const codeMatch = message.match(/enter.*?code\s+([A-Za-z0-9][A-Za-z0-9_-]{3,})/i);
      if (codeMatch?.[1]) userCode = codeMatch[1].replace(/\.$/, "");
    }
    return { verificationUri, userCode };
  }
  emitCode(data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("oauth:code", data);
    }
  }
  emitError(message) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("oauth:error", { message });
    }
  }
}
const deviceOAuthManager = new DeviceOAuthManager();
async function applyProxySettings(partialSettings) {
  const settings = partialSettings ?? await getAllSettings();
  const config = buildElectronProxyConfig(settings);
  await electron.session.defaultSession.setProxy(config);
  try {
    await electron.session.defaultSession.closeAllConnections();
  } catch (error2) {
    logger.debug("Failed to close existing connections after proxy update:", error2);
  }
  logger.info(
    `Applied Electron proxy (${config.mode}${config.proxyRules ? `, server=${config.proxyRules}` : ""}${config.proxyBypassRules ? `, bypass=${config.proxyBypassRules}` : ""})`
  );
}
function parseUsageEntriesFromJsonl(content, context, limit) {
  const entries = [];
  const lines = content.split(/\r?\n/).filter(Boolean);
  const maxEntries = typeof limit === "number" && Number.isFinite(limit) ? Math.max(Math.floor(limit), 0) : Number.POSITIVE_INFINITY;
  for (let i = lines.length - 1; i >= 0 && entries.length < maxEntries; i -= 1) {
    let parsed;
    try {
      parsed = JSON.parse(lines[i]);
    } catch {
      continue;
    }
    const message = parsed.message;
    if (!message || message.role !== "assistant" || !message.usage || !parsed.timestamp) {
      continue;
    }
    const usage = message.usage;
    const inputTokens = usage.input ?? usage.promptTokens ?? 0;
    const outputTokens = usage.output ?? usage.completionTokens ?? 0;
    const cacheReadTokens = usage.cacheRead ?? 0;
    const cacheWriteTokens = usage.cacheWrite ?? 0;
    const totalTokens = usage.total ?? usage.totalTokens ?? inputTokens + outputTokens + cacheReadTokens + cacheWriteTokens;
    if (totalTokens <= 0 && !usage.cost?.total) {
      continue;
    }
    entries.push({
      timestamp: parsed.timestamp,
      sessionId: context.sessionId,
      agentId: context.agentId,
      model: message.model ?? message.modelRef,
      provider: message.provider,
      inputTokens,
      outputTokens,
      cacheReadTokens,
      cacheWriteTokens,
      totalTokens,
      costUsd: usage.cost?.total
    });
  }
  return entries;
}
async function listRecentSessionFiles() {
  const openclawDir = getOpenClawConfigDir();
  const agentsDir = path.join(openclawDir, "agents");
  try {
    const agentEntries = await promises.readdir(agentsDir);
    const files = [];
    for (const agentId of agentEntries) {
      const sessionsDir = path.join(agentsDir, agentId, "sessions");
      try {
        const sessionEntries = await promises.readdir(sessionsDir);
        for (const fileName of sessionEntries) {
          if (!fileName.endsWith(".jsonl") || fileName.includes(".deleted.")) continue;
          const filePath = path.join(sessionsDir, fileName);
          try {
            const fileStat = await promises.stat(filePath);
            files.push({
              filePath,
              sessionId: fileName.replace(/\.jsonl$/, ""),
              agentId,
              mtimeMs: fileStat.mtimeMs
            });
          } catch {
            continue;
          }
        }
      } catch {
        continue;
      }
    }
    files.sort((a, b) => b.mtimeMs - a.mtimeMs);
    return files;
  } catch {
    return [];
  }
}
async function getRecentTokenUsageHistory(limit) {
  const files = await listRecentSessionFiles();
  const results = [];
  const maxEntries = typeof limit === "number" && Number.isFinite(limit) ? Math.max(Math.floor(limit), 0) : Number.POSITIVE_INFINITY;
  for (const file of files) {
    if (results.length >= maxEntries) break;
    try {
      const content = await promises.readFile(file.filePath, "utf8");
      const entries = parseUsageEntriesFromJsonl(content, {
        sessionId: file.sessionId,
        agentId: file.agentId
      }, Number.isFinite(maxEntries) ? maxEntries - results.length : void 0);
      results.push(...entries);
    } catch (error2) {
      logger.debug(`Failed to read token usage transcript ${file.filePath}:`, error2);
    }
  }
  results.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  return Number.isFinite(maxEntries) ? results.slice(0, maxEntries) : results;
}
function getOpenClawProviderKey(type, providerId) {
  if (type === "custom" || type === "ollama") {
    const suffix = providerId.replace(/-/g, "").slice(0, 8);
    return `${type}-${suffix}`;
  }
  if (type === "minimax-portal-cn") {
    return "minimax-portal";
  }
  return type;
}
function getProviderModelRef(config) {
  const providerKey = getOpenClawProviderKey(config.type, config.id);
  if (config.model) {
    return config.model.startsWith(`${providerKey}/`) ? config.model : `${providerKey}/${config.model}`;
  }
  return getProviderDefaultModel(config.type);
}
async function getProviderFallbackModelRefs(config) {
  const allProviders = await getAllProviders();
  const providerMap = new Map(allProviders.map((provider) => [provider.id, provider]));
  const seen = /* @__PURE__ */ new Set();
  const results = [];
  const providerKey = getOpenClawProviderKey(config.type, config.id);
  for (const fallbackModel of config.fallbackModels ?? []) {
    const normalizedModel = fallbackModel.trim();
    if (!normalizedModel) continue;
    const modelRef = normalizedModel.startsWith(`${providerKey}/`) ? normalizedModel : `${providerKey}/${normalizedModel}`;
    if (seen.has(modelRef)) continue;
    seen.add(modelRef);
    results.push(modelRef);
  }
  for (const fallbackId of config.fallbackProviderIds ?? []) {
    if (!fallbackId || fallbackId === config.id) continue;
    const fallbackProvider = providerMap.get(fallbackId);
    if (!fallbackProvider) continue;
    const modelRef = getProviderModelRef(fallbackProvider);
    if (!modelRef || seen.has(modelRef)) continue;
    seen.add(modelRef);
    results.push(modelRef);
  }
  return results;
}
function registerIpcHandlers(gatewayManager2, clawHubService2, mainWindow) {
  registerGatewayHandlers(gatewayManager2, mainWindow);
  registerClawHubHandlers(clawHubService2);
  registerOpenClawHandlers();
  registerProviderHandlers(gatewayManager2);
  registerShellHandlers();
  registerDialogHandlers();
  registerSessionHandlers();
  registerAppHandlers();
  registerSettingsHandlers(gatewayManager2);
  registerUvHandlers();
  registerLogHandlers();
  registerUsageHandlers();
  registerSkillConfigHandlers();
  registerCronHandlers(gatewayManager2);
  registerWindowHandlers(mainWindow);
  registerWhatsAppHandlers(mainWindow);
  registerDeviceOAuthHandlers(mainWindow);
  registerFileHandlers();
}
function registerSkillConfigHandlers() {
  electron.ipcMain.handle("skill:updateConfig", async (_, params) => {
    return await updateSkillConfig(params.skillKey, {
      apiKey: params.apiKey,
      env: params.env
    });
  });
  electron.ipcMain.handle("skill:getConfig", async (_, skillKey) => {
    return await getSkillConfig(skillKey);
  });
  electron.ipcMain.handle("skill:getAllConfigs", async () => {
    return await getAllSkillConfigs();
  });
}
function transformCronJob(job) {
  const message = job.payload?.message || job.payload?.text || "";
  const channelType = job.delivery?.channel;
  const target = channelType ? { channelType, channelId: channelType, channelName: channelType } : void 0;
  const lastRun = job.state?.lastRunAtMs ? {
    time: new Date(job.state.lastRunAtMs).toISOString(),
    success: job.state.lastStatus === "ok",
    error: job.state.lastError,
    duration: job.state.lastDurationMs
  } : void 0;
  const nextRun = job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs).toISOString() : void 0;
  return {
    id: job.id,
    name: job.name,
    message,
    schedule: job.schedule,
    // Pass the object through; frontend parseCronSchedule handles it
    target,
    enabled: job.enabled,
    createdAt: new Date(job.createdAtMs).toISOString(),
    updatedAt: new Date(job.updatedAtMs).toISOString(),
    lastRun,
    nextRun
  };
}
function registerCronHandlers(gatewayManager2) {
  electron.ipcMain.handle("cron:list", async () => {
    try {
      const result = await gatewayManager2.rpc("cron.list", { includeDisabled: true });
      const data = result;
      const jobs = data?.jobs ?? [];
      for (const job of jobs) {
        const isIsolatedAgent = (job.sessionTarget === "isolated" || !job.sessionTarget) && job.payload?.kind === "agentTurn";
        const needsRepair = isIsolatedAgent && job.delivery?.mode === "announce" && !job.delivery?.channel;
        if (needsRepair) {
          try {
            await gatewayManager2.rpc("cron.update", {
              id: job.id,
              patch: { delivery: { mode: "none" } }
            });
            job.delivery = { mode: "none" };
            if (job.state?.lastError?.includes("Channel is required")) {
              job.state.lastError = void 0;
              job.state.lastStatus = "ok";
            }
          } catch (e) {
            console.warn(`Failed to auto-repair cron job ${job.id}:`, e);
          }
        }
      }
      return jobs.map(transformCronJob);
    } catch (error2) {
      console.error("Failed to list cron jobs:", error2);
      throw error2;
    }
  });
  electron.ipcMain.handle("cron:create", async (_, input) => {
    try {
      const gatewayInput = {
        name: input.name,
        schedule: { kind: "cron", expr: input.schedule },
        payload: { kind: "agentTurn", message: input.message },
        enabled: input.enabled ?? true,
        wakeMode: "next-heartbeat",
        sessionTarget: "isolated",
        // UI-created jobs deliver results via ClawX WebSocket chat events,
        // not external messaging channels.  Setting mode='none' prevents
        // the Gateway from attempting channel delivery (which would fail
        // with "Channel is required" when no channels are configured).
        delivery: { mode: "none" }
      };
      const result = await gatewayManager2.rpc("cron.add", gatewayInput);
      if (result && typeof result === "object") {
        return transformCronJob(result);
      }
      return result;
    } catch (error2) {
      console.error("Failed to create cron job:", error2);
      throw error2;
    }
  });
  electron.ipcMain.handle("cron:update", async (_, id, input) => {
    try {
      const patch = { ...input };
      if (typeof patch.schedule === "string") {
        patch.schedule = { kind: "cron", expr: patch.schedule };
      }
      if (typeof patch.message === "string") {
        patch.payload = { kind: "agentTurn", message: patch.message };
        delete patch.message;
      }
      const result = await gatewayManager2.rpc("cron.update", { id, patch });
      return result;
    } catch (error2) {
      console.error("Failed to update cron job:", error2);
      throw error2;
    }
  });
  electron.ipcMain.handle("cron:delete", async (_, id) => {
    try {
      const result = await gatewayManager2.rpc("cron.remove", { id });
      return result;
    } catch (error2) {
      console.error("Failed to delete cron job:", error2);
      throw error2;
    }
  });
  electron.ipcMain.handle("cron:toggle", async (_, id, enabled) => {
    try {
      const result = await gatewayManager2.rpc("cron.update", { id, patch: { enabled } });
      return result;
    } catch (error2) {
      console.error("Failed to toggle cron job:", error2);
      throw error2;
    }
  });
  electron.ipcMain.handle("cron:trigger", async (_, id) => {
    try {
      const result = await gatewayManager2.rpc("cron.run", { id, mode: "force" });
      return result;
    } catch (error2) {
      console.error("Failed to trigger cron job:", error2);
      throw error2;
    }
  });
}
function registerUvHandlers() {
  electron.ipcMain.handle("uv:check", async () => {
    return await checkUvInstalled();
  });
  electron.ipcMain.handle("uv:install-all", async () => {
    try {
      const isInstalled = await checkUvInstalled();
      if (!isInstalled) {
        await installUv();
      }
      await setupManagedPython();
      return { success: true };
    } catch (error2) {
      console.error("Failed to setup uv/python:", error2);
      return { success: false, error: String(error2) };
    }
  });
}
function registerLogHandlers() {
  electron.ipcMain.handle("log:getRecent", async (_, count) => {
    return logger.getRecentLogs(count);
  });
  electron.ipcMain.handle("log:readFile", async (_, tailLines) => {
    return await logger.readLogFile(tailLines);
  });
  electron.ipcMain.handle("log:getFilePath", async () => {
    return logger.getLogFilePath();
  });
  electron.ipcMain.handle("log:getDir", async () => {
    return logger.getLogDir();
  });
  electron.ipcMain.handle("log:listFiles", async () => {
    return await logger.listLogFiles();
  });
}
function registerGatewayHandlers(gatewayManager2, mainWindow) {
  electron.ipcMain.handle("gateway:status", () => {
    return gatewayManager2.getStatus();
  });
  electron.ipcMain.handle("gateway:isConnected", () => {
    return gatewayManager2.isConnected();
  });
  electron.ipcMain.handle("gateway:start", async () => {
    try {
      await gatewayManager2.start();
      return { success: true };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("gateway:stop", async () => {
    try {
      await gatewayManager2.stop();
      return { success: true };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("gateway:restart", async () => {
    try {
      await gatewayManager2.restart();
      return { success: true };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("gateway:rpc", async (_, method, params, timeoutMs) => {
    try {
      const result = await gatewayManager2.rpc(method, params, timeoutMs);
      return { success: true, result };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  const VISION_MIME_TYPES = /* @__PURE__ */ new Set([
    "image/png",
    "image/jpeg",
    "image/bmp",
    "image/webp"
  ]);
  electron.ipcMain.handle("chat:sendWithMedia", async (_, params) => {
    try {
      let message = params.message;
      const imageAttachments = [];
      const fileReferences = [];
      if (params.media && params.media.length > 0) {
        const fsP = await import("fs/promises");
        for (const m of params.media) {
          const exists = await fsP.access(m.filePath).then(() => true, () => false);
          logger.info(`[chat:sendWithMedia] Processing file: ${m.fileName} (${m.mimeType}), path: ${m.filePath}, exists: ${exists}, isVision: ${VISION_MIME_TYPES.has(m.mimeType)}`);
          fileReferences.push(
            `[media attached: ${m.filePath} (${m.mimeType}) | ${m.filePath}]`
          );
          if (VISION_MIME_TYPES.has(m.mimeType)) {
            const fileBuffer = await fsP.readFile(m.filePath);
            const base64Data = fileBuffer.toString("base64");
            logger.info(`[chat:sendWithMedia] Read ${fileBuffer.length} bytes, base64 length: ${base64Data.length}`);
            imageAttachments.push({
              content: base64Data,
              mimeType: m.mimeType,
              fileName: m.fileName
            });
          }
        }
      }
      if (fileReferences.length > 0) {
        const refs = fileReferences.join("\n");
        message = message ? `${message}

${refs}` : refs;
      }
      const rpcParams = {
        sessionKey: params.sessionKey,
        message,
        deliver: params.deliver ?? false,
        idempotencyKey: params.idempotencyKey
      };
      if (imageAttachments.length > 0) {
        rpcParams.attachments = imageAttachments;
      }
      logger.info(`[chat:sendWithMedia] Sending: message="${message.substring(0, 100)}", attachments=${imageAttachments.length}, fileRefs=${fileReferences.length}`);
      const timeoutMs = 12e4;
      const result = await gatewayManager2.rpc("chat.send", rpcParams, timeoutMs);
      logger.info(`[chat:sendWithMedia] RPC result: ${JSON.stringify(result)}`);
      return { success: true, result };
    } catch (error2) {
      logger.error(`[chat:sendWithMedia] Error: ${String(error2)}`);
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("gateway:getControlUiUrl", async () => {
    try {
      const status = gatewayManager2.getStatus();
      const token = await getSetting("gatewayToken");
      const port = status.port || 18789;
      const url = `http://127.0.0.1:${port}/?token=${encodeURIComponent(token)}`;
      return { success: true, url, port, token };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("gateway:health", async () => {
    try {
      const health = await gatewayManager2.checkHealth();
      return { success: true, ...health };
    } catch (error2) {
      return { success: false, ok: false, error: String(error2) };
    }
  });
  gatewayManager2.on("status", (status) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send("gateway:status-changed", status);
    }
  });
  gatewayManager2.on("message", (message) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send("gateway:message", message);
    }
  });
  gatewayManager2.on("notification", (notification) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send("gateway:notification", notification);
    }
  });
  gatewayManager2.on("channel:status", (data) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send("gateway:channel-status", data);
    }
  });
  gatewayManager2.on("chat:message", (data) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send("gateway:chat-message", data);
    }
  });
  gatewayManager2.on("exit", (code) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send("gateway:exit", code);
    }
  });
  gatewayManager2.on("error", (error2) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send("gateway:error", error2.message);
    }
  });
}
function registerOpenClawHandlers() {
  async function ensureDingTalkPluginInstalled() {
    const targetDir = node_path.join(node_os.homedir(), ".openclaw", "extensions", "dingtalk");
    const targetManifest = node_path.join(targetDir, "openclaw.plugin.json");
    if (node_fs.existsSync(targetManifest)) {
      logger.info("DingTalk plugin already installed from local mirror");
      return { installed: true };
    }
    const candidateSources = electron.app.isPackaged ? [
      node_path.join(process.resourcesPath, "openclaw-plugins", "dingtalk"),
      node_path.join(process.resourcesPath, "app.asar.unpacked", "build", "openclaw-plugins", "dingtalk"),
      node_path.join(process.resourcesPath, "app.asar.unpacked", "openclaw-plugins", "dingtalk")
    ] : [
      node_path.join(electron.app.getAppPath(), "build", "openclaw-plugins", "dingtalk"),
      node_path.join(process.cwd(), "build", "openclaw-plugins", "dingtalk"),
      node_path.join(__dirname, "../../build/openclaw-plugins/dingtalk")
    ];
    const sourceDir = candidateSources.find((dir) => node_fs.existsSync(node_path.join(dir, "openclaw.plugin.json")));
    if (!sourceDir) {
      logger.warn("Bundled DingTalk plugin mirror not found in candidate paths", { candidateSources });
      return {
        installed: false,
        warning: `Bundled DingTalk plugin mirror not found. Checked: ${candidateSources.join(" | ")}`
      };
    }
    try {
      node_fs.mkdirSync(node_path.join(node_os.homedir(), ".openclaw", "extensions"), { recursive: true });
      node_fs.rmSync(targetDir, { recursive: true, force: true });
      node_fs.cpSync(sourceDir, targetDir, { recursive: true, dereference: true });
      if (!node_fs.existsSync(targetManifest)) {
        return { installed: false, warning: "Failed to install DingTalk plugin mirror (manifest missing)." };
      }
      logger.info(`Installed DingTalk plugin from bundled mirror: ${sourceDir}`);
      return { installed: true };
    } catch (error2) {
      logger.warn("Failed to install DingTalk plugin from bundled mirror:", error2);
      return {
        installed: false,
        warning: "Failed to install bundled DingTalk plugin mirror"
      };
    }
  }
  electron.ipcMain.handle("openclaw:status", () => {
    const status = getOpenClawStatus();
    logger.info("openclaw:status IPC called", status);
    return status;
  });
  electron.ipcMain.handle("openclaw:isReady", () => {
    const status = getOpenClawStatus();
    return status.packageExists;
  });
  electron.ipcMain.handle("openclaw:getDir", () => {
    return getOpenClawDir();
  });
  electron.ipcMain.handle("openclaw:getConfigDir", () => {
    return getOpenClawConfigDir();
  });
  electron.ipcMain.handle("openclaw:getSkillsDir", () => {
    const dir = getOpenClawSkillsDir();
    ensureDir$2(dir);
    return dir;
  });
  electron.ipcMain.handle("openclaw:getCliCommand", () => {
    try {
      const status = getOpenClawStatus();
      if (!status.packageExists) {
        return { success: false, error: `OpenClaw package not found at: ${status.dir}` };
      }
      if (!node_fs.existsSync(status.entryPath)) {
        return { success: false, error: `OpenClaw entry script not found at: ${status.entryPath}` };
      }
      return { success: true, command: getOpenClawCliCommand() };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("channel:saveConfig", async (_, channelType, config) => {
    try {
      logger.info("channel:saveConfig", { channelType, keys: Object.keys(config || {}) });
      if (channelType === "dingtalk") {
        const installResult = await ensureDingTalkPluginInstalled();
        if (!installResult.installed) {
          return {
            success: false,
            error: installResult.warning || "DingTalk plugin install failed"
          };
        }
        await saveChannelConfig(channelType, config);
        logger.info(
          `Skipping app-forced Gateway restart after channel:saveConfig (${channelType}); Gateway handles channel config reload/restart internally`
        );
        return {
          success: true,
          pluginInstalled: installResult.installed,
          warning: installResult.warning
        };
      }
      await saveChannelConfig(channelType, config);
      logger.info(
        `Skipping app-forced Gateway restart after channel:saveConfig (${channelType}); waiting for Gateway internal channel reload`
      );
      return { success: true };
    } catch (error2) {
      console.error("Failed to save channel config:", error2);
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("channel:getConfig", async (_, channelType) => {
    try {
      const config = await getChannelConfig(channelType);
      return { success: true, config };
    } catch (error2) {
      console.error("Failed to get channel config:", error2);
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("channel:getFormValues", async (_, channelType) => {
    try {
      const values = await getChannelFormValues(channelType);
      return { success: true, values };
    } catch (error2) {
      console.error("Failed to get channel form values:", error2);
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("channel:deleteConfig", async (_, channelType) => {
    try {
      await deleteChannelConfig(channelType);
      return { success: true };
    } catch (error2) {
      console.error("Failed to delete channel config:", error2);
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("channel:listConfigured", async () => {
    try {
      const channels = await listConfiguredChannels();
      return { success: true, channels };
    } catch (error2) {
      console.error("Failed to list channels:", error2);
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("channel:setEnabled", async (_, channelType, enabled) => {
    try {
      await setChannelEnabled(channelType, enabled);
      return { success: true };
    } catch (error2) {
      console.error("Failed to set channel enabled:", error2);
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("channel:validate", async (_, channelType) => {
    try {
      const result = await validateChannelConfig(channelType);
      return { success: true, ...result };
    } catch (error2) {
      console.error("Failed to validate channel:", error2);
      return { success: false, valid: false, errors: [String(error2)], warnings: [] };
    }
  });
  electron.ipcMain.handle("channel:validateCredentials", async (_, channelType, config) => {
    try {
      const result = await validateChannelCredentials(channelType, config);
      return { success: true, ...result };
    } catch (error2) {
      console.error("Failed to validate channel credentials:", error2);
      return { success: false, valid: false, errors: [String(error2)], warnings: [] };
    }
  });
}
function registerWhatsAppHandlers(mainWindow) {
  electron.ipcMain.handle("channel:requestWhatsAppQr", async (_, accountId) => {
    try {
      logger.info("channel:requestWhatsAppQr", { accountId });
      await whatsAppLoginManager.start(accountId);
      return { success: true };
    } catch (error2) {
      logger.error("channel:requestWhatsAppQr failed", error2);
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("channel:cancelWhatsAppQr", async () => {
    try {
      await whatsAppLoginManager.stop();
      return { success: true };
    } catch (error2) {
      logger.error("channel:cancelWhatsAppQr failed", error2);
      return { success: false, error: String(error2) };
    }
  });
  whatsAppLoginManager.on("qr", (data) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send("channel:whatsapp-qr", data);
    }
  });
  whatsAppLoginManager.on("success", (data) => {
    if (!mainWindow.isDestroyed()) {
      logger.info("whatsapp:login-success", data);
      mainWindow.webContents.send("channel:whatsapp-success", data);
    }
  });
  whatsAppLoginManager.on("error", (error2) => {
    if (!mainWindow.isDestroyed()) {
      logger.error("whatsapp:login-error", error2);
      mainWindow.webContents.send("channel:whatsapp-error", error2);
    }
  });
}
function registerDeviceOAuthHandlers(mainWindow) {
  deviceOAuthManager.setWindow(mainWindow);
  electron.ipcMain.handle("provider:requestOAuth", async (_, provider, region) => {
    try {
      logger.info(`provider:requestOAuth for ${provider}`);
      await deviceOAuthManager.startFlow(provider, region);
      return { success: true };
    } catch (error2) {
      logger.error("provider:requestOAuth failed", error2);
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("provider:cancelOAuth", async () => {
    try {
      await deviceOAuthManager.stopFlow();
      return { success: true };
    } catch (error2) {
      logger.error("provider:cancelOAuth failed", error2);
      return { success: false, error: String(error2) };
    }
  });
}
function registerProviderHandlers(gatewayManager2) {
  deviceOAuthManager.on("oauth:success", (providerType) => {
    logger.info(`[IPC] Scheduling Gateway restart after ${providerType} OAuth success...`);
    gatewayManager2.debouncedRestart(8e3);
  });
  electron.ipcMain.handle("provider:list", async () => {
    return await getAllProvidersWithKeyInfo();
  });
  electron.ipcMain.handle("provider:get", async (_, providerId) => {
    return await getProvider(providerId);
  });
  electron.ipcMain.handle("provider:save", async (_, config, apiKey) => {
    try {
      await saveProvider(config);
      const ock = getOpenClawProviderKey(config.type, config.id);
      if (apiKey !== void 0) {
        const trimmedKey = apiKey.trim();
        if (trimmedKey) {
          await storeApiKey(config.id, trimmedKey);
          try {
            await saveProviderKeyToOpenClaw(ock, trimmedKey);
          } catch (err) {
            console.warn("Failed to save key to OpenClaw auth-profiles:", err);
          }
        }
      }
      try {
        const meta = getProviderConfig(config.type);
        const api = config.type === "custom" || config.type === "ollama" ? "openai-completions" : meta?.api;
        if (api) {
          await syncProviderConfigToOpenClaw(ock, config.model, {
            baseUrl: config.baseUrl || meta?.baseUrl,
            api,
            apiKeyEnv: meta?.apiKeyEnv,
            headers: meta?.headers
          });
          if (config.type === "custom" || config.type === "ollama") {
            const resolvedKey = apiKey !== void 0 ? apiKey.trim() || null : await getApiKey(config.id);
            if (resolvedKey && config.baseUrl) {
              const modelId = config.model;
              await updateAgentModelProvider(ock, {
                baseUrl: config.baseUrl,
                api: "openai-completions",
                models: modelId ? [{ id: modelId, name: modelId }] : [],
                apiKey: resolvedKey
              });
            }
          }
          logger.info(`Scheduling Gateway restart after saving provider "${ock}" config`);
          gatewayManager2.debouncedRestart();
        }
      } catch (err) {
        console.warn("Failed to sync openclaw provider config:", err);
      }
      return { success: true };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("provider:delete", async (_, providerId) => {
    try {
      const existing = await getProvider(providerId);
      await deleteProvider(providerId);
      if (existing?.type) {
        try {
          const ock = getOpenClawProviderKey(existing.type, providerId);
          await removeProviderFromOpenClaw(ock);
          logger.info(`Scheduling Gateway restart after deleting provider "${ock}"`);
          gatewayManager2.debouncedRestart();
        } catch (err) {
          console.warn("Failed to completely remove provider from OpenClaw:", err);
        }
      }
      return { success: true };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("provider:setApiKey", async (_, providerId, apiKey) => {
    try {
      await storeApiKey(providerId, apiKey);
      const provider = await getProvider(providerId);
      const providerType = provider?.type || providerId;
      const ock = getOpenClawProviderKey(providerType, providerId);
      try {
        await saveProviderKeyToOpenClaw(ock, apiKey);
      } catch (err) {
        console.warn("Failed to save key to OpenClaw auth-profiles:", err);
      }
      return { success: true };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle(
    "provider:updateWithKey",
    async (_, providerId, updates, apiKey) => {
      const existing = await getProvider(providerId);
      if (!existing) {
        return { success: false, error: "Provider not found" };
      }
      const previousKey = await getApiKey(providerId);
      const previousOck = getOpenClawProviderKey(existing.type, providerId);
      try {
        const nextConfig = {
          ...existing,
          ...updates,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        const ock = getOpenClawProviderKey(nextConfig.type, providerId);
        await saveProvider(nextConfig);
        if (apiKey !== void 0) {
          const trimmedKey = apiKey.trim();
          if (trimmedKey) {
            await storeApiKey(providerId, trimmedKey);
            await saveProviderKeyToOpenClaw(ock, trimmedKey);
          } else {
            await deleteApiKey(providerId);
            await removeProviderFromOpenClaw(ock);
          }
        }
        try {
          const fallbackModels = await getProviderFallbackModelRefs(nextConfig);
          const meta = getProviderConfig(nextConfig.type);
          const api = nextConfig.type === "custom" || nextConfig.type === "ollama" ? "openai-completions" : meta?.api;
          if (api) {
            await syncProviderConfigToOpenClaw(ock, nextConfig.model, {
              baseUrl: nextConfig.baseUrl || meta?.baseUrl,
              api,
              apiKeyEnv: meta?.apiKeyEnv,
              headers: meta?.headers
            });
            if (nextConfig.type === "custom" || nextConfig.type === "ollama") {
              const resolvedKey = apiKey !== void 0 ? apiKey.trim() || null : await getApiKey(providerId);
              if (resolvedKey && nextConfig.baseUrl) {
                const modelId = nextConfig.model;
                await updateAgentModelProvider(ock, {
                  baseUrl: nextConfig.baseUrl,
                  api: "openai-completions",
                  models: modelId ? [{ id: modelId, name: modelId }] : [],
                  apiKey: resolvedKey
                });
              }
            }
          }
          const defaultProviderId = await getDefaultProvider();
          if (defaultProviderId === providerId) {
            const modelOverride = nextConfig.model ? `${ock}/${nextConfig.model}` : void 0;
            if (nextConfig.type !== "custom" && nextConfig.type !== "ollama") {
              await setOpenClawDefaultModel(ock, modelOverride, fallbackModels);
            } else {
              await setOpenClawDefaultModelWithOverride(ock, modelOverride, {
                baseUrl: nextConfig.baseUrl,
                api: "openai-completions"
              }, fallbackModels);
            }
          }
          logger.info(`Scheduling Gateway restart after updating provider "${ock}" config`);
          gatewayManager2.debouncedRestart();
        } catch (err) {
          console.warn("Failed to sync openclaw config after provider update:", err);
        }
        return { success: true };
      } catch (error2) {
        try {
          await saveProvider(existing);
          if (previousKey) {
            await storeApiKey(providerId, previousKey);
            await saveProviderKeyToOpenClaw(previousOck, previousKey);
          } else {
            await deleteApiKey(providerId);
            await removeProviderFromOpenClaw(previousOck);
          }
        } catch (rollbackError) {
          console.warn("Failed to rollback provider updateWithKey:", rollbackError);
        }
        return { success: false, error: String(error2) };
      }
    }
  );
  electron.ipcMain.handle("provider:deleteApiKey", async (_, providerId) => {
    try {
      await deleteApiKey(providerId);
      const provider = await getProvider(providerId);
      const providerType = provider?.type || providerId;
      const ock = getOpenClawProviderKey(providerType, providerId);
      try {
        if (ock) {
          await removeProviderFromOpenClaw(ock);
        }
      } catch (err) {
        console.warn("Failed to completely remove provider from OpenClaw:", err);
      }
      return { success: true };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("provider:hasApiKey", async (_, providerId) => {
    return await hasApiKey(providerId);
  });
  electron.ipcMain.handle("provider:getApiKey", async (_, providerId) => {
    return await getApiKey(providerId);
  });
  electron.ipcMain.handle("provider:setDefault", async (_, providerId) => {
    try {
      await setDefaultProvider(providerId);
      const provider = await getProvider(providerId);
      if (provider) {
        try {
          const ock = getOpenClawProviderKey(provider.type, providerId);
          const providerKey = await getApiKey(providerId);
          const fallbackModels = await getProviderFallbackModelRefs(provider);
          const OAUTH_PROVIDER_TYPES = ["qwen-portal", "minimax-portal", "minimax-portal-cn"];
          const isOAuthProvider = OAUTH_PROVIDER_TYPES.includes(provider.type) && !providerKey;
          if (!isOAuthProvider) {
            const modelOverride = provider.model ? provider.model.startsWith(`${ock}/`) ? provider.model : `${ock}/${provider.model}` : void 0;
            if (provider.type === "custom" || provider.type === "ollama") {
              await setOpenClawDefaultModelWithOverride(ock, modelOverride, {
                baseUrl: provider.baseUrl,
                api: "openai-completions"
              }, fallbackModels);
            } else {
              await setOpenClawDefaultModel(ock, modelOverride, fallbackModels);
            }
            if (providerKey) {
              await saveProviderKeyToOpenClaw(ock, providerKey);
            }
          } else {
            const defaultBaseUrl = provider.type === "minimax-portal" ? "https://api.minimax.io/anthropic" : provider.type === "minimax-portal-cn" ? "https://api.minimaxi.com/anthropic" : "https://portal.qwen.ai/v1";
            const api = provider.type === "minimax-portal" || provider.type === "minimax-portal-cn" ? "anthropic-messages" : "openai-completions";
            let baseUrl = provider.baseUrl || defaultBaseUrl;
            if ((provider.type === "minimax-portal" || provider.type === "minimax-portal-cn") && baseUrl) {
              baseUrl = baseUrl.replace(/\/v1$/, "").replace(/\/anthropic$/, "").replace(/\/$/, "") + "/anthropic";
            }
            const targetProviderKey = provider.type === "minimax-portal" || provider.type === "minimax-portal-cn" ? "minimax-portal" : provider.type;
            await setOpenClawDefaultModelWithOverride(targetProviderKey, getProviderModelRef(provider), {
              baseUrl,
              api,
              authHeader: targetProviderKey === "minimax-portal" ? true : void 0,
              // Relies on OpenClaw Gateway native auth-profiles syncing
              apiKeyEnv: targetProviderKey === "minimax-portal" ? "minimax-oauth" : "qwen-oauth"
            }, fallbackModels);
            logger.info(`Configured openclaw.json for OAuth provider "${provider.type}"`);
            try {
              const defaultModelId = provider.model?.split("/").pop();
              await updateAgentModelProvider(targetProviderKey, {
                baseUrl,
                api,
                authHeader: targetProviderKey === "minimax-portal" ? true : void 0,
                apiKey: targetProviderKey === "minimax-portal" ? "minimax-oauth" : "qwen-oauth",
                models: defaultModelId ? [{ id: defaultModelId, name: defaultModelId }] : []
              });
            } catch (err) {
              logger.warn(`Failed to update models.json for OAuth provider "${targetProviderKey}":`, err);
            }
          }
          if ((provider.type === "custom" || provider.type === "ollama") && providerKey && provider.baseUrl) {
            const modelId = provider.model;
            await updateAgentModelProvider(ock, {
              baseUrl: provider.baseUrl,
              api: "openai-completions",
              models: modelId ? [{ id: modelId, name: modelId }] : [],
              apiKey: providerKey
            });
          }
          if (gatewayManager2.getStatus().state !== "stopped") {
            logger.info(`Scheduling Gateway restart after provider switch to "${ock}"`);
            gatewayManager2.debouncedRestart();
          }
        } catch (err) {
          console.warn("Failed to set OpenClaw default model:", err);
        }
      }
      return { success: true };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("provider:getDefault", async () => {
    return await getDefaultProvider();
  });
  electron.ipcMain.handle(
    "provider:validateKey",
    async (_, providerId, apiKey, options) => {
      try {
        const provider = await getProvider(providerId);
        const providerType = provider?.type || providerId;
        const registryBaseUrl = getProviderConfig(providerType)?.baseUrl;
        const resolvedBaseUrl = options?.baseUrl || provider?.baseUrl || registryBaseUrl;
        console.log(`[clawx-validate] validating provider type: ${providerType}`);
        return await validateApiKeyWithProvider(providerType, apiKey, { baseUrl: resolvedBaseUrl });
      } catch (error2) {
        console.error("Validation error:", error2);
        return { valid: false, error: String(error2) };
      }
    }
  );
}
async function validateApiKeyWithProvider(providerType, apiKey, options) {
  const profile = getValidationProfile(providerType);
  if (profile === "none") {
    return { valid: true };
  }
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) {
    return { valid: false, error: "API key is required" };
  }
  try {
    switch (profile) {
      case "openai-compatible":
        return await validateOpenAiCompatibleKey(providerType, trimmedKey, options?.baseUrl);
      case "google-query-key":
        return await validateGoogleQueryKey(providerType, trimmedKey, options?.baseUrl);
      case "anthropic-header":
        return await validateAnthropicHeaderKey(providerType, trimmedKey, options?.baseUrl);
      case "openrouter":
        return await validateOpenRouterKey(providerType, trimmedKey);
      default:
        return { valid: false, error: `Unsupported validation profile for provider: ${providerType}` };
    }
  } catch (error2) {
    const errorMessage = error2 instanceof Error ? error2.message : String(error2);
    return { valid: false, error: errorMessage };
  }
}
function logValidationStatus(provider, status) {
  console.log(`[clawx-validate] ${provider} HTTP ${status}`);
}
function maskSecret(secret) {
  if (!secret) return "";
  if (secret.length <= 8) return `${secret.slice(0, 2)}***`;
  return `${secret.slice(0, 4)}***${secret.slice(-4)}`;
}
function sanitizeValidationUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const key = url.searchParams.get("key");
    if (key) url.searchParams.set("key", maskSecret(key));
    return url.toString();
  } catch {
    return rawUrl;
  }
}
function sanitizeHeaders(headers) {
  const next = { ...headers };
  if (next.Authorization?.startsWith("Bearer ")) {
    const token = next.Authorization.slice("Bearer ".length);
    next.Authorization = `Bearer ${maskSecret(token)}`;
  }
  if (next["x-api-key"]) {
    next["x-api-key"] = maskSecret(next["x-api-key"]);
  }
  return next;
}
function normalizeBaseUrl(baseUrl) {
  return baseUrl.trim().replace(/\/+$/, "");
}
function buildOpenAiModelsUrl(baseUrl) {
  return `${normalizeBaseUrl(baseUrl)}/models?limit=1`;
}
function logValidationRequest(provider, method, url, headers) {
  console.log(
    `[clawx-validate] ${provider} request ${method} ${sanitizeValidationUrl(url)} headers=${JSON.stringify(sanitizeHeaders(headers))}`
  );
}
function getValidationProfile(providerType) {
  switch (providerType) {
    case "anthropic":
      return "anthropic-header";
    case "google":
      return "google-query-key";
    case "openrouter":
      return "openrouter";
    case "ollama":
      return "none";
    default:
      return "openai-compatible";
  }
}
async function performProviderValidationRequest(providerLabel, url, headers) {
  try {
    logValidationRequest(providerLabel, "GET", url, headers);
    const response = await proxyAwareFetch(url, { headers });
    logValidationStatus(providerLabel, response.status);
    const data = await response.json().catch(() => ({}));
    return classifyAuthResponse(response.status, data);
  } catch (error2) {
    return {
      valid: false,
      error: `Connection error: ${error2 instanceof Error ? error2.message : String(error2)}`
    };
  }
}
function classifyAuthResponse(status, data) {
  if (status >= 200 && status < 300) return { valid: true };
  if (status === 429) return { valid: true };
  if (status === 401 || status === 403) return { valid: false, error: "Invalid API key" };
  const obj = data;
  const msg = obj?.error?.message || obj?.message || `API error: ${status}`;
  return { valid: false, error: msg };
}
async function validateOpenAiCompatibleKey(providerType, apiKey, baseUrl) {
  const trimmedBaseUrl = baseUrl?.trim();
  if (!trimmedBaseUrl) {
    return { valid: false, error: `Base URL is required for provider "${providerType}" validation` };
  }
  const headers = { Authorization: `Bearer ${apiKey}` };
  const modelsUrl = buildOpenAiModelsUrl(trimmedBaseUrl);
  const modelsResult = await performProviderValidationRequest(providerType, modelsUrl, headers);
  if (modelsResult.error?.includes("API error: 404")) {
    console.log(
      `[clawx-validate] ${providerType} /models returned 404, falling back to /chat/completions probe`
    );
    const base = normalizeBaseUrl(trimmedBaseUrl);
    const chatUrl = `${base}/chat/completions`;
    return await performChatCompletionsProbe(providerType, chatUrl, headers);
  }
  return modelsResult;
}
async function performChatCompletionsProbe(providerLabel, url, headers) {
  try {
    logValidationRequest(providerLabel, "POST", url, headers);
    const response = await proxyAwareFetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "validation-probe",
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 1
      })
    });
    logValidationStatus(providerLabel, response.status);
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      return { valid: false, error: "Invalid API key" };
    }
    if (response.status >= 200 && response.status < 300 || response.status === 400 || response.status === 429) {
      return { valid: true };
    }
    return classifyAuthResponse(response.status, data);
  } catch (error2) {
    return {
      valid: false,
      error: `Connection error: ${error2 instanceof Error ? error2.message : String(error2)}`
    };
  }
}
async function validateGoogleQueryKey(providerType, apiKey, baseUrl) {
  const base = normalizeBaseUrl(baseUrl || "https://generativelanguage.googleapis.com/v1beta");
  const url = `${base}/models?pageSize=1&key=${encodeURIComponent(apiKey)}`;
  return await performProviderValidationRequest(providerType, url, {});
}
async function validateAnthropicHeaderKey(providerType, apiKey, baseUrl) {
  const base = normalizeBaseUrl(baseUrl || "https://api.anthropic.com/v1");
  const url = `${base}/models?limit=1`;
  const headers = {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01"
  };
  return await performProviderValidationRequest(providerType, url, headers);
}
async function validateOpenRouterKey(providerType, apiKey) {
  const url = "https://openrouter.ai/api/v1/auth/key";
  const headers = { Authorization: `Bearer ${apiKey}` };
  return await performProviderValidationRequest(providerType, url, headers);
}
function registerShellHandlers() {
  electron.ipcMain.handle("shell:openExternal", async (_, url) => {
    await electron.shell.openExternal(url);
  });
  electron.ipcMain.handle("shell:showItemInFolder", async (_, path2) => {
    electron.shell.showItemInFolder(path2);
  });
  electron.ipcMain.handle("shell:openPath", async (_, path2) => {
    return await electron.shell.openPath(path2);
  });
}
function registerClawHubHandlers(clawHubService2) {
  electron.ipcMain.handle("clawhub:search", async (_, params) => {
    try {
      const results = await clawHubService2.search(params);
      return { success: true, results };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("clawhub:install", async (_, params) => {
    try {
      await clawHubService2.install(params);
      return { success: true };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("clawhub:uninstall", async (_, params) => {
    try {
      await clawHubService2.uninstall(params);
      return { success: true };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("clawhub:list", async () => {
    try {
      const results = await clawHubService2.listInstalled();
      return { success: true, results };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("clawhub:openSkillReadme", async (_, slug) => {
    try {
      await clawHubService2.openSkillReadme(slug);
      return { success: true };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
}
function registerDialogHandlers() {
  electron.ipcMain.handle("dialog:open", async (_, options) => {
    const result = await electron.dialog.showOpenDialog(options);
    return result;
  });
  electron.ipcMain.handle("dialog:save", async (_, options) => {
    const result = await electron.dialog.showSaveDialog(options);
    return result;
  });
  electron.ipcMain.handle("dialog:message", async (_, options) => {
    const result = await electron.dialog.showMessageBox(options);
    return result;
  });
}
function registerAppHandlers() {
  electron.ipcMain.handle("app:version", () => {
    return electron.app.getVersion();
  });
  electron.ipcMain.handle("app:name", () => {
    return electron.app.getName();
  });
  electron.ipcMain.handle("app:getPath", (_, name) => {
    return electron.app.getPath(name);
  });
  electron.ipcMain.handle("app:platform", () => {
    return process.platform;
  });
  electron.ipcMain.handle("app:quit", () => {
    electron.app.quit();
  });
  electron.ipcMain.handle("app:relaunch", () => {
    electron.app.relaunch();
    electron.app.quit();
  });
}
function registerSettingsHandlers(gatewayManager2) {
  const handleProxySettingsChange = async () => {
    const settings = await getAllSettings();
    await applyProxySettings(settings);
    if (gatewayManager2.getStatus().state === "running") {
      await gatewayManager2.restart();
    }
  };
  electron.ipcMain.handle("settings:get", async (_, key) => {
    return await getSetting(key);
  });
  electron.ipcMain.handle("settings:getAll", async () => {
    return await getAllSettings();
  });
  electron.ipcMain.handle("settings:set", async (_, key, value) => {
    await setSetting(key, value);
    if (key === "proxyEnabled" || key === "proxyServer" || key === "proxyHttpServer" || key === "proxyHttpsServer" || key === "proxyAllServer" || key === "proxyBypassRules") {
      await handleProxySettingsChange();
    }
    return { success: true };
  });
  electron.ipcMain.handle("settings:setMany", async (_, patch) => {
    const entries = Object.entries(patch);
    for (const [key, value] of entries) {
      await setSetting(key, value);
    }
    if (entries.some(
      ([key]) => key === "proxyEnabled" || key === "proxyServer" || key === "proxyHttpServer" || key === "proxyHttpsServer" || key === "proxyAllServer" || key === "proxyBypassRules"
    )) {
      await handleProxySettingsChange();
    }
    return { success: true };
  });
  electron.ipcMain.handle("settings:reset", async () => {
    await resetSettings();
    const settings = await getAllSettings();
    await handleProxySettingsChange();
    return { success: true, settings };
  });
}
function registerUsageHandlers() {
  electron.ipcMain.handle("usage:recentTokenHistory", async (_, limit) => {
    const safeLimit = typeof limit === "number" && Number.isFinite(limit) ? Math.max(Math.floor(limit), 1) : void 0;
    return await getRecentTokenUsageHistory(safeLimit);
  });
}
function registerWindowHandlers(mainWindow) {
  electron.ipcMain.handle("window:minimize", () => {
    mainWindow.minimize();
  });
  electron.ipcMain.handle("window:maximize", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  electron.ipcMain.handle("window:close", () => {
    mainWindow.close();
  });
  electron.ipcMain.handle("window:isMaximized", () => {
    return mainWindow.isMaximized();
  });
}
const EXT_MIME_MAP = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".mkv": "video/x-matroska",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".flac": "audio/flac",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".gz": "application/gzip",
  ".tar": "application/x-tar",
  ".7z": "application/x-7z-compressed",
  ".rar": "application/vnd.rar",
  ".json": "application/json",
  ".xml": "application/xml",
  ".csv": "text/csv",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".ts": "text/typescript",
  ".py": "text/x-python",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation"
};
function getMimeType(ext) {
  return EXT_MIME_MAP[ext.toLowerCase()] || "application/octet-stream";
}
function mimeToExt(mimeType) {
  for (const [ext, mime] of Object.entries(EXT_MIME_MAP)) {
    if (mime === mimeType) return ext;
  }
  return "";
}
const OUTBOUND_DIR = node_path.join(node_os.homedir(), ".openclaw", "media", "outbound");
async function generateImagePreview(filePath, mimeType) {
  try {
    const img = electron.nativeImage.createFromPath(filePath);
    if (img.isEmpty()) return null;
    const size = img.getSize();
    const maxDim = 512;
    if (size.width > maxDim || size.height > maxDim) {
      const resized = size.width >= size.height ? img.resize({ width: maxDim }) : img.resize({ height: maxDim });
      return `data:image/png;base64,${resized.toPNG().toString("base64")}`;
    }
    const { readFile: readFileAsync } = await import("fs/promises");
    const buf = await readFileAsync(filePath);
    return `data:${mimeType};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
function registerFileHandlers() {
  electron.ipcMain.handle("file:stage", async (_, filePaths) => {
    const fsP = await import("fs/promises");
    await fsP.mkdir(OUTBOUND_DIR, { recursive: true });
    const results = [];
    for (const filePath of filePaths) {
      const id = crypto$2.randomUUID();
      const ext = node_path.extname(filePath);
      const stagedPath = node_path.join(OUTBOUND_DIR, `${id}${ext}`);
      await fsP.copyFile(filePath, stagedPath);
      const s = await fsP.stat(stagedPath);
      const mimeType = getMimeType(ext);
      const fileName = node_path.basename(filePath);
      let preview = null;
      if (mimeType.startsWith("image/")) {
        preview = await generateImagePreview(stagedPath, mimeType);
      }
      results.push({ id, fileName, mimeType, fileSize: s.size, stagedPath, preview });
    }
    return results;
  });
  electron.ipcMain.handle("file:stageBuffer", async (_, payload) => {
    const fsP = await import("fs/promises");
    await fsP.mkdir(OUTBOUND_DIR, { recursive: true });
    const id = crypto$2.randomUUID();
    const ext = node_path.extname(payload.fileName) || mimeToExt(payload.mimeType);
    const stagedPath = node_path.join(OUTBOUND_DIR, `${id}${ext}`);
    const buffer = Buffer.from(payload.base64, "base64");
    await fsP.writeFile(stagedPath, buffer);
    const mimeType = payload.mimeType || getMimeType(ext);
    const fileSize = buffer.length;
    let preview = null;
    if (mimeType.startsWith("image/")) {
      preview = await generateImagePreview(stagedPath, mimeType);
    }
    return { id, fileName: payload.fileName, mimeType, fileSize, stagedPath, preview };
  });
  electron.ipcMain.handle("media:saveImage", async (_, params) => {
    try {
      const ext = params.defaultFileName.includes(".") ? params.defaultFileName.split(".").pop() : params.mimeType?.split("/")[1] || "png";
      const result = await electron.dialog.showSaveDialog({
        defaultPath: node_path.join(node_os.homedir(), "Downloads", params.defaultFileName),
        filters: [
          { name: "Images", extensions: [ext, "png", "jpg", "jpeg", "webp", "gif"] },
          { name: "All Files", extensions: ["*"] }
        ]
      });
      if (result.canceled || !result.filePath) return { success: false };
      const fsP = await import("fs/promises");
      if (params.filePath) {
        try {
          await fsP.access(params.filePath);
          await fsP.copyFile(params.filePath, result.filePath);
        } catch {
          return { success: false, error: "Source file not found" };
        }
      } else if (params.base64) {
        const buffer = Buffer.from(params.base64, "base64");
        await fsP.writeFile(result.filePath, buffer);
      } else {
        return { success: false, error: "No image data provided" };
      }
      return { success: true, savedPath: result.filePath };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });
  electron.ipcMain.handle("media:getThumbnails", async (_, paths) => {
    const fsP = await import("fs/promises");
    const results = {};
    for (const { filePath, mimeType } of paths) {
      try {
        const s = await fsP.stat(filePath);
        let preview = null;
        if (mimeType.startsWith("image/")) {
          preview = await generateImagePreview(filePath, mimeType);
        }
        results[filePath] = { preview, fileSize: s.size };
      } catch {
        results[filePath] = { preview: null, fileSize: 0 };
      }
    }
    return results;
  });
}
function registerSessionHandlers() {
  electron.ipcMain.handle("session:delete", async (_, sessionKey) => {
    try {
      if (!sessionKey || !sessionKey.startsWith("agent:")) {
        return { success: false, error: `Invalid sessionKey: ${sessionKey}` };
      }
      const parts = sessionKey.split(":");
      if (parts.length < 3) {
        return { success: false, error: `sessionKey has too few parts: ${sessionKey}` };
      }
      const agentId = parts[1];
      const openclawConfigDir = getOpenClawConfigDir();
      const sessionsDir = node_path.join(openclawConfigDir, "agents", agentId, "sessions");
      const sessionsJsonPath = node_path.join(sessionsDir, "sessions.json");
      logger.info(`[session:delete] key=${sessionKey} agentId=${agentId}`);
      logger.info(`[session:delete] sessionsJson=${sessionsJsonPath}`);
      const fsP = await import("fs/promises");
      let sessionsJson = {};
      try {
        const raw = await fsP.readFile(sessionsJsonPath, "utf8");
        sessionsJson = JSON.parse(raw);
      } catch (e) {
        logger.warn(`[session:delete] Could not read sessions.json: ${String(e)}`);
        return { success: false, error: `Could not read sessions.json: ${String(e)}` };
      }
      let uuidFileName;
      if (Array.isArray(sessionsJson.sessions)) {
        const entry = sessionsJson.sessions.find((s) => s.key === sessionKey || s.sessionKey === sessionKey);
        if (entry) {
          uuidFileName = entry.file ?? entry.fileName ?? entry.path;
          if (!uuidFileName && typeof entry.id === "string") {
            uuidFileName = `${entry.id}.jsonl`;
          }
        }
      }
      let resolvedSrcPath;
      if (!uuidFileName && sessionsJson[sessionKey] != null) {
        const val = sessionsJson[sessionKey];
        if (typeof val === "string") {
          uuidFileName = val;
        } else if (typeof val === "object" && val !== null) {
          const entry = val;
          const absFile = entry.sessionFile ?? entry.file ?? entry.fileName ?? entry.path;
          if (absFile) {
            if (absFile.startsWith("/") || absFile.match(/^[A-Za-z]:\\/)) {
              resolvedSrcPath = absFile;
            } else {
              uuidFileName = absFile;
            }
          } else {
            const uuidVal = entry.id ?? entry.sessionId;
            if (uuidVal) uuidFileName = uuidVal.endsWith(".jsonl") ? uuidVal : `${uuidVal}.jsonl`;
          }
        }
      }
      if (!uuidFileName && !resolvedSrcPath) {
        const rawVal = sessionsJson[sessionKey];
        logger.warn(`[session:delete] Cannot resolve file for "${sessionKey}". Raw value: ${JSON.stringify(rawVal)}`);
        return { success: false, error: `Cannot resolve file for session: ${sessionKey}` };
      }
      if (!resolvedSrcPath) {
        if (!uuidFileName.endsWith(".jsonl")) uuidFileName = `${uuidFileName}.jsonl`;
        resolvedSrcPath = node_path.join(sessionsDir, uuidFileName);
      }
      const dstPath = resolvedSrcPath.replace(/\.jsonl$/, ".deleted.jsonl");
      logger.info(`[session:delete] file: ${resolvedSrcPath}`);
      try {
        await fsP.access(resolvedSrcPath);
        await fsP.rename(resolvedSrcPath, dstPath);
        logger.info(`[session:delete] Renamed ${resolvedSrcPath} → ${dstPath}`);
      } catch (e) {
        logger.warn(`[session:delete] Could not rename file: ${String(e)}`);
      }
      try {
        const raw2 = await fsP.readFile(sessionsJsonPath, "utf8");
        const json2 = JSON.parse(raw2);
        if (Array.isArray(json2.sessions)) {
          json2.sessions = json2.sessions.filter((s) => s.key !== sessionKey && s.sessionKey !== sessionKey);
        } else if (json2[sessionKey]) {
          delete json2[sessionKey];
        }
        await fsP.writeFile(sessionsJsonPath, JSON.stringify(json2, null, 2), "utf8");
        logger.info(`[session:delete] Removed "${sessionKey}" from sessions.json`);
      } catch (e) {
        logger.warn(`[session:delete] Could not update sessions.json: ${String(e)}`);
      }
      return { success: true };
    } catch (err) {
      logger.error(`[session:delete] Unexpected error for ${sessionKey}:`, err);
      return { success: false, error: String(err) };
    }
  });
}
let tray = null;
function getIconsDir$1() {
  if (electron.app.isPackaged) {
    return path.join(process.resourcesPath, "resources", "icons");
  }
  return path.join(__dirname, "../../resources/icons");
}
function createTray(mainWindow) {
  const iconsDir = getIconsDir$1();
  let iconPath;
  if (process.platform === "win32") {
    iconPath = path.join(iconsDir, "icon.ico");
  } else if (process.platform === "darwin") {
    iconPath = path.join(iconsDir, "tray-icon-Template.png");
  } else {
    iconPath = path.join(iconsDir, "32x32.png");
  }
  let icon = electron.nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    icon = electron.nativeImage.createFromPath(path.join(iconsDir, "icon.png"));
    if (process.platform === "darwin") {
      icon.setTemplateImage(true);
    }
  }
  if (process.platform === "darwin") {
    icon.setTemplateImage(true);
  }
  tray = new electron.Tray(icon);
  tray.setToolTip("ClawX - AI Assistant");
  const showWindow = () => {
    if (mainWindow.isDestroyed()) return;
    mainWindow.show();
    mainWindow.focus();
  };
  const contextMenu = electron.Menu.buildFromTemplate([
    {
      label: "Show ClawX",
      click: showWindow
    },
    {
      type: "separator"
    },
    {
      label: "Gateway Status",
      enabled: false
    },
    {
      label: "  Running",
      type: "checkbox",
      checked: true,
      enabled: false
    },
    {
      type: "separator"
    },
    {
      label: "Quick Actions",
      submenu: [
        {
          label: "Open Dashboard",
          click: () => {
            if (mainWindow.isDestroyed()) return;
            mainWindow.show();
            mainWindow.webContents.send("navigate", "/");
          }
        },
        {
          label: "Open Chat",
          click: () => {
            if (mainWindow.isDestroyed()) return;
            mainWindow.show();
            mainWindow.webContents.send("navigate", "/chat");
          }
        },
        {
          label: "Open Settings",
          click: () => {
            if (mainWindow.isDestroyed()) return;
            mainWindow.show();
            mainWindow.webContents.send("navigate", "/settings");
          }
        }
      ]
    },
    {
      type: "separator"
    },
    {
      label: "Check for Updates...",
      click: () => {
        if (mainWindow.isDestroyed()) return;
        mainWindow.webContents.send("update:check");
      }
    },
    {
      type: "separator"
    },
    {
      label: "Quit ClawX",
      click: () => {
        electron.app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    if (mainWindow.isDestroyed()) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
  tray.on("double-click", () => {
    if (mainWindow.isDestroyed()) return;
    mainWindow.show();
    mainWindow.focus();
  });
  return tray;
}
function createMenu() {
  const isMac = process.platform === "darwin";
  const template = [
    // App menu (macOS only)
    ...isMac ? [
      {
        label: electron.app.name,
        submenu: [
          { role: "about" },
          { type: "separator" },
          {
            label: "Preferences...",
            accelerator: "Cmd+,",
            click: () => {
              const win = electron.BrowserWindow.getFocusedWindow();
              win?.webContents.send("navigate", "/settings");
            }
          },
          { type: "separator" },
          { role: "services" },
          { type: "separator" },
          { role: "hide" },
          { role: "hideOthers" },
          { role: "unhide" },
          { type: "separator" },
          { role: "quit" }
        ]
      }
    ] : [],
    // File menu
    {
      label: "File",
      submenu: [
        {
          label: "New Chat",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            const win = electron.BrowserWindow.getFocusedWindow();
            win?.webContents.send("navigate", "/chat");
          }
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" }
      ]
    },
    // Edit menu
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        ...isMac ? [
          { role: "pasteAndMatchStyle" },
          { role: "delete" },
          { role: "selectAll" }
        ] : [
          { role: "delete" },
          { type: "separator" },
          { role: "selectAll" }
        ]
      ]
    },
    // View menu
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    // Navigate menu
    {
      label: "Navigate",
      submenu: [
        {
          label: "Dashboard",
          accelerator: "CmdOrCtrl+1",
          click: () => {
            const win = electron.BrowserWindow.getFocusedWindow();
            win?.webContents.send("navigate", "/");
          }
        },
        {
          label: "Chat",
          accelerator: "CmdOrCtrl+2",
          click: () => {
            const win = electron.BrowserWindow.getFocusedWindow();
            win?.webContents.send("navigate", "/chat");
          }
        },
        {
          label: "Channels",
          accelerator: "CmdOrCtrl+3",
          click: () => {
            const win = electron.BrowserWindow.getFocusedWindow();
            win?.webContents.send("navigate", "/channels");
          }
        },
        {
          label: "Skills",
          accelerator: "CmdOrCtrl+4",
          click: () => {
            const win = electron.BrowserWindow.getFocusedWindow();
            win?.webContents.send("navigate", "/skills");
          }
        },
        {
          label: "Cron Tasks",
          accelerator: "CmdOrCtrl+5",
          click: () => {
            const win = electron.BrowserWindow.getFocusedWindow();
            win?.webContents.send("navigate", "/cron");
          }
        },
        {
          label: "Settings",
          accelerator: isMac ? "Cmd+," : "Ctrl+,",
          click: () => {
            const win = electron.BrowserWindow.getFocusedWindow();
            win?.webContents.send("navigate", "/settings");
          }
        }
      ]
    },
    // Window menu
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...isMac ? [
          { type: "separator" },
          { role: "front" },
          { type: "separator" },
          { role: "window" }
        ] : [{ role: "close" }]
      ]
    },
    // Help menu
    {
      role: "help",
      submenu: [
        {
          label: "Documentation",
          click: async () => {
            await electron.shell.openExternal("https://claw-x.com");
          }
        },
        {
          label: "Report Issue",
          click: async () => {
            await electron.shell.openExternal("https://github.com/ValueCell-ai/ClawX/issues");
          }
        },
        { type: "separator" },
        {
          label: "OpenClaw Documentation",
          click: async () => {
            await electron.shell.openExternal("https://docs.openclaw.ai");
          }
        }
      ]
    }
  ];
  const menu = electron.Menu.buildFromTemplate(template);
  electron.Menu.setApplicationMenu(menu);
}
let _isQuitting = false;
function isQuitting() {
  return _isQuitting;
}
function setQuitting(value = true) {
  _isQuitting = value;
}
const OSS_BASE_URL = "https://oss.intelli-spectrum.com";
function detectChannel(version) {
  const match = version.match(/-([a-zA-Z]+)/);
  return match ? match[1] : "latest";
}
class AppUpdater extends events.EventEmitter {
  mainWindow = null;
  status = { status: "idle" };
  autoInstallTimer = null;
  autoInstallCountdown = 0;
  /** Delay (in seconds) before auto-installing a downloaded update. */
  static AUTO_INSTALL_DELAY_SECONDS = 5;
  constructor() {
    super();
    electronUpdater.autoUpdater.autoDownload = false;
    electronUpdater.autoUpdater.autoInstallOnAppQuit = true;
    electronUpdater.autoUpdater.logger = {
      info: (msg) => logger.info("[Updater]", msg),
      warn: (msg) => logger.warn("[Updater]", msg),
      error: (msg) => logger.error("[Updater]", msg),
      debug: (msg) => logger.debug("[Updater]", msg)
    };
    const version = electron.app.getVersion();
    const channel = detectChannel(version);
    const feedUrl = `${OSS_BASE_URL}/${channel}`;
    logger.info(`[Updater] Version: ${version}, channel: ${channel}, feedUrl: ${feedUrl}`);
    electronUpdater.autoUpdater.channel = channel;
    electronUpdater.autoUpdater.setFeedURL({
      provider: "generic",
      url: feedUrl,
      useMultipleRangeRequest: false
    });
    this.setupListeners();
  }
  /**
   * Set the main window for sending update events
   */
  setMainWindow(window) {
    this.mainWindow = window;
  }
  /**
   * Get current update status
   */
  getStatus() {
    return this.status;
  }
  /**
   * Setup auto-updater event listeners
   */
  setupListeners() {
    electronUpdater.autoUpdater.on("checking-for-update", () => {
      this.updateStatus({ status: "checking" });
      this.emit("checking-for-update");
    });
    electronUpdater.autoUpdater.on("update-available", (info2) => {
      this.updateStatus({ status: "available", info: info2 });
      this.emit("update-available", info2);
    });
    electronUpdater.autoUpdater.on("update-not-available", (info2) => {
      this.updateStatus({ status: "not-available", info: info2 });
      this.emit("update-not-available", info2);
    });
    electronUpdater.autoUpdater.on("download-progress", (progress) => {
      this.updateStatus({ status: "downloading", progress });
      this.emit("download-progress", progress);
    });
    electronUpdater.autoUpdater.on("update-downloaded", (event) => {
      this.updateStatus({ status: "downloaded", info: event });
      this.emit("update-downloaded", event);
      if (electronUpdater.autoUpdater.autoDownload) {
        this.startAutoInstallCountdown();
      }
    });
    electronUpdater.autoUpdater.on("error", (error2) => {
      this.updateStatus({ status: "error", error: error2.message });
      this.emit("error", error2);
    });
  }
  /**
   * Update status and notify renderer
   */
  updateStatus(newStatus) {
    this.status = {
      status: newStatus.status ?? this.status.status,
      info: newStatus.info,
      progress: newStatus.progress,
      error: newStatus.error
    };
    this.sendToRenderer("update:status-changed", this.status);
  }
  /**
   * Send event to renderer process
   */
  sendToRenderer(channel, data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }
  /**
   * Check for updates.
   * electron-updater automatically tries providers defined in electron-builder.yml in order.
   *
   * In dev mode (not packed), autoUpdater.checkForUpdates() silently returns
   * null without emitting any events, so we must detect this and force a
   * final status so the UI never gets stuck in 'checking'.
   */
  async checkForUpdates() {
    try {
      const result = await electronUpdater.autoUpdater.checkForUpdates();
      if (result == null) {
        this.updateStatus({
          status: "error",
          error: "Update check skipped (dev mode – app is not packaged)"
        });
        return null;
      }
      if (this.status.status === "checking" || this.status.status === "idle") {
        this.updateStatus({ status: "not-available" });
      }
      return result.updateInfo || null;
    } catch (error2) {
      logger.error("[Updater] Check for updates failed:", error2);
      this.updateStatus({ status: "error", error: error2.message || String(error2) });
      throw error2;
    }
  }
  /**
   * Download available update
   */
  async downloadUpdate() {
    try {
      await electronUpdater.autoUpdater.downloadUpdate();
    } catch (error2) {
      logger.error("[Updater] Download update failed:", error2);
      throw error2;
    }
  }
  /**
   * Install update and restart.
   *
   * On macOS, electron-updater delegates to Squirrel.Mac (ShipIt). The
   * native quitAndInstall() spawns ShipIt then internally calls app.quit().
   * However, the tray close handler in index.ts intercepts window close
   * and hides to tray unless isQuitting is true. Squirrel's internal quit
   * sometimes fails to trigger before-quit in time, so we set isQuitting
   * BEFORE calling quitAndInstall(). This lets the native quit flow close
   * the window cleanly while ShipIt runs independently to replace the app.
   */
  quitAndInstall() {
    logger.info("[Updater] quitAndInstall called");
    setQuitting();
    electronUpdater.autoUpdater.quitAndInstall();
  }
  /**
   * Start a countdown that auto-installs the downloaded update.
   * Sends `update:auto-install-countdown` events to the renderer each second.
   */
  startAutoInstallCountdown() {
    this.clearAutoInstallTimer();
    this.autoInstallCountdown = AppUpdater.AUTO_INSTALL_DELAY_SECONDS;
    this.sendToRenderer("update:auto-install-countdown", { seconds: this.autoInstallCountdown });
    this.autoInstallTimer = setInterval(() => {
      this.autoInstallCountdown--;
      this.sendToRenderer("update:auto-install-countdown", { seconds: this.autoInstallCountdown });
      if (this.autoInstallCountdown <= 0) {
        this.clearAutoInstallTimer();
        this.quitAndInstall();
      }
    }, 1e3);
  }
  cancelAutoInstall() {
    this.clearAutoInstallTimer();
    this.sendToRenderer("update:auto-install-countdown", { seconds: -1, cancelled: true });
  }
  clearAutoInstallTimer() {
    if (this.autoInstallTimer) {
      clearInterval(this.autoInstallTimer);
      this.autoInstallTimer = null;
    }
  }
  /**
   * Set update channel (stable, beta, dev)
   */
  setChannel(channel) {
    electronUpdater.autoUpdater.channel = channel;
  }
  /**
   * Set auto-download preference
   */
  setAutoDownload(enable) {
    electronUpdater.autoUpdater.autoDownload = enable;
  }
  /**
   * Get current version
   */
  getCurrentVersion() {
    return electron.app.getVersion();
  }
}
function registerUpdateHandlers(updater, mainWindow) {
  updater.setMainWindow(mainWindow);
  electron.ipcMain.handle("update:status", () => {
    return updater.getStatus();
  });
  electron.ipcMain.handle("update:version", () => {
    return updater.getCurrentVersion();
  });
  electron.ipcMain.handle("update:check", async () => {
    try {
      await updater.checkForUpdates();
      return { success: true, status: updater.getStatus() };
    } catch (error2) {
      return { success: false, error: String(error2), status: updater.getStatus() };
    }
  });
  electron.ipcMain.handle("update:download", async () => {
    try {
      await updater.downloadUpdate();
      return { success: true };
    } catch (error2) {
      return { success: false, error: String(error2) };
    }
  });
  electron.ipcMain.handle("update:install", () => {
    updater.quitAndInstall();
    return { success: true };
  });
  electron.ipcMain.handle("update:setChannel", (_, channel) => {
    updater.setChannel(channel);
    return { success: true };
  });
  electron.ipcMain.handle("update:setAutoDownload", (_, enable) => {
    updater.setAutoDownload(enable);
    return { success: true };
  });
  electron.ipcMain.handle("update:cancelAutoInstall", () => {
    updater.cancelAutoInstall();
    return { success: true };
  });
}
const appUpdater = new AppUpdater();
class ClawHubService {
  workDir;
  cliPath;
  cliEntryPath;
  useNodeRunner;
  ansiRegex;
  constructor() {
    this.workDir = getOpenClawConfigDir();
    ensureDir$2(this.workDir);
    const binPath = getClawHubCliBinPath();
    const entryPath = getClawHubCliEntryPath();
    this.cliEntryPath = entryPath;
    if (!electron.app.isPackaged && fs.existsSync(binPath)) {
      this.cliPath = binPath;
      this.useNodeRunner = false;
    } else {
      this.cliPath = process.execPath;
      this.useNodeRunner = true;
    }
    const esc = String.fromCharCode(27);
    const csi = String.fromCharCode(155);
    const pattern = `(?:${esc}|${csi})[[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]`;
    this.ansiRegex = new RegExp(pattern, "g");
  }
  stripAnsi(line) {
    return line.replace(this.ansiRegex, "").trim();
  }
  /**
   * Run a ClawHub CLI command
   */
  async runCommand(args) {
    return new Promise((resolve, reject) => {
      if (this.useNodeRunner && !fs.existsSync(this.cliEntryPath)) {
        reject(new Error(`ClawHub CLI entry not found at: ${this.cliEntryPath}`));
        return;
      }
      if (!this.useNodeRunner && !fs.existsSync(this.cliPath)) {
        reject(new Error(`ClawHub CLI not found at: ${this.cliPath}`));
        return;
      }
      const commandArgs = this.useNodeRunner ? [this.cliEntryPath, ...args] : args;
      const displayCommand = [this.cliPath, ...commandArgs].join(" ");
      console.log(`Running ClawHub command: ${displayCommand}`);
      const isWin = process.platform === "win32";
      const useShell = isWin && !this.useNodeRunner;
      const { NODE_OPTIONS: _nodeOptions, ...baseEnv } = process.env;
      const env = {
        ...baseEnv,
        CI: "true",
        FORCE_COLOR: "0"
      };
      if (this.useNodeRunner) {
        env.ELECTRON_RUN_AS_NODE = "1";
      }
      const spawnCmd = useShell ? quoteForCmd(this.cliPath) : this.cliPath;
      const spawnArgs = useShell ? commandArgs.map((a) => quoteForCmd(a)) : commandArgs;
      const child = child_process.spawn(spawnCmd, spawnArgs, {
        cwd: this.workDir,
        shell: useShell,
        env: {
          ...env,
          CLAWHUB_WORKDIR: this.workDir
        },
        windowsHide: true
      });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });
      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      child.on("error", (error2) => {
        console.error("ClawHub process error:", error2);
        reject(error2);
      });
      child.on("close", (code) => {
        if (code !== 0 && code !== null) {
          console.error(`ClawHub command failed with code ${code}`);
          console.error("Stderr:", stderr);
          reject(new Error(`Command failed: ${stderr || stdout}`));
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }
  /**
   * Search for skills
   */
  async search(params) {
    try {
      if (!params.query || params.query.trim() === "") {
        return this.explore({ limit: params.limit });
      }
      const args = ["search", params.query];
      if (params.limit) {
        args.push("--limit", String(params.limit));
      }
      const output = await this.runCommand(args);
      if (!output || output.includes("No skills found")) {
        return [];
      }
      const lines = output.split("\n").filter((l) => l.trim());
      return lines.map((line) => {
        const cleanLine = this.stripAnsi(line);
        let match = cleanLine.match(/^(\S+)\s+v?(\d+\.\S+)\s+(.+)$/);
        if (match) {
          const slug = match[1];
          const version = match[2];
          let description = match[3];
          description = description.replace(/\(\d+\.\d+\)$/, "").trim();
          return {
            slug,
            name: slug,
            version,
            description
          };
        }
        match = cleanLine.match(/^(\S+)\s+(.+)$/);
        if (match) {
          const slug = match[1];
          let description = match[2];
          description = description.replace(/\(\d+\.\d+\)$/, "").trim();
          return {
            slug,
            name: slug,
            version: "latest",
            // Fallback version since it's not provided
            description
          };
        }
        return null;
      }).filter((s) => s !== null);
    } catch (error2) {
      console.error("ClawHub search error:", error2);
      throw error2;
    }
  }
  /**
   * Explore trending skills
   */
  async explore(params = {}) {
    try {
      const args = ["explore"];
      if (params.limit) {
        args.push("--limit", String(params.limit));
      }
      const output = await this.runCommand(args);
      if (!output) return [];
      const lines = output.split("\n").filter((l) => l.trim());
      return lines.map((line) => {
        const cleanLine = this.stripAnsi(line);
        const match = cleanLine.match(/^(\S+)\s+v?(\d+\.\S+)\s+(.+? ago|just now|yesterday)\s+(.+)$/i);
        if (match) {
          return {
            slug: match[1],
            name: match[1],
            version: match[2],
            description: match[4]
          };
        }
        return null;
      }).filter((s) => s !== null);
    } catch (error2) {
      console.error("ClawHub explore error:", error2);
      throw error2;
    }
  }
  /**
   * Install a skill
   */
  async install(params) {
    const args = ["install", params.slug];
    if (params.version) {
      args.push("--version", params.version);
    }
    if (params.force) {
      args.push("--force");
    }
    await this.runCommand(args);
  }
  /**
   * Uninstall a skill
   */
  async uninstall(params) {
    const fsPromises = fs.promises;
    const skillDir = path.join(this.workDir, "skills", params.slug);
    if (fs.existsSync(skillDir)) {
      console.log(`Deleting skill directory: ${skillDir}`);
      await fsPromises.rm(skillDir, { recursive: true, force: true });
    }
    const lockFile = path.join(this.workDir, ".clawhub", "lock.json");
    if (fs.existsSync(lockFile)) {
      try {
        const lockData = JSON.parse(fs.readFileSync(lockFile, "utf8"));
        if (lockData.skills && lockData.skills[params.slug]) {
          console.log(`Removing ${params.slug} from lock.json`);
          delete lockData.skills[params.slug];
          await fsPromises.writeFile(lockFile, JSON.stringify(lockData, null, 2));
        }
      } catch (err) {
        console.error("Failed to update ClawHub lock file:", err);
      }
    }
  }
  /**
   * List installed skills
   */
  async listInstalled() {
    try {
      const output = await this.runCommand(["list"]);
      if (!output || output.includes("No installed skills")) {
        return [];
      }
      const lines = output.split("\n").filter((l) => l.trim());
      return lines.map((line) => {
        const cleanLine = this.stripAnsi(line);
        const match = cleanLine.match(/^(\S+)\s+v?(\d+\.\S+)/);
        if (match) {
          return {
            slug: match[1],
            version: match[2]
          };
        }
        return null;
      }).filter((s) => s !== null);
    } catch (error2) {
      console.error("ClawHub list error:", error2);
      return [];
    }
  }
  /**
   * Open skill README/manual in default editor
   */
  async openSkillReadme(slug) {
    const skillDir = path.join(this.workDir, "skills", slug);
    const possibleFiles = ["SKILL.md", "README.md", "skill.md", "readme.md"];
    let targetFile = "";
    for (const file of possibleFiles) {
      const filePath = path.join(skillDir, file);
      if (fs.existsSync(filePath)) {
        targetFile = filePath;
        break;
      }
    }
    if (!targetFile) {
      if (fs.existsSync(skillDir)) {
        targetFile = skillDir;
      } else {
        throw new Error("Skill directory not found");
      }
    }
    try {
      await electron.shell.openPath(targetFile);
      return true;
    } catch (error2) {
      console.error("Failed to open skill readme:", error2);
      throw error2;
    }
  }
}
const CLAWX_BEGIN = "<!-- clawx:begin -->";
const CLAWX_END = "<!-- clawx:end -->";
async function fileExists(p) {
  try {
    await promises.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
async function ensureDir(dir) {
  if (!await fileExists(dir)) {
    await promises.mkdir(dir, { recursive: true });
  }
}
function mergeClawXSection(existing, section) {
  const wrapped = `${CLAWX_BEGIN}
${section.trim()}
${CLAWX_END}`;
  const beginIdx = existing.indexOf(CLAWX_BEGIN);
  const endIdx = existing.indexOf(CLAWX_END);
  if (beginIdx !== -1 && endIdx !== -1) {
    return existing.slice(0, beginIdx) + wrapped + existing.slice(endIdx + CLAWX_END.length);
  }
  return existing.trimEnd() + "\n\n" + wrapped + "\n";
}
async function resolveAllWorkspaceDirs() {
  const openclawDir = path.join(os.homedir(), ".openclaw");
  const dirs = /* @__PURE__ */ new Set();
  const configPath = path.join(openclawDir, "openclaw.json");
  try {
    if (await fileExists(configPath)) {
      const config = JSON.parse(await promises.readFile(configPath, "utf-8"));
      const defaultWs = config?.agents?.defaults?.workspace;
      if (typeof defaultWs === "string" && defaultWs.trim()) {
        dirs.add(defaultWs.replace(/^~/, os.homedir()));
      }
      const agents = config?.agents?.list;
      if (Array.isArray(agents)) {
        for (const agent of agents) {
          const ws = agent?.workspace;
          if (typeof ws === "string" && ws.trim()) {
            dirs.add(ws.replace(/^~/, os.homedir()));
          }
        }
      }
    }
  } catch {
  }
  try {
    const entries = await promises.readdir(openclawDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith("workspace")) {
        dirs.add(path.join(openclawDir, entry.name));
      }
    }
  } catch {
  }
  if (dirs.size === 0) {
    dirs.add(path.join(openclawDir, "workspace"));
  }
  return [...dirs];
}
async function repairClawXOnlyBootstrapFiles() {
  const workspaceDirs = await resolveAllWorkspaceDirs();
  for (const workspaceDir of workspaceDirs) {
    if (!await fileExists(workspaceDir)) continue;
    let entries;
    try {
      entries = (await promises.readdir(workspaceDir)).filter((f) => f.endsWith(".md"));
    } catch {
      continue;
    }
    for (const file of entries) {
      const filePath = path.join(workspaceDir, file);
      let content;
      try {
        content = await promises.readFile(filePath, "utf-8");
      } catch {
        continue;
      }
      const beginIdx = content.indexOf(CLAWX_BEGIN);
      const endIdx = content.indexOf(CLAWX_END);
      if (beginIdx === -1 || endIdx === -1) continue;
      const before = content.slice(0, beginIdx).trim();
      const after = content.slice(endIdx + CLAWX_END.length).trim();
      if (before === "" && after === "") {
        try {
          await promises.unlink(filePath);
          logger.info(`Removed ClawX-only bootstrap file for re-seeding: ${file} (${workspaceDir})`);
        } catch {
          logger.warn(`Failed to remove ClawX-only bootstrap file: ${filePath}`);
        }
      }
    }
  }
}
async function mergeClawXContextOnce() {
  const contextDir = path.join(getResourcesDir(), "context");
  if (!await fileExists(contextDir)) {
    logger.debug("ClawX context directory not found, skipping context merge");
    return 0;
  }
  let files;
  try {
    files = (await promises.readdir(contextDir)).filter((f) => f.endsWith(".clawx.md"));
  } catch {
    return 0;
  }
  const workspaceDirs = await resolveAllWorkspaceDirs();
  let skipped = 0;
  for (const workspaceDir of workspaceDirs) {
    await ensureDir(workspaceDir);
    for (const file of files) {
      const targetName = file.replace(".clawx.md", ".md");
      const targetPath = path.join(workspaceDir, targetName);
      if (!await fileExists(targetPath)) {
        logger.debug(`Skipping ${targetName} in ${workspaceDir} (file does not exist yet, will be seeded by gateway)`);
        skipped++;
        continue;
      }
      const section = await promises.readFile(path.join(contextDir, file), "utf-8");
      const existing = await promises.readFile(targetPath, "utf-8");
      const merged = mergeClawXSection(existing, section);
      if (merged !== existing) {
        await promises.writeFile(targetPath, merged, "utf-8");
        logger.info(`Merged ClawX context into ${targetName} (${workspaceDir})`);
      }
    }
  }
  return skipped;
}
const RETRY_INTERVAL_MS = 2e3;
const MAX_RETRIES = 15;
async function ensureClawXContext() {
  let skipped = await mergeClawXContextOnce();
  if (skipped === 0) return;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
    skipped = await mergeClawXContextOnce();
    if (skipped === 0) {
      logger.info(`ClawX context merge completed after ${attempt} retry(ies)`);
      return;
    }
    logger.debug(`ClawX context merge: ${skipped} file(s) still missing (retry ${attempt}/${MAX_RETRIES})`);
  }
  logger.warn(`ClawX context merge: ${skipped} file(s) still missing after ${MAX_RETRIES} retries`);
}
electron.app.disableHardwareAcceleration();
if (process.platform === "linux") {
  electron.app.setDesktopName("clawx.desktop");
}
const gotTheLock = electron.app.requestSingleInstanceLock();
if (!gotTheLock) {
  electron.app.quit();
}
exports.mainWindow = null;
const gatewayManager = new GatewayManager();
const clawHubService = new ClawHubService();
function getIconsDir() {
  if (electron.app.isPackaged) {
    return path.join(process.resourcesPath, "resources", "icons");
  }
  return path.join(__dirname, "../../resources/icons");
}
function getAppIcon() {
  if (process.platform === "darwin") return void 0;
  const iconsDir = getIconsDir();
  const iconPath = process.platform === "win32" ? path.join(iconsDir, "icon.ico") : path.join(iconsDir, "icon.png");
  const icon = electron.nativeImage.createFromPath(iconPath);
  return icon.isEmpty() ? void 0 : icon;
}
function createWindow() {
  const isMac = process.platform === "darwin";
  const win = new electron.BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webviewTag: true
      // Enable <webview> for embedding OpenClaw Control UI
    },
    titleBarStyle: isMac ? "hiddenInset" : "hidden",
    trafficLightPosition: isMac ? { x: 16, y: 16 } : void 0,
    frame: isMac,
    show: false
  });
  win.once("ready-to-show", () => {
    win.show();
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    electron.shell.openExternal(url);
    return { action: "deny" };
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../../dist/index.html"));
  }
  return win;
}
async function initialize() {
  logger.init();
  logger.info("=== ClawX Application Starting ===");
  logger.debug(
    `Runtime: platform=${process.platform}/${process.arch}, electron=${process.versions.electron}, node=${process.versions.node}, packaged=${electron.app.isPackaged}`
  );
  void warmupNetworkOptimization();
  await applyProxySettings();
  createMenu();
  exports.mainWindow = createWindow();
  createTray(exports.mainWindow);
  electron.session.defaultSession.webRequest.onHeadersReceived(
    { urls: ["http://127.0.0.1:18789/*", "http://localhost:18789/*"] },
    (details, callback) => {
      const headers = { ...details.responseHeaders };
      delete headers["X-Frame-Options"];
      delete headers["x-frame-options"];
      if (headers["Content-Security-Policy"]) {
        headers["Content-Security-Policy"] = headers["Content-Security-Policy"].map(
          (csp) => csp.replace(/frame-ancestors\s+'none'/g, "frame-ancestors 'self' *")
        );
      }
      if (headers["content-security-policy"]) {
        headers["content-security-policy"] = headers["content-security-policy"].map(
          (csp) => csp.replace(/frame-ancestors\s+'none'/g, "frame-ancestors 'self' *")
        );
      }
      callback({ responseHeaders: headers });
    }
  );
  registerIpcHandlers(gatewayManager, clawHubService, exports.mainWindow);
  registerUpdateHandlers(appUpdater, exports.mainWindow);
  exports.mainWindow.on("close", (event) => {
    if (!isQuitting()) {
      event.preventDefault();
      exports.mainWindow?.hide();
    }
  });
  exports.mainWindow.on("closed", () => {
    exports.mainWindow = null;
  });
  void repairClawXOnlyBootstrapFiles().catch((error2) => {
    logger.warn("Failed to repair bootstrap files:", error2);
  });
  void ensureBuiltinSkillsInstalled().catch((error2) => {
    logger.warn("Failed to install built-in skills:", error2);
  });
  const gatewayAutoStart = await getSetting("gatewayAutoStart");
  if (gatewayAutoStart) {
    try {
      logger.debug("Auto-starting Gateway...");
      await gatewayManager.start();
      logger.info("Gateway auto-start succeeded");
    } catch (error2) {
      logger.error("Gateway auto-start failed:", error2);
      exports.mainWindow?.webContents.send("gateway:error", String(error2));
    }
  } else {
    logger.info("Gateway auto-start disabled in settings");
  }
  void ensureClawXContext().catch((error2) => {
    logger.warn("Failed to merge ClawX context into workspace:", error2);
  });
  void autoInstallCliIfNeeded((installedPath) => {
    exports.mainWindow?.webContents.send("openclaw:cli-installed", installedPath);
  }).then(() => {
    generateCompletionCache();
    installCompletionToProfile();
  }).catch((error2) => {
    logger.warn("CLI auto-install failed:", error2);
  });
  gatewayManager.on("status", (status) => {
    if (status.state === "running") {
      void ensureClawXContext().catch((error2) => {
        logger.warn("Failed to re-merge ClawX context after gateway reconnect:", error2);
      });
    }
  });
}
electron.app.on("second-instance", () => {
  if (exports.mainWindow) {
    if (exports.mainWindow.isMinimized()) exports.mainWindow.restore();
    exports.mainWindow.show();
    exports.mainWindow.focus();
  }
});
electron.app.whenReady().then(() => {
  initialize();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      exports.mainWindow = createWindow();
    } else if (exports.mainWindow && !exports.mainWindow.isDestroyed()) {
      exports.mainWindow.show();
      exports.mainWindow.focus();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", () => {
  setQuitting();
  void gatewayManager.stop().catch((err) => {
    logger.warn("gatewayManager.stop() error during quit:", err);
  });
});
exports.gatewayManager = gatewayManager;
