import { Project, Script, Character, Location, Prop, Scene, Relationship, TimelineEvent, GeneratedImage, Note, ConsistencyFlag } from '../types';

export const DEMO_PROJECT: Project = {
  id: '11111111-1111-1111-1111-111111111111',
  userId: '00000000-0000-0000-0000-000000000001',
  title: 'The Whispering Manor',
  description: 'A thrilling mystery following three siblings—Ethan, Liam, and Ava Carter—who receive anonymous letters leading them to an abandoned mansion, underground church tunnels, and a secret organization protecting a chamber beneath Raven Lake.',
  coverImageUrl: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80',
  createdAt: '2026-08-02T00:00:00Z',
  updatedAt: '2026-08-02T00:00:00Z',
};

export const DEMO_SCRIPT: Script = {
  id: '22222222-2222-2222-2222-222222222222',
  projectId: DEMO_PROJECT.id,
  title: 'The Whispering Manor',
  format: 'screenplay',
  wordCount: 850,
  readingTimeMinutes: 7,
  createdAt: '2026-08-02T00:00:00Z',
  updatedAt: '2026-08-02T00:00:00Z',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'EXT. BLACKWOOD MANOR - DAY' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'A 250-year-old abandoned mansion looms amidst choked fog. Oak doors creak open as three siblings—ETHAN CARTER (eldest, history professor), LIAM CARTER (middle brother, former military officer), and AVA CARTER (youngest sister, investigative journalist)—step onto the weathered porch, holding identical anonymous letters.' }]
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [{ type: 'text', text: 'AVA' }]
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [{ type: 'text', text: '"Your parents never left." That\'s what the letter says.' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Inside the foyer, Ethan uncovers a recent photograph showing their missing parents beside FATHER BENEDICT. DETECTIVE MARCUS REED steps out from the shadows.' }]
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [{ type: 'text', text: 'MARCUS' }]
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [{ type: 'text', text: 'I investigated your parents\' disappearance twenty years ago. The clues lead to St. Gabriel\'s Church.' }]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: "INT. ST. GABRIEL'S CHURCH - UNDERGROUND TUNNELS - NIGHT" }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hidden beneath the 180-year-old church, damp stone walls whisper with history. Liam leads with a tactical flashlight, illuminating leather-bound journals describing a secret organization protecting a chamber beneath Raven Lake. Suddenly, iron gates slam shut!' }]
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [{ type: 'text', text: 'LIAM' }]
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [{ type: 'text', text: 'Stand back! We\'re getting out of here together.' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'They breach the iron gate and escape into the graveyard, finding only blood where Father Benedict was standing.' }]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'EXT. RAVEN LAKE - LIGHTHOUSE & CHAMBER - DAWN' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'At Raven Lake, inside an abandoned lighthouse, photographs of every missing family line the walls. Marcus draws a weapon, revealing he is the leader of the organization.' }]
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [{ type: 'text', text: 'MARCUS' }]
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [{ type: 'text', text: 'Only together could the three of you unlock the hidden chamber beneath the lake.' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Inside the submerged chamber, their parents are alive! Father Benedict appears—the blood was staged to deceive Marcus. During a violent struggle, Liam pushes Marcus into Raven Lake, where he disappears beneath the dark water.' }]
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [{ type: 'text', text: 'FADE OUT.' }]
      }
    ]
  }
};

