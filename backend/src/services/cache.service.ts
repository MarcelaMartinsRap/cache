export async function getCache<T>(key: string): Promise<T | null> {
  console.log(`❌ CACHE MISS (Redis desabilitado): ${key}`);
  return null;
}

export async function setCache<T>(
  key: string,
  data: T,
  ttlSeconds: number = 3600
): Promise<void> {
  console.log(`💾 CACHE SET (Redis desabilitado): ${key}`);
}

export async function deleteCache(key: string): Promise<void> {
  console.log(`🗑️ CACHE DELETE (Redis desabilitado): ${key}`);
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  console.log(`🗑️ CACHE DELETE PATTERN (Redis desabilitado): ${pattern}`);
}

export const CACHE_KEYS = {
  produto: (id: string) => `produto:${id}`,
  produtoAvaliacoes: (id: string) => `produto:${id}:avaliacoes`,
};
