import { Router } from "express";
import * as produtosController from "../controllers/produtos.controller.js";

const router = Router();

router.get("/", produtosController.listProdutos);
router.get("/:id", produtosController.getProdutoById);
router.post("/", produtosController.createProduto);
router.put("/:id", produtosController.updateProduto);
router.delete("/:id", produtosController.deleteProduto);

router.get("/:id/avaliacoes", produtosController.listAvaliacoes);
router.post("/:id/avaliacoes", produtosController.createAvaliacao);
router.delete("/avaliacoes/:avaliacaoId", produtosController.deleteAvaliacao);

export default router;
