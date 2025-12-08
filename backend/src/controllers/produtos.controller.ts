import type { Request, Response } from "express";
import * as produtosService from "../services/produtos.service.js";
import { getCache, setCache } from "../services/cache.service.js";

export async function getProdutoById(
  req: Request<{ id: string }>,
  res: Response
) {
  const { id } = req.params;
# alteração linha 10
  console.time(timer);

  try {
    const produto = await produtosService.getProdutoById(id);

    if (!produto) {
      res.status(404).json({ error: "Produto não encontrado" });
      return;
    }
# alteração linha 20
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

    console.timeEnd(timer);
    res.json(response);
  } catch (error) {
    console.timeEnd(timer);
    console.error("Erro ao buscar produto:", error);
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

// Rota COM cache (otimizada)
export async function getProdutoByIdComCache(
  req: Request<{ id: string }>,
  res: Response
) {
  const { id } = req.params;
  const timer = `[COM CACHE] Produto ${id}`;
  console.time(timer);

  try {
    const cacheKey = `produto:${id}`;

    // Tentar buscar do cache primeiro
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log(`✅ Cache HIT - Produto ${id}`);
      console.timeEnd(timer);
      res.json(cached);
      return;
    }

    console.log(`❌ Cache MISS - Produto ${id}`);

    // Se não estiver no cache, busca do banco
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

    // Salvar no cache por 1 hora (3600 segundos)
    await setCache(cacheKey, response, 3600);

    console.timeEnd(timer);
    res.json(response);
  } catch (error) {
    console.timeEnd(timer);
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ error: "Erro ao buscar produto" });
  }
}

export default {
  getProdutoById,
  getProdutoByIdComCache,
};
