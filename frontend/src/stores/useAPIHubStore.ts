import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIProviderId, AIFeatureId, AIModel, ProviderConfig, FeatureAssignment } from '../types';

export const ALL_TEXT_MODELS: AIModel[] = [
  // OpenAI
  { id: 'gpt-5', providerId: 'openai', providerName: 'OpenAI', name: 'GPT-5', version: '5.0', category: 'text', description: 'Next-gen frontier model with deep reasoning and creative writing.', contextWindow: '256k', speed: 'High Precision', costTier: '$$$', supportsVision: true, supportsStreaming: true, supportsReasoning: true, supportsFunctionCalling: true, isPopular: true },
  { id: 'gpt-5-mini', providerId: 'openai', providerName: 'OpenAI', name: 'GPT-5 Mini', version: '5.0', category: 'text', description: 'Fast, cost-effective GPT-5 variant.', contextWindow: '128k', speed: 'Fast', costTier: '$', supportsVision: true, supportsStreaming: true, supportsFunctionCalling: true, isPopular: true },
  { id: 'gpt-5-nano', providerId: 'openai', providerName: 'OpenAI', name: 'GPT-5 Nano', version: '5.0', category: 'text', description: 'Ultra-fast nano model for real-time text processing.', contextWindow: '64k', speed: 'Ultra Fast', costTier: 'Free', supportsStreaming: true, isPopular: true },
  { id: 'gpt-4.1', providerId: 'openai', providerName: 'OpenAI', name: 'GPT-4.1', version: '4.1', category: 'text', description: 'High performance multimodal model.', contextWindow: '128k', speed: 'Balanced', costTier: '$$', supportsVision: true, supportsStreaming: true, isPopular: true },
  { id: 'gpt-4.1-mini', providerId: 'openai', providerName: 'OpenAI', name: 'GPT-4.1 Mini', version: '4.1', category: 'text', description: 'Lightweight GPT-4.1 variant.', contextWindow: '128k', speed: 'Fast', costTier: '$', supportsStreaming: true, isPopular: true },
  { id: 'o3', providerId: 'openai', providerName: 'OpenAI', name: 'o3', version: '3.0', category: 'text', description: 'Advanced reasoning model for complex logic and math.', contextWindow: '200k', speed: 'Deep Reasoning', costTier: '$$$', supportsReasoning: true, isPopular: true },
  { id: 'o3-pro', providerId: 'openai', providerName: 'OpenAI', name: 'o3 Pro', version: '3.0', category: 'text', description: 'Professional reasoning model with maximum compute.', contextWindow: '200k', speed: 'Deep Reasoning', costTier: '$$$', supportsReasoning: true, isPopular: true },
  { id: 'o4-mini', providerId: 'openai', providerName: 'OpenAI', name: 'o4 Mini', version: '4.0', category: 'text', description: 'Compact reasoning model for rapid logic checks.', contextWindow: '128k', speed: 'Fast', costTier: '$', supportsReasoning: true, isPopular: true },

  // Google
  { id: 'gemini-2.5-pro', providerId: 'google', providerName: 'Google AI', name: 'Gemini 2.5 Pro', version: '2.5', category: 'text', description: 'Google flagship 2M context multimodal model.', contextWindow: '2,000k', speed: 'High Precision', costTier: '$$', supportsVision: true, supportsStreaming: true, supportsFunctionCalling: true, isPopular: true },
  { id: 'gemini-2.5-flash', providerId: 'google', providerName: 'Google AI', name: 'Gemini 2.5 Flash', version: '2.5', category: 'text', description: 'Lightning-fast default model for story generation and chat.', contextWindow: '1,000k', speed: 'Ultra Fast', costTier: '$', supportsVision: true, supportsStreaming: true, supportsFunctionCalling: true, isPopular: true },
  { id: 'gemini-2.5-flash-lite', providerId: 'google', providerName: 'Google AI', name: 'Gemini 2.5 Flash Lite', version: '2.5', category: 'text', description: 'Ultra low latency model for quick prose edits.', contextWindow: '512k', speed: 'Ultra Fast', costTier: 'Free', supportsStreaming: true, isPopular: true },

  // Anthropic
  { id: 'claude-opus-4.1', providerId: 'anthropic', providerName: 'Anthropic', name: 'Claude Opus 4.1', version: '4.1', category: 'text', description: 'Peak literary intelligence for novel writing.', contextWindow: '200k', speed: 'High Precision', costTier: '$$$', supportsVision: true, supportsStreaming: true, isPopular: true },
  { id: 'claude-sonnet-4', providerId: 'anthropic', providerName: 'Anthropic', name: 'Claude Sonnet 4', version: '4.0', category: 'text', description: 'Optimal balance of narrative intelligence and speed.', contextWindow: '200k', speed: 'Balanced', costTier: '$$', supportsVision: true, supportsStreaming: true, isPopular: true },
  { id: 'claude-haiku-4', providerId: 'anthropic', providerName: 'Anthropic', name: 'Claude Haiku 4', version: '4.0', category: 'text', description: 'Rapid responsive model for character dialogue.', contextWindow: '200k', speed: 'Ultra Fast', costTier: '$', supportsStreaming: true, isPopular: true },

  // xAI
  { id: 'grok-4', providerId: 'xai', providerName: 'xAI', name: 'Grok 4', version: '4.0', category: 'text', description: 'Real-time knowledge and witty conversation.', contextWindow: '128k', speed: 'Balanced', costTier: '$$', supportsStreaming: true, isPopular: true },
  { id: 'grok-4-fast', providerId: 'xai', providerName: 'xAI', name: 'Grok 4 Fast', version: '4.0', category: 'text', description: 'High speed Grok variant.', contextWindow: '128k', speed: 'Ultra Fast', costTier: '$', supportsStreaming: true, isPopular: true },

  // DeepSeek
  { id: 'deepseek-r1', providerId: 'deepseek', providerName: 'DeepSeek', name: 'DeepSeek R1', version: 'R1', category: 'text', description: 'Open reasoning model for story continuity and logic audits.', contextWindow: '128k', speed: 'Deep Reasoning', costTier: '$', supportsReasoning: true, supportsStreaming: true, isPopular: true },
  { id: 'deepseek-chat-v3.1', providerId: 'deepseek', providerName: 'DeepSeek', name: 'DeepSeek Chat V3.1', version: 'V3.1', category: 'text', description: 'High efficiency general chat and prose generation.', contextWindow: '128k', speed: 'Fast', costTier: '$', supportsStreaming: true, isPopular: true },

  // Meta
  { id: 'llama-4-maverick', providerId: 'meta', providerName: 'Meta AI', name: 'Llama 4 Maverick', version: '4.0', category: 'text', description: 'Meta flagship open-weights frontier model.', contextWindow: '128k', speed: 'Balanced', costTier: '$', supportsStreaming: true, isPopular: true },
  { id: 'llama-4-scout', providerId: 'meta', providerName: 'Meta AI', name: 'Llama 4 Scout', version: '4.0', category: 'text', description: 'Lightweight fast open model.', contextWindow: '128k', speed: 'Ultra Fast', costTier: 'Free', supportsStreaming: true, isPopular: true },
  { id: 'llama-3.3-70b', providerId: 'meta', providerName: 'Meta AI', name: 'Llama 3.3 70B', version: '3.3', category: 'text', description: 'Proven 70B parameter open-source model.', contextWindow: '128k', speed: 'Fast', costTier: '$', supportsStreaming: true, isPopular: true },

  // Alibaba
  { id: 'qwen3-235b', providerId: 'alibaba', providerName: 'Alibaba Cloud', name: 'Qwen3 235B', version: '3.0', category: 'text', description: '235B parameter multilingual model.', contextWindow: '128k', speed: 'High Precision', costTier: '$$', supportsStreaming: true, isPopular: true },
  { id: 'qwen3-coder', providerId: 'alibaba', providerName: 'Alibaba Cloud', name: 'Qwen3 Coder', version: '3.0', category: 'text', description: 'Specialized model for structured story data.', contextWindow: '128k', speed: 'Fast', costTier: '$', supportsStreaming: true, isPopular: true },

  // Mistral AI
  { id: 'mistral-large', providerId: 'mistral', providerName: 'Mistral AI', name: 'Mistral Large', version: '3.0', category: 'text', description: 'Top-tier European reasoning and prose model.', contextWindow: '128k', speed: 'Balanced', costTier: '$$', supportsStreaming: true, isPopular: true },
  { id: 'magistral-medium', providerId: 'mistral', providerName: 'Mistral AI', name: 'Magistral Medium', version: '1.0', category: 'text', description: 'Specialized narrative structure model.', contextWindow: '128k', speed: 'Fast', costTier: '$', supportsStreaming: true, isPopular: true },
  { id: 'codestral', providerId: 'mistral', providerName: 'Mistral AI', name: 'Codestral', version: '2.0', category: 'text', description: 'Code and structured logic specialist.', contextWindow: '128k', speed: 'Ultra Fast', costTier: '$', supportsStreaming: true, isPopular: true },

  // Moonshot
  { id: 'kimi-k2', providerId: 'moonshot', providerName: 'Moonshot AI', name: 'Kimi K2', version: 'K2', category: 'text', description: 'Long context Chinese and English literary model.', contextWindow: '200k', speed: 'Balanced', costTier: '$', supportsStreaming: true, isPopular: true },

  // Cohere
  { id: 'command-a', providerId: 'cohere', providerName: 'Cohere', name: 'Command A', version: 'A', category: 'text', description: 'Enterprise RAG and character dialog model.', contextWindow: '128k', speed: 'Fast', costTier: '$$', supportsStreaming: true, isPopular: true },

  // Amazon
  { id: 'nova-premier', providerId: 'amazon', providerName: 'Amazon Bedrock', name: 'Nova Premier', version: '1.0', category: 'text', description: 'Amazon flagship multimodal foundation model.', contextWindow: '300k', speed: 'Balanced', costTier: '$$', supportsVision: true, supportsStreaming: true, isPopular: true },

  // NVIDIA
  { id: 'nemotron-ultra', providerId: 'nvidia', providerName: 'NVIDIA AI', name: 'Nemotron Ultra', version: '3.0', category: 'text', description: '550B ultra high parameter model powering Skipper Chatbot.', contextWindow: '128k', speed: 'Fast', costTier: 'Free', supportsStreaming: true, isPopular: true },
];

