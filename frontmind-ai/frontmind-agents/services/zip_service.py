import zipfile
from pathlib import Path
import shutil

ALLOWED_EXTENSIONS = [".html", ".css", ".js", ".jsx", ".tsx"]

def extract_zip_project(zip_file_path: str):
    extract_dir = Path("extracted_projects")

    if extract_dir.exists():
        shutil.rmtree(extract_dir)

    extract_dir.mkdir(exist_ok=True)

    with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
        zip_ref.extractall(extract_dir)

    extracted_files = []
    combined_code = ""

    for file_path in extract_dir.rglob("*"):
        if file_path.is_file() and file_path.suffix.lower() in ALLOWED_EXTENSIONS:
            try:
                content = file_path.read_text(encoding="utf-8", errors="ignore")

                extracted_files.append({
                    "file_name": file_path.name,
                    "path": str(file_path),
                    "extension": file_path.suffix.lower(),
                    "size": len(content)
                })

                combined_code += f"\n\n/* FILE: {file_path} */\n"
                combined_code += content

            except Exception:
                pass

    return {
        "status": "extracted",
        "total_files": len(extracted_files),
        "files": extracted_files,
        "combined_code": combined_code
    }