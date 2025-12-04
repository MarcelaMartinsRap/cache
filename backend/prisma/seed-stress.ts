import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TOTAL_PRODUTOS = 1_000_000;
const PRODUTOS_VIRAIS = 2; 
const AVALIACOES_POR_VIRAL = 1_000_000;
const BATCH_SIZE_PRODUTOS = 10_000;
const BATCH_SIZE_AVALIACOES = 10_000;

const comentariosExemplo = [
  "Produto excelente! Recomendo muito.",
  "Ótima qualidade pelo preço.",
  "Chegou rápido e bem embalado.",
  "Superou minhas expectativas!",
  "Produto ok, nada demais.",
  "Muito bom, compraria novamente.",
  "Qualidade inferior ao esperado.",
  "Perfeito! Igual a foto.",
  "Bom custo-benefício.",
  "Não gostei, devolvi.",
  "Atendeu bem minhas necessidades.",
  "Material de primeira!",
  "Entrega demorou mas valeu a pena.",
  "Recomendo para todos!",
  "Produto maravilhoso!",
  null,
  null,
  null,
];

const nomesBase = [
  "Smartphone", "Notebook", "Tablet", "Fone de Ouvido", "Smart TV",
  "Câmera", "Console", "Monitor", "Teclado", "Mouse", "Caixa de Som",
  "Smartwatch", "Carregador", "Cabo USB", "Webcam", "Microfone",
  "HD Externo", "SSD", "Memória RAM", "Placa de Vídeo", "Processador",
];

const marcas = [
  "Samsung", "Apple", "Xiaomi", "LG", "Sony", "Dell", "HP", "Lenovo",
  "Asus", "Acer", "JBL", "Logitech", "Razer", "HyperX", "Corsair",
];

function randomNota(): number {
  const weights = [5, 10, 15, 30, 40];
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i]!;
    if (random <= 0) return i + 1;
  }
  return 5;
}

function randomComentario(): string | null {
  return comentariosExemplo[Math.floor(Math.random() * comentariosExemplo.length)] ?? null;
}

function randomNomeProduto(index: number): string {
  const nome = nomesBase[Math.floor(Math.random() * nomesBase.length)];
  const marca = marcas[Math.floor(Math.random() * marcas.length)];
  return `${marca} ${nome} Modelo ${index}`;
}

function randomPreco(): number {
  return Number((Math.random() * 5000 + 50).toFixed(2));
}

async function criarProdutosEmMassa() {
  console.log(`\n📦 Criando ${TOTAL_PRODUTOS.toLocaleString()} produtos...`);
  const startTime = Date.now();

  for (let batch = 0; batch < TOTAL_PRODUTOS / BATCH_SIZE_PRODUTOS; batch++) {
    const produtos = [];
    const startIndex = batch * BATCH_SIZE_PRODUTOS;

    for (let i = 0; i < BATCH_SIZE_PRODUTOS; i++) {
      const index = startIndex + i + 1;
      produtos.push({
        nome: randomNomeProduto(index),
        descricao: `Descrição do produto ${index}. Qualidade garantida!`,
        preco: randomPreco(),
        foto: `https://example.com/produto-${index}.jpg`,
        notaGeral: Number((Math.random() * 4 + 1).toFixed(2)),
        qtdAvaliacoes: Math.floor(Math.random() * 100),
      });
    }

    await prisma.produto.createMany({ data: produtos });

    const progress = ((batch + 1) * BATCH_SIZE_PRODUTOS / TOTAL_PRODUTOS * 100).toFixed(1);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const inserted = (batch + 1) * BATCH_SIZE_PRODUTOS;
    console.log(`   [${progress}%] ${inserted.toLocaleString()} produtos - ${elapsed}s`);
  }

  console.log(`✅ ${TOTAL_PRODUTOS.toLocaleString()} produtos criados!`);
}

