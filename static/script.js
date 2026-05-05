document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');
    const preview = document.getElementById('preview');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const resultOverlay = document.getElementById('resultOverlay');
    const resultAge = document.getElementById('resultAge');

    // フローティング桜の作成（数量増加）
    createFloatingSakura(30);

    // カメラ関連
    let stream = null;
    let facingMode = 'user';

    window.startCamera = async function() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            const video = document.getElementById('cameraPreview');
            video.srcObject = stream;
            // 自拍时镜像翻转（前摄像头）
            if (facingMode === 'user') {
                video.style.transform = 'scaleX(-1)';
            } else {
                video.style.transform = 'none';
            }
            document.getElementById('cameraArea').classList.add('show');
            document.getElementById('startBtn').style.display = 'none';
        } catch (err) {
            alert('カメラが起動できません: ' + err.message);
        }
    }

    // 切り替え機能は不要

    window.capture = function() {
        const video = document.getElementById('cameraPreview');
        const canvas = document.getElementById('captureCanvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        // 如果是镜像（自拍），拍照时也要翻转，让照片和预览一致
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);

        canvas.toBlob(function(blob) {
            sendImage(blob);
        }, 'image/jpeg', 0.9);
    }

    async function sendImage(blob) {
        // カメラ停止
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        // ローディング開始
        document.getElementById('cameraArea').classList.remove('show');
        document.getElementById('loadingOverlay').classList.add('show');
        startLoadingText();

        const formData = new FormData();
        formData.append('image', blob, 'capture.jpg');

        try {
            const response = await fetch('/estimate', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            // ローディング終了（最低3秒は表示）
            setTimeout(() => {
                document.getElementById('loadingOverlay').classList.remove('show');
                if (data.error) {
                    alert('エラー: ' + data.error);
                    document.getElementById('startBtn').style.display = 'block';
                } else {
                    showResult(data.age);
                }
            }, 3000);

        } catch (err) {
            setTimeout(() => {
                loadingOverlay.classList.remove('show');
                alert('通信エラー: ' + err.message);
                document.getElementById('startBtn').style.display = 'block';
            }, 3000);
        }
    }

    function startLoadingText() {
        const texts = ['ドキドキ…', '分析中…', 'あと少し…', '結果は…？'];
        let i = 0;
        const textEl = document.getElementById('loadingText');
        const interval = setInterval(() => {
            if (i < texts.length) {
                textEl.textContent = texts[i];
                i++;
            } else {
                clearInterval(interval);
            }
        }, 750);
    }

    function showResult(age) {
        resultAge.textContent = '0';
        resultOverlay.classList.add('show');

        // カウントアップアニメーション
        let current = 0;
        const target = parseInt(age) || 0;
        const duration = 1000;
        const stepTime = duration / target;
        const timer = setInterval(() => {
            current++;
            resultAge.textContent = current;
            if (current >= target) {
                clearInterval(timer);
            }
        }, stepTime > 50 ? 50 : stepTime);

        // 桜吹雪エフェクト
        createConfetti();
    }

    window.retry = function() {
        resultOverlay.classList.remove('show');
        document.getElementById('startBtn').style.display = 'block';
        resultAge.textContent = '0';
        // 30秒後に自動的に最初に戻る
        clearTimeout(window.autoRetryTimer);
        window.autoRetryTimer = setTimeout(() => {
            if (!resultOverlay.classList.contains('show')) return;
            resultOverlay.classList.remove('show');
            document.getElementById('startBtn').style.display = 'block';
            resultAge.textContent = '0';
            window.startCamera();
        }, 30000);
        window.startCamera();
    }
        }, 30000);
    };

    window.sendFeedback = function(type) {
        const age = resultAge.textContent;
        fetch('/feedback', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({correct: type})
        }).then(() => {
            // フィードバック後は自動的に戻る
            setTimeout(() => window.retry(), 1000);
        }).catch(err => {
            console.error('Feedback error:', err);
        });
    }

    window.shareTwitter = function() {
        const age = resultAge.textContent;
        const baseText = `ねえあたし、いくつに見える？${age}歳に見えました🌸`;
        const hashtags = `#生成AIなんでも展示会\n#いくつに見える #AI年齢推定 #VonsaiApps`;
        const shareUrl = 'https://ikutsu.onrender.com/';

        const fullText = `${baseText}\n${hashtags}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    }

    // フローティング桜作成（数量増加・多様な動き）
    function createFloatingSakura(count) {
        const container = document.body;
        for (let i = 0; i < count; i++) {
            const sakura = document.createElement('div');
            sakura.textContent = '🌸';
            sakura.style.position = 'fixed';
            sakura.style.fontSize = (Math.random() * 25 + 10) + 'px';
            sakura.style.opacity = Math.random() * 0.4 + 0.1;
            sakura.style.left = Math.random() * 100 + 'vw';
            sakura.style.top = '-30px';
            sakura.style.zIndex = '0';
            sakura.style.pointerEvents = 'none';
            // 多様なアニメーション
            const duration = Math.random() * 15 + 10;
            const delay = Math.random() * 15;
            const sway = Math.random() * 100 + 50;
            sakura.style.animation = `sakuraFall ${duration}s linear ${delay}s infinite`;
            sakura.style.setProperty('--sway', sway + 'px');
            container.appendChild(sakura);
        }

        // スタイル追加
        const style = document.createElement('style');
        style.textContent = `
            @keyframes sakuraFall {
                0% {
                    transform: translateY(-30px) rotate(0deg) translateX(0);
                    opacity: 0;
                }
                10% {
                    opacity: 0.4;
                }
                25% {
                    transform: translateY(25vh) rotate(180deg) translateX(calc(var(--sway, 50px) * 0.5));
                }
                50% {
                    transform: translateY(50vh) rotate(360deg) translateX(calc(var(--sway, 50px) * -0.5));
                }
                75% {
                    transform: translateY(75vh) rotate(540deg) translateX(var(--sway, 50px));
                }
                90% {
                    opacity: 0.4;
                }
                100% {
                    transform: translateY(100vh) rotate(720deg) translateX(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 桜吹雪エフェクト（強化版）
    function createConfetti() {
        const colors = ['#ffb7c5', '#ff69b4', '#ff1493', '#ffc0cb', '#ffb6c1'];
        for (let i = 0; i < 80; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = Math.random() > 0.5 ? '50% 0 50% 0' : '50%';
                confetti.style.transform = `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5})`;
                confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
                confetti.style.opacity = Math.random() * 0.7 + 0.3;
                document.body.appendChild(confetti);

                setTimeout(() => {
                    confetti.remove();
                }, 5000);
            }, i * 20);
        }
    }

    // ページロード時にカメラは起動しない（はじめるボタンから）
    // 切り替えボタンも不要なので削除
});
