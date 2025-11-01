import type { Request, Response } from "express";
import * as enderecoService from "../services/endereco.service.js";

export async function create(req: Request, res: Response) {
  try {
    const { lat, lon, display_name, text } = req.body;
    if (text) {
      const e = await enderecoService.createEnderecoFromText(text);
      return res.status(201).json(e);
    }
    if (lat == null || lon == null) return res.status(400).json({ error: "lat e lon ou text são necessários" });
    const e = await enderecoService.createEndereco({ lat: Number(lat), lon: Number(lon), display_name });
    return res.status(201).json(e);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const e = await enderecoService.getById(id);
    if (!e) return res.status(404).json({ error: "Endereço não encontrado" });
    return res.json(e);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

export async function search(req: Request, res: Response) {
  try {
    const { q } = req.query as any;
    if (!q) return res.status(400).json({ error: "q é obrigatório" });
    const result = await enderecoService.searchByText(String(q));
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

export default { create, getById, search };
