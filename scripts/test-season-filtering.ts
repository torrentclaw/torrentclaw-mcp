#!/usr/bin/env tsx
/**
 * Script de prueba para verificar el filtrado por temporada/episodio
 *
 * Uso:
 *   npx tsx scripts/test-season-filtering.ts
 */

import { formatSearchResults } from "../src/formatters/content.js";
import type { SearchResponse, TorrentInfo } from "../src/types.js";

// Colores para la consola
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message: string) {
  console.log("\n" + "=".repeat(80));
  log("cyan", message);
  console.log("=".repeat(80));
}

function createTorrent(
  season: number | null,
  episode: number | null,
  quality: string,
  score: number,
  seeders: number,
): TorrentInfo {
  return {
    infoHash: "a".repeat(40),
    rawTitle: null,
    quality,
    codec: "x264",
    sourceType: "WEB-DL",
    sizeBytes: "1073741824",
    seeders,
    leechers: 0,
    magnetUrl: `magnet:?xt=urn:btih:${"a".repeat(40)}`,
    torrentUrl: null,
    source: "test",
    qualityScore: score,
    uploadedAt: null,
    languages: [],
    audioCodec: null,
    hdrType: null,
    releaseGroup: null,
    isProper: null,
    isRepack: null,
    isRemastered: null,
    season,
    episode,
    audioTracks: null,
    subtitleTracks: null,
    videoInfo: null,
    scanStatus: null,
  };
}

function createResponse(torrents: TorrentInfo[]): SearchResponse {
  return {
    total: 1,
    page: 1,
    pageSize: 10,
    results: [
      {
        id: 1,
        imdbId: "tt1234567",
        tmdbId: "12345",
        contentType: "show",
        title: "Test Show",
        titleOriginal: null,
        year: 2024,
        overview:
          "Una serie de prueba para verificar el filtrado por temporada",
        posterUrl: null,
        backdropUrl: null,
        genres: ["Drama", "Action"],
        ratingImdb: "8.5",
        ratingTmdb: "8.2",
        contentUrl: "https://torrentclaw.com/shows/test-show-1",
        hasTorrents: true,
        torrents,
      },
    ],
  };
}

// Test 1: Caso original del bug - Temporada 4 con mejores torrents en temporadas anteriores
header("TEST 1: Búsqueda de temporada específica (caso del bug original)");
log(
  "yellow",
  "Escenario: Serie con temporadas 1-4, donde T1-T3 tienen mejor calidad que T4",
);
log("yellow", "Búsqueda: season=4");

const test1Torrents = [
  createTorrent(1, null, "1080p", 90, 100), // Mejor score, pero T1
  createTorrent(2, null, "1080p", 85, 80), // Segundo mejor, pero T2
  createTorrent(3, null, "1080p", 80, 60), // Tercero, pero T3
  createTorrent(4, null, "720p", 70, 40), // T4 - score bajo
  createTorrent(4, null, "1080p", 75, 30), // T4 - score medio
];

const test1Response = createResponse(test1Torrents);

console.log("\n📌 SIN filtro (comportamiento anterior):");
console.log(formatSearchResults(test1Response));

console.log("\n✅ CON filtro season=4 (comportamiento corregido):");
console.log(formatSearchResults(test1Response, { season: 4 }));

log("green", "✓ Debe mostrar SOLO los 2 torrents de temporada 4");
log("green", '✓ Debe indicar "2 matching, 5 total"');

// Test 2: Filtrado por episodio específico
header("TEST 2: Búsqueda de episodio específico");
log("yellow", "Escenario: Múltiples episodios de la misma temporada");
log("yellow", "Búsqueda: season=2, episode=5");

const test2Torrents = [
  createTorrent(2, 3, "1080p", 90, 100),
  createTorrent(2, 5, "1080p", 85, 80), // Episodio buscado
  createTorrent(2, 5, "720p", 70, 60), // Episodio buscado
  createTorrent(2, 7, "1080p", 88, 90),
];

const test2Response = createResponse(test2Torrents);

console.log("\n✅ CON filtro season=2, episode=5:");
console.log(formatSearchResults(test2Response, { season: 2, episode: 5 }));

log("green", "✓ Debe mostrar SOLO los 2 torrents de S02E05");
log("green", '✓ Debe indicar "2 matching, 4 total"');

// Test 3: Temporada no disponible
header("TEST 3: Temporada no disponible");
log("yellow", "Escenario: Buscar temporada que no existe");
log("yellow", "Búsqueda: season=10");

