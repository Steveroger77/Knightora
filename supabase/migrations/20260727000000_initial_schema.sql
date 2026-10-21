-- ==========================================
-- KNIGHTORA - INITIAL DATABASE SCHEMA
-- Migration: 20260727000000_initial_schema.sql
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------
-- 1. PROJECTS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON public.projects(user_id);

-- ------------------------------------------
-- 2. SCRIPTS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'screenplay' CHECK (format IN ('movie', 'screenplay', 'short_story', 'novel', 'comic', 'stage_play', 'game_narrative', 'episode')),
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    word_count INT NOT NULL DEFAULT 0,
    reading_time_minutes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scripts_project_id ON public.scripts(project_id);

-- ------------------------------------------
-- 3. SCRIPT VERSIONS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.script_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
    content_snapshot JSONB NOT NULL,
    label TEXT NOT NULL DEFAULT 'Autosave Snapshot',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_script_versions_script_id ON public.script_versions(script_id);

-- ------------------------------------------
-- 4. CHARACTERS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    age TEXT,
    gender TEXT,
    occupation TEXT,
    appearance TEXT,
    personality TEXT,
    goals TEXT,
    motivations TEXT,
    strengths TEXT,
    weaknesses TEXT,
    arc_summary TEXT,
    user_edited_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_characters_project_id ON public.characters(project_id);

-- ------------------------------------------
-- 5. CHARACTER IMAGES TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.character_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'portrait' CHECK (type IN ('portrait', 'full_body', 'expression', 'clothing_variant', 'action_pose', 'angle_variant')),
    style_preset TEXT,
    prompt TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_character_images_character_id ON public.character_images(character_id);

-- ------------------------------------------
-- 6. LOCATIONS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    atmosphere TEXT,
    time_of_day TEXT,
    weather TEXT,
    history TEXT,
    user_edited_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_project_id ON public.locations(project_id);

-- ------------------------------------------
-- 7. PROPS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.props (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    owner TEXT,
    status TEXT,
    history TEXT,
    user_edited_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_props_project_id ON public.props(project_id);

-- ------------------------------------------
-- 8. SCENES TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    script_id UUID REFERENCES public.scripts(id) ON DELETE SET NULL,
    scene_number INT NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    summary TEXT,
    mood TEXT,
    time_of_day TEXT,
    weather TEXT,
    dialogue_excerpt TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scenes_project_id ON public.scenes(project_id);
CREATE INDEX idx_scenes_script_id ON public.scenes(script_id);

-- ------------------------------------------
-- 9. MANY-TO-MANY JUNCTIONS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.scene_characters (
    scene_id UUID NOT NULL REFERENCES public.scenes(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    PRIMARY KEY (scene_id, character_id)
);

CREATE TABLE IF NOT EXISTS public.scene_locations (
    scene_id UUID NOT NULL REFERENCES public.scenes(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    PRIMARY KEY (scene_id, location_id)
);

CREATE TABLE IF NOT EXISTS public.scene_props (
    scene_id UUID NOT NULL REFERENCES public.scenes(id) ON DELETE CASCADE,
    prop_id UUID NOT NULL REFERENCES public.props(id) ON DELETE CASCADE,
    PRIMARY KEY (scene_id, prop_id)
);

-- ------------------------------------------
-- 10. GENERATED IMAGES TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.generated_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    scene_id UUID REFERENCES public.scenes(id) ON DELETE SET NULL,
    character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    style_preset TEXT,
    camera_angle TEXT,
    lens TEXT,
    lighting TEXT,
    weather TEXT,
    time_of_day TEXT,
    mood TEXT,
    color_palette TEXT,
    aspect_ratio TEXT DEFAULT '16:9',
    steps INT DEFAULT 4,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generated_images_project_id ON public.generated_images(project_id);

-- ------------------------------------------
-- 11. TIMELINE EVENTS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    day_or_date TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    related_scene_id UUID REFERENCES public.scenes(id) ON DELETE SET NULL,
    related_character_ids UUID[] DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_events_project_id ON public.timeline_events(project_id);

-- ------------------------------------------
-- 12. RELATIONSHIPS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    character_a_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    character_b_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'unknown' CHECK (type IN ('friend', 'enemy', 'sibling', 'mentor', 'student', 'parent', 'lover', 'business_partner', 'unknown')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_relationships_project_id ON public.relationships(project_id);

-- ------------------------------------------
-- 13. NOTES TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    attached_to_type TEXT NOT NULL CHECK (attached_to_type IN ('scene', 'character', 'location', 'prop', 'timeline_event', 'project')),
    attached_to_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_project_id ON public.notes(project_id);

-- ------------------------------------------
-- 14. CONSISTENCY FLAGS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.consistency_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('appearance', 'age', 'relationship', 'timeline', 'object', 'character_death', 'location', 'rule', 'duplicate', 'continuity')),
    description TEXT NOT NULL,
    related_entity_ids UUID[] DEFAULT ARRAY[]::UUID[],
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'ignored', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consistency_flags_project_id ON public.consistency_flags(project_id);

-- ------------------------------------------
-- 15. NEURON USAGE TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.neuron_usage (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    neurons_used INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, date)
);

-- ------------------------------------------
-- 16. AI SESSIONS TABLE (Project Conversational Context)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
    turns JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.props ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consistency_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neuron_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;

-- Helper function for project ownership
CREATE OR REPLACE FUNCTION public.owns_project(proj_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = proj_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Projects RLS
CREATE POLICY "Users control their own projects"
ON public.projects FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Scripts RLS
CREATE POLICY "Users control scripts in their projects"
ON public.scripts FOR ALL
USING (public.owns_project(project_id))
WITH CHECK (public.owns_project(project_id));

-- Script Versions RLS
CREATE POLICY "Users control script versions in their projects"
ON public.script_versions FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.scripts s
    JOIN public.projects p ON s.project_id = p.id
    WHERE s.id = script_id AND p.user_id = auth.uid()
));

-- Characters RLS
CREATE POLICY "Users control characters in their projects"
ON public.characters FOR ALL
USING (public.owns_project(project_id))
WITH CHECK (public.owns_project(project_id));

-- Character Images RLS
CREATE POLICY "Users control character images in their projects"
ON public.character_images FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.characters c
    JOIN public.projects p ON c.project_id = p.id
    WHERE c.id = character_id AND p.user_id = auth.uid()
));

