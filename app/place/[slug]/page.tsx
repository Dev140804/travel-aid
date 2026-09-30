import Link from "next/link";
import PlacePhotoGallery from "@/components/PlacePhotoGallery";
import PlaceBackgroundCarousel from "@/components/PlaceBackgroundCarousel";
import ExpandableHistory from "@/components/ExpandableHistory";
import { IconPin } from "@/components/Icons";
import { GoogleGenAI } from "@google/genai";

interface PlaceDetail {
  name: string;
  keyFacts: string[];
  description: string;
  history: string;
  geography: string;
  future: string;
  placeSpecifics?: Record<string, string>;
  images: string[];
  videos: { title: string; url: string }[];
  highlights: string[];
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const placeDetails: Record<string, PlaceDetail> = {
  "sukhna-lake": {
    name: "Sukhna Lake",
    keyFacts: ["Located in Chandigarh", "Man-made lake from 1958", "UNESCO site candidate"],
    description:
      "Sukhna Lake is a serene reservoir on the foothills of the Himalayas, perfect for boating, birdwatching, and a relaxing sunrise walk.",
    history:
      "Constructed in 1958 by legendary architect Le Corbusier's team, Sukhna Lake was created as a spillover from the Shivalik Hills. It quickly became a cultural and leisure hub.",
    geography:
      "The lake is spread over 3 km and nestled against the Shivalik hills, providing a microclimate with cool breezes and diverse avian life.",
    future:
      "The authorities are modernizing amenities and adding eco-friendly walkways, improved boating infrastructure, and coral plantings to maintain the habitat.",
    highlights: ["Boating", "Bird Sanctuary", "Sunrise promenade", "Photography"],
    images: [
      "https://images.unsplash.com/photo-1584262680350-99f4041daf13?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1579547621706-1a9c79d5f586?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1474562437649-3e1fbe0f3560?auto=format&fit=crop&w=1600&q=80",
    ],
    videos: [
      { title: "Sukhna Lake Travel Guide", url: "https://www.youtube.com/embed/7R6xruqVQpE" },
    ],
  },
  "elante-mall": {
    name: "Elante Mall",
    keyFacts: ["One of India’s largest malls", "350+ brands", "Food court, entertainment and cinema"],
    description:
      "Elante Mall is a landmark shopping and lifestyle destination in Chandigarh, with both Indian and international labels and extensive dining options.",
    history:
      "Opened in 2013, Elante was designed as a modern mall with retail and leisure and quickly became a regional attraction.",
    geography:
      "Set on a two-story campus with a central atrium and easy access from major Chandigarh roads.",
    future:
      "Upgraded by regular expansions and anchor store rotations, with a new entertainment zone planned.",
    highlights: ["High Street Shopping", "Food Court", "IMAX Cinema", "Live Events"],
    images: [
      "https://images.unsplash.com/photo-1582534588076-70f54790f840?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1549055319-0ce61b90c1f2?auto=format&fit=crop&w=1600&q=80",
    ],
    videos: [{ title: "Inside Elante Mall", url: "https://www.youtube.com/embed/2h0luMui9ZA" }],
  },
};

async function fetchPlaceFromWikipedia(title: string): Promise<PlaceDetail | null> {
  try {
    const summaryResp = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { cache: 'no-store' }
    );

    if (!summaryResp.ok) {
      console.warn('Wikipedia summary returned non-ok', summaryResp.status, summaryResp.statusText);
      return null;
    }

    const summary = await summaryResp.json().catch((err) => {
      console.error('Wikipedia summary JSON parse error', err);
      return null;
    });

    if (!summary || !summary.title || /placeholder name/i.test(summary.title)) {
      return null;
    }

    const desc = summary.extract || `Learn essential information about ${summary.title}.`;
    const bestImage = summary.originalimage?.source || summary.thumbnail?.source || null;

    const detail: PlaceDetail = {
      name: summary.title || title,
      keyFacts: [
        summary.title || title,
        summary.description || 'Historic site',
        summary.type || 'Point of interest',
      ].filter(Boolean),
      description: desc,
      history: summary.extract ? `${summary.title} has a rich history. ${desc}` : `History not available for ${title}.`,
      geography: `Location: ${summary.title || title} (information from Wikipedia).`,
      future: `Check local sources for future development and upcoming events in ${summary.title || title}.`,
      highlights: ['Local culture', 'Top attractions', 'Must-see spots'],
      images: [
        bestImage || `https://source.unsplash.com/featured/?${encodeURIComponent(title)},landmark`,
        `https://source.unsplash.com/featured/?${encodeURIComponent(title)},travel`,
        `https://source.unsplash.com/featured/?${encodeURIComponent(title)},city`,
      ],
      videos: [
        {
          title: `${summary.title} overview`,
          url: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(summary.title + ' travel guide')}`,
        },
      ],
    };

    return detail;
  } catch (error) {
    console.error('Wiki fetch error:', error);
    return null;
  }
}

type GooglePlaceInfo = {
  placeId?: string;
  name?: string;
  address?: string;
  rating?: number;
  reviews?: number;
  types?: string[];
  location?: { lat: number; lng: number };
  openNow?: boolean;
  photoReference?: string | null;
} | null;

async function getGooglePlaceData(placeName: string): Promise<GooglePlaceInfo> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      placeName
    )}&key=${apiKey}`;
    const textSearch = await fetch(textSearchUrl, { cache: 'no-store' });
    if (!textSearch.ok) {
      console.warn('Google Text Search returned non-OK', textSearch.status, textSearch.statusText);
      return null;
    }

    const textBody = await textSearch.text();
    if (!textBody) return null;

    let data;
    try {
      data = JSON.parse(textBody);
    } catch (parseErr) {
      console.error('Google text search JSON parse error', parseErr, textBody);
      return null;
    }

    if (data.status !== 'OK' || !Array.isArray(data.results) || data.results.length === 0) {
      return null;
    }

    const top = data.results[0];
    return {
      placeId: top.place_id,
      name: top.name,
      address: top.formatted_address,
      rating: top.rating,
      reviews: top.user_ratings_total,
      types: top.types,
      location: top.geometry?.location,
      openNow: top.opening_hours?.open_now ?? null,
      photoReference: top.photos?.[0]?.photo_reference ?? null,
    };
  } catch (err) {
    console.error('Google place fetch failed', err);
    return null;
  }
}

type GooglePlacePhoto = {
  photo_reference?: string;
};

async function getGooglePlacePhotos(placeId: string, maxPhotos = 8): Promise<string[]> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !placeId) return [];

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=photos&key=${apiKey}`;

    const details = await fetch(detailsUrl, { cache: 'no-store' });
    if (!details.ok) return [];

    const detailsBody = await details.json();
    const photos = Array.isArray(detailsBody.result?.photos) ? detailsBody.result.photos : [];

    return photos
      .slice(0, maxPhotos)
      .map((p: GooglePlacePhoto) => (p.photo_reference ? `/api/photo?ref=${p.photo_reference}` : null))
      .filter((url: string | null): url is string => Boolean(url));
  } catch (error) {
    console.error('Google Place photos error', error);
    return [];
  }
}

enum ThinkingLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

function guessPlaceCategory(placeName: string) {
  if (/restaurant|cafe|dining|bistro|food|eatery|eat/i.test(placeName)) return 'restaurant';
  if (/lake|park|river|hill|garden|mountain|forest|beach|falls/i.test(placeName)) return 'nature';
  if (/mall|shopping|market|bazaar|plaza/i.test(placeName)) return 'shopping';
  return 'general';
}

function safeString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

async function generatePlaceNarrative(
  placeName: string,
  category: string,
  placeData: GooglePlaceInfo,
): Promise<{ whyChosen: string; specifics: string; uniqueNote: string; placeSpecifics: Record<string, string> }> {
  try {
    const prompt = `You are a travel planner helper. The user loves nature, authentic local food, and memorable experiences. The place is '${placeName}' (category ${category}). Provide detailed, accurate place information adapted to type:
- For city landmarks/museums/history/nature: include history, architecture, entry fees, best season, estimated local spending.
- For restaurants/cafes: include signature dish, average price range, local specialties, and reasons why it's authentic.
- For others: include top attractions, travel convenience, and cultural notes.
Include these sections in a JSON object with keys: whyChosen, specifics, uniqueNote, placeSpecifics (as nested key-value pairs).
Also include a short 40-60 word first paragraph of the key high level point in whyChosen.

Cite known Google Maps details in the narrative: rating ${placeData?.rating ?? 'unknown'}, reviews ${placeData?.reviews ?? 'unknown'}, address ${placeData?.address ?? 'unknown'}.
`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
    } catch (error) {
      console.warn('AI model API failed (possibly rate limited or unavailable)', error);
      // Return default response on API failure instead of retrying
      return {
        whyChosen: `${placeName} is a wonderful destination that matches your travel preferences.`,
        specifics: `This place offers unique experiences with good ratings and visitor reviews.`,
        uniqueNote: `Explore this location to discover authentic local experiences and hidden gems.`,
        placeSpecifics: placeData?.types?.includes('restaurant')
          ? {
              'Top dish': 'Chef recommended specialty',
              'Average price': '₹300-800 (approx)',
              'Local flavor': 'Authentic local cuisine',
            }
          : {
              'Must see': 'Main attractions',
              'Entry fee': 'Check on arrival',
              'Best time to visit': 'Early morning or evening',
            },
      };
    }

    const raw = response.text?.trim() || '';
    if (!raw) {
      return {
        whyChosen: `${placeName} is selected because it matches your preferences`,
        specifics: `No narrative available from generator.`,
        uniqueNote: `Use local guide feedback for precise on-ground details.`,
        placeSpecifics: {},
      };
    }

    let cleaned = raw;
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```(json)?/gi, '').replace(/```/g, '').trim();
    }

    let parsed = null;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('LLM narrative JSON parse failed', parseErr, cleaned);
      return {
        whyChosen: `${placeName} is selected because it matches your preferences`,
        specifics: `No narrative available from generator.`,
        uniqueNote: `Use local guide feedback for precise on-ground details.`,
        placeSpecifics: {},
      };
    }

    const safePlaceSpecifics: Record<string, string> = {};
    if (parsed.placeSpecifics && typeof parsed.placeSpecifics === 'object' && !Array.isArray(parsed.placeSpecifics)) {
      Object.entries(parsed.placeSpecifics).forEach(([k, v]) => {
        safePlaceSpecifics[k] = safeString(v);
      });
    }

    return {
      whyChosen: safeString(parsed.whyChosen) || `This destination has great characteristics for your preferences.`,
      specifics: safeString(parsed.specifics) || `Key local info is derived from Google Maps data and regional context.`,
      uniqueNote: safeString(parsed.uniqueNote) || `Explore the spot at sunrise or during local meal hours for best experience.`,
      placeSpecifics: safePlaceSpecifics,
    };
  } catch (error) {
    console.error('Narrative generation failed', error);
    return {
      whyChosen: `${placeName} is selected because it matches user preferences for immersive experiences and local flavor.`,
      specifics: `The place has a strong local identity and a good reputation among visitors.`,
      uniqueNote: `Try the signature dishes and enjoy the scenic surroundings in the early morning.`,
      placeSpecifics:
        placeData?.types?.includes('restaurant')
          ? {
              'Top dish': 'Chef recommended specialty item',
              'Average price': '₹200-600 (approx)',
              'Local flavor': 'Authentic cuisine with regional ingredients',
            }
          : {
              'Must see': 'Key scenic/historic point',
              'Entry fee': 'Varies by season',
              'Best time to visit': 'Early morning or late afternoon',
            },
    };
  }
}

export default async function PlacePage({ params }: { params: Promise<{ slug?: string | string[] }> | { slug?: string | string[] } }) {
  const resolvedParams = await params;
  const slugRaw = typeof resolvedParams.slug === 'string' ? resolvedParams.slug : Array.isArray(resolvedParams.slug) ? resolvedParams.slug[0] : '';
  const decodedSlug = decodeURIComponent(slugRaw || '').trim();
  const slug = decodedSlug ? decodedSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';

  const fallbackName = slug
    ? slug
        .split('-')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Unknown Place';

  const place = slug && placeDetails[slug] ? placeDetails[slug] : null;
  // If slug isn't exactly matched, try to match by title variants
  const fallbackTitle = decodedSlug ? decodedSlug : fallbackName;
  const variantPlace = place || (fallbackTitle && placeDetails[fallbackTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')]) || null;
  const wikiPlace = !variantPlace ? await fetchPlaceFromWikipedia(fallbackTitle) : null;
  const unguardedPlace = variantPlace || wikiPlace || {
    name: fallbackName,
    keyFacts: ['Travel destination', 'Explore local highlights', 'Photos and media'],
    description: `Learn more about ${fallbackName}. This place is a recommended location in your itinerary with local relevance.`,
    history: `Historical details for ${fallbackName} may vary by local cultural context. Nearby guides can provide deeper insight into its origin and evolution.`,
    geography: `Geographically, ${fallbackName} is likely to be accessible by the selected transit mode and located near popular attractions or neighborhoods.`,
    future: `Future developments for ${fallbackName} can include new tours, expanded facilities, and upgraded services. Check local updates for latest information.`,
    highlights: ['Beautiful scenery', 'Local food', 'Cultural experiences'],
    images: [
      `https://source.unsplash.com/featured/?${encodeURIComponent(fallbackName)},travel`,
      `https://source.unsplash.com/featured/?${encodeURIComponent(fallbackName)},landmark`,
      `https://source.unsplash.com/featured/?${encodeURIComponent(fallbackName)},city`,
      `https://source.unsplash.com/featured/?${encodeURIComponent(fallbackName)},street`,
    ],
    videos: [],
  };

  const selectedPlace = {
    ...unguardedPlace,
    images:
      unguardedPlace.images && unguardedPlace.images.length > 0
        ? unguardedPlace.images
        : [
            `https://source.unsplash.com/3840x2160/?${encodeURIComponent(unguardedPlace.name)},travel`,
            `https://source.unsplash.com/3840x2160/?${encodeURIComponent(unguardedPlace.name)},landmark`,
          ],
  };

  const placeCategory = guessPlaceCategory(selectedPlace.name);
  const googlePlaceInfo = await getGooglePlaceData(selectedPlace.name);
  let googlePlacePhotos = googlePlaceInfo?.placeId ? await getGooglePlacePhotos(googlePlaceInfo.placeId, 12) : [];

  // Unique and deterministic conversion
  const normalizeUrl = (url: string) => {
    let normalized = url.trim();
    if (normalized.endsWith("/")) normalized = normalized.slice(0, -1);
    return normalized;
  };

  const allSources: string[] = [];

  // Primary source
  if (googlePlaceInfo?.photoReference) {
    allSources.push(`/api/photo?ref=${googlePlaceInfo.photoReference}`);
  }

  // Place details google photos
  googlePlacePhotos = Array.from(new Set(googlePlacePhotos.map((u) => normalizeUrl(u))));
  allSources.push(...googlePlacePhotos);

  // Pre-seeded static images
  const staticImages = (selectedPlace.images || []).map((imgUrl, idx) => {
    const img = normalizeUrl(imgUrl);
    return img.includes("source.unsplash.com") ? `${img}${img.includes("?") ? "&" : "?"}sig=static-${idx}` : img;
  });
  allSources.push(...staticImages);

  // Fallback generation by category to ensure relevance to place type
  const categoryTags: Record<string, string[]> = {
    restaurant: ["restaurant", "food", "cuisine", "dining", "chef"],
    nature: ["nature", "landscape", "wildlife", "lake", "mountain"],
    shopping: ["shopping", "mall", "market", "fashion", "street"],
    general: ["travel", "attraction", "landmark", "city", "culture"],
  };

  const chosenTags = categoryTags[placeCategory] || categoryTags.general;
  const highlightedTags = (selectedPlace.highlights || []).slice(0, 4).map((h) => h.toLowerCase().replace(/\s+/g, ","));
  const fallbackTags = highlightedTags.length > 0 ? highlightedTags : chosenTags;
  const placeEnc = encodeURIComponent(selectedPlace.name || "destination");

  // Use LoremFlickr with lock parameter for deterministic place-specific unique results.
  // LoremFlickr returns images related to the keyword but lock ensures stable, different images per index.
  const fallbackForms = fallbackTags.slice(0, 8).map((tag, idx) =>
      `https://loremflickr.com/3840/2160/${encodeURIComponent(selectedPlace.name)},${encodeURIComponent(tag)}?lock=${encodeURIComponent(
      `${placeEnc}-${tag}-${idx}`
    )}`
  );

  allSources.push(...fallbackForms);

  // Deduplicate preserving order
  const uniqueSources: string[] = [];
  const seen = new Set<string>();

  allSources.forEach((src) => {
    const n = normalizeUrl(src);
    if (!seen.has(n)) {
      seen.add(n);
      uniqueSources.push(src);
    }
  });

  const fallbackUnsplashSeeds = fallbackTags.slice(0, 8).map((tag, idx) =>
    `https://source.unsplash.com/3840x2160/?${encodeURIComponent(selectedPlace.name)},${encodeURIComponent(tag)}&sig=place-${idx}`
  );

  const blendedSources = [...uniqueSources, ...fallbackUnsplashSeeds];

  const dedupedFinal = Array.from(new Set(blendedSources.map((u) => u.trim())));

  const candidateImages: string[] = [];

  const addImage = (img: string) => {
    const normalized = normalizeUrl(img);
    if (!candidateImages.some((existing) => normalizeUrl(existing) === normalized)) {
      candidateImages.push(img);
    }
  };



  dedupedFinal.forEach((img) => addImage(img));

  let seedIdx = 0;
  const makeSeedImage = (i: number) => `https://picsum.photos/seed/${placeEnc}-${placeCategory}-${i + 1}/3840/2160`;
  while (candidateImages.length < 8) {
    addImage(makeSeedImage(seedIdx));
    seedIdx += 1;
  }

  let finalImages = candidateImages.slice(0, 8);

  if (googlePlaceInfo?.photoReference) {
    const apiPhotoUrl = `/api/photo?ref=${googlePlaceInfo.photoReference}`;
    const otherImages = finalImages.filter((url) => normalizeUrl(url) !== normalizeUrl(apiPhotoUrl));

    while (otherImages.length < 7) {
      const seed = makeSeedImage(seedIdx);
      seedIdx += 1;
      if (!otherImages.some((item) => normalizeUrl(item) === normalizeUrl(seed))) {
        otherImages.push(seed);
      }
    }

    finalImages = [apiPhotoUrl, ...otherImages.slice(0, 7)];
  }

  const getHost = (u: string) => {
    try {
      return new URL(u).hostname;
    } catch {
      return '';
    }
  };

  if (finalImages.length > 1) {
    const firstNorm = normalizeUrl(finalImages[0]);
    const secondNorm = normalizeUrl(finalImages[1]);

    const placeRelatedCandidates = [
      ...(googlePlacePhotos || []),
      ...(Array.isArray(staticImages) ? staticImages : []),
      ...(Array.isArray(fallbackForms) ? fallbackForms : []),
      ...(Array.isArray(fallbackUnsplashSeeds) ? fallbackUnsplashSeeds : []),
      ...(allSources || []),
    ];

    const findPlaceCandidate = () => {
      const ordered = Array.from(new Set(placeRelatedCandidates.map((u) => u))).filter(Boolean);

      const placeLike = ordered.filter((img) => {
        const lower = img.toLowerCase();
        return lower.includes(selectedPlace.name.toLowerCase()) ||
          fallbackTags.some((tag) => lower.includes(tag.toLowerCase()));
      });

      const best = placeLike.find((img) => normalizeUrl(img) !== firstNorm && normalizeUrl(img) !== secondNorm);
      if (best) return best;

      return ordered.find((img) => normalizeUrl(img) !== firstNorm && normalizeUrl(img) !== secondNorm);
    };

    const secondHost = getHost(finalImages[1] || '');
    const firstHost = getHost(finalImages[0] || '');
    const shouldReplace =
      firstNorm === secondNorm ||
      (firstHost && firstHost === secondHost) ||
      /(via\.placeholder\.com|picsum\.photos)/i.test(secondHost);

    if (shouldReplace) {
      const alternative = findPlaceCandidate();
      if (alternative) {
        finalImages[1] = alternative;
      }
    }

    if (normalizeUrl(finalImages[0]) === normalizeUrl(finalImages[1])) {
      const fallbackTag = fallbackTags.find((tag) => !finalImages[0].toLowerCase().includes(tag.toLowerCase())) ?? 'travel';
      finalImages[1] = `https://source.unsplash.com/1200x800/?${encodeURIComponent(selectedPlace.name)},${encodeURIComponent(fallbackTag)}&sig=force-2`;
    }
  }

  const dedupedFinalImages: string[] = [];
  finalImages.forEach((img) => {
    const normalized = normalizeUrl(img);
    if (!dedupedFinalImages.some((existing) => normalizeUrl(existing) === normalized)) {
      dedupedFinalImages.push(img);
    } else {
      let fallback = makeSeedImage(seedIdx);
      seedIdx += 1;
      while (dedupedFinalImages.some((existing) => normalizeUrl(existing) === normalizeUrl(fallback))) {
        fallback = makeSeedImage(seedIdx);
        seedIdx += 1;
      }
      dedupedFinalImages.push(fallback);
    }
  });

  while (dedupedFinalImages.length < 10) {
    let fallback = makeSeedImage(seedIdx);
    seedIdx += 1;
    while (dedupedFinalImages.some((existing) => normalizeUrl(existing) === normalizeUrl(fallback))) {
      fallback = makeSeedImage(seedIdx);
      seedIdx += 1;
    }
    dedupedFinalImages.push(fallback);
  }

  finalImages = dedupedFinalImages.slice(0, 10);

  // Ensure first two final images are not duplicates (strict real-url dedupe).
  if (finalImages.length > 1 && normalizeUrl(finalImages[0]) === normalizeUrl(finalImages[1])) {
    const nextDifferentIndex = finalImages.findIndex((img, i) => i > 1 && normalizeUrl(img) !== normalizeUrl(finalImages[0]));
    if (nextDifferentIndex !== -1) {
      [finalImages[1], finalImages[nextDifferentIndex]] = [finalImages[nextDifferentIndex], finalImages[1]];
    } else {
      const fallbackTag = fallbackTags.find((tag) => !finalImages[0].toLowerCase().includes(tag.toLowerCase())) ?? 'travel';
      finalImages[1] = `https://source.unsplash.com/1200x800/?${encodeURIComponent(selectedPlace.name)},${encodeURIComponent(fallbackTag)}&sig=force-2`;
    }
  }

  // Debug: log the selected first two image URLs and candidate list for root cause analysis
  console.log('PlacePage image selection debug', {
    slug,
    firstImage: finalImages[0],
    secondImage: finalImages[1],
    firstNorm: normalizeUrl(finalImages[0] || ''),
    secondNorm: normalizeUrl(finalImages[1] || ''),
    candidateImages: candidateImages.slice(0, 10),
    fallbackUnsplashSeeds: fallbackUnsplashSeeds.slice(0, 8),
    allSources: allSources.slice(0, 10),
    placeName: selectedPlace.name,
    shouldBeDifferent: normalizeUrl(finalImages[0] || '') !== normalizeUrl(finalImages[1] || ''),
  });

  const finalPlace = {
    ...selectedPlace,
    images: finalImages,
  };

  console.log('PlacePage image details:', {
    slug,
    selectedImages: selectedPlace.images?.length,
    googlePhotos: googlePlacePhotos?.length,
    finalImages: finalPlace.images.length,
    imageUrls: finalPlace.images,
  });

  // Show 8 photos in the "view more" gallery (exclude the first headline photo in finalPlace.images).
  const baseViewImages = finalPlace.images
    .slice(1)
    .map((img) => img?.trim() || '')
    .filter((img): img is string => Boolean(img));

  const uniqueBaseViewImages: string[] = [];
  baseViewImages.forEach((img) => {
    const normalized = normalizeUrl(img);
    if (!uniqueBaseViewImages.some((existing) => normalizeUrl(existing) === normalized)) {
      uniqueBaseViewImages.push(img);
    }
  });

  const isPlaceRelatedImage = (url: string) => {
    const lower = url.toLowerCase();
    const placeNameLower = (selectedPlace.name || '').toLowerCase();
    if (lower.includes(placeNameLower)) return true;
    return fallbackTags.some((tag) => lower.includes(tag.toLowerCase()));
  };

  const normalizeAndTrim = (url: string): string => url?.trim() || '';

  const shuffleArray = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      // eslint-disable-next-line react-hooks/purity
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const candidateSources = [
    ...uniqueBaseViewImages,
    ...(googlePlacePhotos || []),
    ...(Array.isArray(staticImages) ? staticImages : []),
  ]
    .map(normalizeAndTrim)
    .filter(Boolean);

  const fallbackCandidates = [
    ...fallbackForms,
    ...fallbackUnsplashSeeds,
  ]
    .map(normalizeAndTrim)
    .filter(Boolean);

  shuffleArray(candidateSources);
  shuffleArray(fallbackCandidates);

  const targetCount = 8;
  const displayImages: string[] = [];
  const usedUrls = new Set<string>();

  const addIfUnique = (img: string): boolean => {
    const normalized = normalizeUrl(img);
    if (!normalized || usedUrls.has(normalized)) return false;
    usedUrls.add(normalized);
    displayImages.push(img);
    return true;
  };

  const addFromSources = (sources: string[], requireRelated: boolean) => {
    for (const img of sources) {
      if (displayImages.length >= targetCount) break;
      if (requireRelated && !isPlaceRelatedImage(img)) continue;
      addIfUnique(img);
    }
  };

  addFromSources(candidateSources, true); // strongly related first
  addFromSources(candidateSources, false); // then any remaining, ordered
  addFromSources(fallbackCandidates, true); // then place-like fallback
  addFromSources(fallbackCandidates, false); // then any fallback

  let fallbackSourceIndex = 0;
  const placeQuery = encodeURIComponent(selectedPlace.name || fallbackName || 'travel');
  while (displayImages.length < targetCount) {
    const placeSupplemental = `https://source.unsplash.com/900x1600/?${placeQuery},landmark&sig=related-${fallbackSourceIndex}`;
    fallbackSourceIndex += 1;
    addIfUnique(placeSupplemental);
    if (fallbackSourceIndex > 20 && displayImages.length === 0) break;
  }

  const finalViewImages = displayImages.slice(0, targetCount);

  const narrative = await generatePlaceNarrative(finalPlace.name, placeCategory, googlePlaceInfo);

  return (
    <div className="min-h-screen text-[#F8F9FB] relative overflow-hidden">
      {/* Background Carousel with Zoom Effect */}
      <PlaceBackgroundCarousel 
        images={finalPlace.images || []} 
        placeName={finalPlace.name}
      />

      {/* Content */}
      <div className="relative z-10 p-6 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-center relative h-16 mb-8">
            <Link
              href="/plan-trip"
              className="absolute left-0 inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#E8C547] text-lg font-bold transition-colors duration-200 cursor-pointer"
            >
              ← Back
            </Link>
            <h1 className="text-4xl font-bold text-[#D4AF37] text-center drop-shadow-2xl" style={{
              textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 0 10px rgba(0,0,0,0.8)',
            }}>{finalPlace.name}</h1>
          </div>

          {/* Why this place section */}
          <section className="mb-6 p-8 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all shadow-lg">
            <h2 className="text-3xl font-bold text-[#D4AF37] mb-4 drop-shadow-lg" style={{
              textShadow: '1px 1px 0 #D4AF37, -1px -1px 0 #D4AF37, 1px -1px 0 #D4AF37, -1px 1px 0 #D4AF37',
            }}>✨ Why this place is chosen for you</h2>
            <ul className="text-lg space-y-3 list-disc list-inside font-medium drop-shadow-md" style={{
              color: '#F8F9FB',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
            }}>
              <li>{narrative.whyChosen.split('.')[0]}</li>
              {narrative.specifics && <li>{narrative.specifics.split('.')[0]}</li>}
              {narrative.uniqueNote && <li>{narrative.uniqueNote.split('.')[0]}</li>}
              {selectedPlace.keyFacts?.[0] && <li>{selectedPlace.keyFacts[0]}</li>}
            </ul>
          </section>

          <section className="mb-6 p-8 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all shadow-lg">
            <h2 className="text-3xl font-bold text-[#D4AF37] mb-3 drop-shadow-lg" style={{
              textShadow: '1px 1px 0 #D4AF37, -1px -1px 0 #D4AF37, 1px -1px 0 #D4AF37, -1px 1px 0 #D4AF37',
            }}><IconPin style={{ color: 'var(--theme-accent)', display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} /> Proper Location</h2>
            <p className="text-lg mb-4 font-medium drop-shadow-md" style={{
              color: '#F8F9FB',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
            }}>
              <strong>Address:</strong> {googlePlaceInfo?.address || 'Location details available on Google Maps'}
            </p>
            <a
              href={
                googlePlaceInfo?.placeId
                  ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(googlePlaceInfo.placeId)}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalPlace.name)}`
              }
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] hover:shadow-lg hover:shadow-[#D4AF37]/50 text-[#0B1F3A] px-4 py-2 text-sm font-bold transition-all duration-200 cursor-pointer transform hover:scale-105"
            >
              View on Google Maps
            </a>
          </section>

          {narrative.placeSpecifics && Object.keys(narrative.placeSpecifics).length > 0 && (
            <section className="mb-6 p-8 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all shadow-lg">
              <h2 className="text-3xl font-bold text-[#D4AF37] mb-4 drop-shadow-lg" style={{
                textShadow: '1px 1px 0 #D4AF37, -1px -1px 0 #D4AF37, 1px -1px 0 #D4AF37, -1px 1px 0 #D4AF37',
              }}>ℹ️ Place Info</h2>
              <ul className="text-lg space-y-2 list-disc list-inside font-medium drop-shadow-md" style={{
                color: '#F8F9FB',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              }}>
                {Object.entries(narrative.placeSpecifics).slice(0, 4).map(([label, value]) => (
                  <li key={label}>
                    <strong>{label}:</strong> {String(value)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#D4AF37] mb-3">🖼️ Gallery</h2>
            <PlacePhotoGallery images={finalViewImages} altPrefix={finalPlace.name} />
          </section>

          <section className="mb-6 p-8 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all shadow-lg">
            <a
              href={
                googlePlaceInfo?.placeId
                  ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(googlePlaceInfo.placeId)}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalPlace.name)}`
              }
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] hover:shadow-lg hover:shadow-[#D4AF37]/50 text-[#0B1F3A] px-4 py-2 text-sm font-bold transition-all duration-200 cursor-pointer transform hover:scale-105"
            >
              View more photos on Google Maps
            </a>
          </section>

          {placeCategory === 'restaurant' && (
            <section className="mb-6 p-8 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all shadow-lg">
              <h2 className="text-3xl font-bold text-[#D4AF37] mb-4 drop-shadow-lg" style={{
                textShadow: '1px 1px 0 #D4AF37, -1px -1px 0 #D4AF37, 1px -1px 0 #D4AF37, -1px 1px 0 #D4AF37',
              }}>🍽️ Menu & Specialties</h2>
              {narrative.placeSpecifics?.['Top dish'] && (
                <p className="text-lg mb-2 font-medium drop-shadow-md" style={{
                  color: '#F8F9FB',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                }}>
                  <strong>Must Try:</strong> {narrative.placeSpecifics['Top dish']}
                </p>
              )}
              {narrative.placeSpecifics?.['Average price'] && (
                <p className="text-lg mb-2 font-medium drop-shadow-md" style={{
                  color: '#F8F9FB',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                }}>
                  <strong>Price Range:</strong> {narrative.placeSpecifics['Average price']}
                </p>
              )}
              {narrative.placeSpecifics?.['Local flavor'] && (
                <p className="text-lg font-medium drop-shadow-md" style={{
                  color: '#F8F9FB',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                }}>
                  <strong>Specialty:</strong> {narrative.placeSpecifics['Local flavor']}
                </p>
              )}
            </section>
          )}

          {placeCategory !== 'restaurant' && (
            <section className="mb-6 p-8 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all shadow-lg">
              <h2 className="text-3xl font-bold text-[#D4AF37] mb-4 drop-shadow-lg" style={{
                textShadow: '1px 1px 0 #D4AF37, -1px -1px 0 #D4AF37, 1px -1px 0 #D4AF37, -1px 1px 0 #D4AF37',
              }}>🎫 Visiting Details</h2>
              <div className="space-y-3 text-lg font-medium drop-shadow-md" style={{
                color: '#F8F9FB',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              }}>
                {narrative.placeSpecifics?.['Entry fee'] && (
                  <p>
                    <strong>📋 Tickets:</strong> {narrative.placeSpecifics['Entry fee']}
                  </p>
                )}
                {narrative.placeSpecifics?.['Best time to visit'] && (
                  <p>
                    <strong>🕐 Best Time:</strong> {narrative.placeSpecifics['Best time to visit']}
                  </p>
                )}
                {narrative.placeSpecifics?.['Must see'] && (
                  <p>
                    <strong>🎯 Must See:</strong> {narrative.placeSpecifics['Must see']}
                  </p>
                )}
                {googlePlaceInfo?.openNow != null && (
                  <p>
                    <strong>🏢 Status:</strong> {googlePlaceInfo.openNow ? '✅ Open Now' : '❌ Closed at the moment'}
                  </p>
                )}
                {googlePlaceInfo?.rating && (
                  <p>
                    <strong>⭐ Rating:</strong> {googlePlaceInfo.rating} ({googlePlaceInfo.reviews ?? 0} reviews)
                  </p>
                )}
              </div>
            </section>
          )}

          <section className="mb-6 p-8 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all shadow-lg">
            <h2 className="text-3xl font-bold text-[#D4AF37] mb-4 drop-shadow-lg" style={{
              textShadow: '1px 1px 0 #D4AF37, -1px -1px 0 #D4AF37, 1px -1px 0 #D4AF37, -1px 1px 0 #D4AF37',
            }}>📖 History</h2>
            <p className="text-lg font-medium drop-shadow-md leading-relaxed" style={{
              color: '#F8F9FB',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
            }}>
              {selectedPlace.history || "Historical details for " + finalPlace.name + " may vary by local cultural context. Nearby guides can provide deeper insight into its origin and evolution."}
            </p>
          </section>

          {(selectedPlace.videos?.length > 0) && (
            <section className="mt-6">
              <h2 className="text-xl font-semibold text-[#D4AF37] mb-3">▶️ YouTube Vlogs & Guides</h2>
              <div className="space-y-3">
                {selectedPlace.videos.slice(0, 1).map((video) => (
                  <div key={video.url} className="bg-slate-800 rounded-lg overflow-hidden">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-[#D4AF37] hover:text-[#E8C547] text-sm font-semibold p-3 border-b border-[#D4AF37]/30 transition-colors duration-200 cursor-pointer"
                    >
                      ▶️ {video.title}
                    </a>
                    <div className="aspect-video">
                      <iframe
                        src={video.url}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <a
                href={`https://www.youtube.com/search?q=${encodeURIComponent(finalPlace.name + ' vlog travel guide')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-md bg-pink-600 hover:bg-pink-500 text-[#F8F9FB] px-4 py-2 text-sm font-semibold mt-4"
              >
                🎥 Watch More Videos on YouTube
              </a>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
