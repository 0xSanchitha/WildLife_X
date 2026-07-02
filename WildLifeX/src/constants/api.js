export const BACKEND_URL = "http://127.0.0.1:5000/api";

export function getAnimalImageUrl(animal) {
  if (!animal) return null;
  return animal.image || (Array.isArray(animal.images) && animal.images[0]) || null;
}
