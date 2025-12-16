const imageUpload = document.getElementById("imageUpload");
const applyBtn = document.getElementById("applyBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const log = document.getElementById("log");
const progressContainer = document.getElementById('progressContainer');
const resultContainer = document.getElementById('resultContainer');

let uploadedFiles = [];
let processedImages = [];

// Load watermark mặc định từ assets/watermark.png
let watermarkImage = new Image();
watermarkImage.src = 'Asset 2.png';
watermarkImage.onload = () => {
    log.innerHTML += '<p>Đã sẵn sàng! Xin mời Upload ảnh.</p>';
};

imageUpload.addEventListener("change", function(e) {
  uploadedFiles = Array.from(e.target.files);
  progressContainer.innerHTML = '';
  resultContainer.innerHTML = '';
  processedImages = [];
  downloadAllBtn.style.display = 'none';
  uploadedFiles.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const div = document.createElement('div');
      div.className = 'image-box';
      div.innerHTML = `<img src='${event.target.result}' class='preview-img' alt='preview'/><div class='progress-container'><div id='progress-${idx}' class='progress-bar'></div></div>`;
      progressContainer.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
  log.innerHTML = `<p>Đã chọn ${uploadedFiles.length} ảnh. Bấm "Đóng dấu ảnh" để bắt đầu.</p>`;
});

function processImage(file, index) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        canvas.width = 1500;
        canvas.height = 1000;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img, 0,0,img.width,img.height, 0,0,canvas.width,canvas.height);

        const scale = 0.35;
        const wmWidth = canvas.width * scale;
        const wmHeight = (watermarkImage.height / watermarkImage.width) * wmWidth;
        ctx.globalAlpha = 0.8;
        ctx.drawImage(watermarkImage, canvas.width - wmWidth - 12, canvas.height - wmHeight - 12, wmWidth, wmHeight);
        ctx.globalAlpha = 1.0;

        const resultData = canvas.toDataURL('image/jpeg',0.92);
        processedImages[index] = { name: `AC_${index+1}.jpg`, data: resultData };

        const resultDiv = document.createElement('div');
        resultDiv.className = 'image-box';
        resultDiv.innerHTML = `<img src='${resultData}' class='preview-img' alt='result'/>`;
        resultContainer.appendChild(resultDiv);

        const progressBar = document.getElementById(`progress-${index}`);
        if(progressBar){
          progressBar.style.width = '100%';
          progressBar.textContent = '100%';
        }

        resolve();
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

applyBtn.addEventListener('click', async function() {
  if (!watermarkImage) return alert('Watermark chưa sẵn sàng!');
  if (!uploadedFiles.length) return alert('Hãy chọn ảnh để chèn watermark!');

  log.innerHTML += `<p>Bắt đầu chèn watermark cho ${uploadedFiles.length} ảnh...</p>`;

  for (let i=0; i<uploadedFiles.length; i++) {
    log.innerHTML += `<p>Đang xử lý ảnh ${i+1}</p>`;
    try {
      await processImage(uploadedFiles[i], i);
    } catch(e) {
      log.innerHTML += `<p style='color:red;'>Lỗi khi xử lý ảnh ${i+1}</p>`;
    }
  }
  log.innerHTML += `<p style='color:green;'>Hoàn tất tất cả ảnh!</p>`;
  downloadAllBtn.style.display = 'inline-block';
});

downloadAllBtn.addEventListener('click', function() {
  if(!processedImages.length) return;
  processedImages.forEach(imgObj => {
    const link = document.createElement('a');
    link.download = imgObj.name;
    link.href = imgObj.data;
    link.click();
  });
    log.innerHTML += `<p style='color:green;'>Đã tải xuống tất cả ảnh!</p>`;
});
