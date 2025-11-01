import { PrismaClient } from "@prisma/client";
import * as enderecoService from "./endereco.service";
import * as avaliacoesService from "./avaliacoes.service";

const prisma = new PrismaClient();
const GEO_API_KEY = process.env.GEOLOCATION_API_KEY;


const prisma = new PrismaClient();

type LatLng = { lat: number; lon: number };

function haversineDistanceMeters(a: LatLng, b: LatLng) {
	const toRad = (v: number) => (v * Math.PI) / 180;
	const R = 6371000; // meters
	const dLat = toRad(b.lat - a.lat);
	const dLon = toRad(b.lon - a.lon);
	const lat1 = toRad(a.lat);
	const lat2 = toRad(b.lat);

	const sinDLat = Math.sin(dLat / 2);
	const sinDLon = Math.sin(dLon / 2);
	const aVal = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
	const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
	return R * c;
}

export async function createRestaurant(payload: {
	nome: string;
	imagem?: string | null;
	enderecoText?: string;
	enderecoCoords?: { lat: number; lon: number };
}) {
	let enderecoId: string | undefined;
	if (payload.enderecoText) {
		const e = await enderecoService.createEnderecoFromText(payload.enderecoText);
		enderecoId = e.id;
	} else if (payload.enderecoCoords) {
		const e = await enderecoService.createEndereco({ lat: payload.enderecoCoords.lat, lon: payload.enderecoCoords.lon, display_name: "" });
		enderecoId = e.id;
	}

	const rest = await prisma.restaurantes.create({ data: { nome: payload.nome, imagem: payload.imagem ?? null, enderecoId }, include: { endereco: true } });
	return rest;
}

export async function getRestaurantById(id: string, userLocation?: LatLng) {
	const rest = await prisma.restaurantes.findUnique({ where: { id }, include: { endereco: true } });
	if (!rest) return null;
	const result: any = { ...rest };
	const stats = await avaliacoesService.getStatsForRestaurant(id);
	result.qtd_avaliacoes = stats.qtd;
	result.nota = stats.nota;
	if (userLocation && rest.endereco) {
		const dist = haversineDistanceMeters(userLocation, { lat: rest.endereco.lat, lon: rest.endereco.log });
		result.distance_m = Math.round(dist);
		result.distance_km = Number((dist / 1000).toFixed(2));
	}
	return result;
}

export async function listRestaurants(options: {
	lat?: number;
	lon?: number;
	city?: string;
	limit?: number;
	page?: number;
	sort?: "rating" | "distance" | "recent";
}) {
	const limit = options.limit ?? 20;
	const page = options.page && options.page > 0 ? options.page : 1;
	const where: any = {};
	if (options.city) {
		where.endereco = { some: { display_name: { contains: options.city, mode: "insensitive" } } };
	}

	const restos = await prisma.restaurantes.findMany({ include: { endereco: true }, skip: (page - 1) * limit, take: limit, orderBy: options.sort === "recent" ? { createdAt: "desc" } : undefined });

	const ids = restos.map((r) => r.id);
	const statsMap = await avaliacoesService.getStatsForRestaurants(ids);

	const mapped = restos.map((r: any) => {
		const stat = statsMap[r.id] ?? { qtd: 0, nota: 0 };
		const out: any = { id: r.id, nome: r.nome, imagem: r.imagem, qtd_avaliacoes: stat.qtd, nota: stat.nota, endereco: r.endereco ?? null };
		if (options.lat != null && options.lon != null && r.endereco) {
			const dist = haversineDistanceMeters({ lat: options.lat, lon: options.lon }, { lat: r.endereco.lat, lon: r.endereco.log });
			out.distance_m = Math.round(dist);
			out.distance_km = Number((dist / 1000).toFixed(2));
		}
		return out;
	});

	if (options.sort === "rating") mapped.sort((a: any, b: any) => b.nota - a.nota);
	if (options.sort === "distance" && options.lat != null && options.lon != null) mapped.sort((a: any, b: any) => (a.distance_m ?? Infinity) - (b.distance_m ?? Infinity));

	return mapped;
}

export async function updateRestaurant(id: string, data: { nome?: string; imagem?: string | null }) {
	const updated = await prisma.restaurantes.update({ where: { id }, data, include: { endereco: true } });
	return updated;
}

export async function deleteRestaurant(id: string) {
	const deleted = await prisma.restaurantes.delete({ where: { id } });
	return deleted;
}

export default {
	createRestaurant,
	getRestaurantById,
	listRestaurants,
	updateRestaurant,
	deleteRestaurant,
};

