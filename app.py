import warnings
warnings.filterwarnings("ignore")

import os
import sys
import base64
import mimetypes
import traceback
import requests
from flask import Flask, request, render_template, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

TOKEN = os.getenv("SAKURA_API_TOKEN", "")
if not TOKEN:
    print("Warning: SAKURA_API_TOKEN not set", file=sys.stderr)

app.config['DEBUG'] = True
API_BASE = "https://api.ai.sakura.ad.jp/v1"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/estimate", methods=["POST"])
def estimate_age():
    print(f"[DEBUG] Request received: {request.files}", flush=True)
    if "image" not in request.files:
        print("[DEBUG] No image in request", flush=True)
        return jsonify({"error": "画像がありません"}), 400

    file = request.files["image"]
    if not file.filename:
        print("[DEBUG] Empty filename", flush=True)
        return jsonify({"error": "ファイルがありません"}), 400

    mime_type = file.content_type or mimetypes.guess_type(file.filename)[0] or "image/jpeg"
    img_data = file.read()
    b64_img = base64.b64encode(img_data).decode("utf-8")

    # 写真は保存しない（メモリ内のみ）

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
        print(f"[DEBUG] Calling API with token: {TOKEN[:10]}...", flush=True)
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
        print(f"[DEBUG] API response status: {resp.status_code}", flush=True)
        resp.raise_for_status()
        result = resp.json()["choices"][0]["message"]["content"].strip()
        print(f"[DEBUG] API result: {result}", flush=True)

        # 評価統計保存
        save_evaluation(age=int(result) if result.isdigit() else None, emotion=None, correct=None)

        return jsonify({"age": result})
    except Exception as e:
        error_detail = traceback.format_exc()
        print(f"[DEBUG] Error: {e}\n{error_detail}", flush=True)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
