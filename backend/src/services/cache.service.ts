import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redis.on("connect", () => {
  console.log("✅ Conectado ao Redis");
});

redis.on("error", (err: Error) => {
  console.error("❌ Erro no Redis:", err);
});

export async function getCache(key: string): Promise<any | null> {
  try {
    const data = await redis.get(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar cache:", error);
    return null;
  }
}

export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 3600
): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error("Erro ao salvar cache:", error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Erro ao deletar cache:", error);
  }
}

export default redis;
