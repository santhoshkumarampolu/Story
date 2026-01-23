'use client';

import { useState } from 'react';
import { TranslationProvider, T, useTranslations } from '@/components/TranslationProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TestEditorTranslationPage() {
  const [currentLanguage, setCurrentLanguage] = useState('English');

  return (
    <TranslationProvider key={currentLanguage} targetLanguage={currentLanguage} enabled={currentLanguage !== 'English'}>
      <div className="relative min-h-screen bg-black text-white">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
        <div className="relative p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  <T k="test.title" ns="common" defaultValue="Editor Translation Test" />
                </h1>
                <p className="text-gray-400 mt-2">
                  <T k="test.subtitle" ns="common" defaultValue="Testing Phase 3: Editor Interface Translations" />
                </p>
              </div>
              <LanguageSwitcher 
                currentLanguage={currentLanguage} 
                onLanguageChange={setCurrentLanguage} 
              />
            </div>

            <EditorTranslationDemo />
          </div>
        </div>
      </div>
    </TranslationProvider>
  );
}

function EditorTranslationDemo() {
  const { t } = useTranslations();

  return (
    <div className="space-y-8">
      {/* Tabs Section */}
      <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">
            <T k="test.tabsSection" ns="common" defaultValue="Tab Navigation" />
          </h2>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6 bg-white/5 backdrop-blur-md border border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <T k="tabs.overview" ns="editor" defaultValue="Overview" />
              </TabsTrigger>
              <TabsTrigger value="characters" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <T k="tabs.characters" ns="editor" defaultValue="Characters" />
              </TabsTrigger>
              <TabsTrigger value="scenes" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <T k="tabs.scenes" ns="editor" defaultValue="Scenes" />
              </TabsTrigger>
              <TabsTrigger value="fullScript" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <T k="tabs.fullScript" ns="editor" defaultValue="Full Script" />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <p className="text-gray-300">
                <T k="test.overviewContent" ns="common" defaultValue="Overview tab content with translations" />
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Toolbar Section */}
      <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">
            <T k="test.toolbarSection" ns="common" defaultValue="Toolbar Actions" />
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="text-purple-300 border-purple-300 hover:bg-purple-300/10">
              <T k="toolbar.save" ns="editor" defaultValue="Save" />
            </Button>
            <Button variant="outline" className="text-purple-300 border-purple-300 hover:bg-purple-300/10">
              <T k="toolbar.share" ns="editor" defaultValue="Share" />
            </Button>
            <Button variant="outline" className="text-purple-300 border-purple-300 hover:bg-purple-300/10">
              <T k="toolbar.download" ns="editor" defaultValue="Download" />
            </Button>
            <Button variant="outline" className="text-purple-300 border-purple-300 hover:bg-purple-300/10">
              <T k="toolbar.backToDashboard" ns="editor" defaultValue="Back to Dashboard" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Actions Section */}
      <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">
            <T k="test.aiActionsSection" ns="common" defaultValue="AI Generation Actions" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="ai" className="w-full">
              <T k="actions.generateIdea" ns="editor" defaultValue="Generate Idea" />
            </Button>
            <Button variant="ai" className="w-full">
              <T k="actions.generateLogline" ns="editor" defaultValue="Generate Logline" />
            </Button>
            <Button variant="ai" className="w-full">
              <T k="actions.generateTreatment" ns="editor" defaultValue="Generate Treatment" />
            </Button>
            <Button variant="ai" className="w-full">
              <T k="actions.generateCharacters" ns="editor" defaultValue="Generate Characters" />
            </Button>
            <Button variant="ai" className="w-full">
              <T k="actions.generateScenes" ns="editor" defaultValue="Generate Scenes" />
            </Button>
            <Button variant="ai" className="w-full">
              <T k="actions.generateFullScript" ns="editor" defaultValue="Generate Full Script" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Messages Section */}
      <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">
            <T k="test.statusSection" ns="common" defaultValue="Status Messages" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400">
                <T k="status.saved" ns="editor" defaultValue="Saved" />
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-400">
                <T k="status.generating" ns="editor" defaultValue="Generating..." />
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-400">
                <T k="status.saving" ns="editor" defaultValue="Saving..." />
              </p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400">
                <T k="status.error" ns="editor" defaultValue="Error occurred" />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Labels Section */}
      <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">
            <T k="test.labelsSection" ns="common" defaultValue="Form Labels" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <T k="labels.idea" ns="editor" defaultValue="Idea" />
              </label>
              <input 
                type="text" 
                className="w-full bg-white/10 border border-white/10 text-white rounded-md p-2"
                placeholder={t('placeholders.enterIdea', { ns: 'editor', defaultValue: 'Describe your story idea...' })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <T k="labels.logline" ns="editor" defaultValue="Logline" />
              </label>
              <input 
                type="text" 
                className="w-full bg-white/10 border border-white/10 text-white rounded-md p-2"
                placeholder={t('placeholders.enterLogline', { ns: 'editor', defaultValue: 'Enter your logline here...' })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <T k="labels.treatment" ns="editor" defaultValue="Treatment" />
              </label>
              <input 
                type="text" 
                className="w-full bg-white/10 border border-white/10 text-white rounded-md p-2"
                placeholder={t('placeholders.enterTreatment', { ns: 'editor', defaultValue: 'Write a detailed treatment of your story...' })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Section */}
      <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">
            <T k="test.messagesSection" ns="common" defaultValue="Success & Error Messages" />
          </h2>
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400">
                <T k="messages.ideaSaved" ns="editor" defaultValue="Idea saved successfully!" />
              </p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400">
                <T k="messages.charactersGenerated" ns="editor" defaultValue="Characters generated successfully!" />
              </p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400">
                <T k="errors.failedToSave" ns="editor" defaultValue="Failed to save" />
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-400">
                <T k="errors.tokenQuotaExceeded" ns="editor" defaultValue="Token quota exceeded. Upgrade your plan or wait for next month." />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Section */}
      <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">
            <T k="test.aiSection" ns="common" defaultValue="AI Operation Messages" />
          </h2>
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-400">
                <T k="ai.generating" ns="editor" defaultValue="AI is generating content..." />
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-400">
                <T k="ai.processing" ns="editor" defaultValue="AI is processing your request..." />
              </p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <p className="text-purple-400">
                <T k="ai.operationProgress" ns="editor" defaultValue="AI Operation Progress" />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translation Stats */}
      <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">
            <T k="test.statsSection" ns="common" defaultValue="Translation Statistics" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-400">3</p>
              <p className="text-gray-400">
                <T k="test.languages" ns="common" defaultValue="Languages" />
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">~80</p>
              <p className="text-gray-400">
                <T k="test.translationKeys" ns="common" defaultValue="Translation Keys" />
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">100%</p>
              <p className="text-gray-400">
                <T k="test.coverage" ns="common" defaultValue="UI Coverage" />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 