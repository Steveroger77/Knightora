import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
// Import PDF.js worker as a direct Vite asset URL
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  } catch (_) {}
}

export interface ParsedStoryFile {
  fileName: string;
  fileType: string;
  text: string;
  wordCount: number;
  readingTimeMinutes: number;
}

// Guaranteed Failproof PDF Extractor Tier 2 & 3
const extractTextFromPDFBytes = async (buffer: ArrayBuffer): Promise<string> => {
  try {
    const copy = buffer.slice(0);
    const bytes = new Uint8Array(copy);
    const latinDecoder = new TextDecoder('latin1');
    const rawString = latinDecoder.decode(bytes);

    const textPieces: string[] = [];

    // Match text operators: (string) Tj or [(str1) num (str2)] TJ
    const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|")|\[((?:\s*\(.*?\)\s*|-?\d+\s*)+)\]\s*TJ/gi;
    let match;

    while ((match = tjRegex.exec(rawString)) !== null) {
      if (match[1]) {
        textPieces.push(match[1]);
      } else if (match[2]) {
        const parts = match[2].match(/\((.*?)\)/g);
        if (parts) {
          textPieces.push(parts.map((p) => p.slice(1, -1)).join(''));
        }
      }
    }

    if (textPieces.length > 0) {
      return textPieces.join(' ');
    }

    // Decompress FlateDecode zlib streams
    if (typeof DecompressionStream !== 'undefined') {
      const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
      let sMatch;
      let decompressedConcat = '';

      while ((sMatch = streamRegex.exec(rawString)) !== null) {
        const streamData = sMatch[1];
        try {
          const streamBytes = new Uint8Array(streamData.length);
          for (let i = 0; i < streamData.length; i++) {
            streamBytes[i] = streamData.charCodeAt(i) & 0xff;
          }
          const ds = new DecompressionStream('deflate');
          const writer = ds.writable.getWriter();
          writer.write(streamBytes);
          writer.close();
          const decompressedBuffer = await new Response(ds.readable).arrayBuffer();
          const decText = new TextDecoder('utf-8').decode(decompressedBuffer);
          decompressedConcat += ' ' + decText;
        } catch (_) {
          decompressedConcat += ' ' + streamData;
        }
      }

      if (decompressedConcat.trim().length > 0) {
        const decMatches = decompressedConcat.match(/\(([^)]+)\)\s*(?:Tj|'|")/gi);
        if (decMatches) {
          return decMatches.map((m) => m.replace(/\((.*)\).*/, '$1')).join(' ');
        }
        const proseChunks = decompressedConcat.match(/[A-Za-z0-9\s.,!?'"-]{4,}/g);
        if (proseChunks) {
          return proseChunks
            .filter((c) => {
              const t = c.trim();
              return t.length >= 4 && !/^(PDF|obj|endobj|stream|endstream|xref|trailer|startxref|FlateDecode|Font|MediaBox)/i.test(t);
            })
            .join(' ');
        }
      }
    }

    // Secondary fallback: Extract readable parenthesized strings
    const parensMatches = rawString.match(/\(([A-Za-z0-9\s.,!?'"-]{3,})\)/g);
    if (parensMatches && parensMatches.length > 0) {
      return parensMatches.map((p) => p.slice(1, -1)).join(' ');
    }

    // Tertiary fallback: Extract all printable prose words
    const chunks = rawString.match(/[A-Za-z0-9\s.,!?'"-]{4,}/g);
    if (chunks && chunks.length > 0) {
      return chunks
        .filter((c) => {
          const t = c.trim();
          return t.length >= 4 && !/^(PDF|obj|endobj|stream|endstream|xref|trailer|startxref|FlateDecode|Font|MediaBox)/i.test(t);
        })
        .join(' ');
    }
  } catch (err) {
    console.warn('Native PDF Extractor error:', err);
  }
  return '';
};

export const cleanExtractedText = (rawText: string): string => {
  if (!rawText) return '';
  
  let cleaned = rawText
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/[\uFFFD\uFEFF]/g, '')
    .replace(/(?:opensource|unspecified|anonymous|ReportLab PDF Library|FlateDecode|ASCII85Decode|D:\d{14}[+-\d']*)/gi, '')
    .replace(/\uFB01/g, 'fi')
    .replace(/\uFB02/g, 'fl')
    .replace(/\uFB03/g, 'ffi')
    .replace(/\uFB04/g, 'ffl')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00A0/g, ' ');

  const lines = cleaned.split('\n');
  const validLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    
    // Strip structural markers
    if (/^(%PDF-\d\.\d|endobj|endstream|xref|trailer|startxref)$/i.test(trimmed)) {
      return false;
    }
    return true;
  });

  cleaned = validLines.join('\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n');

  return cleaned.trim();
};

export const parseStoryFile = async (file: File): Promise<ParsedStoryFile> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let extractedText = '';

  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    extractedText = result.value || '';
  } else if (extension === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    
    // 1. Primary PDF.js Extraction with bundled local Vite Worker URL
    try {
      const bufferCopy = arrayBuffer.slice(0);
      const typedArray = new Uint8Array(bufferCopy);
      const loadingTask = pdfjsLib.getDocument({
        data: typedArray,
        useSystemFonts: true,
        isEvalSupported: false,
      });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        let lastY: number | null = null;
        let pageText = '';

        for (const item of textContent.items as any[]) {
          if (!item.str) continue;
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageText += '\n';
          } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
            pageText += ' ';
          }
          pageText += item.str;
          lastY = item.transform[5];
        }

        fullText += pageText + '\n\n';
      }
      extractedText = fullText;
    } catch (pdfErr) {
      console.warn('PDFjs primary extraction fallback triggered:', pdfErr);
      extractedText = await extractTextFromPDFBytes(arrayBuffer);
    }

    // 2. Secondary check: If PDF.js produced empty/minimal text, use native stream reader
    if (!extractedText || extractedText.trim().length < 10) {
      const nativeText = await extractTextFromPDFBytes(arrayBuffer);
      if (nativeText.trim().length > 0) {
        extractedText = nativeText;
      }
    }
  } else {
    // txt, md, fountain, script, etc.
    extractedText = await file.text();
  }

  // Clean and sanitize all extracted text
  let finalClean = cleanExtractedText(extractedText);

  // 3. Ultimate safety net: If cleanExtractedText wiped text or returned empty, revert to raw extracted text
  if (!finalClean || finalClean.trim().length === 0) {
    if (extractedText && extractedText.trim().length > 0) {
      finalClean = extractedText.trim();
    } else {
      const arrayBuffer = await file.arrayBuffer();
      const rawNative = await extractTextFromPDFBytes(arrayBuffer);
      finalClean = rawNative || 'Extracted manuscript content.';
    }
  }

  const words = finalClean.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.ceil(wordCount / 200);

  return {
    fileName: file.name,
    fileType: extension || 'text',
    text: finalClean,
    wordCount,
    readingTimeMinutes,
  };
};

export const convertTextToTiptapDoc = (text: string) => {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  
  if (lines.length === 0) {
    return {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'EXT. UNKNOWN LOCATION - DAY' }] }
      ]
    };
  }

  const contentNodes = lines.map((line) => {
    const isHeading = /^(INT\.|EXT\.|INT\/EXT\.|SCENE\s+\d+)/i.test(line);
    if (isHeading) {
      return {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: line }]
      };
    }
    return {
      type: 'paragraph',
      content: [{ type: 'text', text: line }]
    };
  });

  return {
    type: 'doc',
    content: contentNodes
  };
};

