import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateProdutoInput {
  nome: string;
  descricao?: string;
  preco: number;
  foto?: string;
}

export interface CreateAvaliacaoInput {
  nota: number;
  comentario?: string;
}

export async function createProduto(data: CreateProdutoInput) {
  const produto = await prisma.produto.create({ data });
  return produto;
}

export async function listProdutos() {
  const produtos = await prisma.produto.findMany({
    orderBy: { createdAt: "desc" },
  });
  return produtos;
}

export async function getProdutoById(id: string) {
  const produto = await prisma.produto.findUnique({
    where: { id },
    include: {
      avaliacoes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return produto;
}

export async function updateProduto(id: string, data: Partial<CreateProdutoInput>) {
  const produto = await prisma.produto.update({
    where: { id },
    data,
  });
  return produto;
}

export async function deleteProduto(id: string) {
  const produto = await prisma.produto.delete({
    where: { id },
  });
  return produto;
}

export async function createAvaliacaoProduto(produtoId: string, data: CreateAvaliacaoInput) {
  const avaliacao = await prisma.avaliacaoProduto.create({
    data: {
      ...data,
      produtoId,
    },
  });

  await atualizarNotaGeral(produtoId);

  return avaliacao;
}

export async function listAvaliacoesByProduto(produtoId: string) {
  const avaliacoes = await prisma.avaliacaoProduto.findMany({
    where: { produtoId },
    orderBy: { createdAt: "desc" },
  });
  return avaliacoes;
}

export async function deleteAvaliacaoProduto(id: string) {
  const avaliacao = await prisma.avaliacaoProduto.delete({
    where: { id },
  });

  await atualizarNotaGeral(avaliacao.produtoId);

  return avaliacao;
}

async function atualizarNotaGeral(produtoId: string) {
  const agg = await prisma.avaliacaoProduto.aggregate({
    where: { produtoId },
    _count: { _all: true },
    _avg: { nota: true },
  });

  const qtdAvaliacoes = agg._count._all;
  const notaGeral = agg._avg.nota ? Number(agg._avg.nota.toFixed(2)) : 0;

  await prisma.produto.update({
    where: { id: produtoId },
    data: { qtdAvaliacoes, notaGeral },
  });
}

export default {
  createProduto,
  listProdutos,
  getProdutoById,
  updateProduto,
  deleteProduto,
  createAvaliacaoProduto,
  listAvaliacoesByProduto,
  deleteAvaliacaoProduto,
};
