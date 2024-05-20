import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import type { CacheData } from "./types.js";
import { CACHE_TTL } from "./constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cacheDir = path.resolve(__dirname, "../cache");

// Ensure the cache directory exists
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

const cacheFilePath = path.join(cacheDir, "cache.json");

export const generateHash = (url: string) =>
  crypto.createHash("md5").update(url).digest("hex");

const readCacheData = (): CacheData[] => {
  try {
    return JSON.parse(fs.readFileSync(cacheFilePath, "utf-8"));
  } catch (error) {
    console.error("Failed to read cache data:", error);
    return [];
  }
};

const writeCacheData = (data: CacheData[]): void => {
  try {
    fs.writeFileSync(cacheFilePath, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to write cache data:", error);
  }
};

export const isCacheExist = (url: string): boolean => {
  const data = readCacheData();
  const urlHash = generateHash(url);
  const cache = data.find((d) => d.urlHash === urlHash);

  if (cache && cache.createdAt > Date.now()) {
    return true;
  }

  const newData = data.filter((d) => d.urlHash !== urlHash);
  writeCacheData(newData);
  return false;
};

export const setCache = (url: string, imageBuffer: Buffer): void => {
  const data = readCacheData();
  const urlHash = generateHash(url);
  const newData: CacheData = {
    urlHash,
    base64Image: imageBuffer.toString("base64"),
    createdAt: Date.now() + CACHE_TTL,
  };

  data.push(newData);
  writeCacheData(data);
};

export const getImageFromCache = (url: string): Buffer => {
  const data = readCacheData();
  const cache = data.find((d) => d.urlHash === generateHash(url));
  if (!cache) {
    throw new Error("Cache not found");
  }
  return Buffer.from(cache.base64Image, "base64");
};
