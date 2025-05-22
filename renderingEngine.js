const fs = require('fs');
const path = require('path');

function detectPOV(input) {
  const lowered = input.toLowerCase();
  if (["what do i see", "what does heather see", "heather's pov"].some(p => lowered.includes(p))) {
    return "first_person";
  }
  if (["what does", "show me", "look like"].some(p => lowered.includes(p))) {
    return "third_person";
  }
  return "third_person";
}

function getInstalledLoras(loraDir) {
  try {
    return fs.readdirSync(loraDir)
      .filter(f => f.endsWith('.safetensors') || f.endsWith('.pt'))
      .map(f => f.replace(/\.(safetensors|pt)$/, ''));
  } catch (e) {
    console.warn(`LoRA directory not found: ${loraDir}`);
    return [];
  }
}

function matchLora(installed, keywords) {
  for (const keyword of keywords) {
    const match = installed.find(lora => lora.toLowerCase().includes(keyword.toLowerCase()));
    if (match) return match;
  }
  return null;
}

function buildPrompt(state, config) {
  let prompt = [];

  // Transformation state
  if (state.tf && config.tf_states?.[state.tf]) {
    prompt.push(config.tf_states[state.tf]);
  } else {
    let anatomy = config.anatomy_prompt;
    if (state.wearing_pants) {
      anatomy = anatomy.replace(
        /equine penis.*?two vulvas/,
        config.bulge_replace_text
      );
    }
    prompt.push(anatomy);
  }

  // Outfit
  if (state.outfit && config.outfit_variants?.[state.outfit]) {
    prompt.push(config.outfit_variants[state.outfit]);
  }

  // Mood
  if (state.mood && config.mood_prompts?.[state.mood]) {
    prompt.push(config.mood_prompts[state.mood]);
  }

  // Scene
  if (state.scene) {
    prompt.push(state.scene);
  }

  // LoRA
  if (config.lora_auto_select) {
    const installed = getInstalledLoras(config.lora_folder_path);
    const matched = matchLora(installed, ["otter", "muscular", "anthro"]);
    if (matched) {
      prompt.push(`<lora:${matched}:1.0>`);
    }
  }

  return prompt.filter(Boolean).join(", ");
}

module.exports = {
  detectPOV,
  buildPrompt,
  getInstalledLoras,
  matchLora
};
