// ==========================================
// KNIGHTORA - DOMAIN TYPE DEFINITIONS
// ==========================================

export type AuthMethod = 'google' | 'email' | 'guest';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  authMethod: AuthMethod;
  isGuest: boolean;
  rememberMe?: boolean;
}

export type ProjectFormat = 'movie' | 'screenplay' | 'short_story' | 'novel' | 'comic' | 'stage_play' | 'game_narrative' | 'episode';

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Script {
  id: string;
  projectId: string;
  title: string;
  format: ProjectFormat;
  content: any; // TipTap JSON
  wordCount: number;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScriptVersion {
  id: string;
  scriptId: string;
  contentSnapshot: any;
  label: string;
  createdAt: string;
}

export interface Character {
  id: string;
  projectId: string;
  characterCode?: string; // e.g. CHAR_001
  name: string;
  description: string;
  age?: string;
  gender?: string;
  height?: string;
  build?: string;
  skinTone?: string;
  faceShape?: string;
  hairStyle?: string;
  hairColor?: string;
  eyeColor?: string;
  expressions?: string;
  clothing?: string;
  footwear?: string;
  accessories?: string;
  distinctiveMarks?: string;
  personality?: string;
  posture?: string;
  walkingStyle?: string;
  artStyle?: string;
  occupation?: string;
  appearance?: string;
  goals?: string;
  motivations?: string;
  strengths?: string;
  weaknesses?: string;
  arcSummary?: string;
  referenceImageUrl?: string;
  sceneAppearances?: string[];
  userEditedFields?: string[];
  createdAt: string;
  updatedAt: string;
}

export type CharacterImageType = 'portrait' | 'full_body' | 'expression' | 'clothing_variant' | 'action_pose' | 'angle_variant';

export interface CharacterImage {
  id: string;
  characterId: string;
  imageUrl: string;
  type: CharacterImageType;
  stylePreset?: string;
  prompt?: string;
  createdAt: string;
}

export interface Location {
  id: string;
  projectId: string;
  name: string;
  description: string;
  atmosphere?: string;
  timeOfDay?: string;
  weather?: string;
  history?: string;
  userEditedFields?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Prop {
  id: string;
  projectId: string;
  name: string;
  description: string;
  owner?: string;
  status?: string;
  history?: string;
  userEditedFields?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  projectId: string;
  scriptId?: string;
  sceneNumber: number;
  title: string;
  summary: string;
  mood?: string;
  timeOfDay?: string;
  weather?: string;
  dialogueExcerpt?: string;
  characterIds?: string[];
  locationIds?: string[];
  propIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedImage {
  id: string;
  projectId: string;
  sceneId?: string;
  characterId?: string;
  locationId?: string;
  category?: 'Character' | 'Location' | 'Scene' | 'General';
  imageUrl: string;
  prompt: string;
  stylePreset?: string;
  cameraAngle?: string;
  lens?: string;
  lighting?: string;
  weather?: string;
  timeOfDay?: string;
  mood?: string;
  colorPalette?: string;
  aspectRatio?: string;
  steps?: number;
  tags?: string[];
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  projectId: string;
  dayOrDate: string;
  title: string;
  description: string;
  relatedSceneId?: string;
  relatedCharacterIds?: string[];
  createdAt: string;
}

export type RelationshipType = 'friend' | 'enemy' | 'sibling' | 'mentor' | 'student' | 'parent' | 'lover' | 'business_partner' | 'unknown';

export interface Relationship {
  id: string;
  projectId: string;
  characterAId: string;
  characterBId: string;
  type: RelationshipType;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type AttachedToType = 'scene' | 'character' | 'location' | 'prop' | 'timeline_event' | 'project';

export interface Note {
  id: string;
  projectId: string;
  attachedToType: AttachedToType;
  attachedToId: string;
  content: string;
  createdAt: string;
}

export type ConsistencyType = 'appearance' | 'age' | 'relationship' | 'timeline' | 'object' | 'character_death' | 'location' | 'rule' | 'duplicate' | 'continuity';

export interface ConsistencyFlag {
  id: string;
  projectId: string;
  type: ConsistencyType;
  description: string;
  relatedEntityIds?: string[];
  status: 'open' | 'ignored' | 'resolved';
  createdAt: string;
}

export interface NeuronUsage {
  userId: string;
  date: string;
  neuronsUsed: number;
}

export type ActiveTab = 
  | 'script' 
  | 'story-bible' 
  | 'characters' 
  | 'locations' 
  | 'props' 
  | 'scenes' 
  | 'timeline' 
  | 'relationships' 
  | 'images' 
  | 'consistency' 
  | 'notes'
  | 'api-hub';

export type AIProviderId = 
  | 'openai'
  | 'google'
  | 'anthropic'
  | 'xai'
  | 'meta'
  | 'mistral'
  | 'deepseek'
  | 'alibaba'
  | 'moonshot'
  | 'microsoft'
  | 'cohere'
  | 'amazon'
  | 'nvidia'
  | 'blackforest'
  | 'ideogram'
  | 'recraft'
  | 'stability'
  | 'luma'
  | 'playground'
  | 'hidream'
  | 'seedream'
  | 'adobe'
  | 'nanobanana'
  | 'openrouter';

export type AIFeatureId =
  | 'storyGenerator'
  | 'chatbot'
  | 'characterGenerator'
  | 'sceneGenerator'
  | 'promptGenerator'
  | 'dialogueGenerator'
  | 'continuityChecker'
  | 'storyboardAssistant'
  | 'artworkStudio'
  | 'imageUpscaler';

export interface AIModel {
  id: string;
  providerId: AIProviderId;
  providerName: string;
  name: string;
  version: string;
  category: 'text' | 'image';
  description: string;
  contextWindow?: string;
  speed: 'Ultra Fast' | 'Fast' | 'Balanced' | 'Deep Reasoning' | 'High Precision';
  costTier: '$' | '$$' | '$$$' | 'Free';
  supportsVision?: boolean;
  supportsStreaming?: boolean;
  supportsReasoning?: boolean;
  supportsFunctionCalling?: boolean;
  isPopular?: boolean;
}

export interface ProviderConfig {
  providerId: AIProviderId;
  providerName: string;
  apiKey: string;
  status: 'connected' | 'disconnected' | 'invalid_key' | 'testing' | 'quota_exceeded' | 'error';
  activeModelId: string;
  lastTestedAt?: string;
  latencyMs?: number;
  errorMessage?: string;
}

export interface FeatureAssignment {
  featureId: AIFeatureId;
  featureName: string;
  description: string;
  assignedProviderId: string;
  assignedModelId: string;
  category: 'text' | 'image';
}

export type AIAction = 
  | 'Rewrite'
  | 'Continue'
  | 'Expand'
  | 'Shorten'
  | 'Improve Dialogue'
  | 'Improve Description'
  | 'Make More Emotional'
  | 'Make More Suspenseful'
  | 'Make More Cinematic'
  | 'Make More Dramatic'
  | 'Change Tone'
  | 'Simplify'
  | 'Fix Grammar'
  | 'Generate Scene Image'
  | 'Generate Character'
  | 'Add to Story Bible';
