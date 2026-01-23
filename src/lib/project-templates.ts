
export type ProjectType = 'shortfilm' | 'screenplay' | 'novel' | 'shortstory' | 'webseries' | 'documentary' | 'podcast';

export interface ProjectConfiguration {
  name: string;
  description: string;
  icon: string;
  tagline: string; // Short catchy tagline
  bestFor: string[]; // Who should use this
  workflow: string[];
  outputFormats: string[]; // What users get at the end
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
    unit: 'words' | 'pages' | 'minutes' | 'episodes';
  };
  industryStandard?: string; // Reference to industry format
}

export const PROJECT_CONFIGURATIONS: Record<ProjectType, ProjectConfiguration> = {
  'shortfilm': {
    name: 'Short Film',
    description: 'Create a production-ready short film from concept to final screenplay with scene breakdowns and storyboard notes',
    tagline: 'From idea to action! 🎬',
    icon: '🎬',
    bestFor: ['Film students', 'Independent filmmakers', 'Film festival submissions', 'Portfolio pieces'],
    outputFormats: ['Screenplay (industry format)', 'Scene breakdown', 'Shot list', 'Character profiles'],
    workflow: ['idea', 'logline', 'treatment', 'theme', 'characters', 'scenes', 'script', 'storyboard'],
    aiPrompts: {
      idea: {
        system: `You are a short film concept specialist. Create ideas that:
- Can be filmed with limited budget and locations (1-3 locations ideal)
- Have strong visual storytelling potential
- Feature 2-5 main characters maximum
- Can be told in 5-30 minutes
- Have a clear beginning, middle, and end
- Focus on a single, powerful emotional beat or theme
- Consider practical production constraints`,
        temperature: 0.8,
        maxTokens: 600
      },
      logline: {
        system: `You are a short film pitch expert. Create a logline that:
- Follows the format: When [inciting incident], a [specific protagonist] must [goal] before [stakes/deadline]
- Is 25-35 words maximum
- Creates immediate intrigue
- Suggests the genre and tone
- Makes the reader want to see the film
- Avoids clichés and generic descriptions`,
        temperature: 0.7,
        maxTokens: 150
      },
      treatment: {
        system: `You are an experienced short film screenwriter. Write a treatment that:
- Uses present tense, active voice
- Is 1-2 pages (500-1000 words)
- Includes all major plot points
- Shows the emotional journey clearly
- Describes key visual moments
- Maintains the tone throughout
- Sets up and pays off story elements`,
        temperature: 0.7,
        maxTokens: 1200
      },
      theme: {
        system: `You are a film thematic consultant. Identify 2-3 interconnected themes that:
- Can be shown visually (show don't tell)
- Resonate universally
- Support the character's journey
- Create subtext and depth
- Can be expressed through imagery, dialogue, and action`,
        temperature: 0.7,
        maxTokens: 400
      },
      characters: {
        system: `You are a character development expert for short films. Create characters that:
- Have clear, specific goals and obstacles
- Can be established quickly (limited screen time)
- Have distinctive voices and behaviors
- Serve the story's theme
- Have at least one surprising trait
- Feel authentic and three-dimensional despite limited time`,
        temperature: 0.7,
        maxTokens: 800
      },
      scenes: {
        system: `You are a short film structure specialist. Break the story into scenes that:
- Follow proper screenplay scene heading format (INT./EXT. LOCATION - DAY/NIGHT)
- Advance plot AND character in every scene
- Start late, end early (no fat)
- Create visual variety
- Build tension progressively
- Consider production feasibility (locations, cast size)
- Include emotional beats and turning points`,
        temperature: 0.6,
        maxTokens: 1500
      },
      script: {
        system: `You are a professional short film screenwriter. Write in industry-standard format:
- Scene headings: INT./EXT. LOCATION - DAY/NIGHT
- Action lines: Present tense, concise, visual
- Character names: CAPS on first appearance
- Dialogue: Character-specific voices
- Parentheticals: Sparingly, only when necessary
- One page = approximately one minute of screen time
- White space is your friend`,
        temperature: 0.7,
        maxTokens: 3000
      }
    },
    labels: {
      idea: 'Film Concept',
      logline: 'Logline',
      treatment: 'Treatment',
      theme: 'Themes & Motifs',
      characters: 'Character Profiles',
      scenes: 'Scene Breakdown',
      script: 'Screenplay',
      storyboard: 'Storyboard Notes'
    },
    defaultStructure: 'three-act',
    targetLength: { min: 5, max: 30, unit: 'minutes' },
    industryStandard: 'Standard screenplay format (Final Draft compatible)'
  },

  'screenplay': {
    name: 'Feature Screenplay',
    description: 'Write a professional feature-length screenplay (90-120 pages) ready for submission to studios, agents, and competitions',
    tagline: 'Your feature film starts here 🎭',
    icon: '🎭',
    bestFor: ['Aspiring screenwriters', 'Film competitions', 'Studio pitches', 'Spec scripts'],
    outputFormats: ['Feature screenplay', 'Beat sheet', 'Character bible', 'Pitch document'],
    workflow: ['idea', 'logline', 'synopsis', 'beat-sheet', 'treatment', 'characters', 'world-building', 'scenes', 'script'],
    aiPrompts: {
      idea: {
        system: `You are a Hollywood development executive. Create feature film concepts that:
- Have clear commercial appeal or strong artistic vision
- Can sustain a 90-120 minute runtime
- Have franchise or sequel potential (if commercial)
- Feature a compelling protagonist with a transformative arc
- Include A, B, and potentially C storylines
- Fit within a recognizable genre (or blend genres intentionally)
- Have "trailer moments" - scenes you can visualize in a trailer`,
        temperature: 0.8,
        maxTokens: 700
      },
      logline: {
        system: `You are a professional script consultant and pitch specialist. Create a logline that:
- Is exactly 1-2 sentences (25-40 words)
- Identifies genre, tone, and stakes immediately
- Features an ironic or intriguing hook
- Could appear in trade publications
- Makes executives want to read the script
- Avoids words like "must" and "before it's too late"`,
        temperature: 0.7,
        maxTokens: 150
      },
      synopsis: {
        system: `You are a synopsis writer for major studios. Create a synopsis that:
- Is 1-2 pages (400-800 words)
- Tells the COMPLETE story including the ending
- Highlights the emotional journey
- Shows the three-act structure clearly
- Uses engaging, present-tense prose
- Captures the movie's unique voice and tone`,
        temperature: 0.7,
        maxTokens: 1000
      },
      'beat-sheet': {
        system: `You are a story structure expert using the Blake Snyder Beat Sheet method. Create beats:
1. Opening Image (1) - Sets tone, before snapshot
2. Theme Stated (5) - Subtle theme introduction  
3. Set-Up (1-10) - Introduce protagonist's world
4. Catalyst (12) - Life-changing event
5. Debate (12-25) - Protagonist hesitates
6. Break into Two (25) - Commits to journey
7. B Story (30) - Love story/friendship begins
8. Fun and Games (30-55) - Promise of the premise
9. Midpoint (55) - False victory or defeat
10. Bad Guys Close In (55-75) - External/internal pressure
11. All Is Lost (75) - Whiff of death
12. Dark Night of the Soul (75-85) - Lowest point
13. Break into Three (85) - Solution found
14. Finale (85-110) - Synthesis, final battle
15. Final Image (110) - After snapshot, transformation shown`,
        temperature: 0.6,
        maxTokens: 2000
      },
      treatment: {
        system: `You are a treatment writer for A-list productions. Write a treatment that:
- Is 8-15 pages (3000-6000 words)
- Reads like a short story but feels like a movie
- Includes key dialogue moments (not full dialogue)
- Shows character development and arc
- Describes important visual sequences
- Maintains consistent tone and voice
- Builds to a satisfying climax`,
        temperature: 0.7,
        maxTokens: 6000
      },
      characters: {
        system: `You are a character development master for feature films. Create characters with:
- Clear wants (external goal) and needs (internal goal)
- A wound or ghost from the past
- A lie they believe at the start
- A truth they must learn
- Distinctive speech patterns and physicality
- Meaningful relationships that challenge them
- A complete arc from who they are to who they become`,
        temperature: 0.7,
        maxTokens: 1500
      },
      'world-building': {
        system: `You are a production designer and world-building consultant. Define:
- Time period and specific year(s)
- Geographic location(s) with cultural specifics
- Social/political context affecting characters
- Rules of the world (especially for genre films)
- Visual motifs and color palette
- Key locations and their significance
- Technology and communication methods
- Economic and class structures`,
        temperature: 0.7,
        maxTokens: 1200
      },
      scenes: {
        system: `You are a feature film structure specialist. Create a scene breakdown that:
- Contains 40-60 scenes for a feature
- Alternates tension and release
- Varies locations and times of day
- Includes all major story beats
- Shows clear act breaks
- Balances action, dialogue, and emotional scenes
- Creates sequences (groups of scenes building to mini-climaxes)`,
        temperature: 0.6,
        maxTokens: 3000
      },
      script: {
        system: `You are a WGA-level professional screenwriter. Write in industry-standard format:
- 90-120 pages (one page = one minute)
- Scene headings, action, character, dialogue, parenthetical, transition
- Lean action lines (3-4 lines max per paragraph)
- Subtext in dialogue (what's not said)
- Visual storytelling over exposition
- Proper use of (V.O.), (O.S.), (CONT'D)
- White space for readability
- Save the Cat! structure principles`,
        temperature: 0.7,
        maxTokens: 8000
      }
    },
    labels: {
      idea: 'Concept & Premise',
      logline: 'Logline',
      synopsis: 'Synopsis',
      'beat-sheet': 'Beat Sheet',
      treatment: 'Treatment',
      characters: 'Character Bible',
      'world-building': 'World Building',
      scenes: 'Scene Breakdown',
      script: 'Screenplay'
    },
    defaultStructure: 'three-act',
    targetLength: { min: 90, max: 120, unit: 'pages' },
    industryStandard: 'WGA/Industry standard screenplay format'
  },

  'shortstory': {
    name: 'Short Story',
    description: 'Craft a literary short story with rich prose, compelling characters, and meaningful themes for publication or personal expression',
    tagline: 'Every word counts ✍️',
    icon: '📖',
    bestFor: ['Literary magazines', 'Anthologies', 'Writing contests', 'Personal projects', 'MFA portfolios'],
    outputFormats: ['Polished prose narrative', 'Character sketches', 'Thematic analysis'],
    workflow: ['idea', 'premise', 'theme', 'characters', 'outline', 'narrative-draft', 'revision'],
    aiPrompts: {
      idea: {
        system: `You are a literary fiction expert and MFA instructor. Help develop short story concepts that:
- Explore a specific moment of change or revelation
- Focus on character interiority and psychology
- Have a clear "aboutness" beyond plot
- Can be told effectively in 1,500-7,500 words
- Feature a distinctive narrative voice
- Offer fresh perspective on universal experiences
- Avoid clichéd situations and predictable endings`,
        temperature: 0.8,
        maxTokens: 500
      },
      premise: {
        system: `You are a story premise specialist. Create a premise that:
- Captures the central situation in 1-2 sentences
- Identifies the main character and their conflict
- Suggests the story's emotional territory
- Hints at what's at stake (internal or external)
- Indicates the story's tone and approach
- Creates curiosity without revealing the ending`,
        temperature: 0.7,
        maxTokens: 200
      },
      theme: {
        system: `You are a literature professor specializing in contemporary fiction. Develop themes that:
- Emerge organically from character and situation
- Operate on multiple levels (personal, social, universal)
- Can be explored through concrete details and scenes
- Avoid being preachy or on-the-nose
- Connect to enduring human concerns
- Allow for ambiguity and complexity
- Can be expressed through imagery and symbol`,
        temperature: 0.7,
        maxTokens: 500
      },
      characters: {
        system: `You are a character psychologist for literary fiction. Create characters with:
- Specific, vivid physical details (not generic descriptions)
- Contradictions and complexity
- A unique way of seeing the world
- Desires they may not fully understand
- Relationships that reveal who they are
- Mannerisms, habits, and speech patterns
- A backstory that informs present behavior
- Room to surprise the reader (and themselves)`,
        temperature: 0.7,
        maxTokens: 800
      },
      outline: {
        system: `You are a story structure consultant for literary fiction. Create an outline that:
- Uses the "Freytag's Pyramid" or "moment of change" structure
- Identifies the inciting incident or disturbance
- Shows rising tension through complications
- Builds to an epiphany or turning point
- Allows for resonant ending (not necessarily resolved)
- Balances scene and summary
- Notes POV and tense choices
- Identifies key images and motifs`,
        temperature: 0.6,
        maxTokens: 800
      },
      'narrative-draft': {
        system: `You are an award-winning short story writer. Write prose that:
- Has a distinctive, consistent narrative voice
- Uses specific, sensory details
- Balances interiority with external action
- Employs varied sentence rhythms
- Shows rather than tells (when appropriate)
- Uses dialogue that reveals character
- Creates subtext and resonance
- Earns its emotional moments
- Has a satisfying (not necessarily happy) ending`,
        temperature: 0.75,
        maxTokens: 4000
      }
    },
    labels: {
      idea: 'Story Seed',
      premise: 'Premise',
      theme: 'Themes & Symbols',
      characters: 'Character Profiles',
      outline: 'Story Structure',
      'narrative-draft': 'Draft',
      revision: 'Revision Notes'
    },
    targetLength: { min: 1500, max: 7500, unit: 'words' },
    industryStandard: 'Standard manuscript format (Shunn)'
  },

  'novel': {
    name: 'Novel',
    description: 'Develop a full-length novel with complex plotting, deep characterization, and rich world-building for traditional or self-publishing',
    tagline: 'Your epic story awaits 📚',
    icon: '📚',
    bestFor: ['Traditional publishing', 'Self-publishing', 'NaNoWriMo', 'Long-form storytelling'],
    outputFormats: ['Full manuscript', 'Chapter outline', 'Character bible', 'World-building bible', 'Query letter'],
    workflow: ['idea', 'genre', 'premise', 'theme', 'characters', 'world-building', 'plot-outline', 'chapter-breakdown', 'first-draft'],
    aiPrompts: {
      idea: {
        system: `You are a bestselling novelist and book development editor. Create novel concepts that:
- Can sustain 60,000-120,000 words
- Have a compelling hook that fits in one sentence
- Feature a protagonist readers will root for
- Include at least one fresh or unique element
- Have clear stakes that escalate
- Fit into a marketable genre or category
- Have series potential (if desired)
- Balance commercial appeal with artistic integrity`,
        temperature: 0.8,
        maxTokens: 700
      },
      genre: {
        system: `You are a publishing industry expert. Define the genre positioning:
- Primary genre and key subgenres
- Comparable titles ("comp titles") - 2-3 recent books
- Target audience demographics and psychographics
- Reader expectations for this genre
- Tropes to embrace or subvert
- Word count expectations
- Market trends and opportunities
- Cross-genre possibilities`,
        temperature: 0.6,
        maxTokens: 600
      },
      premise: {
        system: `You are a literary agent. Create a premise statement that:
- Could appear in a query letter
- Is 2-3 sentences maximum
- Identifies protagonist, conflict, and stakes
- Shows what makes this book unique
- Indicates genre and tone
- Creates a "need to read more" feeling
- Avoids rhetorical questions`,
        temperature: 0.7,
        maxTokens: 250
      },
      theme: {
        system: `You are a thematic development consultant. Develop themes that:
- Emerge through character and plot
- Have both universal and specific dimensions
- Can be explored from multiple angles
- Create meaningful subplots
- Inform character arcs and decisions
- Resonate with the target readership
- Allow for nuance and debate
- Can sustain a novel-length exploration`,
        temperature: 0.7,
        maxTokens: 600
      },
      characters: {
        system: `You are a character development master for novels. Create:
- Protagonist with clear arc from beginning to end
- Antagonist with understandable (if not sympathetic) motivation
- 3-5 key supporting characters with their own mini-arcs
- Relationship dynamics that create conflict and growth
- Character voice distinctions (could you identify them by dialogue alone?)
- Backstory that informs but doesn't overwhelm
- Secrets and lies that drive plot
- Growth and change for main characters`,
        temperature: 0.7,
        maxTokens: 2000
      },
      'world-building': {
        system: `You are a world-building architect for novels. Create:
- Setting that feels like a character itself
- Specific, sensory details of place
- Social structures and power dynamics
- History that affects present events
- Rules (especially for fantasy/sci-fi)
- Cultural elements (food, clothing, customs)
- Geography and how it affects characters
- Economy and class structures
- Technology and its limitations`,
        temperature: 0.7,
        maxTokens: 1500
      },
      'plot-outline': {
        system: `You are a plot architect using multiple structure methods. Create an outline using:
- Three-Act Structure foundation
- Seven-Point Story Structure for major beats
- Multiple plotlines (A-story, B-story, C-story)
- Subplot integration
- Foreshadowing and payoff tracking
- Pinch points and reversals
- Midpoint shift
- Climax and resolution
- Chapter-by-chapter can come later`,
        temperature: 0.6,
        maxTokens: 2500
      },
      'chapter-breakdown': {
        system: `You are a novel structure specialist. Create chapter breakdown:
- 20-40 chapters typical for most novels
- Each chapter has a purpose (plot/character/both)
- Chapter hooks and chapter endings
- POV assignments (if multiple POV)
- Timeline tracking
- Word count targets per chapter (2,000-5,000)
- Cliffhangers and breathing room balance
- Pacing variation (action/reflection)`,
        temperature: 0.6,
        maxTokens: 3000
      }
    },
    labels: {
      idea: 'Novel Concept',
      genre: 'Genre & Market',
      premise: 'Premise',
      theme: 'Themes',
      characters: 'Character Bible',
      'world-building': 'World Building',
      'plot-outline': 'Plot Outline',
      'chapter-breakdown': 'Chapter Breakdown',
      'first-draft': 'Manuscript'
    },
    targetLength: { min: 60000, max: 120000, unit: 'words' },
    industryStandard: 'Standard manuscript format (12pt Times New Roman, double-spaced)'
  },

  'webseries': {
    name: 'Web Series',
    description: 'Create a binge-worthy web series with episodic structure, season arcs, and cliffhangers designed for streaming platforms',
    tagline: 'Make them binge! 📺',
    icon: '📺',
    bestFor: ['YouTube creators', 'Streaming pitches', 'Digital content', 'Serialized storytelling'],
    outputFormats: ['Series bible', 'Pilot script', 'Episode outlines', 'Season arc'],
    workflow: ['concept', 'series-logline', 'format', 'characters', 'season-arc', 'pilot-outline', 'episode-breakdown', 'pilot-script'],
    aiPrompts: {
      concept: {
        system: `You are a streaming content development executive. Create web series concepts that:
- Have a strong, repeatable premise ("engine")
- Work in 10-30 minute episode formats
- Feature ensemble or single protagonist structure
- Have built-in conflict renewal each episode
- Are "scrollable" - hook in first 30 seconds
- Appeal to digital-native audiences
- Have viral/shareable moments
- Can sustain multiple seasons`,
        temperature: 0.8,
        maxTokens: 600
      },
      'series-logline': {
        system: `You are a pitch deck specialist. Create a series logline that:
- Establishes the world/premise in the first clause
- Introduces the central character(s)
- Suggests the episode "engine" (what happens each episode)
- Hints at season-long stakes
- Is social media friendly (tweetable length)
- Creates immediate "I'd watch that" reaction`,
        temperature: 0.7,
        maxTokens: 150
      },
      format: {
        system: `You are a format development expert. Define the series format:
- Episode length (optimal for platform)
- Episode structure (cold open, acts, tag)
- Tone and visual style
- Genre and target demographic
- Comparable shows for pitch
- Release strategy (weekly/binge)
- Platform considerations (YouTube, streaming, etc.)
- Budget tier and production scope`,
        temperature: 0.6,
        maxTokens: 500
      },
      characters: {
        system: `You are a TV character developer. Create series regulars that:
- Have distinct, memorable personalities
- Generate conflict when together
- Each have their own goals and arcs
- Offer different audience identification points
- Have secrets that can be revealed over seasons
- Support comedic AND dramatic moments
- Could carry their own episode
- Have clear relationships and dynamics`,
        temperature: 0.7,
        maxTokens: 1200
      },
      'season-arc': {
        system: `You are a TV showrunner. Plan a season arc that:
- Has a clear season-long question/mystery/goal
- Builds episode to episode
- Features mid-season twist
- Has character arcs across the season
- Balances serialized and episodic elements
- Ends with satisfying-but-wanting-more finale
- Sets up future seasons
- Includes 8-12 episode breakdown`,
        temperature: 0.7,
        maxTokens: 1500
      },
      'pilot-outline': {
        system: `You are a pilot development expert. Create a pilot outline that:
- Hooks the audience in the first scene
- Establishes the world efficiently
- Introduces main characters memorably
- Sets up the series premise/engine
- Has a complete A-story
- Plants seeds for season arc
- Ends with a reason to watch episode 2
- Shows the "promise of the premise"`,
        temperature: 0.7,
        maxTokens: 1000
      },
      'episode-breakdown': {
        system: `You are a TV writer's room leader. Create episode loglines that:
- Each have a clear A-story and B-story
- Build on the season arc
- Develop different characters each episode
- Alternate episode types (action, character, mythology)
- Include mid-season and finale descriptions
- Track running storylines
- Note cliffhangers and reveals`,
        temperature: 0.6,
        maxTokens: 1500
      },
      'pilot-script': {
        system: `You are a TV pilot writer. Write a pilot script that:
- Follows TV script format (teaser + 3-4 acts)
- Has a cold open that hooks immediately
- Introduces characters through action, not exposition
- Establishes the "world rules"
- Completes a satisfying story while opening larger questions
- Ends with a strong pilot ending (twist, cliffhanger, or emotional beat)
- Is written for the episode length (pages = minutes)`,
        temperature: 0.7,
        maxTokens: 4000
      }
    },
    labels: {
      concept: 'Series Concept',
      'series-logline': 'Series Logline',
      format: 'Format & Style',
      characters: 'Series Regulars',
      'season-arc': 'Season Arc',
      'pilot-outline': 'Pilot Outline',
      'episode-breakdown': 'Episode Guide',
      'pilot-script': 'Pilot Script'
    },
    targetLength: { min: 6, max: 12, unit: 'episodes' },
    industryStandard: 'TV script format (cold open + acts)'
  },

  'documentary': {
    name: 'Documentary',
    description: 'Develop a compelling documentary with research, interview plans, and narrative structure that brings real stories to life',
    tagline: 'Tell the real story 🎙️',
    icon: '🎥',
    bestFor: ['Documentary filmmakers', 'Journalists', 'Non-fiction storytellers', 'Grant applications'],
    outputFormats: ['Treatment', 'Interview questions', 'Shot list', 'Research document', 'Pitch deck'],
    workflow: ['subject', 'angle', 'research', 'characters', 'structure', 'interview-plan', 'visual-approach', 'treatment'],
    aiPrompts: {
      subject: {
        system: `You are a documentary development consultant. Help define the subject:
- What is the specific topic, person, or event?
- Why now? (timeliness and relevance)
- What's the access situation?
- Who are the potential subjects/interviewees?
- What's the geographic scope?
- What archives/footage might exist?
- What's unique about this approach?
- What questions will you answer?`,
        temperature: 0.7,
        maxTokens: 600
      },
      angle: {
        system: `You are a documentary angle specialist. Define the angle that:
- Distinguishes this from other docs on the topic
- Has a clear point of view (without being propaganda)
- Raises meaningful questions
- Has emotional and intellectual hooks
- Can be expressed in one sentence
- Appeals to target audience
- Has festival/distribution potential`,
        temperature: 0.7,
        maxTokens: 400
      },
      research: {
        system: `You are a documentary research consultant. Create a research plan:
- Primary sources to pursue
- Secondary sources and archives
- Expert interviews needed
- Data and statistics to gather
- Timeline of events (if historical)
- Key facts to verify
- Opposing viewpoints to explore
- Gaps in existing coverage`,
        temperature: 0.6,
        maxTokens: 800
      },
      characters: {
        system: `You are a documentary casting consultant. Identify subjects/characters:
- Main subject(s) - their story and access
- Supporting subjects who add perspective
- Expert voices for context
- Opposing viewpoints for balance
- What makes each person compelling on camera?
- What do they add to the narrative?
- Access and consent considerations`,
        temperature: 0.7,
        maxTokens: 800
      },
      structure: {
        system: `You are a documentary structure specialist. Create a structure using:
- Act structure (typically 3 acts)
- Chronological vs. thematic organization
- Opening hook
- Key reveals and turning points
- Emotional arc for the viewer
- How threads weave together
- Ending that lands with impact
- Runtime considerations`,
        temperature: 0.6,
        maxTokens: 1000
      },
      'interview-plan': {
        system: `You are a documentary interview specialist. Create interview guides:
- Questions for each subject (open-ended)
- Follow-up prompts for deeper answers
- Emotional questions to ask carefully
- Factual questions for clarity
- Questions that might surprise
- Questions you hope they refuse (reveals character)
- Technical setup notes
- Pre-interview research needed`,
        temperature: 0.7,
        maxTokens: 1200
      },
      'visual-approach': {
        system: `You are a documentary cinematography consultant. Define visual approach:
- Interview style (talking heads, walk-and-talks, etc.)
- B-roll needs and locations
- Archival footage strategy
- Animation/graphics needs
- Verité vs. constructed scenes
- Reenactment policy (if any)
- Color and mood
- Equipment and technical approach`,
        temperature: 0.7,
        maxTokens: 600
      },
      treatment: {
        system: `You are a documentary treatment writer. Write a treatment that:
- Opens with the hook
- Establishes the subject and stakes
- Introduces main characters
- Outlines the narrative journey
- Describes key scenes and moments
- Notes visual style
- Addresses the "so what?" question
- Is 5-10 pages for feature doc
- Would work as a pitch document`,
        temperature: 0.7,
        maxTokens: 2000
      }
    },
    labels: {
      subject: 'Subject & Topic',
      angle: 'Angle & POV',
      research: 'Research Plan',
      characters: 'Subjects & Voices',
      structure: 'Narrative Structure',
      'interview-plan': 'Interview Guide',
      'visual-approach': 'Visual Approach',
      treatment: 'Treatment'
    },
    targetLength: { min: 30, max: 120, unit: 'minutes' },
    industryStandard: 'Documentary treatment format'
  },

  'podcast': {
    name: 'Podcast Script',
    description: 'Create engaging podcast episodes with research, scripts, and show notes for narrative or interview-based audio content',
    tagline: 'Be heard 🎧',
    icon: '🎙️',
    bestFor: ['Podcasters', 'Audio storytellers', 'Journalists', 'Content creators'],
    outputFormats: ['Episode script', 'Show notes', 'Interview questions', 'Research document'],
    workflow: ['concept', 'format', 'episode-topic', 'research', 'outline', 'script', 'show-notes'],
    aiPrompts: {
      concept: {
        system: `You are a podcast development consultant. Create a podcast concept that:
- Has a clear niche and point of view
- Differentiates from existing podcasts
- Has a sustainable episode engine
- Appeals to a specific audience
- Has strong host personality fit
- Works in the chosen format
- Has monetization potential
- Can build a community around it`,
        temperature: 0.8,
        maxTokens: 600
      },
      format: {
        system: `You are a podcast format specialist. Define the format:
- Episode length (sweet spot for genre)
- Solo, co-hosted, or interview format
- Segment structure
- Recurring elements/segments
- Intro/outro approach
- Music and sound design notes
- Release schedule
- Season vs. ongoing structure`,
        temperature: 0.6,
        maxTokens: 500
      },
      'episode-topic': {
        system: `You are a podcast content strategist. Develop episode topics that:
- Fit the show's niche
- Have a clear hook and title
- Can be summarized in one sentence
- Have enough depth for episode length
- Will interest the target audience
- Have SEO/discoverability potential
- Connect to broader show themes
- Have clear takeaways for listeners`,
        temperature: 0.7,
        maxTokens: 400
      },
      research: {
        system: `You are a podcast research specialist. Create research that:
- Gathers key facts and statistics
- Finds compelling stories and examples
- Identifies expert sources
- Notes surprising or counterintuitive findings
- Prepares for potential guest questions
- Fact-checks claims
- Gathers listener-friendly explanations
- Creates resource list for show notes`,
        temperature: 0.6,
        maxTokens: 800
      },
      outline: {
        system: `You are a podcast outline specialist. Create an outline that:
- Has a hook in the first 60 seconds
- Structures content into clear segments
- Includes transitions between topics
- Notes where to add examples/stories
- Marks call-to-action moments
- Plans engagement points (questions to audience)
- Times each section approximately
- Has a strong close`,
        temperature: 0.6,
        maxTokens: 800
      },
      script: {
        system: `You are a podcast script writer. Write a script that:
- Sounds natural when read aloud (conversational)
- Includes suggested ad lib moments [in brackets]
- Notes tone and pacing [stage directions]
- Has clear segment transitions
- Includes intro and outro copy
- Marks music/sound effect cues
- Balances scripted and spontaneous
- Fits the target episode length`,
        temperature: 0.7,
        maxTokens: 3000
      },
      'show-notes': {
        system: `You are a podcast show notes specialist. Create show notes that:
- Summarize the episode compellingly
- Include timestamps for key moments
- List all resources mentioned
- Add links for further reading
- Include guest bio and links (if applicable)
- Have SEO-friendly keywords
- Include a call-to-action
- Are formatted for easy scanning`,
        temperature: 0.6,
        maxTokens: 600
      }
    },
    labels: {
      concept: 'Show Concept',
      format: 'Format & Structure',
      'episode-topic': 'Episode Topic',
      research: 'Research',
      outline: 'Episode Outline',
      script: 'Script',
      'show-notes': 'Show Notes'
    },
    targetLength: { min: 20, max: 60, unit: 'minutes' },
    industryStandard: 'Podcast script format with audio cues'
  }
};

