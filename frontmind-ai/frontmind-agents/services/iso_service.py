from bs4 import BeautifulSoup
import re


def clamp(value):
    return max(0, min(100, value))


def detect_colors(html):
    hex_colors = re.findall(r"#[0-9a-fA-F]{3,6}", html)
    rgb_colors = re.findall(r"rgb[a]?\([^)]+\)", html)
    return list(set(hex_colors + rgb_colors))


def get_level(score):
    if score >= 90:
        return "Excelente"
    if score >= 80:
        return "Alto"
    if score >= 60:
        return "Medio"
    if score >= 40:
        return "Bajo"
    return "Crítico"


def evaluate_iso_25010(html: str):
    soup = BeautifulSoup(html, "html.parser")

    findings = []
    tips = []

    scores = {
        "adecuacion_funcional": 100,
        "eficiencia_desempeno": 100,
        "usabilidad": 100,
        "accesibilidad": 100,
        "mantenibilidad": 100,
        "compatibilidad": 100,
        "seguridad": 100,
        "portabilidad": 100,
    }

    def add_finding(dimension, subdimension, severity, finding, recommendation, penalties):
        findings.append({
            "dimension": dimension,
            "subdimension": subdimension,
            "severity": severity,
            "finding": finding,
            "recommendation": recommendation
        })

        for key, value in penalties.items():
            scores[key] -= value

    # =========================
    # ADECUACIÓN FUNCIONAL
    # =========================

    if not soup.find("main"):
        add_finding(
            "Adecuación funcional",
            "Completitud funcional",
            "Alta",
            "No se detectó la etiqueta <main> para delimitar el contenido principal.",
            "Agregar una etiqueta <main> para estructurar el contenido principal.",
            {"adecuacion_funcional": 25, "usabilidad": 10}
        )

    if not soup.find("nav"):
        add_finding(
            "Adecuación funcional",
            "Pertinencia funcional",
            "Media",
            "No se detectó una estructura de navegación principal.",
            "Incorporar una etiqueta <nav> para mejorar la orientación del usuario.",
            {"adecuacion_funcional": 15, "usabilidad": 10}
        )

    if not soup.find("h1"):
        add_finding(
            "Adecuación funcional",
            "Comprensibilidad",
            "Alta",
            "No se detectó un encabezado principal <h1>.",
            "Agregar un <h1> claro que indique el propósito de la interfaz.",
            {"adecuacion_funcional": 20, "usabilidad": 20}
        )

    interactive = soup.find_all(["button", "a", "input", "select", "textarea"])
    if len(interactive) == 0:
        add_finding(
            "Adecuación funcional",
            "Pertinencia funcional",
            "Alta",
            "No se detectaron elementos interactivos.",
            "Agregar controles interactivos cuando la interfaz lo requiera.",
            {"adecuacion_funcional": 25, "usabilidad": 20}
        )

    # =========================
    # ACCESIBILIDAD WCAG 2.1
    # =========================

    images = soup.find_all("img")
    images_without_alt = [img for img in images if not img.get("alt")]

    if images_without_alt:
        total = len(images_without_alt)
        add_finding(
            "Accesibilidad",
            "Texto alternativo",
            "Alta",
            f"Se detectaron {total} imágenes sin atributo alt.",
            "Agregar texto alternativo descriptivo en imágenes informativas.",
            {
                "accesibilidad": min(50, total * 8),
                "usabilidad": min(20, total * 3)
            }
        )

    buttons = soup.find_all("button")
    buttons_without_text = [
        btn for btn in buttons
        if not btn.get_text(strip=True)
        and not btn.get("aria-label")
        and not btn.get("title")
    ]

    if buttons_without_text:
        total = len(buttons_without_text)
        add_finding(
            "Accesibilidad",
            "Nombre accesible de controles",
            "Alta",
            f"Se detectaron {total} botones sin texto visible ni nombre accesible.",
            "Agregar texto visible, title o aria-label a cada botón.",
            {
                "accesibilidad": min(60, total * 12),
                "usabilidad": min(30, total * 5)
            }
        )

    links = soup.find_all("a")
    links_without_text = [
        a for a in links
        if not a.get_text(strip=True)
        and not a.get("aria-label")
        and not a.get("title")
        and not a.find("img", alt=True)
    ]

    if links_without_text:
        total = len(links_without_text)
        add_finding(
            "Accesibilidad",
            "Nombre accesible de enlaces",
            "Alta",
            f"Se detectaron {total} enlaces sin texto visible ni nombre accesible.",
            "Agregar texto descriptivo, aria-label o title a los enlaces.",
            {
                "accesibilidad": min(70, total * 5),
                "usabilidad": min(40, total * 3)
            }
        )

    inputs = soup.find_all(["input", "textarea", "select"])
    invalid_inputs = []

    for input_tag in inputs:
        input_id = input_tag.get("id")
        has_label = False

        if input_id and soup.find("label", attrs={"for": input_id}):
            has_label = True

        if input_tag.get("aria-label") or input_tag.get("placeholder"):
            has_label = True

        if not has_label:
            invalid_inputs.append(input_tag)

    if invalid_inputs:
        total = len(invalid_inputs)
        add_finding(
            "Accesibilidad",
            "Identificación de formularios",
            "Alta",
            f"Se detectaron {total} campos de formulario sin etiqueta accesible.",
            "Asociar cada campo con <label>, aria-label o placeholder descriptivo.",
            {
                "accesibilidad": min(50, total * 10),
                "usabilidad": min(25, total * 5)
            }
        )

    # =========================
    # CONTRASTE / ESTÉTICA
    # =========================

    html_lower = html.lower()

    possible_low_contrast = [
        "#fff", "#ffffff", "white", "#f8f8f8", "#f9fafb",
        "#e5e7eb", "#d1d5db", "#cbd5e1"
    ]

    light_text_patterns = 0

    for color in possible_low_contrast:
        if f"color:{color}" in html_lower or f"color: {color}" in html_lower:
            light_text_patterns += 1

    if light_text_patterns >= 2:
        add_finding(
            "Accesibilidad",
            "Contraste mínimo",
            "Alta",
            "Se detectaron posibles patrones de bajo contraste en estilos CSS.",
            "Verificar contraste mínimo WCAG AA de 4.5:1 para texto normal.",
            {
                "accesibilidad": 30,
                "usabilidad": 20
            }
        )

    colors = detect_colors(html)
    if len(colors) > 12:
        add_finding(
            "Usabilidad",
            "Estética de interfaz",
            "Media",
            f"Se detectó una paleta visual extensa de {len(colors)} colores.",
            "Reducir la cantidad de colores para mejorar consistencia visual.",
            {"usabilidad": 15}
        )
        tips.append("Usar una paleta cromática controlada y consistente.")

    # =========================
    # EFICIENCIA DE DESEMPEÑO
    # =========================

    scripts = soup.find_all("script")
    stylesheets = soup.find_all("link", rel="stylesheet")
    videos = soup.find_all("video")

    if len(scripts) > 10:
        add_finding(
            "Eficiencia de desempeño",
            "Comportamiento temporal",
            "Media",
            f"Se detectaron {len(scripts)} scripts.",
            "Reducir scripts innecesarios y aplicar carga diferida.",
            {"eficiencia_desempeno": min(35, len(scripts) * 3)}
        )

    if len(stylesheets) > 6:
        add_finding(
            "Eficiencia de desempeño",
            "Utilización de recursos",
            "Media",
            f"Se detectaron {len(stylesheets)} hojas de estilo externas.",
            "Unificar estilos o aplicar CSS crítico.",
            {"eficiencia_desempeno": min(25, len(stylesheets) * 3)}
        )

    if len(images) > 12:
        add_finding(
            "Eficiencia de desempeño",
            "Utilización de recursos visuales",
            "Media",
            f"Se detectaron {len(images)} imágenes.",
            "Optimizar imágenes y usar formatos modernos como WebP.",
            {"eficiencia_desempeno": min(35, len(images) * 3)}
        )

    if len(videos) > 1:
        add_finding(
            "Eficiencia de desempeño",
            "Recursos multimedia",
            "Media",
            f"Se detectaron {len(videos)} videos.",
            "Aplicar carga diferida o compresión multimedia.",
            {"eficiencia_desempeno": 20}
        )

    # =========================
    # MANTENIBILIDAD
    # =========================

    div_count = len(soup.find_all("div"))
    semantic_count = len(soup.find_all([
        "main", "section", "article", "header", "footer", "nav", "aside"
    ]))

    if div_count > 25 and semantic_count < 5:
        add_finding(
            "Mantenibilidad",
            "Modularidad",
            "Media",
            "Uso elevado de etiquetas <div> con baja semántica HTML5.",
            "Reestructurar componentes usando etiquetas semánticas.",
            {"mantenibilidad": 30, "adecuacion_funcional": 10}
        )

    if len(html) > 60000:
        add_finding(
            "Mantenibilidad",
            "Analizabilidad",
            "Media",
            "El documento HTML presenta una longitud elevada.",
            "Dividir la interfaz en componentes reutilizables.",
            {"mantenibilidad": 25}
        )

    inline_styles = soup.find_all(style=True)

    if len(inline_styles) > 20:
        add_finding(
            "Mantenibilidad",
            "Modificabilidad",
            "Media",
            f"Se detectaron {len(inline_styles)} estilos inline.",
            "Mover estilos inline hacia clases CSS reutilizables.",
            {"mantenibilidad": min(30, len(inline_styles))}
        )

    # =========================
    # COMPATIBILIDAD / PORTABILIDAD
    # =========================

    if not soup.find("meta", attrs={"name": "viewport"}):
        add_finding(
            "Compatibilidad",
            "Adaptabilidad responsive",
            "Alta",
            "No se detectó meta viewport para diseño responsive.",
            "Agregar meta viewport para asegurar adaptación móvil.",
            {"compatibilidad": 35, "portabilidad": 30}
        )

    if not soup.find("html") or not soup.find("body"):
        add_finding(
            "Portabilidad",
            "Estructura base",
            "Media",
            "La estructura HTML base está incompleta.",
            "Asegurar el uso de etiquetas html, head y body.",
            {"portabilidad": 20}
        )

    # =========================
    # SEGURIDAD FRONTEND
    # =========================

    inline_events = []

    for tag in soup.find_all(True):
        for attr in tag.attrs:
            if attr.lower().startswith("on"):
                inline_events.append(attr)

    if inline_events:
        add_finding(
            "Seguridad",
            "Ejecución insegura",
            "Media",
            f"Se detectaron {len(inline_events)} eventos JavaScript inline.",
            "Separar la lógica JavaScript del marcado HTML.",
            {"seguridad": min(35, len(inline_events) * 5)}
        )

    if soup.find("iframe"):
        iframes = soup.find_all("iframe")
        unsafe_iframes = [
            iframe for iframe in iframes
            if not iframe.get("sandbox")
        ]

        if unsafe_iframes:
            add_finding(
                "Seguridad",
                "Contenido embebido",
                "Media",
                f"Se detectaron {len(unsafe_iframes)} iframes sin atributo sandbox.",
                "Agregar sandbox a iframes para limitar riesgos.",
                {"seguridad": 20}
            )

    # =========================
    # AJUSTE FINAL MÁS ESTRICTO
    # =========================

    high = len([f for f in findings if f["severity"] == "Alta"])
    medium = len([f for f in findings if f["severity"] == "Media"])

    general_penalty = high * 4 + medium * 2

    for key in scores:
        scores[key] = clamp(scores[key] - general_penalty)

    global_score = round(sum(scores.values()) / len(scores))

    # Penalización global por demasiadas incidencias
    if len(findings) >= 20:
        global_score -= 25
    elif len(findings) >= 10:
        global_score -= 15
    elif len(findings) >= 5:
        global_score -= 8

    global_score = clamp(global_score)

    return {
        "global_score": global_score,
        "quality_level": get_level(global_score),
        "scores": {key: clamp(value) for key, value in scores.items()},
        "total_findings": len(findings),
        "findings": findings,
        "engineering_tips": list(set(tips)),
        "strict_mode": True
    }