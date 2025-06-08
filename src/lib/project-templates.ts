export function getInitialContent(type: string) {
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
      return {
        version: 1,
        idea: '',
        logline: '',
        treatment: '',
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
              type: 'story',
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
    default:
      return {
        version: 1,
        idea: '',
        logline: '',
        treatment: '',
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
              type: 'general',
              content: '',
              order: 0
            }
          ]
        }
      };
  }
}
