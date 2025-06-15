
export type ProjectType = 'shortfilm' | 'story' | 'screenplay' | 'novel' | 'shortstory' | 'synopsis' | 'short-story' | 'film-story';

export interface ProjectConfiguration {
  name: string;
  description: string;
  icon: string;
  workflow: string[];
  aiPrompts: {
    [key: string]: {
      system: string;
      temperature: number;
      maxTokens: number;
    };
  };
  labels: {
    [key: string]: string;
  };
  defaultStructure?: string;
  targetLength?: {
    min: number;
    max: number;
    unit: 'words' | 'pages' | 'minutes';
  };
}

export const PROJECT_CONFIGURATIONS: Record<ProjectType, ProjectConfiguration> = {
  'shortfilm': {
    name: 'Short Film',
    description: 'Create a compelling short film from concept to screen-ready script',
    icon: '🎬',
    workflow: ['idea', 'logline', 'treatment', 'characters', 'scenes', 'script', 'storyboard', 'production'],
    aiPrompts: {
      idea: {
        system: 'You are a creative film concept generator. Help develop compelling short film ideas that can be produced with limited resources but maximum impact. Focus on character-driven stories with clear visual potential.',
        temperature: 0.8,
        maxTokens: 500
      },
      logline: {
        system: 'You are a professional screenplay consultant. Create a compelling one-sentence logline that captures the protagonist, conflict, and stakes. Make it specific, intriguing, and marketable.',
        temperature: 0.7,
        maxTokens: 150
      },
      treatment: {
        system: 'You are an experienced screenwriter. Write a detailed treatment that expands the logline into a compelling narrative summary. Include the three-act structure, key plot points, and emotional journey.',
        temperature: 0.7,
        maxTokens: 1000
      },
      characters: {
        system: 'You are a character development expert. Create well-rounded characters with clear motivations, conflicts, and arcs. Focus on what makes them unique and how they serve the story.',
        temperature: 0.7,
        maxTokens: 800
      },
      scenes: {
        system: 'You are a film structure specialist. Break down the story into well-paced scenes that build tension and advance the plot. Include visual storytelling opportunities and production considerations.',
        temperature: 0.6,
        maxTokens: 1200
      }
    },
    labels: {
      idea: 'Film Concept',
      logline: 'Logline',
      treatment: 'Treatment',
      characters: 'Characters',
      scenes: 'Scene Breakdown',
      script: 'Screenplay',
      storyboard: 'Storyboard',
      production: 'Production Notes'
    },
    defaultStructure: 'three-act',
    targetLength: { min: 5, max: 30, unit: 'minutes' }
  },

  'story': {
    name: 'Short Story',
    description: 'Craft a compelling short story with rich characters and themes',
    icon: '📖',
    workflow: ['idea', 'genre', 'logline', 'theme', 'outline', 'characters', 'narrative-draft'],
    aiPrompts: {
      idea: {
        system: 'You are a literary fiction expert. Help develop compelling short story concepts that explore human nature, relationships, and meaningful themes. Focus on character-driven narratives with emotional depth.',
        temperature: 0.8,
        maxTokens: 500
      },
      genre: {
        system: 'You are a genre specialist. Help define the genre, tone, and style that best serves the story concept. Consider literary devices, narrative techniques, and reader expectations.',
        temperature: 0.6,
        maxTokens: 300
      },
      logline: {
        system: 'You are a literary editor. Create a compelling one-sentence summary that captures the essence of the story, its central conflict, and emotional core.',
        temperature: 0.7,
        maxTokens: 150
      },
      theme: {
        system: 'You are a literature professor. Help identify and develop the central themes, symbols, and deeper meanings that will give the story resonance and lasting impact.',
        temperature: 0.7,
        maxTokens: 400
      },
      outline: {
        system: 'You are a story structure expert. Create a detailed outline using story beats that build tension, develop character, and explore theme. Focus on pacing and emotional arc.',
        temperature: 0.6,
        maxTokens: 800
      },
      characters: {
        system: 'You are a character psychology expert. Develop complex, believable characters with clear motivations, flaws, and growth arcs. Focus on what makes them human and relatable.',
        temperature: 0.7,
        maxTokens: 600
      }
    },
    labels: {
      idea: 'Story Concept',
      genre: 'Genre & Tone',
      logline: 'Story Summary',
      theme: 'Themes',
      outline: 'Story Outline',
      characters: 'Characters',
      'narrative-draft': 'Draft'
    },
    targetLength: { min: 1000, max: 7500, unit: 'words' }
  },

  'shortstory': {
    name: 'Short Story',
    description: 'Craft a compelling short story with rich characters and themes',
    icon: '📖',
    workflow: ['idea', 'genre', 'logline', 'theme', 'outline', 'characters', 'narrative-draft'],
    aiPrompts: {
      idea: {
        system: 'You are a literary fiction expert. Help develop compelling short story concepts that explore human nature, relationships, and meaningful themes. Focus on character-driven narratives with emotional depth.',
        temperature: 0.8,
        maxTokens: 500
      },
      genre: {
        system: 'You are a genre specialist. Help define the genre, tone, and style that best serves the story concept. Consider literary devices, narrative techniques, and reader expectations.',
        temperature: 0.6,
        maxTokens: 300
      },
      logline: {
        system: 'You are a literary editor. Create a compelling one-sentence summary that captures the essence of the story, its central conflict, and emotional core.',
        temperature: 0.7,
        maxTokens: 150
      },
      theme: {
        system: 'You are a literature professor. Help identify and develop the central themes, symbols, and deeper meanings that will give the story resonance and lasting impact.',
        temperature: 0.7,
        maxTokens: 400
      },
      outline: {
        system: 'You are a story structure expert. Create a detailed outline using story beats that build tension, develop character, and explore theme. Focus on pacing and emotional arc.',
        temperature: 0.6,
        maxTokens: 800
      },
      characters: {
        system: 'You are a character psychology expert. Develop complex, believable characters with clear motivations, flaws, and growth arcs. Focus on what makes them human and relatable.',
        temperature: 0.7,
        maxTokens: 600
      }
    },
    labels: {
      idea: 'Story Concept',
      genre: 'Genre & Tone',
      logline: 'Story Summary',
      theme: 'Themes',
      outline: 'Story Outline',
      characters: 'Characters',
      'narrative-draft': 'Draft'
    },
    targetLength: { min: 1000, max: 7500, unit: 'words' }
  },

  'short-story': {
    name: 'Short Story',
    description: 'Craft a compelling short story with rich characters and themes',
    icon: '📖',
    workflow: ['idea', 'genre', 'logline', 'theme', 'outline', 'characters', 'narrative-draft'],
    aiPrompts: {
      idea: {
        system: 'You are a literary fiction expert. Help develop compelling short story concepts that explore human nature, relationships, and meaningful themes. Focus on character-driven narratives with emotional depth.',
        temperature: 0.8,
        maxTokens: 500
      },
      genre: {
        system: 'You are a genre specialist. Help define the genre, tone, and style that best serves the story concept. Consider literary devices, narrative techniques, and reader expectations.',
        temperature: 0.6,
        maxTokens: 300
      },
      logline: {
        system: 'You are a literary editor. Create a compelling one-sentence summary that captures the essence of the story, its central conflict, and emotional core.',
        temperature: 0.7,
        maxTokens: 150
      },
      theme: {
        system: 'You are a literature professor. Help identify and develop the central themes, symbols, and deeper meanings that will give the story resonance and lasting impact.',
        temperature: 0.7,
        maxTokens: 400
      },
      outline: {
        system: 'You are a story structure expert. Create a detailed outline using story beats that build tension, develop character, and explore theme. Focus on pacing and emotional arc.',
        temperature: 0.6,
        maxTokens: 800
      },
      characters: {
        system: 'You are a character psychology expert. Develop complex, believable characters with clear motivations, flaws, and growth arcs. Focus on what makes them human and relatable.',
        temperature: 0.7,
        maxTokens: 600
      }
    },
    labels: {
      idea: 'Story Concept',
      genre: 'Genre & Tone',
      logline: 'Story Summary',
      theme: 'Themes',
      outline: 'Story Outline',
      characters: 'Characters',
      'narrative-draft': 'Draft'
    },
    targetLength: { min: 1000, max: 7500, unit: 'words' }
  },

  'novel': {
    name: 'Novel',
    description: 'Develop a full-length novel with complex plot and character development',
    icon: '📚',
    workflow: ['idea', 'genre', 'logline', 'theme', 'outline', 'characters', 'world-building', 'chapters'],
    aiPrompts: {
      idea: {
        system: 'You are a bestselling novelist. Help develop compelling novel concepts with scope for complex character development, multiple plot threads, and rich world-building. Focus on ideas that can sustain a full-length narrative.',
        temperature: 0.8,
        maxTokens: 600
      },
      genre: {
        system: 'You are a publishing expert. Help define the genre, subgenres, target audience, and market positioning. Consider reader expectations, tropes, and opportunities for innovation.',
        temperature: 0.6,
        maxTokens: 400
      },
      logline: {
        system: 'You are a literary agent. Create a compelling pitch that captures the novel\'s unique premise, protagonist, and stakes. Make it marketable and memorable.',
        temperature: 0.7,
        maxTokens: 200
      },
      theme: {
        system: 'You are a literary critic. Help develop the central themes, philosophical questions, and deeper meanings that will give the novel depth and significance.',
        temperature: 0.7,
        maxTokens: 500
      },
      outline: {
        system: 'You are a plot structure expert. Create a comprehensive outline with major plot points, subplots, character arcs, and pacing. Consider the three-act or hero\'s journey structure.',
        temperature: 0.6,
        maxTokens: 1500
      },
      characters: {
        system: 'You are a character development master. Create a cast of complex, multi-dimensional characters with distinct voices, motivations, and relationships. Include protagonists, antagonists, and supporting characters.',
        temperature: 0.7,
        maxTokens: 1000
      },
      'world-building': {
        system: 'You are a world-building expert. Develop the setting, culture, history, and rules of the story world. Create a rich, believable environment that serves the narrative.',
        temperature: 0.7,
        maxTokens: 1000
      }
    },
    labels: {
      idea: 'Novel Concept',
      genre: 'Genre & Market',
      logline: 'Pitch',
      theme: 'Themes',
      outline: 'Plot Outline',
      characters: 'Character Profiles',
      'world-building': 'World Building',
      chapters: 'Chapter Breakdown'
    },
    targetLength: { min: 50000, max: 120000, unit: 'words' }
  },

  'screenplay': {
    name: 'Feature Screenplay',
    description: 'Write a full-length feature film screenplay with professional formatting',
    icon: '🎭',
    workflow: ['idea', 'logline', 'treatment', 'characters', 'scenes', 'script'],
    aiPrompts: {
      idea: {
        system: 'You are a Hollywood development executive. Help create compelling feature film concepts that have commercial appeal, clear three-act structure, and strong visual storytelling potential.',
        temperature: 0.8,
        maxTokens: 600
      },
      logline: {
        system: 'You are a professional script consultant. Write a marketable logline that clearly establishes the protagonist, central conflict, and what\'s at stake. Make it compelling enough to sell the script.',
        temperature: 0.7,
        maxTokens: 150
      },
      treatment: {
        system: 'You are an experienced screenwriter. Write a detailed treatment that tells the complete story with proper pacing, character development, and visual storytelling. Include all major plot points and turning moments.',
        temperature: 0.7,
        maxTokens: 2000
      },
      characters: {
        system: 'You are a character creation expert for film. Develop memorable, actable characters with clear wants, needs, and obstacles. Focus on how they drive the plot and create conflict.',
        temperature: 0.7,
        maxTokens: 1000
      },
      scenes: {
        system: 'You are a film structure specialist. Break the story into scenes that advance plot, develop character, and maintain pacing. Consider visual storytelling and production requirements.',
        temperature: 0.6,
        maxTokens: 1500
      }
    },
    labels: {
      idea: 'Film Concept',
      logline: 'Logline',
      treatment: 'Treatment',
      characters: 'Characters',
      scenes: 'Scene Breakdown',
      script: 'Screenplay'
    },
    defaultStructure: 'three-act',
    targetLength: { min: 90, max: 120, unit: 'pages' }
  },

  'synopsis': {
    name: 'Synopsis',
    description: 'Create a compelling synopsis for pitching your story or screenplay',
    icon: '📋',
    workflow: ['idea', 'logline', 'summary', 'characters', 'plot-points'],
    aiPrompts: {
      idea: {
        system: 'You are a story development expert. Help refine and clarify the core concept to make it as compelling and marketable as possible for synopsis purposes.',
        temperature: 0.7,
        maxTokens: 400
      },
      logline: {
        system: 'You are a pitch specialist. Create a powerful one-sentence hook that will grab attention and clearly communicate the story\'s unique appeal.',
        temperature: 0.7,
        maxTokens: 150
      },
      summary: {
        system: 'You are a professional synopsis writer. Create a compelling narrative summary that tells the complete story while highlighting the key dramatic moments and emotional journey.',
        temperature: 0.6,
        maxTokens: 800
      },
      characters: {
        system: 'You are a character specialist. Briefly but effectively introduce the main characters, their motivations, and their roles in the story for synopsis purposes.',
        temperature: 0.6,
        maxTokens: 400
      },
      'plot-points': {
        system: 'You are a story structure expert. Identify and articulate the key plot points, turning moments, and climactic elements that drive the narrative forward.',
        temperature: 0.6,
        maxTokens: 600
      }
    },
    labels: {
      idea: 'Core Concept',
      logline: 'Logline',
      summary: 'Synopsis',
      characters: 'Key Characters',
      'plot-points': 'Plot Points'
    },
    targetLength: { min: 500, max: 2000, unit: 'words' }
  },

  'film-story': {
    name: 'Film Story',
    description: 'Develop a story specifically crafted for film adaptation',
    icon: '🎥',
    workflow: ['idea', 'genre', 'logline', 'theme', 'treatment', 'characters', 'scenes', 'visual-elements'],
    aiPrompts: {
      idea: {
        system: 'You are a film story developer. Create concepts that are inherently visual and cinematic, with strong potential for film adaptation. Focus on stories that can be told through action and visuals.',
        temperature: 0.8,
        maxTokens: 500
      },
      genre: {
        system: 'You are a film genre expert. Help define the genre, tone, and visual style that will best serve the cinematic adaptation. Consider audience expectations and film conventions.',
        temperature: 0.6,
        maxTokens: 350
      },
      logline: {
        system: 'You are a film pitch specialist. Create a logline that emphasizes the visual and dramatic elements that would make this story compelling on screen.',
        temperature: 0.7,
        maxTokens: 150
      },
      theme: {
        system: 'You are a film thematic expert. Develop themes that can be expressed through visual storytelling, character actions, and cinematic metaphors.',
        temperature: 0.7,
        maxTokens: 400
      },
      treatment: {
        system: 'You are a film treatment writer. Create a narrative treatment that emphasizes visual storytelling, pacing, and cinematic moments. Focus on how the story will work on screen.',
        temperature: 0.7,
        maxTokens: 1200
      },
      characters: {
        system: 'You are a film character developer. Create characters that are visually interesting, have clear external goals, and whose internal conflicts can be shown through action and behavior.',
        temperature: 0.7,
        maxTokens: 800
      },
      scenes: {
        system: 'You are a cinematic storytelling expert. Structure scenes that are visually compelling, advance the plot efficiently, and create opportunities for strong film moments.',
        temperature: 0.6,
        maxTokens: 1000
      },
      'visual-elements': {
        system: 'You are a visual storytelling consultant. Identify key visual elements, symbols, settings, and cinematic opportunities that will enhance the story\'s film potential.',
        temperature: 0.7,
        maxTokens: 600
      }
    },
    labels: {
      idea: 'Story Concept',
      genre: 'Genre & Style',
      logline: 'Film Logline',
      theme: 'Cinematic Themes',
      treatment: 'Film Treatment',
      characters: 'Character Profiles',
      scenes: 'Scene Structure',
      'visual-elements': 'Visual Elements'
    },
    targetLength: { min: 15000, max: 40000, unit: 'words' }
  }
};