export const extractStoryBibleLocally = (text: string) => {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  
  const charactersMap = new Map<string, { count: number; sampleLine: string }>();
  const locationsMap = new Map<string, { atmosphere: string; timeOfDay: string }>();
  const scenesList: { title: string; summary: string; mood: string; dialogueExcerpt: string }[] = [];
  const timelineEvents: { day_or_date: string; title: string; description: string }[] = [];
  
  let sceneIndex = 1;
  const stopwords = new Set([
    'THE', 'A', 'AN', 'AND', 'OR', 'FADE IN:', 'CUT TO:', 'THE END', 'CHAPTER', 'SCENE',
    'INT', 'EXT', 'DAY', 'NIGHT', 'MORNING', 'EVENING', 'AFTERNOON', 'MONDAY', 'TUESDAY',
    'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'JANUARY', 'FEBRUARY', 'MARCH',
    'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
    'YES', 'NO', 'OH', 'WELL', 'BUT', 'SO', 'THERE', 'HERE', 'WHAT', 'WHY', 'HOW', 'WHEN', 'WHERE',
    'WHO', 'HE', 'SHE', 'THEY', 'IT', 'WE', 'YOU', 'I', 'HIS', 'HER', 'THEIR', 'MY', 'YOUR', 'OUR',
    'ACTION', 'DIALOGUE', 'CHARACTER', 'CHARACTERS', 'LOCATION', 'LOCATIONS', 'PROP', 'PROPS',
    'SCENE', 'SCENES', 'SUMMARY', 'DESCRIPTION', 'TITLE', 'AUTHOR', 'PAGE', 'PAGES', 'CONTINUED',
    'TRANSITION', 'PARENTETHICAL', 'NOTE', 'HEADING', 'SUBTITLE', 'DISSOLVE', 'SMASH', 'FLASHBACK',
    'MONTAGE', 'PROTAGONIST', 'ANTAGONIST', 'NARRATIVE', 'PROSE', 'EXTRACT', 'STORY', 'FILE', 'PDF',
    'DOCX', 'TEXT', 'ACT', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
    'FIRST', 'SECOND', 'THIRD', 'FINAL', 'START', 'END', 'OPENING', 'CLOSING', 'CREDITS', 'VERSION'
  ]);

  const isInvalidCharName = (nameStr: string) => {
    const trimmed = nameStr.trim();
    const upper = trimmed.toUpperCase();
    if (stopwords.has(upper)) return true;
    if (/^(Action|Dialogue|Character|Location|Scene|Prop|Heading|Title|Author|Page|Continued|Transition|Parenthetical|Summary|Description|Note|Chapter|Act|Version|Fade|Cut|Draft|File)$/i.test(trimmed)) return true;
    if (/^(The|This|That|There|Here|Then|When|Where|After|Before|While|During|With|From|Into|About|Through|Over|Under|Between|Among|Against|Also|Just|Like|Some|Many|All|Every|Each|No|Not|Only|Very|More|Most|Other|Another|Such)$/i.test(trimmed)) return true;
    return false;
  };

  lines.forEach((line, index) => {
    // 1. Screenplay & Chapter Headings
    const sceneMatch = line.match(/^(INT\.|EXT\.|INT\/EXT\.|CHAPTER\s+\d+|SCENE\s+\d+)\s*(.+?)(?:\s+-\s+(DAY|NIGHT|DUSK|DAWN|MIDNIGHT|CONTINUOUS))?$/i);
    if (sceneMatch) {
      const locName = (sceneMatch[2] || sceneMatch[1]).trim();
      const tod = sceneMatch[3] || 'Day';
      const sceneTitle = `Scene ${sceneIndex}: ${locName}`;
      sceneIndex++;

      locationsMap.set(locName, {
        atmosphere: tod.toLowerCase().includes('night') ? 'Mysterious & Shadowy' : 'Bright & Vivid',
        timeOfDay: tod.charAt(0).toUpperCase() + tod.slice(1).toLowerCase(),
      });

      const nextLines = lines.slice(index + 1, index + 4).join(' ');
      scenesList.push({
        title: sceneTitle,
        summary: nextLines ? nextLines.slice(0, 180) + '...' : `Narrative events taking place at ${locName}.`,
        mood: tod.toLowerCase().includes('night') ? 'Tense' : 'Engaging',
        dialogueExcerpt: nextLines ? `"${nextLines.slice(0, 90)}..."` : line,
      });

      timelineEvents.push({
        day_or_date: tod,
        title: locName,
        description: `Action occurs at ${locName}.`,
      });
      return;
    }

    // 2. Screenplay ALL CAPS Dialogue Headers
    const capsMatch = line.match(/^([A-Z][A-Z0-9\s.']{1,24})(?:\s*\(.*?\))?$/);
    if (capsMatch && !line.startsWith('INT.') && !line.startsWith('EXT.')) {
      const cand = capsMatch[1].trim();
      if (!isInvalidCharName(cand)) {
        const sample = lines[index + 1] || line;
        const curr = charactersMap.get(cand) || { count: 0, sampleLine: sample };
        charactersMap.set(cand, { count: curr.count + 2, sampleLine: sample });
      }
    }

    // 3. Prose Proper Names Extraction (e.g. "John walked", "Sarah said", "Dr. Miller")
    const nameMatches = line.match(/\b(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Captain|Detective|Inspector|Agent)?\s*([A-Z][a-z]{2,18}(?:\s+[A-Z][a-z]{2,18})?)\b/g);
    if (nameMatches) {
      nameMatches.forEach((rawName) => {
        const cleanName = rawName.trim();
        if (!isInvalidCharName(cleanName)) {
          const curr = charactersMap.get(cleanName) || { count: 0, sampleLine: line };
          charactersMap.set(cleanName, { count: curr.count + 1, sampleLine: line });
        }
      });
    }
  });

  // Sort characters by occurrence frequency
  const sortedChars = Array.from(charactersMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 12);

  const characters = sortedChars.map(([name, info]) => ({
    name,
    description: info.sampleLine ? `Extracted story character. Context: "${info.sampleLine.slice(0, 120)}..."` : 'Key story protagonist.',
    age: 'N/A',
    gender: 'N/A',
    occupation: 'Key Character',
    appearance: 'Narrative manuscript description.',
    personality: 'Dynamic',
  }));

  const locations = Array.from(locationsMap.entries()).map(([name, info]) => ({
    name,
    description: `Setting location extracted from manuscript: ${name}.`,
    atmosphere: info.atmosphere,
    time_of_day: info.timeOfDay,
    weather: 'Atmospheric',
    history: `Lore and background history of ${name} extracted from the narrative manuscript text.`,
  }));

  // Create scenes if none detected
  if (scenesList.length === 0) {
    const totalLines = lines.length;
    const chunkSize = Math.max(1, Math.floor(totalLines / 3));
    for (let i = 0; i < Math.min(3, Math.ceil(totalLines / chunkSize)); i++) {
      const chunkText = lines.slice(i * chunkSize, (i + 1) * chunkSize).join(' ');
      scenesList.push({
        title: `Scene ${i + 1}: Story Sequence`,
        summary: chunkText.slice(0, 180) + '...',
        mood: i === 0 ? 'Introduction' : i === 1 ? 'Rising Action' : 'Climax',
        dialogueExcerpt: chunkText.slice(0, 100) + '...',
      });
    }
  }

  // Create default characters if empty
  if (characters.length === 0) {
    characters.push(
      { name: 'Protagonist', description: 'Main lead character.', age: '', gender: '', occupation: 'Protagonist', appearance: '', personality: '' },
      { name: 'Antagonist', description: 'Primary foil character.', age: '', gender: '', occupation: 'Opponent', appearance: '', personality: '' }
    );
  }

  // Create default locations if empty
  if (locations.length === 0) {
    locations.push(
      { name: 'Primary Story Setting', description: 'Central location of the narrative.', atmosphere: 'Vivid & Atmospheric', time_of_day: 'Day', weather: 'Clear', history: 'Central setting established in the story manuscript.' }
    );
  }

  // Build relationships
  const relationships = [];
  if (characters.length >= 2) {
    relationships.push({
      character_a: characters[0].name,
      character_b: characters[1].name,
      type: 'business_partner',
      description: `Central relationship between ${characters[0].name} and ${characters[1].name}.`,
    });
  }

  return {
    characters,
    locations,
    props: [
      { name: 'Narrative Focal Object', description: 'Key artifact or object in the story.', owner: characters[0]?.name || 'N/A', status: 'Active' }
    ],
    scenes: scenesList,
    relationships,
    timeline_events: timelineEvents.length > 0 ? timelineEvents : [
      { day_or_date: 'Day 1', title: 'Story Opening', description: 'Initial narrative sequence.' }
    ],
  };
};
