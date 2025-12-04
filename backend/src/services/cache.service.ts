import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis.default(REDIS_URL);

redis.on("connect", () => {
  console.log("✅ Redis conectado!");
});

redis.on("error", (err: Error) => {
  console.error("❌ Erro Redis:", err);
});

const DEFAULT_TTL = 60 * 60;

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (data) {
      console.log(`🎯 CACHE HIT: ${key}`);
      return JSON.parse(data) as T;
    }
    console.log(`❌ CACHE MISS: ${key}`);
    return null;
  } catch (error) {
    console.error("Erro ao buscar cache:", error);
    return null;
  }
}

export async function setCache<T>(key: string, data: T, ttlSeconds: number = DEFAULT_TTL): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    console.log(`💾 CACHE SET: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    console.error("Erro ao salvar cache:", error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
    console.log(`🗑️ CACHE DELETE: ${key}`);
  } catch (error) {
    console.error("Erro ao deletar cache:", error);
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️ CACHE DELETE PATTERN: ${pattern} (${keys.length} keys)`);
    }
  } catch (error) {
    console.error("Erro ao deletar cache por pattern:", error);
  }
}

export const CACHE_KEYS = {
  produto: (id: string) => `produto:${id}`,
  produtoAvaliacoes: (id: string) => `produto:${id}:avaliacoes`,
};

export default redis;
