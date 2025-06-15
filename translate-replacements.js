#!/usr/bin/env node

// Script to replace translate calls with t calls in editor-client.tsx
const fs = require('fs');
const path = require('path');

const filePath = '/Users/santhoshampolu/Story/src/app/editor/[projectId]/editor-client.tsx';

// Define replacements as [oldString, newString] pairs
const replacements = [
  // Basic status and actions
  [`translate('Saving...')`, `t('status.saving', { ns: 'editor', defaultValue: 'Saving...' })`],
  [`translate('Save')`, `t('toolbar.save', { ns: 'editor', defaultValue: 'Save' })`],
  [`translate('Generating...')`, `t('status.generating', { ns: 'editor', defaultValue: 'Generating...' })`],
  [`translate('Generate Treatment')`, `t('actions.generateTreatment', { ns: 'editor', defaultValue: 'Generate Treatment' })`],
  [`translate('Generate Characters')`, `t('actions.generateCharacters', { ns: 'editor', defaultValue: 'Generate Characters' })`],
  [`translate('Generate Scenes')`, `t('actions.generateScenes', { ns: 'editor', defaultValue: 'Generate Scenes' })`],
  [`translate('Generate Full Script')`, `t('actions.generateFullScript', { ns: 'editor', defaultValue: 'Generate Full Script' })`],
  [`translate('Save Character')`, `t('actions.saveCharacter', { ns: 'editor', defaultValue: 'Save Character' })`],
  [`translate('Save Script')`, `t('actions.saveScript', { ns: 'editor', defaultValue: 'Save Script' })`],
  [`translate('Add Character')`, `t('actions.addCharacter', { ns: 'editor', defaultValue: 'Add Character' })`],
  [`translate('Add Scene')`, `t('actions.addScene', { ns: 'editor', defaultValue: 'Add Scene' })`],
  
  // Placeholders
  [`translate("Write your treatment here...")`, `t('placeholders.enterTreatment', { ns: 'editor', defaultValue: 'Write a detailed treatment of your story...' })`],
  [`translate("Character Name")`, `t('placeholders.characterName', { ns: 'editor', defaultValue: 'Character Name' })`],
  [`translate("Description")`, `t('placeholders.description', { ns: 'editor', defaultValue: 'Description' })`],
  [`translate("Backstory...")`, `t('placeholders.backstory', { ns: 'editor', defaultValue: 'Backstory...' })`],
  [`translate("Motivation...")`, `t('placeholders.motivation', { ns: 'editor', defaultValue: 'Motivation...' })`],
  [`translate("Scene Title")`, `t('placeholders.sceneTitle', { ns: 'editor', defaultValue: 'Scene Title' })`],
  [`translate("Summary")`, `t('placeholders.summary', { ns: 'editor', defaultValue: 'Summary' })`],
  [`translate("Generate or paste your full script here...")`, `t('placeholders.generateOrPasteScript', { ns: 'editor', defaultValue: 'Generate or paste your full script here...' })`],
  
  // UI Labels
  [`translate('Genre')`, `t('labels.genre', { ns: 'editor', defaultValue: 'Genre' })`],
  [`translate('Tone')`, `t('labels.tone', { ns: 'editor', defaultValue: 'Tone' })`],
  [`translate('Select Genre')`, `t('placeholders.selectGenre', { ns: 'editor', defaultValue: 'Select Genre' })`],
  [`translate('Select Tone')`, `t('placeholders.selectTone', { ns: 'editor', defaultValue: 'Select Tone' })`],
  [`translate('Visual Style')`, `t('labels.visualStyle', { ns: 'editor', defaultValue: 'Visual Style' })`],
  [`translate('Key Visual Moments')`, `t('labels.keyVisualMoments', { ns: 'editor', defaultValue: 'Key Visual Moments' })`],
  [`translate('Copy')`, `t('toolbar.copy', { ns: 'editor', defaultValue: 'Copy' })`],
  [`translate('Download')`, `t('toolbar.download', { ns: 'editor', defaultValue: 'Download' })`],
  
  // Tabs
  [`translate('Overview')`, `t('tabs.overview', { ns: 'editor', defaultValue: 'Overview' })`],
  [`translate('Characters')`, `t('tabs.characters', { ns: 'editor', defaultValue: 'Characters' })`],
  [`translate('Scenes')`, `t('tabs.scenes', { ns: 'editor', defaultValue: 'Scenes' })`],
  [`translate('Full Script')`, `t('tabs.fullScript', { ns: 'editor', defaultValue: 'Full Script' })`],
  
  // Messages
  [`translate("Success")`, `t('status.success', { ns: 'editor', defaultValue: 'Success' })`],
  [`translate("Error")`, `t('status.error', { ns: 'editor', defaultValue: 'Error' })`],
  [`translate("Characters generated successfully!")`, `t('messages.charactersGenerated', { ns: 'editor', defaultValue: 'Characters generated successfully!' })`],
  [`translate("Failed to generate characters.")`, `t('messages.failedToGenerateCharacters', { ns: 'editor', defaultValue: 'Failed to generate characters.' })`],
  [`translate("Scenes generated successfully!")`, `t('messages.scenesGenerated', { ns: 'editor', defaultValue: 'Scenes generated successfully!' })`],
  [`translate("Failed to generate scenes.")`, `t('messages.failedToGenerateScenes', { ns: 'editor', defaultValue: 'Failed to generate scenes.' })`],
  [`translate("Full script generated successfully!")`, `t('messages.fullScriptGenerated', { ns: 'editor', defaultValue: 'Full script generated successfully!' })`],
  [`translate("Failed to generate full script.")`, `t('messages.failedToGenerateFullScript', { ns: 'editor', defaultValue: 'Failed to generate full script.' })`],
  [`translate("Full script saved successfully!")`, `t('messages.fullScriptSaved', { ns: 'editor', defaultValue: 'Full script saved successfully!' })`],
  [`translate("Failed to save full script.")`, `t('messages.failedToSaveFullScript', { ns: 'editor', defaultValue: 'Failed to save full script.' })`],
];

function replaceInFile() {
  let content = fs.readFileSync(filePath, 'utf8');
  
  replacements.forEach(([oldStr, newStr]) => {
    const regex = new RegExp(oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, newStr);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Replacements completed!');
}

replaceInFile();
