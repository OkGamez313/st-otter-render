// The main script for the extension
// The following are examples of some basic extension functionality

//You'll likely need to import extension_settings, getContext, and loadExtensionSettings from extensions.js
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

//You'll likely need to import some other functions from the main script
import { saveSettingsDebounced } from "../../../../script.js";

// Keep track of where your extension is located, name should match repo name
const extensionName = "st-extension-example";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const extensionSettings = extension_settings[extensionName];
const defaultSettings = {};


 
// Loads the extension settings if they exist, otherwise initializes them to the defaults.
async function loadSettings() {
  //Create the settings if they don't exist
  extension_settings[extensionName] = extension_settings[extensionName] || {};
  if (Object.keys(extension_settings[extensionName]).length === 0) {
    Object.assign(extension_settings[extensionName], defaultSettings);
  }

  // Updating settings in the UI
  $("#example_setting").prop("checked", extension_settings[extensionName].example_setting).trigger("input");
}

// This function is called when the extension settings are changed in the UI
function onExampleInput(event) {
  const value = Boolean($(event.target).prop("checked"));
  extension_settings[extensionName].example_setting = value;
  saveSettingsDebounced();
}

// This function is called when the button is clicked
function onButtonClick() {
  // You can do whatever you want here
  // Let's make a popup appear with the checked setting
  toastr.info(
    `The checkbox is ${extension_settings[extensionName].example_setting ? "checked" : "not checked"}`,
    "A popup appeared because you clicked the button!"
  );
}

// This function is called when the extension is loaded
jQuery(async () => {
  // This is an example of loading HTML from a file
  const settingsHtml = await $.get(`${extensionFolderPath}/example.html`);

  // Append settingsHtml to extensions_settings
  // extension_settings and extensions_settings2 are the left and right columns of the settings menu
  // Left should be extensions that deal with system functions and right should be visual/UI related 
  $("#extensions_settings").append(settingsHtml);

  // These are examples of listening for events
  $("#my_button").on("click", onButtonClick);
  $("#example_setting").on("input", onExampleInput);

  // Load settings when starting things up (if you have any)
  loadSettings();
});
const path = require('path');
const fs = require('fs');

const { detectPOV, buildPrompt, getInstalledLoras, matchLora } = require('./renderingEngine');

let config = {}; // To be loaded from your card or config file

function loadCharacterConfig() {
  const configPath = path.join(__dirname, 'config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(raw);
    console.log(`[Heather Renderer] Loaded config from config.json`);
  } else {
    console.warn(`[Heather Renderer] No config.json found, using defaults.`);
  }
}

function onMessage(message, chatInterface) {
  const content = message.content || '';
  const pov = detectPOV(content);

  const state = {
    tf: message.tf || null,
    outfit: message.outfit || "casual",
    mood: message.mood || "focused",
    scene: message.scene || "",
    wearing_pants: true
  };

  const prompt = buildPrompt(state, config.rendering_config);

  console.log(`[Heather Renderer] POV: ${pov}`);
  console.log(`[Heather Renderer] Prompt: ${prompt}`);

  chatInterface.sendSystemMessage(`🔧 [Render] (${pov}) → "${prompt}"`);

  // OPTIONAL: send prompt to backend here
}

function setup(api) {
  loadCharacterConfig();

  api.registerEvent('message:sent', onMessage);
  console.log('[Heather Renderer] Extension loaded.');
}

module.exports = {
  setup
};