export const DEMO_CHARACTERS: Character[] = [
  {
    id: '33333333-3333-3333-3333-333333333331',
    projectId: DEMO_PROJECT.id,
    characterCode: 'CHAR_001',
    name: 'Ethan Carter',
    description: 'Eldest sibling and history professor obsessed with historical archives and ancient texts.',
    age: '38',
    gender: 'Male',
    height: '6 ft 0 in',
    build: 'Lean athletic build',
    skinTone: 'Fair with subtle warm undertone',
    faceShape: 'Angular jawline with high cheekbones',
    hairStyle: 'Slightly messy medium-length hair parted on the side',
    hairColor: 'Dark brown with subtle silver strands at temples',
    eyeColor: 'Intense hazel green eyes',
    expressions: 'Thoughtful, intense, observant',
    clothing: 'Brown wool tweed jacket, dark turtleneck sweater, tailored charcoal trousers',
    footwear: 'Dark leather oxford boots',
    accessories: 'Vintage gold wire-rimmed glasses, worn leather journal',
    distinctiveMarks: 'Faint scar on left eyebrow',
    occupation: 'History Professor',
    appearance: 'Tweed jacket, wire-rimmed glasses, hazel green eyes, dark brown hair with silver temples, lean build.',
    personality: 'Analytical, cautious, protective of his younger siblings, deeply reflective.',
    goals: 'To decipher the historical documents and locate his missing parents.',
    motivations: 'Family loyalty and a need to solve the mystery that defined his childhood.',
    strengths: 'Deep historical knowledge, fluent in ancient Latin and cryptology.',
    weaknesses: 'Hesitant in physical danger, overthinks under pressure.',
    arcSummary: 'Overcomes intellectual detachment to fight for his living family.',
    sceneAppearances: ['Scene 1: Blackwood Manor', 'Scene 2: St. Gabriel Catacombs', 'Scene 3: Raven Lake Chamber'],
    userEditedFields: [],
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333332',
    projectId: DEMO_PROJECT.id,
    characterCode: 'CHAR_002',
    name: 'Liam Carter',
    description: 'Middle brother and former military officer providing tactical protection and tactical instinct.',
    age: '35',
    gender: 'Male',
    height: '6 ft 2 in',
    build: 'Muscular, broad shoulders, athletic posture',
    skinTone: 'Weathered tan',
    faceShape: 'Square, strong jaw',
    hairStyle: 'Short military crew cut',
    hairColor: 'Dark jet black',
    eyeColor: 'Deep steel blue eyes',
    expressions: 'Stern, hyper-vigilant, protective',
    clothing: 'Black tactical waterproof coat, dark combat pants, dark tactical boots',
    footwear: 'Heavy duty tactical combat boots',
    accessories: 'Tactical flashlight, heavy leather gloves',
    distinctiveMarks: 'Scar across right knuckle',
    occupation: 'Former Military Officer',
    appearance: 'Broad shoulders, black tactical coat, short cropped black hair, steel blue eyes, military build.',
    personality: 'Decisive, action-oriented, stoic, fierce guardian of Ethan and Ava.',
    goals: 'To keep his siblings alive through physical hazards and eliminate threats.',
    motivations: 'Military duty and fierce familial instinct.',
    strengths: 'Hand-to-hand combat, tactical awareness, quick reflex under fire.',
    weaknesses: 'Prone to reckless aggression when his siblings are threatened.',
    arcSummary: 'Uses his combat prowess to defeat Detective Marcus Reed in the final confrontation.',
    sceneAppearances: ['Scene 1: Blackwood Manor', 'Scene 2: St. Gabriel Catacombs', 'Scene 3: Raven Lake Chamber'],
    userEditedFields: [],
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    projectId: DEMO_PROJECT.id,
    characterCode: 'CHAR_003',
    name: 'Ava Carter',
    description: 'Youngest sister and sharp investigative journalist who exposes secrets.',
    age: '30',
    gender: 'Female',
    height: '5 ft 7 in',
    build: 'Slender, energetic, agile',
    skinTone: 'Olive skin tone',
    faceShape: 'Heart-shaped face with sharp chin',
    hairStyle: 'Shoulder-length wavy hair tied in a loose ponytail',
    hairColor: 'Auburn reddish-brown',
    eyeColor: 'Piercing dark brown eyes',
    expressions: 'Inquisitive, sharp, undaunted',
    clothing: 'Dark leather jacket, fitted charcoal jeans, dark knit sweater',
    footwear: 'Ankle leather riding boots',
    accessories: 'Vintage brass camera strap, digital micro-recorder',
    distinctiveMarks: 'Light freckles across bridge of nose',
    occupation: 'Investigative Journalist',
    appearance: 'Dark leather jacket, auburn hair tied back, piercing brown eyes, slender agile build.',
    personality: 'Tenacious, inquisitive, unyielding truth-seeker, skeptical.',
    goals: 'To uncover the truth behind the disappearances and publish the exposure book.',
    motivations: 'Justice for missing families and finding her lost parents.',
    strengths: 'Unrivaled investigative instincts, relentless interviewer, perceptive.',
    weaknesses: 'Walks into dangerous situations without waiting for backup.',
    arcSummary: 'Exposes the secret organization to the world through her best-selling investigative book.',
    sceneAppearances: ['Scene 1: Blackwood Manor', 'Scene 2: St. Gabriel Catacombs', 'Scene 3: Raven Lake Chamber'],
    userEditedFields: [],
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333334',
    projectId: DEMO_PROJECT.id,
    characterCode: 'CHAR_004',
    name: 'Father Benedict',
    description: 'Elderly priest guarding a dangerous secret beneath St. Gabriel\'s Church.',
    age: '68',
    gender: 'Male',
    height: '5 ft 10 in',
    build: 'Slightly stooped, frail but dignified build',
    skinTone: 'Pale parchment skin tone',
    faceShape: 'Narrow elongated face with deep smile lines',
    hairStyle: 'Receding silver white hair',
    hairColor: 'Pure silver white',
    eyeColor: 'Warm dark brown eyes with sorrowful gaze',
    expressions: 'Solemn, protective, secretive',
    clothing: 'Black priest cassock, silver crucifix pendant',
    footwear: 'Simple black leather shoes',
    accessories: 'Heavy silver crucifix necklace, worn Latin breviary',
    distinctiveMarks: 'Deep forehead wrinkles',
    occupation: 'Priest / Guardian',
    appearance: 'Black cassock, silver white hair, dark brown eyes, tall slightly stooped posture.',
    personality: 'Mysterious, morally conflicted, protective, cunning strategist.',
    goals: 'To safeguard the secret chamber and protect the Carter parents from Marcus.',
    motivations: 'Redemption for past silence and sacred oath.',
    strengths: 'Secret knowledge of underground tunnels, master of deception (staged his own death).',
    weaknesses: 'Failing physical health, burdened by past secrets.',
    arcSummary: 'Stages his own bloody death to trick Marcus, returning in time to save the siblings.',
    sceneAppearances: ['Scene 2: St. Gabriel Catacombs', 'Scene 3: Raven Lake Chamber'],
    userEditedFields: [],
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333335',
    projectId: DEMO_PROJECT.id,
    characterCode: 'CHAR_005',
    name: 'Detective Marcus Reed',
    description: 'Retired detective who claimed to investigate disappearances, secretly the leader of the conspiracy.',
    age: '58',
    gender: 'Male',
    height: '6 ft 1 in',
    build: 'Heavy-set, imposing build',
    skinTone: 'Ruddy complexion',
    faceShape: 'Broad heavy jaw with sharp cold eyes',
    hairStyle: 'Slicked-back grey hair',
    hairColor: 'Salt-and-pepper grey',
    eyeColor: 'Cold ice-grey eyes',
    expressions: 'Calculating, authoritative, cold smirk',
    clothing: 'Heavy wool dark trench coat, dark suit, polished shoes',
    footwear: 'Polished black dress shoes',
    accessories: 'Silver pocket watch, leather holster',
    distinctiveMarks: 'Thin scar along right jaw',
    occupation: 'Retired Detective / Cult Leader',
    appearance: 'Heavy wool trench coat, slicked-back grey hair, cold ice-grey eyes, imposing build.',
    personality: 'Manipulative, ruthless, patient, obsessed with the hidden chamber.',
    goals: 'To use the three Carter siblings to unlock the hidden chamber beneath Raven Lake.',
    motivations: 'Power, ancient secrets, and absolute control over the secret organization.',
    strengths: 'Master manipulator, extensive law enforcement authority, lethal combatant.',
    weaknesses: 'Arrogance and underestimating the Carter siblings\' unity.',
    arcSummary: 'Reveals his true evil leadership before being pushed into Raven Lake by Liam.',
    sceneAppearances: ['Scene 1: Blackwood Manor', 'Scene 3: Raven Lake Chamber'],
    userEditedFields: [],
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  }
];

