const API_URL = "http://127.0.0.1:8000";

export async function captureInterfaceByUrl(url) {
  const response = await fetch(`${API_URL}/capture/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "No se pudo capturar la URL.");
  }

  return response.json();
}

export async function uploadZip(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload/zip`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "No se pudo procesar el ZIP.");
  }

  return response.json();
}

export async function replicateHtmlFromContent(htmlContent, url) {
  const response = await fetch(`${API_URL}/replicate/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      html_content: htmlContent,
      url,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "No se pudo replicar el HTML.");
  }

  return response.json();
}

export async function evaluateHtml(html) {
  const response = await fetch(`${API_URL}/evaluate/iso`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html }),
  });

  if (!response.ok) {
    throw new Error("No se pudo evaluar el HTML.");
  }

  return response.json();
}

export async function generateReport(evaluation) {
  const response = await fetch(`${API_URL}/report/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ evaluation }),
  });

  if (!response.ok) {
    throw new Error("No se pudo generar el reporte.");
  }

  return response.json();
}