import type { Request, Response } from "express";
import * as produtosService from "../services/produtos.service.js";
import { getCache, setCache, CACHE_KEYS } from "../services/cache.service.js";

export async function getProdutoById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;
    const produto = await produtosService.getProdutoById(id);

    if (!produto) {
      res.status(404).json({ error: "Produto não encontrado" });
      return;
    }

    const response = {
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      foto: produto.foto,
      preco: produto.preco,
      notaGeral: produto.notaGeral,
      qtdAvaliacoes: produto.qtdAvaliacoes,
      avaliacoes: produto.avaliacoes.map(
        (av: {
          id: string;
          nota: number;
          comentario: string | null;
          createdAt: Date;
        }) => ({
          id: av.id,
          nota: av.nota,
          comentario: av.comentario,
          createdAt: av.createdAt,
        })
      ),
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ error: "Erro ao buscar produto" });
  }
}

export async function getProdutoByIdFast(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;
    const startTime = Date.now();

    const cacheKey = CACHE_KEYS.produto(id);
    const cached = await getCache<ProdutoResponse>(cacheKey);

    if (cached) {
      const elapsed = Date.now() - startTime;
      res.setHeader("X-Cache", "HIT");
      res.setHeader("X-Response-Time", `${elapsed}ms`);
      return res.json(cached);
    }

    const produto = await produtosService.getProdutoById(id);

    if (!produto) {
      res.status(404).json({ error: "Produto não encontrado" });
      return;
    }

    const response: ProdutoResponse = {
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      foto: produto.foto,
      preco: produto.preco,
      notaGeral: produto.notaGeral,
      qtdAvaliacoes: produto.qtdAvaliacoes,
      avaliacoes: produto.avaliacoes.map(
        (av: {
          id: string;
          nota: number;
          comentario: string | null;
          createdAt: Date;
        }) => ({
          id: av.id,
          nota: av.nota,
          comentario: av.comentario,
          createdAt: av.createdAt,
        })
      ),
    };

    await setCache(cacheKey, response, 3600);

    const elapsed = Date.now() - startTime;
    res.setHeader("X-Cache", "MISS");
    res.setHeader("X-Response-Time", `${elapsed}ms`);
    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar produto (fast):", error);
    res.status(500).json({ error: "Erro ao buscar produto" });
  }
}

interface ProdutoResponse {
  id: string;
  nome: string;
  descricao: string | null;
  foto: string | null;
  preco: number;
  notaGeral: number;
  qtdAvaliacoes: number;
  avaliacoes: Array<{
    id: string;
    nota: number;
    comentario: string | null;
    createdAt: Date;
  }>;
}

export default {
  getProdutoById,
  getProdutoByIdFast,
};
