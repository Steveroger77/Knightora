import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Script, Character, Location, Prop, Scene, Relationship, TimelineEvent, GeneratedImage, Note, ConsistencyFlag } from '../types';
import { DEMO_PROJECT, DEMO_SCRIPT, DEMO_CHARACTERS, DEMO_LOCATIONS, DEMO_PROPS, DEMO_SCENES, DEMO_RELATIONSHIPS, DEMO_TIMELINE_EVENTS, DEMO_GENERATED_IMAGES, DEMO_CONSISTENCY_FLAGS, DEMO_NOTES } from '../lib/mockData';
import { convertTextToTiptapDoc } from '../lib/fileParser';
import { saveProjectSupabase, deleteProjectSupabase, deleteEntitySupabase } from '../lib/supabase';

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  activeScript: Script | null;
  characters: Character[];
  locations: Location[];
  props: Prop[];
  scenes: Scene[];
  relationships: Relationship[];
  timelineEvents: TimelineEvent[];
  generatedImages: GeneratedImage[];
  consistencyFlags: ConsistencyFlag[];
  notes: Note[];
  savedProjectData: Record<string, any>;
  isLoading: boolean;

  // Actions
  setActiveProject: (project: Project) => void;
  createProject: (title: string, description: string) => void;
  importStoryProject: (title: string, description: string, extractedText: string, extractedData?: any) => void;
  addCharacter: (char: Partial<Character>) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  addLocation: (loc: Partial<Location>) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  addProp: (prop: Partial<Prop>) => void;
  updateProp: (id: string, updates: Partial<Prop>) => void;
  deleteProp: (id: string) => void;
  addScene: (scene: Partial<Scene>) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  deleteScene: (id: string) => void;
  addRelationship: (rel: Partial<Relationship>) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  deleteRelationship: (id: string) => void;
  addTimelineEvent: (event: Partial<TimelineEvent>) => void;
  updateTimelineEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  deleteTimelineEvent: (id: string) => void;
  addGeneratedImage: (img: GeneratedImage) => void;
  deleteGeneratedImage: (id: string) => void;
  resolveFlag: (id: string) => void;
  ignoreFlag: (id: string) => void;
  addNote: (attachedToType: any, attachedToId: string, content: string) => void;
  updateScriptContent: (content: any, wordCount: number, readingTime: number) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [DEMO_PROJECT],
      activeProject: DEMO_PROJECT,
      activeScript: DEMO_SCRIPT,
      characters: DEMO_CHARACTERS,
      locations: DEMO_LOCATIONS,
      props: DEMO_PROPS,
      scenes: DEMO_SCENES,
      relationships: DEMO_RELATIONSHIPS,
      timelineEvents: DEMO_TIMELINE_EVENTS,
      generatedImages: DEMO_GENERATED_IMAGES,
      consistencyFlags: DEMO_CONSISTENCY_FLAGS,
      notes: DEMO_NOTES,
      savedProjectData: {} as Record<string, any>,
      isLoading: false,

      setActiveProject: (project) => {
        set((state) => {
          const currentProject = state.activeProject;
          let updatedSavedData = { ...state.savedProjectData };
          if (currentProject) {
            updatedSavedData[currentProject.id] = {
              activeScript: state.activeScript,
              characters: state.characters,
              locations: state.locations,
              props: state.props,
              scenes: state.scenes,
              relationships: state.relationships,
              timelineEvents: state.timelineEvents,
              generatedImages: state.generatedImages,
              consistencyFlags: state.consistencyFlags,
              notes: state.notes,
            };
          }

          const savedData = updatedSavedData[project.id];
          if (savedData) {
            return {
              activeProject: project,
              savedProjectData: updatedSavedData,
              ...savedData,
            };
          }

          if (project.id === DEMO_PROJECT.id) {
            return {
              activeProject: project,
              savedProjectData: updatedSavedData,
              activeScript: DEMO_SCRIPT,
              characters: DEMO_CHARACTERS,
              locations: DEMO_LOCATIONS,
              props: DEMO_PROPS,
              scenes: DEMO_SCENES,
              relationships: DEMO_RELATIONSHIPS,
              timelineEvents: DEMO_TIMELINE_EVENTS,
              generatedImages: DEMO_GENERATED_IMAGES,
              consistencyFlags: DEMO_CONSISTENCY_FLAGS,
              notes: DEMO_NOTES,
            };
          }

          return {
            activeProject: project,
            savedProjectData: updatedSavedData,
            activeScript: null,
            characters: [],
            locations: [],
            props: [],
            scenes: [],
            relationships: [],
            timelineEvents: [],
            generatedImages: [],
            consistencyFlags: [],
            notes: [],
          };
        });
      },

      createProject: (title, description) => {
        const newProj: Project = {
          id: crypto.randomUUID(),
          userId: '00000000-0000-0000-0000-000000000001',
          title,
          description,
          coverImageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        saveProjectSupabase(newProj);

        const newScript: Script = {
          id: crypto.randomUUID(),
          projectId: newProj.id,
          title: `${title} - Screenplay`,
          format: 'screenplay',
          wordCount: 0,
          readingTimeMinutes: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          content: { type: 'doc', content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'EXT. UNKNOWN LOCATION - DAY' }] }] }
        };
        set((state) => ({
          projects: [newProj, ...state.projects],
          activeProject: newProj,
          activeScript: newScript,
          characters: [],
          locations: [],
          props: [],
          scenes: [],
          relationships: [],
          timelineEvents: [],
          generatedImages: [],
          consistencyFlags: [],
          notes: [],
        }));
      },

      importStoryProject: (title, description, extractedText, extractedData) => {
        const projId = crypto.randomUUID();
        const newProj: Project = {
          id: projId,
          userId: '00000000-0000-0000-0000-000000000001',
          title,
          description: description || 'Imported story document with AI Story Bible extraction.',
          coverImageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const words = extractedText.trim().split(/\s+/).filter(Boolean);
        const wordCount = words.length;
        const readingTimeMinutes = Math.ceil(wordCount / 200);

        const tiptapDoc = convertTextToTiptapDoc(extractedText);

        const newScript: Script = {
          id: crypto.randomUUID(),
          projectId: projId,
          title: `${title} - Manuscript`,
          format: 'screenplay',
          wordCount,
          readingTimeMinutes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          content: tiptapDoc,
        };

        const importedCharacters: Character[] = (extractedData?.characters || []).map((c: any, idx: number) => ({
          id: crypto.randomUUID(),
          projectId: projId,
          characterCode: c.characterCode || `CHAR_${String(idx + 1).padStart(3, '0')}`,
          name: c.name || `Character ${idx + 1}`,
          description: c.description || 'Auto-extracted character profile.',
          age: c.age || '30',
          gender: c.gender || 'N/A',
          height: c.height || '5 ft 10 in',
          build: c.build || 'Athletic build',
          skinTone: c.skinTone || 'Fair skin tone',
          faceShape: c.faceShape || 'Oval face shape',
          hairStyle: c.hairStyle || 'Short neatly styled hair',
          hairColor: c.hairColor || 'Dark brown',
          eyeColor: c.eyeColor || 'Dark eyes',
          expressions: c.expressions || 'Observant',
          clothing: c.clothing || c.appearance || 'Signature cinematic attire',
          footwear: c.footwear || 'Leather boots',
          accessories: c.accessories || 'Personal item',
          distinctiveMarks: c.distinctiveMarks || 'None noted',
          occupation: c.occupation || 'Dramatis Personae',
          appearance: c.appearance || `${c.name || 'Character'} with dark brown hair, dark eyes, athletic build, wearing signature attire.`,
          personality: c.personality || 'Determined, insightful',
          sceneAppearances: c.sceneAppearances || [`Scene 1: Introduction`, `Scene 2: Conflict`, `Scene 3: Resolution`],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        const importedLocations: Location[] = (extractedData?.locations || []).map((l: any) => ({
          id: crypto.randomUUID(),
          projectId: projId,
          name: l.name || 'Unknown Location',
          description: l.description || 'Auto-extracted location atmosphere.',
          atmosphere: l.atmosphere || 'Atmospheric',
          timeOfDay: l.time_of_day || l.timeOfDay || 'Day',
          weather: l.weather || 'Clear',
          history: l.history || `Lore & narrative history of ${l.name || 'this location'} extracted from the story manuscript.`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        const importedProps: Prop[] = (extractedData?.props || []).map((p: any) => ({
          id: crypto.randomUUID(),
          projectId: projId,
          name: p.name || 'Key Prop',
          description: p.description || 'Auto-extracted prop item.',
          owner: p.owner || 'N/A',
          status: p.status || 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        const importedScenes: Scene[] = (extractedData?.scenes || []).map((s: any, idx: number) => ({
          id: crypto.randomUUID(),
          projectId: projId,
          sceneNumber: idx + 1,
          title: s.title || `Scene ${idx + 1}`,
          summary: s.summary || 'Auto-extracted scene summary.',
          mood: s.mood || 'Dramatic',
          dialogueExcerpt: s.dialogue_excerpt || '...',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        const charMap: Record<string, string> = {};
        importedCharacters.forEach((c) => { charMap[c.name.toLowerCase()] = c.id; });

        const importedRelationships: Relationship[] = (extractedData?.relationships || []).map((r: any) => {
          const charAId = charMap[r.character_a?.toLowerCase()] || (importedCharacters[0]?.id || crypto.randomUUID());
          const charBId = charMap[r.character_b?.toLowerCase()] || (importedCharacters[1]?.id || crypto.randomUUID());
          return {
            id: crypto.randomUUID(),
            projectId: projId,
            characterAId: charAId,
            characterBId: charBId,
            type: r.type || 'ally',
            description: r.description || `${r.character_a || 'Character A'} & ${r.character_b || 'Character B'} dynamic relationship.`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });

        const importedTimeline: TimelineEvent[] = (extractedData?.timeline_events || []).map((t: any) => ({
          id: crypto.randomUUID(),
          projectId: projId,
          dayOrDate: t.day_or_date || 'Day 1',
          title: t.title || 'Key Event',
          description: t.description || 'Auto-extracted timeline milestone.',
          createdAt: new Date().toISOString(),
        }));

        const importedNotes: Note[] = [
          {
            id: crypto.randomUUID(),
            projectId: projId,
            attachedToType: 'project',
            attachedToId: projId,
            content: `Imported from story file: "${title}". Extracted ${wordCount} words, ${importedCharacters.length} characters, and ${importedScenes.length} scenes.`,
            createdAt: new Date().toISOString(),
          }
        ];

        set((state) => ({
          projects: [newProj, ...state.projects],
          activeProject: newProj,
          activeScript: newScript,
          characters: importedCharacters,
          locations: importedLocations,
          props: importedProps,
          scenes: importedScenes,
          relationships: importedRelationships,
          timelineEvents: importedTimeline,
          generatedImages: [],
          consistencyFlags: [],
          notes: importedNotes,
          savedProjectData: {
            ...state.savedProjectData,
            [projId]: {
              activeScript: newScript,
              characters: importedCharacters,
              locations: importedLocations,
              props: importedProps,
              scenes: importedScenes,
              relationships: importedRelationships,
              timelineEvents: importedTimeline,
              generatedImages: [],
              consistencyFlags: [],
              notes: importedNotes,
            },
          },
        }));
      },

      addCharacter: (char) => set((state) => {
        const nextCodeNum = state.characters.length + 1;
        const charCode = char.characterCode || `CHAR_${String(nextCodeNum).padStart(3, '0')}`;
        const newChar: Character = {
          id: crypto.randomUUID(),
          projectId: state.activeProject?.id || '',
          characterCode: charCode,
          name: char.name || 'New Character',
          description: char.description || 'Character description...',
          age: char.age || '30',
          gender: char.gender || 'N/A',
          height: char.height || '5 ft 10 in',
          build: char.build || 'Athletic build',
          skinTone: char.skinTone || 'Fair skin tone',
          faceShape: char.faceShape || 'Oval face shape',
          hairStyle: char.hairStyle || 'Short dark hair',
          hairColor: char.hairColor || 'Dark brown',
          eyeColor: char.eyeColor || 'Dark eyes',
          expressions: char.expressions || 'Focused',
          clothing: char.clothing || char.appearance || 'Signature attire',
          footwear: char.footwear || 'Leather boots',
          accessories: char.accessories || 'Personal accessory',
          distinctiveMarks: char.distinctiveMarks || 'None noted',
          occupation: char.occupation || 'Protagonist',
          appearance: char.appearance || `${char.name || 'Character'} with short dark hair, dark eyes, athletic build.`,
          personality: char.personality || 'Determined',
          sceneAppearances: char.sceneAppearances || [`Scene 1: Introduction`, `Scene 2: Conflict`, `Scene 3: Resolution`],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [newChar, ...state.characters];
        const activeId = state.activeProject?.id;
        let updatedSaved = { ...state.savedProjectData };
        if (activeId && updatedSaved[activeId]) {
          updatedSaved[activeId] = { ...updatedSaved[activeId], characters: updated };
        }
        return { characters: updated, savedProjectData: updatedSaved };
      }),

      updateCharacter: (id, updates) => set((state) => {
        const updated = state.characters.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
        const activeId = state.activeProject?.id;
        let updatedSaved = { ...state.savedProjectData };
        if (activeId && updatedSaved[activeId]) {
          updatedSaved[activeId] = { ...updatedSaved[activeId], characters: updated };
        }
        return { characters: updated, savedProjectData: updatedSaved };
      }),

      deleteCharacter: (id) => {
        deleteEntitySupabase('characters', id);
        set((state) => {
          const updatedChars = state.characters.filter((c) => c.id !== id);
          const activeId = state.activeProject?.id;
          let updatedSaved = { ...state.savedProjectData };
          if (activeId && updatedSaved[activeId]) {
            updatedSaved[activeId] = { ...updatedSaved[activeId], characters: updatedChars };
          }
          return { characters: updatedChars, savedProjectData: updatedSaved };
        });
      },

      addLocation: (loc) => set((state) => {
        const newLoc: Location = {
          id: crypto.randomUUID(),
          projectId: state.activeProject?.id || '',
          name: loc.name || 'New Location',
          description: loc.description || 'Setting description...',
          atmosphere: loc.atmosphere || 'Atmospheric',
          timeOfDay: loc.timeOfDay || 'Day',
          weather: loc.weather || 'Clear',
          history: loc.history || 'Narrative background history of this setting.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [newLoc, ...state.locations];
        const activeId = state.activeProject?.id;
        let updatedSaved = { ...state.savedProjectData };
        if (activeId && updatedSaved[activeId]) {
          updatedSaved[activeId] = { ...updatedSaved[activeId], locations: updated };
        }
        return { locations: updated, savedProjectData: updatedSaved };
      }),

      updateLocation: (id, updates) => set((state) => {
        const updated = state.locations.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
        const activeId = state.activeProject?.id;
        let updatedSaved = { ...state.savedProjectData };
        if (activeId && updatedSaved[activeId]) {
          updatedSaved[activeId] = { ...updatedSaved[activeId], locations: updated };
        }
        return { locations: updated, savedProjectData: updatedSaved };
      }),

      deleteLocation: (id) => {
        deleteEntitySupabase('locations', id);
        set((state) => {
          const updatedLocs = state.locations.filter((l) => l.id !== id);
          const activeId = state.activeProject?.id;
          let updatedSaved = { ...state.savedProjectData };
          if (activeId && updatedSaved[activeId]) {
            updatedSaved[activeId] = { ...updatedSaved[activeId], locations: updatedLocs };
          }
          return { locations: updatedLocs, savedProjectData: updatedSaved };
        });
      },

      addProp: (prop) => set((state) => {
        const newProp: Prop = {
          id: crypto.randomUUID(),
          projectId: state.activeProject?.id || '',
          name: prop.name || 'New Prop Item',
          description: prop.description || 'Prop description...',
          owner: prop.owner || 'N/A',
          status: prop.status || 'Active',
          history: prop.history || 'Lore history...',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [newProp, ...state.props];
        const activeId = state.activeProject?.id;
        let updatedSaved = { ...state.savedProjectData };
        if (activeId && updatedSaved[activeId]) {
          updatedSaved[activeId] = { ...updatedSaved[activeId], props: updated };
        }
        return { props: updated, savedProjectData: updatedSaved };
      }),

      updateProp: (id, updates) => set((state) => {
        const updated = state.props.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
        const activeId = state.activeProject?.id;
        let updatedSaved = { ...state.savedProjectData };
        if (activeId && updatedSaved[activeId]) {
          updatedSaved[activeId] = { ...updatedSaved[activeId], props: updated };
        }
        return { props: updated, savedProjectData: updatedSaved };
      }),

      deleteProp: (id) => {
        deleteEntitySupabase('props', id);
        set((state) => {
          const updatedProps = state.props.filter((p) => p.id !== id);
          const activeId = state.activeProject?.id;
          let updatedSaved = { ...state.savedProjectData };
          if (activeId && updatedSaved[activeId]) {
            updatedSaved[activeId] = { ...updatedSaved[activeId], props: updatedProps };
          }
          return { props: updatedProps, savedProjectData: updatedSaved };
        });
      },

      addScene: (scene) => set((state) => {
        const newScene: Scene = {
          id: crypto.randomUUID(),
          projectId: state.activeProject?.id || '',
          sceneNumber: state.scenes.length + 1,
          title: scene.title || `Scene ${state.scenes.length + 1}`,
          summary: scene.summary || 'Scene summary...',
          mood: scene.mood || 'Dramatic',
          dialogueExcerpt: scene.dialogueExcerpt || '...',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [...state.scenes, newScene];
        const activeId = state.activeProject?.id;
        let updatedSaved = { ...state.savedProjectData };
        if (activeId && updatedSaved[activeId]) {
          updatedSaved[activeId] = { ...updatedSaved[activeId], scenes: updated };
        }
        return { scenes: updated, savedProjectData: updatedSaved };
      }),

      updateScene: (id, updates) => set((state) => {
        const updated = state.scenes.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
        const activeId = state.activeProject?.id;
        let updatedSaved = { ...state.savedProjectData };
        if (activeId && updatedSaved[activeId]) {
          updatedSaved[activeId] = { ...updatedSaved[activeId], scenes: updated };
        }
        return { scenes: updated, savedProjectData: updatedSaved };
      }),

      deleteScene: (id) => {
        deleteEntitySupabase('scenes', id);
        set((state) => {
          const updatedScenes = state.scenes.filter((s) => s.id !== id);
          const activeId = state.activeProject?.id;
          let updatedSaved = { ...state.savedProjectData };
          if (activeId && updatedSaved[activeId]) {
            updatedSaved[activeId] = { ...updatedSaved[activeId], scenes: updatedScenes };
          }
          return { scenes: updatedScenes, savedProjectData: updatedSaved };
        });
      },

      addRelationship: (rel) => set((state) => {
        const newRel: Relationship = {
          id: crypto.randomUUID(),
          projectId: state.activeProject?.id || '',
          characterAId: rel.characterAId || '',
          characterBId: rel.characterBId || '',
          type: rel.type || 'friend',
          description: rel.description || 'Relationship connection.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [newRel, ...state.relationships];
        const activeId = state.activeProject?.id;
        let updatedSaved = { ...state.savedProjectData };
        if (activeId && updatedSaved[activeId]) {
          updatedSaved[activeId] = { ...updatedSaved[activeId], relationships: updated };
        }
        return { relationships: updated, savedProjectData: updatedSaved };
      }),

      updateRelationship: (id, updates) => set((state) => {
        const updated = state.relationships.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
        const activeId = state.activeProject?.id;
        let updatedSaved = { ...state.savedProjectData };
        if (activeId && updatedSaved[activeId]) {
          updatedSaved[activeId] = { ...updatedSaved[activeId], relationships: updated };
        }
        return { relationships: updated, savedProjectData: updatedSaved };
      }),

      deleteRelationship: (id) => set((state) => {
        deleteEntitySupabase('relationships', id);
        const updated = state.relationships.filter((r) => r.id !== id);
        const activeId = state.activeProject?.id;
        let updatedSaved = { ...state.savedProjectData };
        if (activeId && updatedSaved[activeId]) {
          updatedSaved[activeId] = { ...updatedSaved[activeId], relationships: updated };
        }
        return { relationships: updated, savedProjectData: updatedSaved };
      }),

      addTimelineEvent: (event) => set((state) => {
        const newEvent: TimelineEvent = {
          id: crypto.randomUUID(),
          projectId: state.activeProject?.id || '',
          dayOrDate: event.dayOrDate || 'Day 1',
          title: event.title || 'New Story Event',
          description: event.description || 'Timeline milestone description...',
          createdAt: new Date().toISOString(),
        };
        const updated = [...state.timelineEvents, newEvent];
        const activeId = state.activeProject?.id;
        let updatedSaved = { ...state.savedProjectData };
        if (activeId && updatedSaved[activeId]) {
          updatedSaved[activeId] = { ...updatedSaved[activeId], timelineEvents: updated };
        }
        return { timelineEvents: updated, savedProjectData: updatedSaved };
      }),

      updateTimelineEvent: (id, updates) => set((state) => {
        const updated = state.timelineEvents.map((t) => (t.id === id ? { ...t, ...updates } : t));
        const activeId = state.activeProject?.id;
        let updatedSaved = { ...state.savedProjectData };
        if (activeId && updatedSaved[activeId]) {
          updatedSaved[activeId] = { ...updatedSaved[activeId], timelineEvents: updated };
        }
        return { timelineEvents: updated, savedProjectData: updatedSaved };
      }),

      deleteTimelineEvent: (id) => set((state) => {
        deleteEntitySupabase('timeline_events', id);
        const updated = state.timelineEvents.filter((t) => t.id !== id);
        const activeId = state.activeProject?.id;
        let updatedSaved = { ...state.savedProjectData };
        if (activeId && updatedSaved[activeId]) {
          updatedSaved[activeId] = { ...updatedSaved[activeId], timelineEvents: updated };
        }
        return { timelineEvents: updated, savedProjectData: updatedSaved };
      }),

      addGeneratedImage: (img) => set((state) => ({
        generatedImages: [img, ...state.generatedImages]
      })),

      deleteGeneratedImage: (id) => {
        deleteEntitySupabase('generated_images', id);
        set((state) => ({
          generatedImages: state.generatedImages.filter((img) => img.id !== id)
        }));
      },

      resolveFlag: (id) => set((state) => ({
        consistencyFlags: state.consistencyFlags.map((f) => (f.id === id ? { ...f, status: 'resolved' } : f))
      })),

      ignoreFlag: (id) => set((state) => ({
        consistencyFlags: state.consistencyFlags.map((f) => (f.id === id ? { ...f, status: 'ignored' } : f))
      })),

      addNote: (attachedToType, attachedToId, content) => set((state) => ({
        notes: [
          {
            id: crypto.randomUUID(),
            projectId: state.activeProject?.id || '',
            attachedToType,
            attachedToId,
            content,
            createdAt: new Date().toISOString(),
          },
          ...state.notes,
        ]
      })),

      updateScriptContent: (content, wordCount, readingTime) => set((state) => ({
        activeScript: state.activeScript ? {
          ...state.activeScript,
          content,
          wordCount,
          readingTimeMinutes: readingTime,
          updatedAt: new Date().toISOString(),
        } : null
      })),

      deleteProject: (id) => {
        deleteProjectSupabase(id);
        set((state) => {
          const remaining = state.projects.filter((p) => p.id !== id);
          const { [id]: _removed, ...restSaved } = state.savedProjectData;

          if (remaining.length === 0) {
            const freshProject: Project = {
              id: crypto.randomUUID(),
              userId: 'guest',
              title: 'Untitled Screenplay Project',
              description: 'Fresh screenplay workspace.',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            const freshScript: Script = {
              id: crypto.randomUUID(),
              projectId: freshProject.id,
              title: freshProject.title,
              format: 'screenplay',
              content: convertTextToTiptapDoc('EXT. NEW LOCATION - DAY\n\nType your screenplay story here...'),
              wordCount: 7,
              readingTimeMinutes: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            return {
              projects: [freshProject],
              activeProject: freshProject,
              activeScript: freshScript,
              characters: [],
              locations: [],
              props: [],
              scenes: [],
              relationships: [],
              timelineEvents: [],
              generatedImages: [],
              consistencyFlags: [],
              notes: [],
              savedProjectData: {
                [freshProject.id]: {
                  activeScript: freshScript,
                  characters: [],
                  locations: [],
                  props: [],
                  scenes: [],
                  relationships: [],
                  timelineEvents: [],
                  generatedImages: [],
                  consistencyFlags: [],
                  notes: [],
                }
              },
            };
          }

          const isActive = state.activeProject?.id === id;

          if (!isActive) {
            return { projects: remaining, savedProjectData: restSaved };
          }

          const next = remaining[0];
          const savedData = restSaved[next.id];

          if (savedData) {
            return {
              projects: remaining,
              activeProject: next,
              savedProjectData: restSaved,
              ...savedData,
            };
          }

          if (next.id === DEMO_PROJECT.id) {
            return {
              projects: remaining,
              activeProject: next,
              savedProjectData: restSaved,
              activeScript: DEMO_SCRIPT,
              characters: DEMO_CHARACTERS,
              locations: DEMO_LOCATIONS,
              props: DEMO_PROPS,
              scenes: DEMO_SCENES,
              relationships: DEMO_RELATIONSHIPS,
              timelineEvents: DEMO_TIMELINE_EVENTS,
              generatedImages: DEMO_GENERATED_IMAGES,
              consistencyFlags: DEMO_CONSISTENCY_FLAGS,
              notes: DEMO_NOTES,
            };
          }

          return {
            projects: remaining,
            activeProject: next,
            savedProjectData: restSaved,
            activeScript: null,
            characters: [],
            locations: [],
            props: [],
            scenes: [],
            relationships: [],
            timelineEvents: [],
            generatedImages: [],
            consistencyFlags: [],
            notes: [],
          };
        });
      },
    }),
    {
      name: 'obsidian-project-store-v4',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const hasLegacy = state.projects.some((p) => p.title?.includes('Cipher Protocol') || p.id === DEMO_PROJECT.id);
          if (hasLegacy || !state.activeProject || state.activeProject.title?.includes('Cipher Protocol')) {
            state.projects = [DEMO_PROJECT];
            state.activeProject = DEMO_PROJECT;
            state.activeScript = DEMO_SCRIPT;
            state.characters = DEMO_CHARACTERS;
            state.locations = DEMO_LOCATIONS;
            state.props = DEMO_PROPS;
            state.scenes = DEMO_SCENES;
            state.relationships = DEMO_RELATIONSHIPS;
            state.timelineEvents = DEMO_TIMELINE_EVENTS;
            state.consistencyFlags = DEMO_CONSISTENCY_FLAGS;
            state.notes = DEMO_NOTES;
          }
        }
      },
      partialize: (state) => ({
        projects: state.projects,
        activeProject: state.activeProject,
        activeScript: state.activeScript,
        characters: state.characters,
        locations: state.locations,
        props: state.props,
        scenes: state.scenes,
        relationships: state.relationships,
        timelineEvents: state.timelineEvents,
        generatedImages: state.generatedImages,
        consistencyFlags: state.consistencyFlags,
        notes: state.notes,
        savedProjectData: state.savedProjectData,
      }),
    }
  )
);
