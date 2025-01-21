// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const settingsSection = document.getElementById('settingsSection');
const previewSection = document.getElementById('previewSection');
const downloadSection = document.getElementById('downloadSection');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const downloadBtn = document.getElementById('downloadBtn');

// 当前处理的图片数据
let currentFile = null;
let compressedBlob = null;

// 文件拖放处理
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#007AFF';
    dropZone.style.background = '#F5F5F7';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#E5E5E5';
    dropZone.style.background = 'white';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#E5E5E5';
    dropZone.style.background = 'white';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

// 点击上传处理
dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

// 质量滑块处理
qualitySlider.addEventListener('input', (e) => {
    const quality = e.target.value;
    qualityValue.textContent = quality + '%';
    if (currentFile) {
        compressImage(currentFile, quality / 100);
    }
});

// 下载按钮处理
downloadBtn.addEventListener('click', () => {
    if (compressedBlob) {
        const url = URL.createObjectURL(compressedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed_${currentFile.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});

// 处理图片上传
function handleImageUpload(file) {
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }
    
    currentFile = file;
    
    // 显示原始图片大小
    originalSize.textContent = formatFileSize(file.size);
    
    // 预览原始图片
    const reader = new FileReader();
    reader.onload = (e) => {
        originalPreview.src = e.target.result;
        // 显示所有相关区域
        settingsSection.style.display = 'block';
        previewSection.style.display = 'block';
        downloadSection.style.display = 'block';
        // 使用当前质量值压缩图片
        compressImage(file, qualitySlider.value / 100);
    };
    reader.readAsDataURL(file);
}

// 压缩图片
function compressImage(file, quality) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // 创建canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // 绘制图片
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            // 转换为blob
            canvas.toBlob((blob) => {
                compressedBlob = blob;
                compressedPreview.src = URL.createObjectURL(blob);
                compressedSize.textContent = formatFileSize(blob.size);
                
                // 如果压缩后比原图大，提示用户
                if (blob.size > file.size) {
                    alert('警告：压缩后的文件大于原始文件，建议调整压缩质量或使用其他格式。');
                }
            }, file.type, quality);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 