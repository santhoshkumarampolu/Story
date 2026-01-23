'use client';

import { TranslationProvider, T, useTranslations } from '@/components/TranslationProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function TestContent({ userLanguage, setUserLanguage }: { 
  userLanguage: string; 
  setUserLanguage: (language: string) => void; 
}) {
  const { t } = useTranslations();
  
  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
      <div className="relative p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Multi-Language Support Test
            </h1>
            <p className="text-gray-400 mt-2">Testing the AI Story Studio translation system</p>
          </div>
          <LanguageSwitcher currentLanguage={userLanguage} onLanguageChange={setUserLanguage} />
        </div>
        
        {/* Status Card */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Translation System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Current Language:</strong> {userLanguage}</p>
            <p><strong>Translation Enabled:</strong> {userLanguage !== 'English' ? '✅ Yes' : '❌ No (Default English)'}</p>
            <p><strong>Display Format:</strong> {userLanguage !== 'English' ? 'Bilingual (English + Translation)' : 'English Only'}</p>
          </CardContent>
        </Card>
        
        {/* Common Translations */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Common UI Translations</CardTitle>
            <CardDescription className="text-gray-400">Navigation and button labels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-gray-800/50 rounded">
                  <strong>Navigation - Projects:</strong><br />
                  <T k="navigation.projects" ns="common" defaultValue="My Projects" />
                </div>
                <div className="p-3 bg-gray-800/50 rounded">
                  <strong>Navigation - New Project:</strong><br />
                  <T k="navigation.newProject" ns="common" defaultValue="New Project" />
                </div>
                <div className="p-3 bg-gray-800/50 rounded">
                  <strong>Button - Save:</strong><br />
                  <T k="buttons.save" ns="common" defaultValue="Save" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800/50 rounded">
                  <strong>Button - Cancel:</strong><br />
                  <T k="buttons.cancel" ns="common" defaultValue="Cancel" />
                </div>
                <div className="p-3 bg-gray-800/50 rounded">
                  <strong>Button - Delete:</strong><br />
                  <T k="buttons.delete" ns="common" defaultValue="Delete" />
                </div>
                <div className="p-3 bg-gray-800/50 rounded">
                  <strong>State - Loading:</strong><br />
                  <T k="states.loading" ns="common" defaultValue="Loading..." />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Project Translations */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Project-Specific Translations</CardTitle>
            <CardDescription className="text-gray-400">Project types and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-gray-800/50 rounded">
                  <strong>Header - Create Project:</strong><br />
                  <T k="headers.createProject" ns="projects" defaultValue="Create New Project" />
                </div>
                <div className="p-3 bg-gray-800/50 rounded">
                  <strong>Project Type - Short Film:</strong><br />
                  <T k="projectTypes.shortfilm" ns="projects" defaultValue="Short Film" />
                </div>
                <div className="p-3 bg-gray-800/50 rounded">
                  <strong>Project Type - Novel:</strong><br />
                  <T k="projectTypes.novel" ns="projects" defaultValue="Novel" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800/50 rounded">
                  <strong>Project Type - Short Story:</strong><br />
                  <T k="projectTypes.shortStory" ns="projects" defaultValue="Short Story" />
                </div>
                <div className="p-3 bg-gray-800/50 rounded">
                  <strong>Action - Choose Project Type:</strong><br />
                  <T k="actions.chooseProjectType" ns="projects" defaultValue="Choose your project type and give it a title" />
                </div>
                <div className="p-3 bg-gray-800/50 rounded">
                  <strong>Label - Project Title:</strong><br />
                  <T k="labels.projectTitle" ns="projects" defaultValue="Project Title" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Function-based Translations */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Dynamic Translation Examples</CardTitle>
            <CardDescription className="text-gray-400">Using the t() function for complex scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-gray-800/50 rounded">
                <strong>Simple Translation:</strong><br />
                {t('navigation.projects', { ns: 'common', defaultValue: 'My Projects' })}
              </div>
              <div className="p-3 bg-gray-800/50 rounded">
                <strong>Fallback to Default:</strong><br />
                {t('nonexistent.key', { ns: 'common', defaultValue: 'This is a fallback value' })}
              </div>
              <div className="p-3 bg-gray-800/50 rounded">
                <strong>Cross-namespace:</strong><br />
                Common: {t('buttons.save', { ns: 'common', defaultValue: 'Save' })} | 
                Projects: {t('projectTypes.novel', { ns: 'projects', defaultValue: 'Novel' })}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Instructions */}
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-blue-400">How to Test</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <ol className="list-decimal list-inside space-y-2">
              <li>Use the language switcher above to change between English, Telugu (తెలుగు), and Hindi (हिंदी)</li>
              <li>Notice how the translations appear in bilingual format: "English (Translation)"</li>
              <li>When set to English, only English text is shown</li>
              <li>When set to other languages, both English and translated text are displayed</li>
              <li>Navigate to <code>/dashboard/projects</code> and <code>/dashboard/projects/new</code> to see translations in action</li>
            </ol>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}

export default function TranslationTestPage() {
  const [userLanguage, setUserLanguage] = useState('English');
  
  return (
    <TranslationProvider key={userLanguage} targetLanguage={userLanguage} enabled={userLanguage !== 'English'}>
      <TestContent userLanguage={userLanguage} setUserLanguage={setUserLanguage} />
    </TranslationProvider>
  );
}
