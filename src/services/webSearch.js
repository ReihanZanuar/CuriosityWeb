/**
 * CURIOSITY AI — GLOBAL DEEP WEB SEARCH SERVICE
 * Fetches real-time, verified factual information from Wikipedia (ID & EN),
 * DuckDuckGo, and open encyclopedic web sources to eliminate AI hallucination
 * and provide up-to-date 2024-2026 knowledge for local LLMs.
 */

const WEB_SEARCH_KEYWORDS = [
  'siapa', 'siapa saja', 'daftar', 'presiden', 'wakil presiden', 'menteri',
  'kabinet', 'gubernur', 'pemilu', 'pilpres', 'pilkada', 'tokoh', 'biografi',
  'sekarang', 'saat ini', 'terbaru', 'terkini', 'terakhir', 'tahun 2024',
  'tahun 2025', 'tahun 2026', 'ikn', 'nusantara', 'ibu kota', 'ibukota',
  'dimana', 'kapan', 'apa itu', 'sejarah', 'penemu', 'negara', 'populasi',
  'artemis', 'starship', 'spacex', 'nasa', 'jwst', 'james webb', 'satelit',
  'berita', 'harga', 'jadwal', 'peristiwa', 'perang', 'ktt', 'asean', 'pbb'
];

/**
 * Determines whether a given user prompt requires live web searching
 */
export function shouldTriggerWebSearch(prompt = '', mode = 'auto') {
  if (mode === 'off') return false;
  if (mode === 'always') return true;

  const clean = (prompt || '').toLowerCase().trim();
  if (clean.length < 3) return false;

  // Check if prompt contains factual or recent keywords
  return WEB_SEARCH_KEYWORDS.some((kw) => clean.includes(kw));
}

/**
 * Generates search queries tailored for accurate encyclopedic retrieval
 */
function buildSearchQueries(rawPrompt) {
  const clean = rawPrompt
    .toLowerCase()
    .replace(/[?.,!/\\()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const queries = [clean];

  // Domain-specific query expansions
  if (clean.includes('presiden indonesia')) {
    queries.push('Daftar presiden Indonesia');
    queries.push('Presiden Indonesia');
    queries.push('Prabowo Subianto');
  } else if (clean.includes('wakil presiden indonesia')) {
    queries.push('Daftar wakil presiden Indonesia');
    queries.push('Gibran Rakabuming Raka');
  } else if (clean.includes('kabinet')) {
    queries.push('Kabinet Merah Putih');
    queries.push('Daftar kabinet Indonesia');
  } else if (clean.includes('ikn') || clean.includes('nusantara') || clean.includes('ibu kota')) {
    queries.push('Nusantara (kota terencana)');
  } else if (clean.includes('artemis')) {
    queries.push('Program Artemis');
  } else if (clean.includes('starship')) {
    queries.push('SpaceX Starship');
  }

  return Array.from(new Set(queries));
}

/**
 * Fetches Wikipedia search results and detailed article extracts (Indonesian & Global)
 */
async function fetchWikipediaKnowledge(searchTerms) {
  const headers = {
    'User-Agent': 'CuriosityAI/2.0 (Educational AI Assistant; https://curiosity.edu)',
    'Accept': 'application/json',
  };

  const resultsMap = new Map();

  // Phase 1: Search Wikipedia Indonesia
  for (const term of searchTerms) {
    try {
      const searchUrl = `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        term
      )}&format=json&utf8=1&srlimit=4&origin=*`;

      const res = await fetch(searchUrl, { headers });
      if (!res.ok) continue;
      const data = await res.json();
      const hits = data.query?.search || [];

      for (const hit of hits) {
        if (!resultsMap.has(hit.title)) {
          resultsMap.set(hit.title, {
            title: hit.title,
            snippet: hit.snippet.replace(/<[^>]+>/g, '').trim(),
            lang: 'id',
          });
        }
      }
    } catch (err) {
      console.warn('Wikipedia ID Search error:', err.message);
    }
  }

  // Phase 2: If few results, enrich with Wikipedia English
  if (resultsMap.size < 2) {
    for (const term of searchTerms.slice(0, 2)) {
      try {
        const enSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          term
        )}&format=json&utf8=1&srlimit=3&origin=*`;

        const res = await fetch(enSearchUrl, { headers });
        if (!res.ok) continue;
        const data = await res.json();
        const hits = data.query?.search || [];

        for (const hit of hits) {
          if (!resultsMap.has(hit.title)) {
            resultsMap.set(hit.title, {
              title: hit.title,
              snippet: hit.snippet.replace(/<[^>]+>/g, '').trim(),
              lang: 'en',
            });
          }
        }
      } catch (err) {
        console.warn('Wikipedia EN Search error:', err.message);
      }
    }
  }

  // Phase 3: Fetch deep extracts & table data for top articles
  const topArticles = Array.from(resultsMap.values()).slice(0, 4);
  const sources = [];

  for (const article of topArticles) {
    const domain = article.lang === 'en' ? 'en.wikipedia.org' : 'id.wikipedia.org';
    const sourceName = article.lang === 'en' ? 'Wikipedia Global' : 'Wikipedia Indonesia';

    try {
      // 1. Fetch Lead Summary / Extract
      const extractUrl = `https://${domain}/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(
        article.title
      )}&format=json&utf8=1&origin=*`;

      const extRes = await fetch(extractUrl, { headers });
      if (!extRes.ok) continue;
      const extData = await extRes.json();
      const page = Object.values(extData.query?.pages || {})[0];

      let extractContent = page?.extract ? page.extract.trim() : article.snippet;

      // 2. If it's a list or table article (e.g. "Daftar presiden Indonesia"), parse the structured table!
      if (article.title.toLowerCase().startsWith('daftar') || article.title.toLowerCase().includes('list of')) {
        try {
          const parseUrl = `https://${domain}/w/api.php?action=parse&page=${encodeURIComponent(
            article.title
          )}&prop=text&format=json&utf8=1&origin=*`;
          const parseRes = await fetch(parseUrl, { headers });
          if (parseRes.ok) {
            const parseData = await parseRes.json();
            const html = parseData.parse?.text?.['*'] || '';
            const tableMatch = html.match(/<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/i);
            if (tableMatch) {
              const cleanTableText = tableMatch[0]
                .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              if (cleanTableText.length > 50) {
                extractContent += `\n\n[TABEL DATA RESMI DARI WIKIPEDIA]:\n${cleanTableText.slice(0, 1400)}`;
              }
            }
          }
        } catch (tableErr) {
          console.warn('Table extraction failed for', article.title, tableErr.message);
        }
      }

      if (extractContent) {
        sources.push({
          title: article.title,
          snippet: article.snippet || extractContent.slice(0, 160) + '...',
          content: extractContent,
          url: `https://${domain}/wiki/${encodeURIComponent(article.title.replace(/ /g, '_'))}`,
          sourceName: sourceName,
        });
      }
    } catch (err) {
      console.warn('Could not extract page', article.title, err.message);
    }
  }

  return sources;
}

