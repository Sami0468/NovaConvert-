import sys
import json
from pdf2docx import Converter


def main():
    src, dst = sys.argv[1], sys.argv[2]
    cv = Converter(src)
    try:
        cv.convert(dst, start=0, end=None)
    finally:
        cv.close()
    print(json.dumps({"ok": True}))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))
        sys.exit(1)
