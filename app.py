import os
import base64
import mimetypes
import requests
from flask import Flask, request, render_template, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

TOKEN = os.getenv("SAKURA_API_TOKEN", "")
if not TOKEN:
    print("Warning: SAKURA_API_TOKEN not set", file=sys.stderr)
API_BASE = "https://api.ai.sakura.ad.jp/v1"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/estimate", methods=["POST"])
def estimate_age():
    if "image" not in request.files:
        return jsonify({"error": "画像がありません"}), 400

    file = request.files["image"]
    if not file.filename:
        return jsonify({"error": "ファイルがありません"}), 400

    mime_type = file.content_type or mimetypes.guess_type(file.filename)[0] or "image/jpeg"
    img_data = file.read()
    b64_img = base64.b64encode(img_data).decode("utf-8")

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "ねえあたし、いくつに見える？この人物の年齢を推定して。数値のみで答えてください。"},
                {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64_img}"}},
            ],
        }
    ]

    try:
        resp = requests.post(
            f"{API_BASE}/chat/completions",
            headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
            json={
                "model": "preview/Qwen3-VL-30B-A3B-Instruct",
                "messages": messages,
                "max_tokens": 50,
                "stream": False,
            },
            timeout=60,
        )
        resp.raise_for_status()
        result = resp.json()["choices"][0]["message"]["content"].strip()
        return jsonify({"age": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
