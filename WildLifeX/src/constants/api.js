export const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
export const BACKEND_URL = `${BASE_URL}/api`;

export function getAnimalImageUrl(animal) {
  if (!animal) return null;
  return animal.image || (Array.isArray(animal.images) && animal.images[0]) || null;
}