export const ALL_IMAGE_MODELS: AIModel[] = [
  // OpenAI
  { id: 'gpt-image-1', providerId: 'openai', providerName: 'OpenAI', name: 'GPT Image 1', version: '1.0', category: 'image', description: 'Direct text-to-image generator with prompt adherence.', speed: 'Balanced', costTier: '$$', isPopular: true },

  // Google
  { id: 'gemini-2.5-flash-image', providerId: 'google', providerName: 'Google AI', name: 'Gemini 2.5 Flash Image', version: '2.5', category: 'image', description: 'Google free fast multimodal image generation model.', speed: 'Ultra Fast', costTier: 'Free', isPopular: true },
  { id: 'imagen-4-ultra', providerId: 'google', providerName: 'Google AI', name: 'Imagen 4 Ultra', version: '4.0', category: 'image', description: 'Google highest fidelity photorealistic generator.', speed: 'High Precision', costTier: '$$$', isPopular: true },
  { id: 'imagen-4', providerId: 'google', providerName: 'Google AI', name: 'Imagen 4', version: '4.0', category: 'image', description: 'Standard high definition Imagen 4.', speed: 'Fast', costTier: '$$', isPopular: true },
  { id: 'imagen-4-fast', providerId: 'google', providerName: 'Google AI', name: 'Imagen 4 Fast', version: '4.0', category: 'image', description: 'Rapid image preview model.', speed: 'Ultra Fast', costTier: '$', isPopular: true },

  // Black Forest Labs
  { id: 'flux-1.1-pro-ultra', providerId: 'blackforest', providerName: 'Black Forest Labs', name: 'FLUX 1.1 Pro Ultra', version: '1.1', category: 'image', description: 'State of the art cinematic artwork model.', speed: 'High Precision', costTier: '$$$', isPopular: true },
  { id: 'flux-1.1-pro', providerId: 'blackforest', providerName: 'Black Forest Labs', name: 'FLUX 1.1 Pro', version: '1.1', category: 'image', description: 'High speed professional FLUX model.', speed: 'Fast', costTier: '$$', isPopular: true },
  { id: 'flux-pro', providerId: 'blackforest', providerName: 'Black Forest Labs', name: 'FLUX Pro', version: '1.0', category: 'image', description: 'Proven FLUX Pro visual generator.', speed: 'Balanced', costTier: '$$', isPopular: true },
  { id: 'flux-dev', providerId: 'blackforest', providerName: 'Black Forest Labs', name: 'FLUX Dev', version: '1.0', category: 'image', description: 'Development tier FLUX model.', speed: 'Fast', costTier: '$', isPopular: true },
  { id: 'flux-schnell', providerId: 'blackforest', providerName: 'Black Forest Labs', name: 'FLUX Schnell', version: '1.0', category: 'image', description: 'Sub-second real-time image generator.', speed: 'Ultra Fast', costTier: 'Free', isPopular: true },

  // Ideogram
  { id: 'ideogram-3.0', providerId: 'ideogram', providerName: 'Ideogram', name: 'Ideogram 3.0', version: '3.0', category: 'image', description: 'Unrivaled typography and poster design generator.', speed: 'Balanced', costTier: '$$', isPopular: true },

  // Recraft
  { id: 'recraft-v3', providerId: 'recraft', providerName: 'Recraft', name: 'Recraft V3', version: 'V3', category: 'image', description: 'Vector and graphic design masterpiece model.', speed: 'Fast', costTier: '$$', isPopular: true },

  // Stability AI
  { id: 'stable-image-ultra', providerId: 'stability', providerName: 'Stability AI', name: 'Stable Image Ultra', version: '3.5', category: 'image', description: 'Ultra high resolution SD 3.5 variant.', speed: 'High Precision', costTier: '$$$', isPopular: true },
  { id: 'sd-3.5-large', providerId: 'stability', providerName: 'Stability AI', name: 'Stable Diffusion 3.5 Large', version: '3.5', category: 'image', description: '8B parameter image generation powerhouse.', speed: 'Balanced', costTier: '$$', isPopular: true },
  { id: 'sdxl', providerId: 'stability', providerName: 'Stability AI', name: 'Stable Diffusion XL', version: 'XL', category: 'image', description: 'Industry benchmark photorealistic SDXL.', speed: 'Fast', costTier: '$', isPopular: true },

  // Luma AI
  { id: 'photon', providerId: 'luma', providerName: 'Luma AI', name: 'Photon', version: '1.0', category: 'image', description: 'Hyper-realistic lighting and skin texture generator.', speed: 'Balanced', costTier: '$$', isPopular: true },
  { id: 'photon-flash', providerId: 'luma', providerName: 'Luma AI', name: 'Photon Flash', version: '1.0', category: 'image', description: 'Rapid Photon model.', speed: 'Ultra Fast', costTier: '$', isPopular: true },

  // HiDream
  { id: 'hidream-i1-full', providerId: 'hidream', providerName: 'HiDream AI', name: 'HiDream I1 Full', version: 'I1', category: 'image', description: 'Full parameter visual scene engine.', speed: 'High Precision', costTier: '$$', isPopular: true },
  { id: 'hidream-i1-fast', providerId: 'hidream', providerName: 'HiDream AI', name: 'HiDream I1 Fast', version: 'I1', category: 'image', description: 'Fast HiDream image model.', speed: 'Fast', costTier: '$', isPopular: true },

  // Seedream
  { id: 'seedream-3.0', providerId: 'seedream', providerName: 'Seedream', name: 'Seedream 3.0', version: '3.0', category: 'image', description: 'Concept art and character design model.', speed: 'Balanced', costTier: '$', isPopular: true },

  // Adobe
  { id: 'firefly-4', providerId: 'adobe', providerName: 'Adobe Firefly', name: 'Firefly Image 4', version: '4.0', category: 'image', description: 'Commercial safe creative image model.', speed: 'Balanced', costTier: '$$', isPopular: true },

  // Nano Banana
  { id: 'nanobanana-latest', providerId: 'nanobanana', providerName: 'Nano Banana', name: 'Nano Banana Latest', version: 'Latest', category: 'image', description: 'Experimental lightweight image generator.', speed: 'Ultra Fast', costTier: 'Free', isPopular: true },
];

