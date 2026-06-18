export async function fetchUrlSource(url) {
  const cleanUrl = url.trim();

  if (!cleanUrl) {
    throw new Error("La URL está vacía.");
  }

  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    throw new Error("La URL debe iniciar con http:// o https://");
  }

  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`;

  const response = await fetch(proxyUrl);

  if (!response.ok) {
    throw new Error("No se pudo obtener el contenido de la URL.");
  }

  const html = await response.text();

  if (!html || html.length < 20) {
    throw new Error("La URL no devolvió contenido suficiente para analizar.");
  }

  return html;
}