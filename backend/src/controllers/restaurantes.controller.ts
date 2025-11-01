import type { Request, Response } from "express";
import * as restaurantesService from "../services/restaurantes.service.js";

export async function create(req: Request, res: Response) {
  try {
    const { nome, imagem, enderecoText, enderecoCoords } = req.body;
    if (!nome) return res.status(400).json({ error: "nome é obrigatório" });
    const rest = await restaurantesService.createRestaurant({ nome, imagem, enderecoText, enderecoCoords });
    return res.status(201).json(rest);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const { lat, lon, city, limit, page, sort } = req.query as any;
    const opts: any = {};
    if (lat && lon) {
      opts.lat = Number(lat);
      opts.lon = Number(lon);
    }
    if (city) opts.city = String(city);
    if (limit) opts.limit = Number(limit);
    if (page) opts.page = Number(page);
    if (sort) opts.sort = sort;
    const list = await restaurantesService.listRestaurants(opts);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { lat, lon } = req.query as any;
    const userLocation = lat && lon ? { lat: Number(lat), lon: Number(lon) } : undefined;
    const rest = await restaurantesService.getRestaurantById(id, userLocation);
    if (!rest) return res.status(404).json({ error: "Restaurante não encontrado" });
    return res.json(rest);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { nome, imagem } = req.body;
    const updated = await restaurantesService.updateRestaurant(id, { nome, imagem });
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await restaurantesService.deleteRestaurant(id);
    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

export default { create, list, getById, update, remove };