export function getProjectConfiguration(type: ProjectType | string): ProjectConfiguration {
  // Handle legacy type mappings
  const typeMapping: Record<string, ProjectType> = {
    'story': 'shortstory',
    'short-story': 'shortstory',
    'film-story': 'shortfilm',
    'synopsis': 'shortstory', // Map synopsis to shortstory workflow
  };
  
  const normalizedType = typeMapping[type] || type;
  return PROJECT_CONFIGURATIONS[normalizedType as ProjectType] || PROJECT_CONFIGURATIONS['shortstory'];
}

export function getInitialContent(type: string) {
  // Handle legacy type mappings
  const normalizedType = type === 'story' || type === 'short-story' ? 'shortstory' : 
                         type === 'film-story' || type === 'synopsis' ? 'shortfilm' : type;
  
  switch (normalizedType) {
    case 'shortfilm':
      return {
        version: 1,
        structureType: 'three-act',
        idea: '',
        logline: '',
        treatment: '',
        theme: '',
        characters: {
          create: [
            {
              name: 'Protagonist',
              description: 'Your main character - who drives the story',
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
              title: 'Opening',
              summary: 'How your film begins - the hook',
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
    
    case 'screenplay':
      return {
        version: 1,
        idea: '',
        logline: '',
        synopsis: '',
        beatSheet: '',
        treatment: '',
        worldBuilding: '',
        structureType: 'three-act',
        characters: {
          create: [
            {
              name: 'Protagonist',
              description: 'Your hero - the character whose journey we follow',
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
              title: 'Opening Image',
              summary: 'Visual snapshot of the world before the story begins',
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
    
    case 'shortstory':
      return {
        version: 1,
        idea: '',
        premise: '',
        theme: '',
        characters: {
          create: [
            {
              name: 'Protagonist',
              description: 'Your central character - through whose eyes we experience the story',
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
              description: 'How the story begins - establish character and situation',
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
              type: 'shortstory',
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
        genre: '',
        premise: '',
        theme: '',
        worldBuilding: '',
        plotOutline: '',
        targetLength: 80000,
        characters: {
          create: [
            {
              name: 'Protagonist',
              description: 'Your main character - the hero of your novel',
              motivation: '',
              backstory: '',
              arc: '',
              relationships: ''
            },
            {
              name: 'Antagonist',
              description: 'The force opposing your protagonist',
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
              title: 'Hook',
              description: 'The opening that grabs readers',
              order: 0,
              beatType: 'hook'
            },
            {
              title: 'Inciting Incident',
              description: 'The event that disrupts the status quo',
              order: 1,
              beatType: 'inciting-incident'
            }
          ]
        },
        chapters: {
          create: [
            {
              title: 'Chapter 1',
              summary: 'Opening chapter - introduce your protagonist and their world',
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
    
    case 'webseries':
      return {
        version: 1,
        idea: '',
        seriesLogline: '',
        format: '',
        seasonArc: '',
        characters: {
          create: [
            {
              name: 'Lead',
              description: 'Your series lead - the character audiences will follow each episode',
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
              title: 'Pilot - Cold Open',
              summary: 'Hook the audience in the first scene',
              order: 0,
              act: 'teaser',
              notes: '',
              version: 1
            }
          ]
        },
        cards: {
          create: [
            {
              type: 'webseries',
              content: '',
              order: 0
            }
          ]
        }
      };
    
    case 'documentary':
      return {
        version: 1,
        idea: '',
        angle: '',
        research: '',
        structure: '',
        interviewPlan: '',
        visualApproach: '',
        treatment: '',
        characters: {
          create: [
            {
              name: 'Main Subject',
              description: 'The primary person or focus of your documentary',
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
              type: 'documentary',
              content: '',
              order: 0
            }
          ]
        }
      };
    
    case 'podcast':
      return {
        version: 1,
        idea: '',
        format: '',
        episodeTopic: '',
        research: '',
        outline: '',
        script: '',
        showNotes: '',
        cards: {
          create: [
            {
              type: 'podcast',
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
              name: 'Protagonist',
              description: 'Your main character',
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
