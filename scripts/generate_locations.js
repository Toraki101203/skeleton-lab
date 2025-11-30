import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawPrefecturesPath = path.join(__dirname, '../src/data/raw_prefectures.json');
const rawMunicipalitiesPath = path.join(__dirname, '../src/data/raw_municipalities.json');
const outputPath = path.join(__dirname, '../src/data/locations.ts');

const prefectures = JSON.parse(fs.readFileSync(rawPrefecturesPath, 'utf8'));
const municipalities = JSON.parse(fs.readFileSync(rawMunicipalitiesPath, 'utf8'));

// Helper to normalize prefecture ID
const normalizePrefId = (romaji) => {
    return romaji.toLowerCase()
        .replace(' ken', '')
        .replace(' fu', '')
        .replace(' to', '')
        .trim();
};

const PREFECTURES = prefectures.map(p => ({
    id: normalizePrefId(p.prefecture_romaji),
    name: p.prefecture_kanji
}));

const CITIES = {};

// Initialize arrays for all prefectures
PREFECTURES.forEach(p => {
    CITIES[p.id] = [];
});

municipalities.forEach(m => {
    const prefId = normalizePrefId(m.prefecture_romaji);
    if (CITIES[prefId]) {
        CITIES[prefId].push({
            id: m.code,
            name: m.name_kanji
        });
    } else {
        // console.warn(`Prefecture not found for: ${m.name_romaji} (${prefId})`);
    }
});

// Sort cities by code
Object.keys(CITIES).forEach(key => {
    CITIES[key].sort((a, b) => a.id.localeCompare(b.id));
});

const outputContent = `// This file is auto-generated. Do not edit manually.
export const PREFECTURES = ${JSON.stringify(PREFECTURES, null, 4)};

export const CITIES: Record<string, { id: string, name: string }[]> = ${JSON.stringify(CITIES, null, 4)};

// Helper to get cities safely
export const getCities = (prefId: string) => {
    return CITIES[prefId] || [];
};
`;

fs.writeFileSync(outputPath, outputContent, 'utf8');
console.log('Successfully generated src/data/locations.ts');