export const DEFAULT_FEATURE_ASSIGNMENTS: Record<AIFeatureId, { providerId: string; modelId: string; modelName: string }> = {
  storyGenerator: { providerId: 'google', modelId: 'gemini-2.5-flash', modelName: 'Gemini 2.5 Flash' },
  chatbot: { providerId: 'nvidia', modelId: 'nemotron-ultra', modelName: 'Nemotron Ultra' },
  characterGenerator: { providerId: 'google', modelId: 'gemini-2.5-flash', modelName: 'Gemini 2.5 Flash' },
  sceneGenerator: { providerId: 'google', modelId: 'gemini-2.5-flash', modelName: 'Gemini 2.5 Flash' },
  promptGenerator: { providerId: 'google', modelId: 'gemini-2.5-flash', modelName: 'Gemini 2.5 Flash' },
  dialogueGenerator: { providerId: 'google', modelId: 'gemini-2.5-flash', modelName: 'Gemini 2.5 Flash' },
  continuityChecker: { providerId: 'deepseek', modelId: 'deepseek-r1', modelName: 'DeepSeek R1' },
  storyboardAssistant: { providerId: 'google', modelId: 'gemini-2.5-flash', modelName: 'Gemini 2.5 Flash' },
  artworkStudio: { providerId: 'google', modelId: 'gemini-2.5-flash-image', modelName: 'Gemini 2.5 Flash Image' },
  imageUpscaler: { providerId: 'google', modelId: 'gemini-2.5-flash-image', modelName: 'Gemini 2.5 Flash Image' },
};

