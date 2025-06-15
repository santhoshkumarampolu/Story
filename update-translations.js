#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = '/Users/santhoshampolu/Story/src/app/editor/[projectId]/editor-client.tsx';

function updateTranslationCalls() {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Define a comprehensive mapping of translation keys
  const translationMap = [
    // Basic actions and status
    [/t\('Saving\.\.\.'\)/g, `t('status.saving', { ns: 'editor', defaultValue: 'Saving...' })`],
    [/t\('Save'\)/g, `t('toolbar.save', { ns: 'editor', defaultValue: 'Save' })`],
    [/t\('Generating\.\.\.'\)/g, `t('status.generating', { ns: 'editor', defaultValue: 'Generating...' })`],
    [/t\('Generate Treatment'\)/g, `t('actions.generateTreatment', { ns: 'editor', defaultValue: 'Generate Treatment' })`],
    [/t\('Generate Characters'\)/g, `t('actions.generateCharacters', { ns: 'editor', defaultValue: 'Generate Characters' })`],
    [/t\('Generate Scenes'\)/g, `t('actions.generateScenes', { ns: 'editor', defaultValue: 'Generate Scenes' })`],
    [/t\('Generate Full Script'\)/g, `t('actions.generateFullScript', { ns: 'editor', defaultValue: 'Generate Full Script' })`],
    [/t\('Save Character'\)/g, `t('actions.saveCharacter', { ns: 'editor', defaultValue: 'Save Character' })`],
    [/t\('Save Script'\)/g, `t('actions.saveScript', { ns: 'editor', defaultValue: 'Save Script' })`],
    [/t\('Add Character'\)/g, `t('actions.addCharacter', { ns: 'editor', defaultValue: 'Add Character' })`],
    [/t\('Add Scene'\)/g, `t('actions.addScene', { ns: 'editor', defaultValue: 'Add Scene' })`],
    [/t\('Generating Script\.\.\.'\)/g, `t('status.generatingScript', { ns: 'editor', defaultValue: 'Generating Script...' })`],
    
    // Placeholders
    [/t\("Write your treatment here\.\.\."\)/g, `t('placeholders.enterTreatment', { ns: 'editor', defaultValue: 'Write a detailed treatment of your story...' })`],
    [/t\("Character Name"\)/g, `t('placeholders.characterName', { ns: 'editor', defaultValue: 'Character Name' })`],
    [/t\("Description"\)/g, `t('placeholders.description', { ns: 'editor', defaultValue: 'Description' })`],
    [/t\("Backstory\.\.\."\)/g, `t('placeholders.backstory', { ns: 'editor', defaultValue: 'Backstory...' })`],
    [/t\("Motivation\.\.\."\)/g, `t('placeholders.motivation', { ns: 'editor', defaultValue: 'Motivation...' })`],
    [/t\("Scene Title"\)/g, `t('placeholders.sceneTitle', { ns: 'editor', defaultValue: 'Scene Title' })`],
    [/t\("Summary"\)/g, `t('placeholders.summary', { ns: 'editor', defaultValue: 'Summary' })`],
    [/t\("Generate or paste your full script here\.\.\."\)/g, `t('placeholders.generateOrPasteScript', { ns: 'editor', defaultValue: 'Generate or paste your full script here...' })`],
    
    // Labels
    [/t\('Genre'\)/g, `t('labels.genre', { ns: 'editor', defaultValue: 'Genre' })`],
    [/t\('Tone'\)/g, `t('labels.tone', { ns: 'editor', defaultValue: 'Tone' })`],
    [/t\('Select Genre'\)/g, `t('placeholders.selectGenre', { ns: 'editor', defaultValue: 'Select Genre' })`],
    [/t\('Select Tone'\)/g, `t('placeholders.selectTone', { ns: 'editor', defaultValue: 'Select Tone' })`],
    [/t\('Visual Style'\)/g, `t('labels.visualStyle', { ns: 'editor', defaultValue: 'Visual Style' })`],
    [/t\('Key Visual Moments'\)/g, `t('labels.keyVisualMoments', { ns: 'editor', defaultValue: 'Key Visual Moments' })`],
    [/t\('Copy'\)/g, `t('toolbar.copy', { ns: 'editor', defaultValue: 'Copy' })`],
    [/t\('Download'\)/g, `t('toolbar.download', { ns: 'editor', defaultValue: 'Download' })`],
    
    // Tabs
    [/t\('Overview'\)/g, `t('tabs.overview', { ns: 'editor', defaultValue: 'Overview' })`],
    [/t\('Characters'\)/g, `t('tabs.characters', { ns: 'editor', defaultValue: 'Characters' })`],
    [/t\('Scenes'\)/g, `t('tabs.scenes', { ns: 'editor', defaultValue: 'Scenes' })`],
    [/t\('Full Script'\)/g, `t('tabs.fullScript', { ns: 'editor', defaultValue: 'Full Script' })`],
    
    // Status messages
    [/t\("Success"\)/g, `t('status.success', { ns: 'editor', defaultValue: 'Success' })`],
    [/t\("Error"\)/g, `t('status.error', { ns: 'editor', defaultValue: 'Error' })`],
    [/t\("Characters generated successfully!"\)/g, `t('messages.charactersGenerated', { ns: 'editor', defaultValue: 'Characters generated successfully!' })`],
    [/t\("Scenes generated successfully!"\)/g, `t('messages.scenesGenerated', { ns: 'editor', defaultValue: 'Scenes generated successfully!' })`],
    [/t\("Full script generated successfully!"\)/g, `t('messages.fullScriptGenerated', { ns: 'editor', defaultValue: 'Full script generated successfully!' })`],
    [/t\("Full script saved successfully!"\)/g, `t('messages.fullScriptSaved', { ns: 'editor', defaultValue: 'Full script saved successfully!' })`],
    [/t\("Copied!"\)/g, `t('messages.copied', { ns: 'editor', defaultValue: 'Copied!' })`],
    [/t\("Downloaded"\)/g, `t('messages.downloaded', { ns: 'editor', defaultValue: 'Downloaded' })`],
    
    // Error messages
    [/t\("Failed to generate characters\."\)/g, `t('messages.failedToGenerateCharacters', { ns: 'editor', defaultValue: 'Failed to generate characters.' })`],
    [/t\("Failed to generate scenes\."\)/g, `t('messages.failedToGenerateScenes', { ns: 'editor', defaultValue: 'Failed to generate scenes.' })`],
    [/t\("Failed to generate full script\."\)/g, `t('messages.failedToGenerateFullScript', { ns: 'editor', defaultValue: 'Failed to generate full script.' })`],
    [/t\("Failed to save full script\."\)/g, `t('messages.failedToSaveFullScript', { ns: 'editor', defaultValue: 'Failed to save full script.' })`],
    [/t\("Scene not found\."\)/g, `t('messages.sceneNotFound', { ns: 'editor', defaultValue: 'Scene not found.' })`],
    [/t\("Full script is empty\."\)/g, `t('messages.scriptEmpty', { ns: 'editor', defaultValue: 'Full script is empty.' })`],
    [/t\("Nothing to copy"\)/g, `t('messages.nothingToCopy', { ns: 'editor', defaultValue: 'Nothing to copy' })`],
    [/t\("Nothing to download"\)/g, `t('messages.nothingToDownload', { ns: 'editor', defaultValue: 'Nothing to download' })`],
    [/t\("Nothing to save"\)/g, `t('messages.nothingToSave', { ns: 'editor', defaultValue: 'Nothing to save' })`],
    
    // Operations
    [/t\("Full Script Generation"\)/g, `t('operations.fullScriptGeneration', { ns: 'editor', defaultValue: 'Full Script Generation' })`],
    [/t\("Treatment Generation"\)/g, `t('operations.treatmentGeneration', { ns: 'editor', defaultValue: 'Treatment Generation' })`],
    [/t\("Idea Generation"\)/g, `t('operations.ideaGeneration', { ns: 'editor', defaultValue: 'Idea Generation' })`],
    [/t\("Logline Generation"\)/g, `t('operations.loglineGeneration', { ns: 'editor', defaultValue: 'Logline Generation' })`],
    [/t\("Character Generation"\)/g, `t('operations.characterGeneration', { ns: 'editor', defaultValue: 'Character Generation' })`],
    [/t\("Scene Generation"\)/g, `t('operations.sceneGeneration', { ns: 'editor', defaultValue: 'Scene Generation' })`],
    [/t\("Scene Script Generation"\)/g, `t('operations.sceneScriptGeneration', { ns: 'editor', defaultValue: 'Scene Script Generation' })`],
    [/t\("Scene Storyboard Generation"\)/g, `t('operations.sceneStoryboardGeneration', { ns: 'editor', defaultValue: 'Scene Storyboard Generation' })`],
    [/t\("Saving Full Script"\)/g, `t('operations.savingFullScript', { ns: 'editor', defaultValue: 'Saving Full Script' })`],
    [/t\("AI Generation"\)/g, `t('operations.aiGeneration', { ns: 'editor', defaultValue: 'AI Generation' })`],
    
    // UI Controls
    [/t\("Enable"\)/g, `t('labels.enable', { ns: 'editor', defaultValue: 'Enable' })`],
    [/t\("Disable"\)/g, `t('labels.disable', { ns: 'editor', defaultValue: 'Disable' })`],
    [/t\("Tenglish"\)/g, `t('labels.tenglish', { ns: 'editor', defaultValue: 'Tenglish' })`],
  ];
  
  // Apply all replacements
  translationMap.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Translation updates completed!');
}

updateTranslationCalls();
