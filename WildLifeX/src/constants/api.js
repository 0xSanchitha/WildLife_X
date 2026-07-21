export const BASE_URL = import.meta.env.VITE_API_URL || "https://wildlifex-production-7a43.up.railway.app";
export const BACKEND_URL = `${BASE_URL}/api`;

export function getAnimalImageUrl(animal) {
  if (!animal) return null;
  return animal.image || (Array.isArray(animal.images) && animal.images[0]) || null;
}
