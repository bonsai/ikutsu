document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');
    const preview = document.getElementById('preview');
    const estimateBtn = document.getElementById('estimateBtn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const ageNumber = document.getElementById('ageNumber');

    uploadArea.addEventListener('click', () => imageInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImage(file);
        }
    });

    imageInput.addEventListener('change', function() {
        if (this.files[0]) {
            handleImage(this.files[0]);
        }
    });

    function handleImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            result.classList.remove('show');
        }
        reader.readAsDataURL(file);
    }

    window.estimate = async function() {
        const file = imageInput.files[0];
        if (!file) {
            alert('画像を選択してください');
            return;
        }

        estimateBtn.disabled = true;
        loading.classList.add('show');
        result.classList.remove('show');

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/estimate', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            loading.classList.remove('show');

            if (data.error) {
                alert('エラー: ' + data.error);
            } else {
                ageNumber.textContent = data.age;
                result.classList.add('show');
            }
        } catch (err) {
            loading.classList.remove('show');
            alert('通信エラー: ' + err.message);
        } finally {
            estimateBtn.disabled = false;
        }
    }
});
