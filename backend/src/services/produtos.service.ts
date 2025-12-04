import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getProdutoById(id: string) {
  const resultado = await prisma.$queryRaw<any[]>`
    SELECT 
      p.id,
      p.nome,
      p.descricao,
      CAST(AVG(a.nota) AS FLOAT) AS "notaGeral",
      CAST(COUNT(a.id) AS INT) AS "qtdAvaliacoes",
      p.preco,
      p.foto,
      p."createdAt",
      json_agg(
        json_build_object(
          'id', a.id,
          'nota', a.nota,
          'comentario', a.comentario,
          'produtoId', a."produtoId",
          'createdAt', a."createdAt"
        )
        ORDER BY a."createdAt" DESC
      ) FILTER (WHERE a.id IS NOT NULL) AS avaliacoes
    FROM produtos p
    LEFT JOIN avaliacoes_produtos a ON a."produtoId" = p.id
    WHERE p.id = ${id}
    GROUP BY p.id;`;

  return resultado[0];
}

export default {
  getProdutoById,
};
