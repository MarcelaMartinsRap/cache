import { Router } from "express";
import avaliacoesController from "../controllers/avaliacoes.controller.js"

const router = Router();

router.post("/", avaliacoesController.create);

router.get("/restaurante/:restauranteId", avaliacoesController.listByRestaurant);

router.delete("/:id", avaliacoesController.remove);

export default router;