export const DEMO_LOCATIONS: Location[] = [
  {
    id: '55555555-5555-5555-5555-555555555551',
    projectId: DEMO_PROJECT.id,
    name: 'Blackwood Manor',
    description: 'A 250-year-old abandoned mansion where every owner mysteriously disappeared.',
    atmosphere: 'Haunting, foggy, decaying elegance with creaking floorboards.',
    timeOfDay: 'Dusk',
    weather: 'Thick mist and heavy downpour',
    history: 'Built in 1776, this estate has seen dozens of unexplained vanishings over two centuries.',
    userEditedFields: [],
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '55555555-5555-5555-5555-555555555552',
    projectId: DEMO_PROJECT.id,
    name: "St. Gabriel's Church",
    description: 'A 180-year-old church hiding underground stone tunnels and forgotten records.',
    atmosphere: 'Sacred yet subterranean, lit by flickering candlelight and damp stone arches.',
    timeOfDay: 'Night',
    weather: 'Cold subterranean drafts',
    history: 'Erected in 1846, concealing subterranean catacombs used by the secret organization.',
    userEditedFields: [],
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '55555555-5555-5555-5555-555555555553',
    projectId: DEMO_PROJECT.id,
    name: 'Raven Lake & Lighthouse',
    description: 'A dark lake linked to dozens of unexplained disappearances occurring every twenty years.',
    atmosphere: 'Ominous, misty waters, solitary weather-worn lighthouse.',
    timeOfDay: 'Dawn',
    weather: 'Freezing fog over dark waters',
    history: 'Every 20 years, people vanish around the lake. Beneath lies the sealed ancient chamber.',
    userEditedFields: [],
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  }
];

