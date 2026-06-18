export function auditFrontend({ type = "code", url = "", code = "", fileName = "" }) {
  const source = String(code || "");
  const lower = source.toLowerCase();
  const issues = [];

  const rules = [
    // 1. ADECUACIÓN FUNCIONAL
    check("Adecuación funcional", "Completitud funcional", source.trim().length > 0, "El código fuente no está vacío."),
    check("Adecuación funcional", "Corrección funcional", hasAny(lower, ["<form", "<button", "<a ", "onclick", "onsubmit"]), "La interfaz contiene elementos funcionales de interacción."),
    check("Adecuación funcional", "Pertinencia funcional", hasAny(lower, ["<main", "<section", "<article", "<nav"]), "La estructura responde a una interfaz web organizada."),

    // 2. EFICIENCIA DE DESEMPEÑO
    check("Eficiencia de desempeño", "Comportamiento temporal", source.length <= 8000, "El código no debe ser excesivamente grande para una interfaz inicial."),
    check("Eficiencia de desempeño", "Utilización de recursos", !hasHeavyAssets(lower), "No se detectan recursos pesados incrustados directamente."),
    check("Eficiencia de desempeño", "Capacidad", hasAny(lower, ["loading=\"lazy\"", "loading='lazy'", "defer", "async"]) || !lower.includes("<img"), "Uso de carga diferida o ausencia de imágenes pesadas."),

    // 3. COMPATIBILIDAD
    check("Compatibilidad", "Coexistencia", !hasAny(lower, ["!important", "position: fixed", "z-index: 9999"]), "No se detectan estilos agresivos que puedan romper coexistencia visual."),
    check("Compatibilidad", "Interoperabilidad", hasAny(lower, ["html", "css", "javascript", "react", "class", "classname"]), "Uso de tecnologías frontend estándar."),

    // 4. USABILIDAD
    check("Usabilidad", "Capacidad para reconocer su adecuación", hasAny(lower, ["<h1", "<h2", "<title", "aria-label"]), "La interfaz comunica su propósito mediante títulos o etiquetas."),
    check("Usabilidad", "Facilidad de aprendizaje", hasAny(lower, ["placeholder", "label", "<nav", "<button"]), "Existen elementos que orientan al usuario."),
    check("Usabilidad", "Operabilidad", hasAny(lower, ["<button", "<a ", "<input", "<select", "<textarea"]), "La interfaz contiene controles operables."),
    check("Usabilidad", "Protección contra errores de usuario", hasAny(lower, ["required", "type=\"email\"", "minlength", "maxlength", "pattern"]), "Se detectan validaciones de entrada."),
    check("Usabilidad", "Estética de interfaz", hasAny(lower, ["class", "classname", "style", "css"]), "Se evidencian estilos o clases para presentación visual."),
    check("Usabilidad", "Accesibilidad", validateAccessibility(source), "Imágenes, botones y controles tienen soporte accesible básico."),

    // 5. FIABILIDAD
    check("Fiabilidad", "Madurez", !hasAny(lower, ["console.log", "debugger", "todo", "fixme"]), "No se detectan rastros de depuración o código incompleto."),
    check("Fiabilidad", "Disponibilidad", hasAny(lower, ["try", "catch", "fallback", "error", "loading"]), "Se evidencia manejo básico de estados o errores."),
    check("Fiabilidad", "Tolerancia a fallos", !hasAny(lower, ["undefined.", "null.", "nan"]), "No se detectan patrones evidentes de fallos comunes."),
    check("Fiabilidad", "Capacidad de recuperación", hasAny(lower, ["catch", "finally", "retry", "reload", "fallback"]) || type === "url", "Existe algún mecanismo básico de recuperación o recarga."),

    // 6. SEGURIDAD
    check("Seguridad", "Confidencialidad", !hasAny(lower, ["password=", "apikey", "secret", "token="]), "No se detectan credenciales expuestas."),
    check("Seguridad", "Integridad", !hasAny(lower, ["eval(", "document.write", "innerhtml"]), "No se detectan prácticas que comprometan integridad del DOM."),
    check("Seguridad", "No repudio", hasAny(lower, ["log", "createdat", "timestamp", "audit"]) || type !== "code", "Existe evidencia mínima de trazabilidad o registro."),
    check("Seguridad", "Responsabilidad", hasAny(lower, ["id=", "name=", "data-"]), "Los elementos poseen identificadores o atributos rastreables."),
    check("Seguridad", "Autenticidad", !hasAny(lower, ["http://"]) || lower.includes("https://"), "No se priorizan enlaces inseguros HTTP."),

    // 7. MANTENIBILIDAD
    check("Mantenibilidad", "Modularidad", hasAny(lower, ["component", "function", "export", "import", "<section"]), "El código evidencia separación por componentes o secciones."),
    check("Mantenibilidad", "Reusabilidad", hasAny(lower, ["class", "classname", "component", "props"]), "Existen clases, componentes o estructuras reutilizables."),
    check("Mantenibilidad", "Analizabilidad", source.split("\n").length < 350, "El código puede inspeccionarse sin complejidad excesiva."),
    check("Mantenibilidad", "Modificabilidad", !tooManyDivs(lower), "No existe dependencia excesiva de divs genéricos."),
    check("Mantenibilidad", "Capacidad de prueba", hasAny(lower, ["id=", "data-testid", "name=", "role="]), "Existen atributos útiles para pruebas o identificación."),

    // 8. PORTABILIDAD
    check("Portabilidad", "Adaptabilidad", hasResponsiveEvidence(lower), "Se detectan evidencias de diseño responsive."),
    check("Portabilidad", "Instalabilidad", hasAny(lower, ["html", "react", "export", "import", "<!doctype"]), "El código puede integrarse en un entorno frontend estándar."),
    check("Portabilidad", "Reemplazabilidad", !hasAny(lower, ["window.", "document.getelementbyid"]) || hasAny(lower, ["react", "component"]), "Baja dependencia rígida del DOM global.")
  ];

  rules.forEach((r) => {
    if (!r.pass) {
      issues.push({
        type: r.critical ? "error" : "warning",
        category: r.characteristic,
        subcategory: r.subcharacteristic,
        rule: `${r.characteristic} - ${r.subcharacteristic}`,
        message: r.message
      });
    }
  });

  const grouped = groupByCharacteristic(rules);
  const dimensions = {};
  Object.entries(grouped).forEach(([characteristic, items]) => {
    const passed = items.filter((i) => i.pass).length;
    dimensions[characteristic] = Math.round((passed / items.length) * 100);
  });

  const globalScore = Math.round(
    Object.values(dimensions).reduce((a, b) => a + b, 0) / Object.values(dimensions).length
  );

  const errors = issues.filter((i) => i.type === "error").length;
  const warnings = issues.filter((i) => i.type === "warning").length;

  return {
    type,
    url,
    fileName,
    sourceLength: source.length,
    globalScore,
    status: getStatus(globalScore),
    dimensions,
    summary: {
      errors,
      warnings,
      goodPractices: rules.filter((r) => r.pass).length,
      opportunities: warnings
    },
    issues,
    matrix: rules.map((r) => ({
      characteristic: r.characteristic,
      subcharacteristic: r.subcharacteristic,
      result: r.pass ? "Cumple" : "No cumple",
      evidence: r.message
    })),
    createdAt: new Date().toISOString()
  };
}