async function criarProdutosVirais() {
  const produtosVirais: { id: string; nome: string }[] = [];

  console.log(`\n🔥 Criando ${PRODUTOS_VIRAIS} produtos virais...`);

  for (let i = 0; i < PRODUTOS_VIRAIS; i++) {
    const produto = await prisma.produto.create({
      data: {
        nome: `🔥 VIRAL ${i + 1} - iPhone 15 Pro Max 256GB - MAIS VENDIDO`,
        descricao: "O smartphone mais desejado do momento! Câmera profissional, chip A17 Pro.",
        preco: 9499.99,
        foto: `https://example.com/viral-${i + 1}.jpg`,
        notaGeral: 0,
        qtdAvaliacoes: 0,
      },
    });
    produtosVirais.push({ id: produto.id, nome: produto.nome });
    console.log(`   ✅ Produto viral ${i + 1}: ${produto.id}`);
  }

  return produtosVirais;
}

async function criarAvaliacoesParaProduto(produtoId: string, produtoNome: string, numero: number) {
  console.log(`\n📝 Inserindo ${AVALIACOES_POR_VIRAL.toLocaleString()} avaliações para produto viral ${numero}...`);
  
  let totalNotas = 0;
  const startTime = Date.now();

  for (let batch = 0; batch < AVALIACOES_POR_VIRAL / BATCH_SIZE_AVALIACOES; batch++) {
    const avaliacoes = [];

    for (let i = 0; i < BATCH_SIZE_AVALIACOES; i++) {
      const nota = randomNota();
      totalNotas += nota;
      avaliacoes.push({
        nota,
        comentario: randomComentario(),
        produtoId,
      });
    }

    await prisma.avaliacaoProduto.createMany({ data: avaliacoes });

    const progress = ((batch + 1) * BATCH_SIZE_AVALIACOES / AVALIACOES_POR_VIRAL * 100).toFixed(1);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const inserted = (batch + 1) * BATCH_SIZE_AVALIACOES;
    console.log(`   [${progress}%] ${inserted.toLocaleString()} avaliações - ${elapsed}s`);
  }

  const notaGeral = Number((totalNotas / AVALIACOES_POR_VIRAL).toFixed(2));
  await prisma.produto.update({
    where: { id: produtoId },
    data: { notaGeral, qtdAvaliacoes: AVALIACOES_POR_VIRAL },
  });

  console.log(`   ⭐ Nota geral calculada: ${notaGeral}`);
}

async function main() {
  console.log("🚀 STRESS TEST - SEED DO E-COMMERCE");
  console.log("=".repeat(60));
  console.log(`📦 Total de produtos: ${TOTAL_PRODUTOS.toLocaleString()}`);
  console.log(`🔥 Produtos virais: ${PRODUTOS_VIRAIS}`);
  console.log(`📝 Avaliações por viral: ${AVALIACOES_POR_VIRAL.toLocaleString()}`);
  console.log(`📊 Total de avaliações: ${(PRODUTOS_VIRAIS * AVALIACOES_POR_VIRAL).toLocaleString()}`);
  console.log("=".repeat(60));

  const startTotal = Date.now();

  console.log("\n🗑️  Limpando dados existentes...");
  await prisma.avaliacaoProduto.deleteMany();
  await prisma.produto.deleteMany();
  console.log("   ✅ Banco limpo!");

  await criarProdutosEmMassa();

  const produtosVirais = await criarProdutosVirais();

  for (let i = 0; i < produtosVirais.length; i++) {
    const pv = produtosVirais[i]!;
    await criarAvaliacoesParaProduto(pv.id, pv.nome, i + 1);
  }

  const totalTime = ((Date.now() - startTotal) / 1000 / 60).toFixed(2);

  console.log("\n" + "=".repeat(60));
  console.log("✅ STRESS TEST SEED COMPLETO!");
  console.log("=".repeat(60));
  console.log(`📦 Produtos criados: ${(TOTAL_PRODUTOS + PRODUTOS_VIRAIS).toLocaleString()}`);
  console.log(`📝 Avaliações criadas: ${(PRODUTOS_VIRAIS * AVALIACOES_POR_VIRAL).toLocaleString()}`);
  console.log(`⏱️  Tempo total: ${totalTime} minutos`);
  console.log("=".repeat(60));
  
  console.log("\n🧪 TESTE OS ENDPOINTS:");
  for (const pv of produtosVirais) {
    console.log(`   GET http://localhost:3000/api/produtos/${pv.id}`);
  }
  console.log("\n⚠️  ATENÇÃO: O GET dos produtos virais vai trazer 1M de avaliações!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
