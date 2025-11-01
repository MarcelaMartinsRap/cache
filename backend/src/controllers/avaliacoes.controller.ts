import type { Request, Response } from "express";
import * as avaliacoesService from "../services/avaliacoes.service.js";

export async function create(req: Request, res: Response) {
  try {
    const { nota, comentario, usuarioId, restauranteId } = req.body;
    if (nota == null || !usuarioId || !restauranteId) return res.status(400).json({ error: "nota, usuarioId e restauranteId são obrigatórios" });
    const created = await avaliacoesService.createAvaliacao({ nota: Number(nota), comentario, usuarioId, restauranteId });
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

export async function listByRestaurant(req: Request, res: Response) {
  try {
    const { restauranteId } = req.params;
    const list = await avaliacoesService.listByRestaurant(restauranteId);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await avaliacoesService.deleteAvaliacao(id);
    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

export default { create, listByRestaurant, remove };