export function getProjectConfiguration(type: ProjectType): ProjectConfiguration {
  return PROJECT_CONFIGURATIONS[type] || PROJECT_CONFIGURATIONS['story'];
}

export function getInitialContent(type: string) {
  const config = getProjectConfiguration(type as ProjectType);
  
  switch (type) {
    case 'shortfilm':
      return {
        version: 1,
        structureType: 'three-act',
        idea: '',
        logline: '',
        treatment: '',
        characters: {
          create: [
            {
              name: 'Arjun',
              description: 'Main character description',
              motivation: '',
              backstory: '',
              arc: '',
              relationships: ''
            }
          ]
        },
        scenes: {
          create: [
            {
              title: 'Scene 1',
              summary: 'Opening scene',
              order: 0,
              act: 'act1',
              notes: '',
              version: 1
            }
          ]
        },
        cards: {
          create: [
            {
              type: 'shortfilm',
              content: '',
              order: 0
            }
          ]
        }
      };
    case 'story':
    case 'shortstory':
    case 'short-story':
      return {
        version: 1,
        idea: '',
        logline: '',
        genre: '',
        tone: '',
        theme: '',
        characters: {
          create: [
            {
              name: 'Priya',
              description: 'Main character description',
              motivation: '',
              backstory: '',
              arc: '',
              relationships: ''
            }
          ]
        },
        outlineBeats: {
          create: [
            {
              title: 'Opening',
              description: 'Story opening beat',
              order: 0,
              beatType: 'opening'
            }
          ]
        },
        narrativeDrafts: {
          create: [
            {
              title: 'First Draft',
              content: '',
              draftType: 'first',
              version: 1
            }
          ]
        },
        cards: {
          create: [
            {
              type: 'story',
              content: '',
              order: 0
            }
          ]
        }
      };
    case 'novel':
      return {
        version: 1,
        idea: '',
        logline: '',
        genre: '',
        tone: '',
        theme: '',
        worldBuilding: '',
        targetLength: 80000,
        characters: {
          create: [
            {
              name: 'Maya',
              description: 'Protagonist description',
              motivation: '',
              backstory: '',
              arc: '',
              relationships: ''
            }
          ]
        },
        outlineBeats: {
          create: [
            {
              title: 'Inciting Incident',
              description: 'The event that starts the main story',
              order: 0,
              beatType: 'inciting-incident'
            }
          ]
        },
        chapters: {
          create: [
            {
              title: 'Chapter 1',
              summary: 'Opening chapter',
              order: 0,
              content: '',
              wordCount: 0
            }
          ]
        },
        cards: {
          create: [
            {
              type: 'novel',
              content: '',
              order: 0
            }
          ]
        }
      };
    case 'screenplay':
      return {
        version: 1,
        idea: '',
        logline: '',
        treatment: '',
        structureType: 'three-act',
        characters: {
          create: [
            {
              name: 'Kiran',
              description: 'Main character description',
              motivation: '',
              backstory: '',
              arc: '',
              relationships: ''
            }
          ]
        },
        scenes: {
          create: [
            {
              title: 'Scene 1',
              summary: 'Opening scene',
              order: 0,
              act: 'act1',
              notes: '',
              version: 1
            }
          ]
        },
        cards: {
          create: [
            {
              type: 'screenplay',
              content: '',
              order: 0
            }
          ]
        }
      };
    case 'synopsis':
      return {
        version: 1,
        idea: '',
        logline: '',
        blurb: '',
        characters: {
          create: [
            {
              name: 'Alex',
              description: 'Central character',
              motivation: '',
              backstory: '',
              arc: '',
              relationships: ''
            }
          ]
        },
        cards: {
          create: [
            {
              type: 'synopsis',
              content: '',
              order: 0
            }
          ]
        }
      };
    case 'film-story':
      return {
        version: 1,
        idea: '',
        logline: '',
        treatment: '',
        genre: '',
        tone: '',
        theme: '',
        characters: {
          create: [
            {
              name: 'Rohan',
              description: 'Lead character',
              motivation: '',
              backstory: '',
              arc: '',
              relationships: ''
            }
          ]
        },
        scenes: {
          create: [
            {
              title: 'Opening Scene',
              summary: 'Visual opening',
              order: 0,
              act: 'act1',
              notes: '',
              version: 1
            }
          ]
        },
        cards: {
          create: [
            {
              type: 'film-story',
              content: '',
              order: 0
            }
          ]
        }
      };
    default:
      return {
        version: 1,
        idea: '',
        logline: '',
        characters: {
          create: [
            {
              name: 'Meera',
              description: 'Main character description',
              motivation: '',
              backstory: '',
              arc: '',
              relationships: ''
            }
          ]
        },
        cards: {
          create: [
            {
              type: 'general',
              content: '',
              order: 0
            }
          ]
        }
      };
  }
}