const test3Torrents = [
  createTorrent(1, null, "1080p", 90, 100),
  createTorrent(2, null, "1080p", 85, 80),
  createTorrent(3, null, "720p", 75, 60),
];

const test3Response = createResponse(test3Torrents);

console.log("\n✅ CON filtro season=10 (no existe):");
console.log(formatSearchResults(test3Response, { season: 10 }));

log("green", '✓ Debe mostrar mensaje "No torrents available for season 10"');
log("green", '✓ Debe indicar "3 torrents available for other seasons"');

// Test 4: Packs de temporada vs episodios individuales
header("TEST 4: Packs de temporada completa vs episodios individuales");
log("yellow", "Escenario: Mezcla de packs completos y episodios individuales");
log("yellow", "Búsqueda: season=1, episode=5");

const test4Torrents = [
  createTorrent(1, null, "1080p", 95, 100), // Pack completo T1
  createTorrent(1, 1, "1080p", 90, 80), // Episodio 1
  createTorrent(1, 5, "1080p", 85, 70), // Episodio 5 (buscado)
  createTorrent(1, 5, "720p", 75, 60), // Episodio 5 (buscado)
  createTorrent(1, 10, "1080p", 88, 65), // Episodio 10
];

const test4Response = createResponse(test4Torrents);

console.log("\n📌 CON filtro season=1 (solo temporada):");
console.log(formatSearchResults(test4Response, { season: 1 }));

log("green", "✓ Debe mostrar todos los torrents de T1 (5 torrents)");

console.log("\n✅ CON filtro season=1, episode=5 (específico):");
console.log(formatSearchResults(test4Response, { season: 1, episode: 5 }));

log("green", "✓ Debe mostrar SOLO episodios S01E05 (2 torrents)");
log("green", "✓ NO debe mostrar el pack completo");

// Test 5: Más de 5 torrents de la misma temporada
header("TEST 5: Más de 5 torrents de la misma temporada");
log("yellow", "Escenario: 8 torrents disponibles de la temporada 3");
log("yellow", "Búsqueda: season=3");

const test5Torrents = [
  createTorrent(3, null, "2160p", 100, 150),
  createTorrent(3, null, "1080p", 95, 140),
  createTorrent(3, null, "1080p", 90, 130),
  createTorrent(3, null, "720p", 85, 120),
  createTorrent(3, null, "1080p", 80, 110),
  createTorrent(3, null, "720p", 75, 100),
  createTorrent(3, null, "480p", 70, 90),
  createTorrent(3, null, "720p", 65, 80),
];

const test5Response = createResponse(test5Torrents);

console.log("\n✅ CON filtro season=3:");
console.log(formatSearchResults(test5Response, { season: 3 }));

log("green", "✓ Debe mostrar máximo 5 torrents (los de mejor score)");
log("green", '✓ Debe indicar "8 matching, 8 total, top 5"');
log("green", "✓ Primer torrent debe ser 2160p (score: 100)");

// Test 6: Sin filtro (comportamiento original debe mantenerse)
header("TEST 6: Sin filtro de temporada (regresión)");
log("yellow", "Escenario: Búsqueda sin especificar temporada");
log("yellow", "Búsqueda: sin season ni episode");

const test6Torrents = [
  createTorrent(1, null, "1080p", 70, 50),
  createTorrent(2, null, "1080p", 85, 80),
  createTorrent(3, null, "2160p", 95, 100),
  createTorrent(4, null, "720p", 60, 40),
];

const test6Response = createResponse(test6Torrents);

console.log("\n✅ SIN filtro:");
console.log(formatSearchResults(test6Response));

log("green", "✓ Debe mostrar top 4 torrents ordenados por score");
log("green", "✓ Primero: T3 2160p (score: 95)");
log("green", "✓ Último: T4 720p (score: 60)");
log("green", '✓ Debe indicar "4 total, top 4"');

// Resumen
header("RESUMEN DE PRUEBAS");
log("cyan", "Todos los tests manuales ejecutados.");
log(
  "cyan",
  "Verifica que los resultados coincidan con las expectativas marcadas con ✓",
);
console.log("\nPara ejecutar tests automatizados:");
log("blue", "  npm test -- tests/formatters/content.test.ts");
console.log("\nPara ver cobertura completa:");
log("blue", "  npm test");
console.log();