interface APIHubState {
  operatingMode: 'default' | 'custom';
  providerConfigs: Record<string, ProviderConfig>;
  featureAssignments: Record<AIFeatureId, { providerId: string; modelId: string; modelName: string }>;
  fallbackChain: Array<{ providerId: string; modelId: string }>;
  metrics: {
    dailyRequests: number;
    totalNeuronsUsed: number;
    avgLatencyMs: number;
    errorCount: number;
    lastSuccessAt: string | null;
  };

  // Actions
  setOperatingMode: (mode: 'default' | 'custom') => void;
  setProviderApiKey: (providerId: string, apiKey: string) => void;
  testProviderConnection: (providerId: string) => Promise<boolean>;
  setProviderActiveModel: (providerId: string, modelId: string) => void;
  setFeatureAssignment: (featureId: AIFeatureId, providerId: string, modelId: string, modelName: string) => void;
  setFallbackChain: (chain: Array<{ providerId: string; modelId: string }>) => void;
  resetAllToDefaults: () => void;
}

export const useAPIHubStore = create<APIHubState>()(
  persist(
    (set, get) => ({
      operatingMode: 'default',
      providerConfigs: {
        openai: { providerId: 'openai', providerName: 'OpenAI', apiKey: '', status: 'disconnected', activeModelId: 'gpt-4.1-mini' },
        google: { providerId: 'google', providerName: 'Google AI', apiKey: '', status: 'connected', activeModelId: 'gemini-2.5-flash-image', latencyMs: 140 },
        anthropic: { providerId: 'anthropic', providerName: 'Anthropic', apiKey: '', status: 'disconnected', activeModelId: 'claude-sonnet-4' },
        xai: { providerId: 'xai', providerName: 'xAI', apiKey: '', status: 'disconnected', activeModelId: 'grok-4' },
        meta: { providerId: 'meta', providerName: 'Meta AI', apiKey: '', status: 'disconnected', activeModelId: 'llama-4-maverick' },
        mistral: { providerId: 'mistral', providerName: 'Mistral AI', apiKey: '', status: 'disconnected', activeModelId: 'mistral-large' },
        deepseek: { providerId: 'deepseek', providerName: 'DeepSeek', apiKey: '', status: 'connected', activeModelId: 'deepseek-r1', latencyMs: 210 },
        alibaba: { providerId: 'alibaba', providerName: 'Alibaba Cloud', apiKey: '', status: 'disconnected', activeModelId: 'qwen3-235b' },
        blackforest: { providerId: 'blackforest', providerName: 'Black Forest Labs', apiKey: '', status: 'connected', activeModelId: 'flux-schnell', latencyMs: 380 },
        openrouter: { providerId: 'openrouter', providerName: 'OpenRouter', apiKey: '', status: 'connected', activeModelId: 'nemotron-ultra', latencyMs: 180 },
      },
      featureAssignments: DEFAULT_FEATURE_ASSIGNMENTS,
      fallbackChain: [
        { providerId: 'google', modelId: 'gemini-2.5-flash' },
        { providerId: 'deepseek', modelId: 'deepseek-r1' },
        { providerId: 'openrouter', modelId: 'nemotron-ultra' },
      ],
      metrics: {
        dailyRequests: 142,
        totalNeuronsUsed: 9580,
        avgLatencyMs: 215,
        errorCount: 0,
        lastSuccessAt: new Date().toISOString(),
      },

      setOperatingMode: (mode) => set({ operatingMode: mode }),

      setProviderApiKey: (providerId, apiKey) => set((state) => ({
        providerConfigs: {
          ...state.providerConfigs,
          [providerId]: {
            ...state.providerConfigs[providerId],
            providerId: providerId as any,
            providerName: providerId.toUpperCase(),
            apiKey,
            status: apiKey.trim() ? 'testing' : 'disconnected',
          }
        }
      })),

      testProviderConnection: async (providerId) => {
        const config = get().providerConfigs[providerId];
        if (!config || !config.apiKey.trim()) {
          set((state) => ({
            providerConfigs: {
              ...state.providerConfigs,
              [providerId]: {
                ...state.providerConfigs[providerId],
                status: 'invalid_key',
                errorMessage: 'Please enter a valid API key before testing connection.'
              }
            }
          }));
          return false;
        }

        set((state) => ({
          providerConfigs: {
            ...state.providerConfigs,
            [providerId]: { ...state.providerConfigs[providerId], status: 'testing' }
          }
        }));

        // Simulate API latency & validation test
        const startTime = Date.now();
        await new Promise((r) => setTimeout(r, 1200));
        const latency = Date.now() - startTime;

        set((state) => ({
          providerConfigs: {
            ...state.providerConfigs,
            [providerId]: {
              ...state.providerConfigs[providerId],
              status: 'connected',
              latencyMs: latency,
              lastTestedAt: new Date().toISOString(),
              errorMessage: undefined,
            }
          }
        }));
        return true;
      },

      setProviderActiveModel: (providerId, modelId) => set((state) => ({
        providerConfigs: {
          ...state.providerConfigs,
          [providerId]: {
            ...state.providerConfigs[providerId],
            activeModelId: modelId,
          }
        }
      })),

      setFeatureAssignment: (featureId, providerId, modelId, modelName) => set((state) => ({
        featureAssignments: {
          ...state.featureAssignments,
          [featureId]: { providerId, modelId, modelName },
        }
      })),

      setFallbackChain: (chain) => set({ fallbackChain: chain }),

      resetAllToDefaults: () => set({
        operatingMode: 'default',
        featureAssignments: DEFAULT_FEATURE_ASSIGNMENTS,
      }),
    }),
    {
      name: 'knightora-api-hub-store',
    }
  )
);