/**
 * Queries DuckDuckGo Instant Answers API for quick definitions
 */
async function fetchDuckDuckGoAnswer(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.AbstractText && data.AbstractURL) {
      return {
        title: data.Heading || query,
        snippet: data.AbstractText.slice(0, 160) + '...',
        content: data.AbstractText,
        url: data.AbstractURL,
        sourceName: data.AbstractSource || 'DuckDuckGo Knowledge',
      };
    }
  } catch (err) {
    // Non-critical fallback
  }
  return null;
}

/**
 * Main deep web search function
 * Returns structured search results and system context injection
 */
export async function performDeepWebSearch(prompt, onProgress) {
  if (onProgress) onProgress({ status: 'generating_queries', message: 'Merumuskan kueri penelusuran...' });

  const searchTerms = buildSearchQueries(prompt);

  if (onProgress) onProgress({ status: 'searching_web', message: 'Mencari di repositori web & ensiklopedia global...' });

  // Run searches in parallel
  const [wikiSources, ddgSource] = await Promise.all([
    fetchWikipediaKnowledge(searchTerms),
    fetchDuckDuckGoAnswer(searchTerms[0]),
  ]);

  const allSources = [...wikiSources];
  if (ddgSource && !allSources.some((s) => s.url === ddgSource.url)) {
    allSources.push(ddgSource);
  }

  // Deduplicate and cap at top 4 best sources
  const finalSources = allSources.slice(0, 4);

  if (onProgress) {
    onProgress({
      status: 'completed',
      message: `Menemukan ${finalSources.length} referensi sumber web terverifikasi`,
      sources: finalSources,
    });
  }

  // Format LLM System Context
  const currentYear = new Date().getFullYear();
  let searchContextText = '';

  if (finalSources.length > 0) {
    searchContextText = `[DATA FAKTUAL & TERKINI DARI PENCARIAN WEB GLOBAL]:
(Waktu Nyata: Tahun ${currentYear}, Data Terverifikasi)

${finalSources
  .map(
    (s, idx) => `=== [SUMBER ${idx + 1}]: "${s.title}" (${s.sourceName}) ===
Tautan Sumber: ${s.url}
Isi Fakta:
${s.content}
`
  )
  .join('\n\n')}

[PETUNJUK UTAMA]:
1. Gunakan data faktual dan mutakhir dari hasil pencarian web di atas untuk menjawab pertanyaan pengguna dengan 100% akurat dan tanpa halusinasi.
2. Jika ditanyakan tentang daftar tokoh/presiden/peristiwa, sebutkan secara lengkap dan runut hingga data terkini (${currentYear}).
3. Jelaskan dengan gaya bahasa Indonesia yang rapi, runtut, dan informatif.`;
  }

  return {
    sources: finalSources,
    searchContextText: searchContextText,
    queryUsed: searchTerms[0],
  };
}