async function geocodeText(text: string) {
	if (!GEO_API_KEY) return null;
	const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
		text,
	)}&apiKey=${GEO_API_KEY}`;
	const res = await fetch(url);
	if (!res.ok) return null;
	const json = await res.json();
	import { PrismaClient } from "@prisma/client";
	import * as enderecoService from "./endereco.service";
	import * as avaliacoesService from "./avaliacoes.service";

	const prisma = new PrismaClient();

	type LatLng = { lat: number; lon: number };

	function haversineDistanceMeters(a: LatLng, b: LatLng) {
	  const toRad = (v: number) => (v * Math.PI) / 180;
	  const R = 6371000; // meters
	  const dLat = toRad(b.lat - a.lat);
	  const dLon = toRad(b.lon - a.lon);
	  const lat1 = toRad(a.lat);
	  const lat2 = toRad(b.lat);

	  const sinDLat = Math.sin(dLat / 2);
	  const sinDLon = Math.sin(dLon / 2);
	  const aVal = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
	  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
	  return R * c;
	}

	export async function createRestaurant(payload: {
	  nome: string;
	  imagem?: string | null;
	  enderecoText?: string;
	  enderecoCoords?: { lat: number; lon: number };
	}) {
	  let enderecoId: string | undefined;
	  if (payload.enderecoText) {
	    const e = await enderecoService.createEnderecoFromText(payload.enderecoText);
	    enderecoId = e.id;
	  } else if (payload.enderecoCoords) {
	    const e = await enderecoService.createEndereco({ lat: payload.enderecoCoords.lat, lon: payload.enderecoCoords.lon, display_name: "" });
	    enderecoId = e.id;
	  }

	  const rest = await prisma.restaurantes.create({ data: { nome: payload.nome, imagem: payload.imagem ?? null, enderecoId }, include: { endereco: true } });
	  return rest;
	}

	export async function getRestaurantById(id: string, userLocation?: LatLng) {
	  const rest = await prisma.restaurantes.findUnique({ where: { id }, include: { endereco: true } });
	  if (!rest) return null;
	  const result: any = { ...rest };
	  const stats = await avaliacoesService.getStatsForRestaurant(id);
	  result.qtd_avaliacoes = stats.qtd;
	  result.nota = stats.nota;
	  if (userLocation && rest.endereco) {
	    const dist = haversineDistanceMeters(userLocation, { lat: rest.endereco.lat, lon: rest.endereco.log });
	    result.distance_m = Math.round(dist);
	    result.distance_km = Number((dist / 1000).toFixed(2));
	  }
	  return result;
	}

	export async function listRestaurants(options: {
	  lat?: number;
	  lon?: number;
	  city?: string;
	  limit?: number;
	  page?: number;
	  sort?: "rating" | "distance" | "recent";
	}) {
	  const limit = options.limit ?? 20;
	  const page = options.page && options.page > 0 ? options.page : 1;
	  const where: any = {};
	  if (options.city) {
	    where.endereco = { some: { display_name: { contains: options.city, mode: "insensitive" } } };
	  }

	  const restos = await prisma.restaurantes.findMany({ include: { endereco: true }, skip: (page - 1) * limit, take: limit, orderBy: options.sort === "recent" ? { createdAt: "desc" } : undefined });

	  const ids = restos.map((r) => r.id);
	  const statsMap = await avaliacoesService.getStatsForRestaurants(ids);

	  const mapped = restos.map((r: any) => {
	    const stat = statsMap[r.id] ?? { qtd: 0, nota: 0 };
	    const out: any = { id: r.id, nome: r.nome, imagem: r.imagem, qtd_avaliacoes: stat.qtd, nota: stat.nota, endereco: r.endereco ?? null };
	    if (options.lat != null && options.lon != null && r.endereco) {
	      const dist = haversineDistanceMeters({ lat: options.lat, lon: options.lon }, { lat: r.endereco.lat, lon: r.endereco.log });
	      out.distance_m = Math.round(dist);
	      out.distance_km = Number((dist / 1000).toFixed(2));
	    }
	    return out;
	  });

	  if (options.sort === "rating") mapped.sort((a: any, b: any) => b.nota - a.nota);
	  if (options.sort === "distance" && options.lat != null && options.lon != null) mapped.sort((a: any, b: any) => (a.distance_m ?? Infinity) - (b.distance_m ?? Infinity));

	  return mapped;
	}

	export async function updateRestaurant(id: string, data: { nome?: string; imagem?: string | null }) {
	  const updated = await prisma.restaurantes.update({ where: { id }, data, include: { endereco: true } });
	  return updated;
	}

	export async function deleteRestaurant(id: string) {
	  const deleted = await prisma.restaurantes.delete({ where: { id } });
	  return deleted;
	}

	export default {
	  createRestaurant,
	  getRestaurantById,
	  listRestaurants,
	  updateRestaurant,
	  deleteRestaurant,
	};
			out.distance_km = Number((dist / 1000).toFixed(2));

		}
