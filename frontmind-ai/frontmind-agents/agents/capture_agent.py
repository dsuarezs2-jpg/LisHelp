from services.screenshot_service import take_screenshots

class CaptureAgent:

    def run(self, url: str):

        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url

        result = take_screenshots(url)

        return {
            "agent": "CaptureAgent",
            "status": "completed",
            "source_type": "url",
            "url": url,
            "message": "Capturas generadas correctamente.",
            "html_content": result["html_content"],
            "captures": result["captures"],
            "total_captures": result["total_captures"],
            "captured_at": result["captured_at"]
        }