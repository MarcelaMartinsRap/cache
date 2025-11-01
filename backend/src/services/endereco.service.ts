import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const GEO_API_KEY = process.env.GEOLOCATION_API_KEY;

async function geocodeText(text: string) {
  if (!GEO_API_KEY) return null;
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&apiKey=${GEO_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  if (!json || !json.features || json.features.length === 0) return null;
  const f = json.features[0];
  const lat = Number(f.properties.lat ?? f.geometry.coordinates[1]);
  const lon = Number(f.properties.lon ?? f.geometry.coordinates[0]);
  const display_name = f.properties.formatted ?? f.properties.display_name ?? f.properties.name;
  return { lat, lon, display_name };
}

export async function createEndereco(data: { lat: number; lon: number; display_name?: string }) {
  const e = await prisma.endereco.create({ data: { lat: data.lat, log: data.lon, display_name: data.display_name ?? "" } });
  return e;
}

export async function createEnderecoFromText(text: string) {
  const geo = await geocodeText(text);
  if (!geo) throw new Error("Não foi possível localizar o endereço");
  const endereco = await createEndereco({ lat: geo.lat, lon: geo.lon, display_name: geo.display_name });
  return endereco;
}

export async function getById(id: string) {
  return prisma.endereco.findUnique({ where: { id } });
}

export async function searchByText(text: string) {
  const geo = await geocodeText(text);
  return geo;
}

export default { createEndereco, createEnderecoFromText, getById, searchByText };
