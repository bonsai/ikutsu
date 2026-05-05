import warnings
warnings.filterwarnings("ignore")

import os
import sys
import base64
import mimetypes
import traceback
import csv
import datetime
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

# 評価保存関数
def save_evaluation(age=None, emotion=None, correct=None, client_ip='unknown'):
    """評価結果をファイルに保存"""
    log_file = "evaluations.csv"
    file_exists = os.path.isfile(log_file)
    with open(log_file, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['timestamp', 'age', 'emotion', 'correct', 'client_ip'])
        writer.writerow([datetime.datetime.now().isoformat(), age, emotion, correct, client_ip])

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
        try:
            age_val = int(result) if result.isdigit() else None
            client_ip = request.remote_addr if request else 'unknown'
            save_evaluation(age=age_val, emotion=None, correct=None, client_ip=client_ip)
        except Exception as e:
            print(f"[DEBUG] Save evaluation error: {e}", flush=True)

        return jsonify({"age": result})
    except Exception as e:
        error_detail = traceback.format_exc()
        print(f"[DEBUG] Error: {e}\n{error_detail}", flush=True)
        return jsonify({"error": str(e)}), 500


@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json()
    correct = data.get("correct")  # "correct" or "wrong"
    log_file = "evaluations.csv"
    if os.path.isfile(log_file):
        rows = []
        with open(log_file, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                rows.append(row)
        if len(rows) > 1:
            rows[-1][3] = correct
            with open(log_file, mode='w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerows(rows)
    return jsonify({"status": "ok"})


@app.route("/stats")
def stats():
    log_file = "evaluations.csv"
    if not os.path.isfile(log_file):
        return render_template("stats.html", total=0, correct=0, wrong=0, accuracy=0)

    rows = []
    with open(log_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)

    total = len(rows)
    correct_count = sum(1 for r in rows if r.get('correct') == 'correct')
    wrong_count = sum(1 for r in rows if r.get('correct') == 'wrong')
    accuracy = round(correct_count / total * 100, 1) if total > 0 else 0

    return render_template("stats.html",
                       total=total,
                       correct=correct_count,
                       wrong=wrong_count,
                       accuracy=accuracy)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
