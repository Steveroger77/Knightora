-- ==========================================
-- KNIGHTORA - DEMO SEED DATA
-- seed.sql
-- ==========================================

-- Standard Demo Project UUIDs
DO $$
DECLARE
    demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
    proj_id UUID := '11111111-1111-1111-1111-111111111111';
    script_id UUID := '22222222-2222-2222-2222-222222222222';
    char_elena_id UUID := '33333333-3333-3333-3333-333333333333';
    char_matteo_id UUID := '44444444-4444-4444-4444-444444444444';
    loc_workshop_id UUID := '55555555-5555-5555-5555-555555555555';
    prop_astrolabe_id UUID := '66666666-6666-6666-6666-666666666666';
    scene1_id UUID := '77777777-7777-7777-7777-777777777771';
    scene2_id UUID := '77777777-7777-7777-7777-777777777772';
    scene3_id UUID := '77777777-7777-7777-7777-777777777773';
BEGIN
    -- 0. Ensure Demo User Exists in auth.users for FK Constraints
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
    VALUES (
        demo_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'demo@knightora.app',
        '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr',
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"displayName":"Venetian Author","username":"knightora_demo"}'
    ) ON CONFLICT (id) DO NOTHING;

    -- 1. Create Demo Project
    INSERT INTO public.projects (id, user_id, title, description, cover_image_url)
    VALUES (
        proj_id,
        demo_user_id,
        'The Clockwork Alchemy of Venice',
        'A gothic cinematic mystery set in 16th century Venice, where a master horologist discovers a brass automaton capable of altering memory.',
        'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80'
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Create Script
    INSERT INTO public.scripts (id, project_id, title, format, word_count, reading_time_minutes, content)
    VALUES (
        script_id,
        proj_id,
        'The Clockwork Alchemy of Venice - Feature Screenplay',
        'screenplay',
        1450,
        12,
        '{
            "type": "doc",
            "content": [
                {
                    "type": "heading",
                    "attrs": { "level": 2 },
                    "content": [{ "type": "text", "text": "EXT. GRAND CANAL - VENICE - NIGHT" }]
                },
                {
                    "type": "paragraph",
                    "content": [{ "type": "text", "text": "Fog thick as spilled milk rolls off the dark lagoon. Black gondolas sway like shadow coffins tied to wooden posts. Rain whispers across the ancient marble facades." }]
                },
                {
                    "type": "heading",
                    "attrs": { "level": 2 },
                    "content": [{ "type": "text", "text": "INT. MATTEO''S WORKSHOP - CONTINUOUS" }]
                },
                {
                    "type": "paragraph",
                    "content": [{ "type": "text", "text": "Brass gears of every dimension line velvet trays. Ticking clocks create a rhythmic heartbeat throughout the vaulted chamber. MATTEO VALENTI (45), weary eyes under thick brows, peers through an ocular magnifying loupe." }]
                },
                {
                    "type": "paragraph",
                    "content": [{ "type": "text", "text": "He delicately turns an obsidian screw into the chest cavity of a brass mechanical sparrow." }]
                },
                {
                    "type": "paragraph",
                    "attrs": { "textAlign": "center" },
                    "content": [{ "type": "text", "text": "MATTEO" }]
                },
                {
                    "type": "paragraph",
                    "attrs": { "textAlign": "center" },
                    "content": [{ "type": "text", "text": "(whispering to himself)" }]
                },
                {
                    "type": "paragraph",
                    "attrs": { "textAlign": "center" },
                    "content": [{ "type": "text", "text": "Just one more turn... release the memory." }]
                },
                {
                    "type": "paragraph",
                    "content": [{ "type": "text", "text": "Heavy footsteps echo on the stone staircase outside. The iron door latch shakes. Enter ELENA ARMANI (32), sharp velvet coat, dark hair tied back with silver wire. She holds a damp leather folio to her chest." }]
                },
                {
                    "type": "paragraph",
                    "attrs": { "textAlign": "center" },
                    "content": [{ "type": "text", "text": "ELENA" }]
                },
                {
                    "type": "paragraph",
                    "attrs": { "textAlign": "center" },
                    "content": [{ "type": "text", "text": "The Council knows about the obsidian core, Matteo. We have less than an hour." }]
                }
            ]
        }'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- 3. Characters
    INSERT INTO public.characters (id, project_id, name, description, age, gender, occupation, appearance, personality, goals, motivations, strengths, weaknesses, arc_summary)
    VALUES
    (
        char_matteo_id,
        proj_id,
        'Matteo Valenti',
        'Master horologist and alchemical engineer who secretly guards the Obsidian Automaton.',
        '45',
        'Male',
        'Master Clockmaker & Alchemist',
        'Tall, lean build, silver-streaked dark hair, wearing a dark leather apron over linen shirt, ocular magnifying loupe over left eye.',
        'Meticulous, introspective, quiet intensity, fiercely protective of his creations.',
        'To complete the automaton and unlock his missing sister''s last recorded memory.',
        'Guilt over the night the Venetian Council seized his family workshop.',
        'Incredible mechanical intellect, steady surgical hand, deep knowledge of metallurgy.',
        'Obsessive focus causing him to ignore imminent danger; reluctance to trust allies.',
        'Transforms from a solitary, grieving recluse into a decisive rebel fighting the Council.'
    ),
    (
        char_elena_id,
        proj_id,
        'Elena Armani',
        'Rogue archivist for the Venetian Inquisitors, operating as a double agent for the Guild of Scholars.',
        '32',
        'Female',
        'Inquisitorial Archivist / Scholar',
        'Sharp cheekbones, raven-black hair bound with silver thread, tailored dark velvet coat with hidden leather parchment holsters.',
        'Calculating, swift, highly observant, dry wit under intense pressure.',
        'To smuggle the alchemical schematics out of Venice before the Doge destroys them.',
        'Seeking truth regarding the mysterious disappearance of the Guild founders.',
        'Master of cyphers, deceptive diplomacy, quick with a hidden stiletto.',
        'Haunted by betrayal in her past; struggles with genuine emotional vulnerability.',
        'Evolves from a calculating informant into Matteo''s loyal co-conspirator.'
    ) ON CONFLICT (id) DO NOTHING;

    -- 4. Location
    INSERT INTO public.locations (id, project_id, name, description, atmosphere, time_of_day, weather, history)
    VALUES (
        loc_workshop_id,
        proj_id,
        'Matteo''s Venetian Workshop',
        'A hidden three-story clocktower workshop tucked behind the San Zaccaria canal, filled with brass armillary spheres, glass retorts, and velvet trays of gears.',
        'Ticking clockwork rhythm, smell of lamp oil, clove, and polished brass; warm amber lantern light contrasting cold blue canal mist.',
        'Midnight',
        'Heavy mist and soft autumn rain',
        'Built in 1482 by Matteo''s grandfather, secretly expanded downward into ancient Roman vault foundations.'
    ) ON CONFLICT (id) DO NOTHING;

    -- 5. Prop
    INSERT INTO public.props (id, project_id, name, description, owner, status, history)
    VALUES (
        prop_astrolabe_id,
        proj_id,
        'The Obsidian Astrolabe',
        'A pocket-sized brass and black obsidian celestial calculator containing micro-engraved alchemical memory cyphers.',
        'Matteo Valenti',
        'Intact & operational',
        'Crafted by the Guild of Scholars in 1510; said to tune the clockwork sparrow to resonant human brainwaves.'
    ) ON CONFLICT (id) DO NOTHING;

    -- 6. Scenes
    INSERT INTO public.scenes (id, project_id, script_id, scene_number, title, summary, mood, time_of_day, weather, dialogue_excerpt)
    VALUES
    (
        scene1_id,
        proj_id,
        script_id,
        1,
        'EXT. GRAND CANAL - VENICE - NIGHT',
        'Rain sweeps across the Venetian lagoon as dark gondolas drift past silent palaces.',
        'Atmospheric, gothic, ominous',
        'Night',
        'Rain and heavy canal fog',
        'Fog thick as spilled milk rolls off the dark lagoon...'
    ),
    (
        scene2_id,
        proj_id,
        script_id,
        2,
        'INT. MATTEO''S WORKSHOP - CONTINUOUS',
        'Matteo works on the mechanical sparrow until Elena bursts in with news of the Council.',
        'Tense, claustrophobic, urgent',
        'Night',
        'Storm outside',
        'The Council knows about the obsidian core, Matteo. We have less than an hour.'
    ),
    (
        scene3_id,
        proj_id,
        script_id,
        3,
        'INT. SECRET CATACONBS - LATER',
        'Matteo and Elena descend into the submerged Roman vaults beneath the workshop.',
        'Mysterious, ancient, awe-inspiring',
        '2:00 AM',
        'Subterranean dampness',
        'These gears haven''t turned in three hundred years...'
    ) ON CONFLICT (id) DO NOTHING;

    -- 7. Scene Junctions
    INSERT INTO public.scene_characters (scene_id, character_id) VALUES
    (scene2_id, char_matteo_id),
    (scene2_id, char_elena_id),
    (scene3_id, char_matteo_id),
    (scene3_id, char_elena_id)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.scene_locations (scene_id, location_id) VALUES
    (scene2_id, loc_workshop_id)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.scene_props (scene_id, prop_id) VALUES
    (scene2_id, prop_astrolabe_id)
    ON CONFLICT DO NOTHING;

    -- 8. Relationships
    INSERT INTO public.relationships (project_id, character_a_id, character_b_id, type, description)
    VALUES (
        proj_id,
        char_matteo_id,
        char_elena_id,
        'business_partner',
        'Uneasy allies bound by shared danger; Matteo mistrusts her Inquisitorial badge, while Elena needs his mechanical mastery.'
    ) ON CONFLICT DO NOTHING;

    -- 9. Timeline Events
    INSERT INTO public.timeline_events (project_id, day_or_date, title, description, related_scene_id, related_character_ids)
    VALUES
    (
        proj_id,
        'October 14, 1534 - 11:30 PM',
        'Arrival at the Workshop',
        'Elena evades Venetian Inquisitorial guards and reaches Matteo''s secret sanctuary.',
        scene2_id,
        ARRAY[char_matteo_id, char_elena_id]
    ),
    (
        proj_id,
        'October 15, 1534 - 12:15 AM',
        'Discovery of the Council Decree',
        'Elena reveals the Doge has signed an immediate seizure warrant for all alchemical clockwork.',
        scene2_id,
        ARRAY[char_elena_id]
    ) ON CONFLICT DO NOTHING;

    -- 10. Generated Placeholder Images
    INSERT INTO public.generated_images (project_id, scene_id, character_id, image_url, prompt, style_preset, camera_angle, lighting, mood)
    VALUES
    (
        proj_id,
        scene2_id,
        char_matteo_id,
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
        'Cinematic portrait of Matteo Valenti, Venetian master clockmaker with ocular lens working on brass gears in candlelit workshop.',
        'Cinematic',
        'Close-Up',
        'Candlelit',
        'Tense & Focused'
    ),
    (
        proj_id,
        scene2_id,
        char_elena_id,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
        'Cinematic portrait of Elena Armani in dark velvet coat standing at a rainy Venetian window holding a leather folio.',
        'Noir',
        'Medium Shot',
        'Moonlit',
        'Suspenseful'
    ) ON CONFLICT DO NOTHING;

    -- 11. Consistency Flags
    INSERT INTO public.consistency_flags (project_id, type, description, related_entity_ids, status)
    VALUES
    (
        proj_id,
        'timeline',
        'Elena mentions the Council warrant was signed at dawn, but Scene 1 states news only broke at midnight.',
        ARRAY[char_elena_id],
        'open'
    ),
    (
        proj_id,
        'object',
        'Matteo places the Obsidian Astrolabe in a iron vault in Scene 2, but holds it in his hand at start of Scene 3 without retrieval action.',
        ARRAY[prop_astrolabe_id],
        'open'
    ) ON CONFLICT DO NOTHING;

    -- 12. Notes
    INSERT INTO public.notes (project_id, attached_to_type, attached_to_id, content)
    VALUES
    (
        proj_id,
        'character',
        char_matteo_id,
        'Remember to emphasize Matteo''s subtle limp from his early apprentice injury in glass retorts.'
    ),
    (
        proj_id,
        'location',
        loc_workshop_id,
        'The water level rises 4 inches during high tide; add ticking sound blending with water splashing.'
    ) ON CONFLICT DO NOTHING;

END $$;