function check(characteristic, subcharacteristic, condition, message) {
  return {
    characteristic,
    subcharacteristic,
    pass: Boolean(condition),
    message,
    critical: ["Seguridad", "Accesibilidad", "Eficiencia de desempeño"].includes(characteristic)
  };
}

function hasAny(text, keywords) {
  return keywords.some((k) => text.includes(k.toLowerCase()));
}

function hasHeavyAssets(text) {
  return text.includes("base64") || text.includes(".mp4") || text.includes(".mov") || text.includes(".webm");
}

function validateAccessibility(code) {
  const imgs = code.match(/<img\b[^>]*>/gi) || [];
  const buttons = code.match(/<button\b[^>]*>(.*?)<\/button>/gis) || [];

  const imgsOk = imgs.every((img) => /alt\s*=/.test(img));
  const buttonsOk = buttons.every((btn) => {
    const content = btn.replace(/<[^>]+>/g, "").trim();
    return content.length > 0 || /aria-label\s*=/.test(btn);
  });

  return imgsOk && buttonsOk;
}

function hasResponsiveEvidence(text) {
  return hasAny(text, [
    "@media",
    "viewport",
    "display: flex",
    "display:flex",
    "display: grid",
    "display:grid",
    "grid-template",
    "flex-wrap",
    "sm:",
    "md:",
    "lg:",
    "max-width",
    "min-width"
  ]);
}

function tooManyDivs(text) {
  const divs = (text.match(/<div/g) || []).length;
  const semantic = (text.match(/<main|<section|<article|<header|<footer|<nav/g) || []).length;
  return divs > 15 && semantic < 3;
}

function groupByCharacteristic(rules) {
  return rules.reduce((acc, rule) => {
    if (!acc[rule.characteristic]) acc[rule.characteristic] = [];
    acc[rule.characteristic].push(rule);
    return acc;
  }, {});
}

function getStatus(score) {
  if (score >= 90) return "Excelente";
  if (score >= 75) return "Bueno";
  if (score >= 60) return "Regular";
  return "Deficiente";
}