export const DEMO_PROPS: Prop[] = [
  {
    id: '66666666-6666-6666-6666-666666666661',
    projectId: DEMO_PROJECT.id,
    name: 'Anonymous Letters',
    description: 'Three identical letters sent to Ethan, Liam, and Ava containing the phrase "Your parents never left."',
    owner: 'Carter Siblings',
    status: 'Preserved evidence',
    history: 'Sent anonymously to bring the siblings together at Blackwood Manor.',
    userEditedFields: [],
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '66666666-6666-6666-6666-666666666662',
    projectId: DEMO_PROJECT.id,
    name: 'Missing Parents Photograph',
    description: 'A recent photograph discovered at Blackwood Manor showing the missing parents beside Father Benedict.',
    owner: 'Ethan Carter',
    status: 'Intact',
    history: 'Proves the parents survived and remained connected to Father Benedict.',
    userEditedFields: [],
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  }
];

export const DEMO_SCENES: Scene[] = [
  {
    id: '77777777-7777-7777-7777-777777777771',
    projectId: DEMO_PROJECT.id,
    scriptId: DEMO_SCRIPT.id,
    sceneNumber: 1,
    title: 'EXT. BLACKWOOD MANOR - DAY',
    summary: 'The Carter siblings receive anonymous letters and discover a photograph of their parents with Father Benedict.',
    mood: 'Mysterious, atmospheric',
    timeOfDay: 'Day',
    weather: 'Foggy',
    dialogueExcerpt: '"Your parents never left." That\'s what the letter says.',
    characterIds: [DEMO_CHARACTERS[0].id, DEMO_CHARACTERS[1].id, DEMO_CHARACTERS[2].id, DEMO_CHARACTERS[4].id],
    locationIds: [DEMO_LOCATIONS[0].id],
    propIds: [DEMO_PROPS[0].id, DEMO_PROPS[1].id],
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '77777777-7777-7777-7777-777777777772',
    projectId: DEMO_PROJECT.id,
    scriptId: DEMO_SCRIPT.id,
    sceneNumber: 2,
    title: "INT. ST. GABRIEL'S CHURCH - UNDERGROUND - NIGHT",
    summary: 'They discover secret journals beneath St. Gabriel\'s Church. Father Benedict disappears leaving blood behind.',
    mood: 'Tense, claustrophobic',
    timeOfDay: 'Night',
    weather: 'Subterranean drafts',
    dialogueExcerpt: 'Stand back! We\'re getting out of here together.',
    characterIds: [DEMO_CHARACTERS[0].id, DEMO_CHARACTERS[1].id, DEMO_CHARACTERS[2].id, DEMO_CHARACTERS[3].id],
    locationIds: [DEMO_LOCATIONS[1].id],
    propIds: [],
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '77777777-7777-7777-7777-777777777773',
    projectId: DEMO_PROJECT.id,
    scriptId: DEMO_SCRIPT.id,
    sceneNumber: 3,
    title: 'EXT. RAVEN LAKE & CHAMBER - DAWN',
    summary: 'Marcus reveals his villainy at Raven Lake. Father Benedict returns, Liam pushes Marcus into the lake, and parents are saved.',
    mood: 'Climactic, thrilling',
    timeOfDay: 'Dawn',
    weather: 'Freezing fog',
    dialogueExcerpt: 'Only together could the three of you unlock the hidden chamber beneath the lake.',
    characterIds: [DEMO_CHARACTERS[0].id, DEMO_CHARACTERS[1].id, DEMO_CHARACTERS[2].id, DEMO_CHARACTERS[3].id, DEMO_CHARACTERS[4].id],
    locationIds: [DEMO_LOCATIONS[2].id],
    propIds: [],
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  }
];

