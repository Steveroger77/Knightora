import { create } from 'zustand';
import { Project, Script, Character, Location, Prop, Scene, Relationship, TimelineEvent, GeneratedImage, Note, ConsistencyFlag } from '../types';
import { DEMO_PROJECT, DEMO_SCRIPT, DEMO_CHARACTERS, DEMO_LOCATIONS, DEMO_PROPS, DEMO_SCENES, DEMO_RELATIONSHIPS, DEMO_TIMELINE_EVENTS, DEMO_GENERATED_IMAGES, DEMO_CONSISTENCY_FLAGS, DEMO_NOTES } from '../lib/mockData';
import { convertTextToTiptapDoc } from '../lib/fileParser';
import { saveProjectSupabase, deleteProjectSupabase, deleteEntitySupabase, fetchUserProjectsSupabase } from '../lib/supabase';

interface ProjectState {
  currentUserId: string | null;
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

  // Workspace Partitioning Actions
  loadUserWorkspace: (userId: string) => Promise<void>;
  clearWorkspace: () => void;
  loadSampleTutorialStory: () => void;

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

function getWorkspaceStorageKey(userId: string): string {
  return `knightora_user_workspace_${userId}`;
}

function saveUserWorkspaceToStorage(userId: string | null, state: any) {
  if (!userId) return;
  try {
    const payload = {
      projects: state.projects || [],
      activeProjectId: state.activeProject?.id || null,
      activeScript: state.activeScript || null,
      characters: state.characters || [],
      locations: state.locations || [],
      props: state.props || [],
      scenes: state.scenes || [],
      relationships: state.relationships || [],
      timelineEvents: state.timelineEvents || [],
      generatedImages: state.generatedImages || [],
      consistencyFlags: state.consistencyFlags || [],
      notes: state.notes || [],
      savedProjectData: state.savedProjectData || {},
    };
    localStorage.setItem(getWorkspaceStorageKey(userId), JSON.stringify(payload));
  } catch (err) {
    console.warn('[Workspace Save] Error:', err);
  }
}

/**
 * Creates an interactive tutorial workspace loaded with the complete sample universe:
 * Characters (Ethan, Liam, Ava Carter, Detective Marcus, Father Benedict),
 * Locations (Blackwood Manor, Crypt tunnels, Lake lighthouse), Props, Scenes,
 * Relationships, and Timeline Events.
 */
export function createTutorialWorkspace(userId: string) {
  const tutorialProjectId = crypto.randomUUID();
  const tutorialProject: Project = {
    ...DEMO_PROJECT,
    id: tutorialProjectId,
    userId,
    title: 'The Whispering Manor (Sample Guide)',
    description: 'A thrilling mystery following three siblings—Ethan, Liam, and Ava Carter—who receive anonymous letters leading to Blackwood Manor. Explore this sample universe to learn Knightora!',
    coverImageUrl: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const tutorialScript: Script = {
    ...DEMO_SCRIPT,
    id: crypto.randomUUID(),
    projectId: tutorialProjectId,
    title: 'The Whispering Manor',
  };

  const initialCharacters = DEMO_CHARACTERS.map((c) => ({
    ...c,
    id: crypto.randomUUID(),
    projectId: tutorialProjectId,
  }));

  const charIdMap: Record<string, string> = {};
  DEMO_CHARACTERS.forEach((oldC, idx) => {
    charIdMap[oldC.id] = initialCharacters[idx].id;
  });

  const initialLocations = DEMO_LOCATIONS.map((l) => ({
    ...l,
    id: crypto.randomUUID(),
    projectId: tutorialProjectId,
  }));
  const locIdMap: Record<string, string> = {};
  DEMO_LOCATIONS.forEach((oldL, idx) => {
    locIdMap[oldL.id] = initialLocations[idx].id;
  });

  const initialProps = DEMO_PROPS.map((p) => ({
    ...p,
    id: crypto.randomUUID(),
    projectId: tutorialProjectId,
  }));
  const propIdMap: Record<string, string> = {};
  DEMO_PROPS.forEach((oldP, idx) => {
    propIdMap[oldP.id] = initialProps[idx].id;
  });

  const initialScenes = DEMO_SCENES.map((s) => ({
    ...s,
    id: crypto.randomUUID(),
    projectId: tutorialProjectId,
    scriptId: tutorialScript.id,
    characterIds: s.characterIds?.map((cid) => charIdMap[cid] || cid) || [],
    locationIds: s.locationIds?.map((lid) => locIdMap[lid] || lid) || [],
    propIds: s.propIds?.map((pid) => propIdMap[pid] || pid) || [],
  }));
  const sceneIdMap: Record<string, string> = {};
  DEMO_SCENES.forEach((oldS, idx) => {
    sceneIdMap[oldS.id] = initialScenes[idx].id;
  });

  const initialRelationships = DEMO_RELATIONSHIPS.map((r) => ({
    ...r,
    id: crypto.randomUUID(),
    projectId: tutorialProjectId,
    characterAId: charIdMap[r.characterAId] || initialCharacters[0]?.id || crypto.randomUUID(),
    characterBId: charIdMap[r.characterBId] || initialCharacters[1]?.id || crypto.randomUUID(),
  }));

  const initialTimeline = DEMO_TIMELINE_EVENTS.map((t) => ({
    ...t,
    id: crypto.randomUUID(),
    projectId: tutorialProjectId,
    relatedSceneId: t.relatedSceneId ? (sceneIdMap[t.relatedSceneId] || t.relatedSceneId) : undefined,
    relatedCharacterIds: t.relatedCharacterIds?.map((cid) => charIdMap[cid] || cid) || [],
  }));

  const initialImages = DEMO_GENERATED_IMAGES.map((img) => ({
    ...img,
    id: crypto.randomUUID(),
    projectId: tutorialProjectId,
    characterId: img.characterId ? (charIdMap[img.characterId] || img.characterId) : undefined,
    locationId: img.locationId ? (locIdMap[img.locationId] || img.locationId) : undefined,
    sceneId: img.sceneId ? (sceneIdMap[img.sceneId] || img.sceneId) : undefined,
  }));

  const initialFlags = DEMO_CONSISTENCY_FLAGS.map((f) => ({
    ...f,
    id: crypto.randomUUID(),
    projectId: tutorialProjectId,
    relatedEntityIds: f.relatedEntityIds?.map((eid) => charIdMap[eid] || locIdMap[eid] || propIdMap[eid] || sceneIdMap[eid] || eid) || [],
  }));

  const initialNotes: Note[] = DEMO_NOTES.map((n) => ({
    ...n,
    id: crypto.randomUUID(),
    projectId: tutorialProjectId,
    attachedToId: n.attachedToType === 'project'
      ? tutorialProjectId
      : (charIdMap[n.attachedToId] || locIdMap[n.attachedToId] || propIdMap[n.attachedToId] || sceneIdMap[n.attachedToId] || n.attachedToId),
  }));

  const initialSavedData = {
    [tutorialProjectId]: {
      activeScript: tutorialScript,
      characters: initialCharacters,
      locations: initialLocations,
      props: initialProps,
      scenes: initialScenes,
      relationships: initialRelationships,
      timelineEvents: initialTimeline,
      generatedImages: initialImages,
      consistencyFlags: initialFlags,
      notes: initialNotes,
    },
  };

  return {
    currentUserId: userId,
    projects: [tutorialProject],
    activeProject: tutorialProject,
    activeScript: tutorialScript,
    characters: initialCharacters,
    locations: initialLocations,
    props: initialProps,
    scenes: initialScenes,
    relationships: initialRelationships,
    timelineEvents: initialTimeline,
    generatedImages: initialImages,
    consistencyFlags: initialFlags,
    notes: initialNotes,
    savedProjectData: initialSavedData,
    isLoading: false,
  };
}

// Initial default state seeded with the rich mock dataset immediately so there's never an empty screen or vanishing data
function getInitialWorkspaceState(): ReturnType<typeof createTutorialWorkspace> {
  try {
    let userId = 'guest';
    const sessionRaw = sessionStorage.getItem('knightora_session') || localStorage.getItem('knightora_session');
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed?.user?.id) userId = parsed.user.id;
    }

    const raw = localStorage.getItem(`knightora_user_workspace_${userId}`);
    if (raw) {
      const data = JSON.parse(raw);
      const hasProjects = Array.isArray(data.projects) && data.projects.length > 0;
      const activeProj = hasProjects
        ? data.projects.find((p: any) => p.id === data.activeProjectId) || data.projects[0]
        : null;

      const hasAnyEntities =
        (Array.isArray(data.characters) && data.characters.length > 0) ||
        (Array.isArray(data.locations) && data.locations.length > 0) ||
        (Array.isArray(data.scenes) && data.scenes.length > 0);

      const isSample = !activeProj || activeProj.title?.includes('The Whispering Manor');
      const hasFullTutorialData =
        Array.isArray(data.characters) && data.characters.length >= 4 &&
        Array.isArray(data.props) && data.props.length >= 4 &&
        Array.isArray(data.scenes) && data.scenes.length >= 4 &&
        Array.isArray(data.generatedImages) && data.generatedImages.length >= 4;

      // Only restore custom project if it actually has user-created entities
      if (hasProjects && !isSample && hasAnyEntities) {
        return {
          currentUserId: userId,
          projects: data.projects,
          activeProject: activeProj,
          activeScript: data.activeScript || null,
          characters: data.characters || [],
          locations: data.locations || [],
          props: data.props || [],
          scenes: data.scenes || [],
          relationships: data.relationships || [],
          timelineEvents: data.timelineEvents || [],
          generatedImages: data.generatedImages || [],
          consistencyFlags: data.consistencyFlags || [],
          notes: data.notes || [],
          savedProjectData: data.savedProjectData || {},
          isLoading: false,
        };
      }

      // If user has fully populated tutorial data, restore it
      if (hasProjects && isSample && hasFullTutorialData) {
        return {
          currentUserId: userId,
          projects: data.projects,
          activeProject: activeProj,
          activeScript: data.activeScript || null,
          characters: data.characters || [],
          locations: data.locations || [],
          props: data.props || [],
          scenes: data.scenes || [],
          relationships: data.relationships || [],
          timelineEvents: data.timelineEvents || [],
          generatedImages: data.generatedImages || [],
          consistencyFlags: data.consistencyFlags || [],
          notes: data.notes || [],
          savedProjectData: data.savedProjectData || {},
          isLoading: false,
        };
      }
    }

    // Default: generate fresh tutorial workspace with full mock data for all tabs
    const fresh = createTutorialWorkspace(userId);
    saveUserWorkspaceToStorage(userId, fresh);
    return fresh;
  } catch (err) {
    return createTutorialWorkspace('guest');
  }
}