-- Locations RLS
CREATE POLICY "Users control locations in their projects"
ON public.locations FOR ALL
USING (public.owns_project(project_id))
WITH CHECK (public.owns_project(project_id));

-- Props RLS
CREATE POLICY "Users control props in their projects"
ON public.props FOR ALL
USING (public.owns_project(project_id))
WITH CHECK (public.owns_project(project_id));

-- Scenes RLS
CREATE POLICY "Users control scenes in their projects"
ON public.scenes FOR ALL
USING (public.owns_project(project_id))
WITH CHECK (public.owns_project(project_id));

-- Junctions RLS
CREATE POLICY "Users control scene_characters"
ON public.scene_characters FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.scenes s WHERE s.id = scene_id AND public.owns_project(s.project_id)
));

CREATE POLICY "Users control scene_locations"
ON public.scene_locations FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.scenes s WHERE s.id = scene_id AND public.owns_project(s.project_id)
));

CREATE POLICY "Users control scene_props"
ON public.scene_props FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.scenes s WHERE s.id = scene_id AND public.owns_project(s.project_id)
));

-- Generated Images RLS
CREATE POLICY "Users control generated_images in their projects"
ON public.generated_images FOR ALL
USING (public.owns_project(project_id))
WITH CHECK (public.owns_project(project_id));

-- Timeline Events RLS
CREATE POLICY "Users control timeline_events in their projects"
ON public.timeline_events FOR ALL
USING (public.owns_project(project_id))
WITH CHECK (public.owns_project(project_id));

-- Relationships RLS
CREATE POLICY "Users control relationships in their projects"
ON public.relationships FOR ALL
USING (public.owns_project(project_id))
WITH CHECK (public.owns_project(project_id));

-- Notes RLS
CREATE POLICY "Users control notes in their projects"
ON public.notes FOR ALL
USING (public.owns_project(project_id))
WITH CHECK (public.owns_project(project_id));

-- Consistency Flags RLS
CREATE POLICY "Users control consistency_flags in their projects"
ON public.consistency_flags FOR ALL
USING (public.owns_project(project_id))
WITH CHECK (public.owns_project(project_id));

-- Neuron Usage RLS
CREATE POLICY "Users read and update their neuron usage"
ON public.neuron_usage FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- AI Sessions RLS
CREATE POLICY "Users control AI sessions in their projects"
ON public.ai_sessions FOR ALL
USING (public.owns_project(project_id))
WITH CHECK (public.owns_project(project_id));

-- ==========================================
-- STORAGE BUCKETS SETUP
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true),
       ('cover-images', 'cover-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read for generated images"
ON storage.objects FOR SELECT
USING (bucket_id IN ('generated-images', 'cover-images'));

CREATE POLICY "Authenticated user folder upload for generated images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id IN ('generated-images', 'cover-images') AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
