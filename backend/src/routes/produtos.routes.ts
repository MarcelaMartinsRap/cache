import { Router } from "express";
import * as produtosController from "../controllers/produtos.controller.js";

const router = Router();

router.get("/:id", produtosController.getProdutoById);
router.get("/:id/fast", produtosController.getProdutoByIdFast); // Com cache Redis

export default router;