const initialDefaultState = getInitialWorkspaceState();

export const useProjectStore = create<ProjectState>((set, get) => ({
  ...initialDefaultState,
  currentUserId: null,

  loadUserWorkspace: async (userId: string) => {
    set({ isLoading: true, currentUserId: userId });

    try {
      // 1. Try loading user's isolated local workspace
      const raw = localStorage.getItem(getWorkspaceStorageKey(userId));
      if (raw) {
        const data = JSON.parse(raw);
        const hasProjects = Array.isArray(data.projects) && data.projects.length > 0;
        const activeProj = hasProjects
          ? data.projects.find((p: Project) => p.id === data.activeProjectId) || data.projects[0]
          : null;

        const hasAnyEntities =
          (Array.isArray(data.characters) && data.characters.length > 0) ||
          (Array.isArray(data.locations) && data.locations.length > 0) ||
          (Array.isArray(data.scenes) && data.scenes.length > 0);

        const isSampleProject = !activeProj || activeProj.title?.includes('The Whispering Manor');
        const hasFullTutorialData =
          Array.isArray(data.characters) && data.characters.length >= 4 &&
          Array.isArray(data.props) && data.props.length >= 4 &&
          Array.isArray(data.scenes) && data.scenes.length >= 4 &&
          Array.isArray(data.generatedImages) && data.generatedImages.length >= 4;

        // If user has a real custom project with actual user-created entities, restore it
        if (hasProjects && !isSampleProject && hasAnyEntities) {
          set({
            currentUserId: userId,
            projects: data.projects,
            activeProject: activeProj,
            activeScript: data.activeScript || null,
            characters: data.characters || [],
            locations: data.locations || [],
            props: data.props || [],
            scenes: data.scenes || [],
            relationships: data.relationships || [],
            timelineEvents: data.timelineEvents || [],
            generatedImages: data.generatedImages || [],
            consistencyFlags: data.consistencyFlags || [],
            notes: data.notes || [],
            savedProjectData: data.savedProjectData || {},
            isLoading: false,
          });
          return;
        }

        // If user has fully populated tutorial data, restore it
        if (hasProjects && isSampleProject && hasFullTutorialData) {
          set({
            currentUserId: userId,
            projects: data.projects,
            activeProject: activeProj,
            activeScript: data.activeScript || null,
            characters: data.characters || [],
            locations: data.locations || [],
            props: data.props || [],
            scenes: data.scenes || [],
            relationships: data.relationships || [],
            timelineEvents: data.timelineEvents || [],
            generatedImages: data.generatedImages || [],
            consistencyFlags: data.consistencyFlags || [],
            notes: data.notes || [],
            savedProjectData: data.savedProjectData || {},
            isLoading: false,
          });
          return;
        }
      }

      // 2. Check Supabase cloud projects if online
      const cloudProjects = await fetchUserProjectsSupabase(userId);
      const customCloudProjects = cloudProjects?.filter(
        (cp: any) => cp.title && !cp.title.includes('The Whispering Manor')
      );

      // If user has custom saved projects on cloud (not the sample guide)
      if (customCloudProjects && customCloudProjects.length > 0) {
        const tutorial = createTutorialWorkspace(userId);
        const formattedProjects: Project[] = customCloudProjects.map((cp: any) => ({
          id: cp.id,
          userId: cp.user_id,
          title: cp.title,
          description: cp.description || '',
          coverImageUrl: cp.cover_image_url || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80',
          createdAt: cp.created_at,
          updatedAt: cp.updated_at,
        }));

        const activeP = formattedProjects[0];
        set({
          currentUserId: userId,
          projects: [...formattedProjects, tutorial.activeProject],
          activeProject: activeP,
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
          savedProjectData: tutorial.savedProjectData,
          isLoading: false,
        });
        saveUserWorkspaceToStorage(userId, get());
        return;
      }

      // 3. New visitor onboarding: Seed user's private workspace with the complete learning tutorial story
      const freshWorkspace = createTutorialWorkspace(userId);
      set(freshWorkspace);
      saveUserWorkspaceToStorage(userId, freshWorkspace);
      saveProjectSupabase(freshWorkspace.activeProject);
    } catch (err) {
      console.warn('[Workspace Load] Error:', err);
      // Fallback: seed with tutorial workspace
      const freshWorkspace = createTutorialWorkspace(userId);
      set(freshWorkspace);
      saveUserWorkspaceToStorage(userId, freshWorkspace);
    }
  },

  loadSampleTutorialStory: () => {
    const userId = get().currentUserId || 'guest';
    const tutorial = createTutorialWorkspace(userId);
    const existingProjects = get().projects.filter((p) => !p.title.includes('The Whispering Manor'));
    
    set({
      projects: [tutorial.activeProject, ...existingProjects],
      activeProject: tutorial.activeProject,
      activeScript: tutorial.activeScript,
      characters: tutorial.characters,
      locations: tutorial.locations,
      props: tutorial.props,
      scenes: tutorial.scenes,
      relationships: tutorial.relationships,
      timelineEvents: tutorial.timelineEvents,
      generatedImages: tutorial.generatedImages,
      consistencyFlags: tutorial.consistencyFlags,
      notes: tutorial.notes,
      savedProjectData: {
        ...get().savedProjectData,
        ...tutorial.savedProjectData,
      },
    });

    saveUserWorkspaceToStorage(userId, get());
  },

  clearWorkspace: () => {
    const defaultData = createTutorialWorkspace('guest');
    set({
      ...defaultData,
      currentUserId: null,
    });
  },

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
      const nextState = savedData
        ? { activeProject: project, savedProjectData: updatedSavedData, ...savedData }
        : {
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

      saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
      return nextState;
    });
  },

  createProject: (title, description) => {
    const userId = get().currentUserId || '00000000-0000-0000-0000-000000000001';
    const newProj: Project = {
      id: crypto.randomUUID(),
      userId,
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
      content: {
        type: 'doc',
        content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'EXT. UNKNOWN LOCATION - DAY' }] }],
      },
    };

    set((state) => {
      const nextState = {
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
      };
      saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
      return nextState;
    });
  },

  importStoryProject: (title, description, extractedText, extractedData) => {
    const projId = crypto.randomUUID();
    const userId = get().currentUserId || '00000000-0000-0000-0000-000000000001';
    const newProj: Project = {
      id: projId,
      userId,
      title,
      description: description || 'Imported story document with AI Story Bible extraction.',
      coverImageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProjectSupabase(newProj);

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
      appearance: c.appearance || `${c.name || 'Character'} with dark brown hair, dark eyes, athletic build.`,
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
      },
    ];

    set((state) => {
      const nextState = {
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
      };
      saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
      return nextState;
    });
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
    const nextState = { characters: updated, savedProjectData: updatedSaved };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
  }),

  updateCharacter: (id, updates) => set((state) => {
    const updated = state.characters.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    const activeId = state.activeProject?.id;
    let updatedSaved = { ...state.savedProjectData };
    if (activeId && updatedSaved[activeId]) {
      updatedSaved[activeId] = { ...updatedSaved[activeId], characters: updated };
    }
    const nextState = { characters: updated, savedProjectData: updatedSaved };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
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
      const nextState = { characters: updatedChars, savedProjectData: updatedSaved };
      saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
      return nextState;
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
    const nextState = { locations: updated, savedProjectData: updatedSaved };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
  }),

  updateLocation: (id, updates) => set((state) => {
    const updated = state.locations.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
    const activeId = state.activeProject?.id;
    let updatedSaved = { ...state.savedProjectData };
    if (activeId && updatedSaved[activeId]) {
      updatedSaved[activeId] = { ...updatedSaved[activeId], locations: updated };
    }
    const nextState = { locations: updated, savedProjectData: updatedSaved };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
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
      const nextState = { locations: updatedLocs, savedProjectData: updatedSaved };
      saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
      return nextState;
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
    const nextState = { props: updated, savedProjectData: updatedSaved };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
  }),

  updateProp: (id, updates) => set((state) => {
    const updated = state.props.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    const activeId = state.activeProject?.id;
    let updatedSaved = { ...state.savedProjectData };
    if (activeId && updatedSaved[activeId]) {
      updatedSaved[activeId] = { ...updatedSaved[activeId], props: updated };
    }
    const nextState = { props: updated, savedProjectData: updatedSaved };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
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
      const nextState = { props: updatedProps, savedProjectData: updatedSaved };
      saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
      return nextState;
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
    const nextState = { scenes: updated, savedProjectData: updatedSaved };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
  }),

  updateScene: (id, updates) => set((state) => {
    const updated = state.scenes.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
    const activeId = state.activeProject?.id;
    let updatedSaved = { ...state.savedProjectData };
    if (activeId && updatedSaved[activeId]) {
      updatedSaved[activeId] = { ...updatedSaved[activeId], scenes: updated };
    }
    const nextState = { scenes: updated, savedProjectData: updatedSaved };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
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
      const nextState = { scenes: updatedScenes, savedProjectData: updatedSaved };
      saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
      return nextState;
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
    const nextState = { relationships: updated, savedProjectData: updatedSaved };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
  }),

  updateRelationship: (id, updates) => set((state) => {
    const updated = state.relationships.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
    const activeId = state.activeProject?.id;
    let updatedSaved = { ...state.savedProjectData };
    if (activeId && updatedSaved[activeId]) {
      updatedSaved[activeId] = { ...updatedSaved[activeId], relationships: updated };
    }
    const nextState = { relationships: updated, savedProjectData: updatedSaved };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
  }),

  deleteRelationship: (id) => set((state) => {
    deleteEntitySupabase('relationships', id);
    const updated = state.relationships.filter((r) => r.id !== id);
    const activeId = state.activeProject?.id;
    let updatedSaved = { ...state.savedProjectData };
    if (activeId && updatedSaved[activeId]) {
      updatedSaved[activeId] = { ...updatedSaved[activeId], relationships: updated };
    }
    const nextState = { relationships: updated, savedProjectData: updatedSaved };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
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
    const nextState = { timelineEvents: updated, savedProjectData: updatedSaved };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
  }),

  updateTimelineEvent: (id, updates) => set((state) => {
    const updated = state.timelineEvents.map((t) => (t.id === id ? { ...t, ...updates } : t));
    const activeId = state.activeProject?.id;
    let updatedSaved = { ...state.savedProjectData };
    if (activeId && updatedSaved[activeId]) {
      updatedSaved[activeId] = { ...updatedSaved[activeId], timelineEvents: updated };
    }
    const nextState = { timelineEvents: updated, savedProjectData: updatedSaved };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
  }),

  deleteTimelineEvent: (id) => set((state) => {
    deleteEntitySupabase('timeline_events', id);
    const updated = state.timelineEvents.filter((t) => t.id !== id);
    const activeId = state.activeProject?.id;
    let updatedSaved = { ...state.savedProjectData };
    if (activeId && updatedSaved[activeId]) {
      updatedSaved[activeId] = { ...updatedSaved[activeId], timelineEvents: updated };
    }
    const nextState = { timelineEvents: updated, savedProjectData: updatedSaved };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
  }),

  addGeneratedImage: (img) => set((state) => {
    const nextState = { generatedImages: [img, ...state.generatedImages] };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
  }),

  deleteGeneratedImage: (id) => {
    deleteEntitySupabase('generated_images', id);
    set((state) => {
      const nextState = { generatedImages: state.generatedImages.filter((img) => img.id !== id) };
      saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
      return nextState;
    });
  },

  resolveFlag: (id) => set((state) => {
    const nextState = { consistencyFlags: state.consistencyFlags.map((f) => (f.id === id ? { ...f, status: 'resolved' as const } : f)) };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
  }),

  ignoreFlag: (id) => set((state) => {
    const nextState = { consistencyFlags: state.consistencyFlags.map((f) => (f.id === id ? { ...f, status: 'ignored' as const } : f)) };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
  }),

  addNote: (attachedToType, attachedToId, content) => set((state) => {
    const nextState = {
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
      ],
    };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
  }),

  updateScriptContent: (content, wordCount, readingTime) => set((state) => {
    const nextState = {
      activeScript: state.activeScript
        ? {
            ...state.activeScript,
            content,
            wordCount,
            readingTimeMinutes: readingTime,
            updatedAt: new Date().toISOString(),
          }
        : null,
    };
    saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
    return nextState;
  }),

  deleteProject: (id) => {
    deleteProjectSupabase(id);
    set((state) => {
      const remaining = state.projects.filter((p) => p.id !== id);
      const { [id]: _removed, ...restSaved } = state.savedProjectData;

      if (remaining.length === 0) {
        const freshProject: Project = {
          id: crypto.randomUUID(),
          userId: state.currentUserId || 'guest',
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
        const nextState = {
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
            },
          },
        };
        saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
        return nextState;
      }

      const isActive = state.activeProject?.id === id;
      if (!isActive) {
        const nextState = { projects: remaining, savedProjectData: restSaved };
        saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
        return nextState;
      }

      const next = remaining[0];
      const savedData = restSaved[next.id];
      const nextState = savedData
        ? { projects: remaining, activeProject: next, savedProjectData: restSaved, ...savedData }
        : {
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

      saveUserWorkspaceToStorage(state.currentUserId, { ...state, ...nextState });
      return nextState;
    });
  },
}));
