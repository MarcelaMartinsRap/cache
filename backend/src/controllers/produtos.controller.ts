import type { Request, Response } from "express";
import * as produtosService from "../services/produtos.service.js";
import { getCache, setCache, CACHE_KEYS } from "../services/cache.service.js";

export async function listProdutos(_req: Request, res: Response) {
  try {
    const produtos = await produtosService.listProdutos();
    res.json(produtos);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    res.status(500).json({ error: "Erro ao listar produtos" });
  }
}

export async function getProdutoById(req: Request<{ id: string }>, res: Response) {
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
      avaliacoes: produto.avaliacoes.map((av: { id: string; nota: number; comentario: string | null; createdAt: Date }) => ({
        id: av.id,
        nota: av.nota,
        comentario: av.comentario,
        createdAt: av.createdAt,
      })),
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ error: "Erro ao buscar produto" });
  }
}

export async function getProdutoByIdFast(req: Request<{ id: string }>, res: Response) {
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
      avaliacoes: produto.avaliacoes.map((av: { id: string; nota: number; comentario: string | null; createdAt: Date }) => ({
        id: av.id,
        nota: av.nota,
        comentario: av.comentario,
        createdAt: av.createdAt,
      })),
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

export async function createProduto(req: Request, res: Response) {
  try {
    const { nome, descricao, preco, foto } = req.body;

    if (!nome || preco === undefined) {
      res.status(400).json({ error: "Nome e preço são obrigatórios" });
      return;
    }

    const produto = await produtosService.createProduto({
      nome,
      descricao,
      preco: Number(preco),
      foto,
    });

    res.status(201).json(produto);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
}

export async function updateProduto(req: Request<{ id: string }>, res: Response) {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, foto } = req.body;

    const updateData: Parameters<typeof produtosService.updateProduto>[1] = {};
    if (nome !== undefined) updateData.nome = nome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (preco !== undefined) updateData.preco = Number(preco);
    if (foto !== undefined) updateData.foto = foto;

    const produto = await produtosService.updateProduto(id, updateData);

    res.json(produto);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
}

export async function deleteProduto(req: Request<{ id: string }>, res: Response) {
  try {
    const { id } = req.params;
    await produtosService.deleteProduto(id);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ error: "Erro ao deletar produto" });
  }
}

export async function createAvaliacao(req: Request<{ id: string }>, res: Response) {
  try {
    const { id } = req.params;
    const { nota, comentario } = req.body;

    if (nota === undefined || nota < 1 || nota > 5) {
      res.status(400).json({ error: "Nota deve ser um número entre 1 e 5" });
      return;
    }

    const avaliacao = await produtosService.createAvaliacaoProduto(id, {
      nota: Number(nota),
      comentario,
    });

    res.status(201).json(avaliacao);
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    res.status(500).json({ error: "Erro ao criar avaliação" });
  }
}

export async function listAvaliacoes(req: Request<{ id: string }>, res: Response) {
  try {
    const { id } = req.params;
    const avaliacoes = await produtosService.listAvaliacoesByProduto(id);
    res.json(avaliacoes);
  } catch (error) {
    console.error("Erro ao listar avaliações:", error);
    res.status(500).json({ error: "Erro ao listar avaliações" });
  }
}

export async function deleteAvaliacao(req: Request<{ avaliacaoId: string }>, res: Response) {
  try {
    const { avaliacaoId } = req.params;
    await produtosService.deleteAvaliacaoProduto(avaliacaoId);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar avaliação:", error);
    res.status(500).json({ error: "Erro ao deletar avaliação" });
  }
}

export default {
  listProdutos,
  getProdutoById,
  getProdutoByIdFast,
  createProduto,
  updateProduto,
  deleteProduto,
  createAvaliacao,
  listAvaliacoes,
  deleteAvaliacao,
};
