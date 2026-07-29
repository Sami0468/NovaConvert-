import sys
import json
import fitz  # PyMuPDF


def main():
    src, out_dir, fmt = sys.argv[1], sys.argv[2], sys.argv[3]
    doc = fitz.open(src)
    paths = []
    zoom = 2.0  # ~144 DPI for crisp output
    mat = fitz.Matrix(zoom, zoom)
    for i, page in enumerate(doc):
        pix = page.get_pixmap(matrix=mat)
        out_path = f"{out_dir}/page-{i + 1}.{fmt}"
        pix.save(out_path)
        paths.append(out_path)
    doc.close()
    print(json.dumps({"ok": True, "pages": paths}))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))
        sys.exit(1)