export const DEMO_RELATIONSHIPS: Relationship[] = [
  {
    id: '88888888-8888-8888-8888-888888888881',
    projectId: DEMO_PROJECT.id,
    characterAId: DEMO_CHARACTERS[0].id,
    characterBId: DEMO_CHARACTERS[1].id,
    type: 'sibling',
    description: 'Ethan & Liam Carter: Eldest and middle brothers who protect each other despite intellectual vs tactical clashes.',
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '88888888-8888-8888-8888-888888888882',
    projectId: DEMO_PROJECT.id,
    characterAId: DEMO_CHARACTERS[0].id,
    characterBId: DEMO_CHARACTERS[2].id,
    type: 'sibling',
    description: 'Ethan & Ava Carter: Eldest brother and youngest sister combining historical research with investigative journalism.',
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '88888888-8888-8888-8888-888888888883',
    projectId: DEMO_PROJECT.id,
    characterAId: DEMO_CHARACTERS[1].id,
    characterBId: DEMO_CHARACTERS[2].id,
    type: 'sibling',
    description: 'Liam & Ava Carter: Military brother serving as physical bodyguard for his investigative sister.',
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '88888888-8888-8888-8888-888888888884',
    projectId: DEMO_PROJECT.id,
    characterAId: DEMO_CHARACTERS[3].id,
    characterBId: DEMO_CHARACTERS[4].id,
    type: 'enemy',
    description: 'Father Benedict & Detective Marcus Reed: Secret opposition. Benedict staged his death to deceive Marcus and save the siblings.',
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-02T00:00:00Z',
  }
];

export const DEMO_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: '99999999-9999-9999-9999-999999999991',
    projectId: DEMO_PROJECT.id,
    dayOrDate: '20 Years Ago',
    title: 'Disappearance of Carter Parents',
    description: 'Mr. and Mrs. Carter vanish under mysterious circumstances near Blackwood Manor.',
    createdAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '99999999-9999-9999-9999-999999999992',
    projectId: DEMO_PROJECT.id,
    dayOrDate: 'Present Day - 10:00 AM',
    title: 'Arrival at Blackwood Manor',
    description: 'Ethan, Liam, and Ava receive anonymous letters and meet Detective Marcus Reed.',
    relatedSceneId: DEMO_SCENES[0].id,
    relatedCharacterIds: [DEMO_CHARACTERS[0].id, DEMO_CHARACTERS[1].id, DEMO_CHARACTERS[2].id, DEMO_CHARACTERS[4].id],
    createdAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '99999999-9999-9999-9999-999999999993',
    projectId: DEMO_PROJECT.id,
    dayOrDate: 'Present Day - 06:00 PM',
    title: 'Tunnels of St. Gabriel\'s',
    description: 'The siblings discover secret organization journals under the church.',
    relatedSceneId: DEMO_SCENES[1].id,
    relatedCharacterIds: [DEMO_CHARACTERS[0].id, DEMO_CHARACTERS[1].id, DEMO_CHARACTERS[2].id, DEMO_CHARACTERS[3].id],
    createdAt: '2026-08-02T00:00:00Z',
  },
  {
    id: '99999999-9999-9999-9999-999999999994',
    projectId: DEMO_PROJECT.id,
    dayOrDate: 'Present Day - 05:00 AM',
    title: 'Confrontation at Raven Lake',
    description: 'Marcus is pushed into Raven Lake by Liam, and the parents are rescued alive.',
    relatedSceneId: DEMO_SCENES[2].id,
    relatedCharacterIds: [DEMO_CHARACTERS[0].id, DEMO_CHARACTERS[1].id, DEMO_CHARACTERS[2].id, DEMO_CHARACTERS[3].id, DEMO_CHARACTERS[4].id],
    createdAt: '2026-08-02T00:00:00Z',
  }
];

export const DEMO_GENERATED_IMAGES: GeneratedImage[] = [];

export const DEMO_CONSISTENCY_FLAGS: ConsistencyFlag[] = [
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    projectId: DEMO_PROJECT.id,
    type: 'continuity',
    description: 'Father Benedict\'s blood at St. Gabriel\'s Church was staged to trick Detective Marcus Reed into believing he was dead.',
    relatedEntityIds: [DEMO_CHARACTERS[3].id, DEMO_CHARACTERS[4].id],
    status: 'open',
    createdAt: '2026-08-02T00:00:00Z',
  }
];

export const DEMO_NOTES: Note[] = [
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    projectId: DEMO_PROJECT.id,
    attachedToType: 'character',
    attachedToId: DEMO_CHARACTERS[2].id,
    content: 'Ava receives a final letter months later stating "The lake kept Marcus alive" and spots a man in his coat in the fog.',
    createdAt: '2026-08-02T00:00:00Z',
  }
];
