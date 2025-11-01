import { Router } from "express";
import enderecoController from "../controllers/endereco.controller.js";

const router = Router();

router.post("/", enderecoController.create);
router.get("/:id", enderecoController.getById);
router.get("/search", enderecoController.search);

export default router;
