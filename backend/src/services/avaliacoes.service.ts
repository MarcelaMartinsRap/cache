import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createAvaliacao(data: { nota: number; comentario?: string | null; usuarioId: string; restauranteId: string }) {
  const aval = await prisma.avaliacao.create({ data });

  const resto = await prisma.restaurantes.findUnique({ where: { id: data.restauranteId }, include: { avaliacoes: true } });
  if (resto) {
    const qtd = resto.avaliacoes?.length ?? 0;
    const soma = (resto.avaliacoes ?? []).reduce((s: number, a: any) => s + (a.nota ?? 0), 0) + data.nota;
    const novaQtd = qtd + 1;
    const novaNota = Number((soma / novaQtd).toFixed(2));
    await prisma.restaurantes.update({ where: { id: resto.id }, data: { qtd_avaliacoes: novaQtd, nota: novaNota } });
  }

  return aval;
}

export async function listByRestaurant(restauranteId: string) {
  const list = await prisma.avaliacao.findMany({ where: { restauranteId }, include: { usuario: { select: { id: true, nome: true } } }, orderBy: { createdAt: "desc" } });
  return list;
}

export async function deleteAvaliacao(id: string) {
  const aval = await prisma.avaliacao.delete({ where: { id } });

  const resto = await prisma.restaurantes.findUnique({ where: { id: aval.restauranteId }, include: { avaliacoes: true } });
  if (resto) {
    const qtd = resto.avaliacoes?.length ?? 0;
    const soma = (resto.avaliacoes ?? []).reduce((s: number, a: any) => s + (a.nota ?? 0), 0);
    const nota = qtd > 0 ? Number((soma / qtd).toFixed(2)) : 0;
    await prisma.restaurantes.update({ where: { id: resto.id }, data: { qtd_avaliacoes: qtd, nota } });
  }
  return aval;
}

export default { createAvaliacao, listByRestaurant, deleteAvaliacao };

export async function getStatsForRestaurant(restauranteId: string) {
  const agg = await prisma.avaliacao.aggregate({ where: { restauranteId }, _count: { _all: true }, _avg: { nota: true } });
  const qtd = agg._count?._all ?? 0;
  const nota = agg._avg?.nota ? Number((agg._avg.nota).toFixed(2)) : 0;
  return { qtd, nota };
}

export async function getStatsForRestaurants(restauranteIds: string[]) {
  if (!restauranteIds || restauranteIds.length === 0) return {};
  const groups = await prisma.avaliacao.groupBy({
    by: ["restauranteId"],
    where: { restauranteId: { in: restauranteIds } },
    _count: { _all: true },
    _avg: { nota: true },
  });
  const map: Record<string, { qtd: number; nota: number }> = {};
  for (const g of groups) {
    map[g.restauranteId] = { qtd: g._count?._all ?? 0, nota: g._avg?.nota ? Number((g._avg.nota).toFixed(2)) : 0 };
  }
  return map;
}
