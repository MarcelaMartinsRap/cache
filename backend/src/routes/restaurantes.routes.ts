import { Router } from "express";
import restaurantesController from "../controllers/restaurantes.controller.js";

const router = Router();

router.get("/", restaurantesController.list);

router.post("/", restaurantesController.create);

router.get("/:id", restaurantesController.getById);

router.put("/:id", restaurantesController.update);

router.delete("/:id", restaurantesController.remove);

export default router;
