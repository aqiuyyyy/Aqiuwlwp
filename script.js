const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'ghp_你的Token'; // 本地测试用
const OWNER = process.env.OWNER || '你的用户名';
const REPO = process.env.REPO || '你的仓库名';
const BRANCH = process.env.BRANCH || 'main';

const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const status = document.getElementById('status');
const fileList = document.getElementById('fileList');

['dragover', 'dragenter'].forEach(evt => {
  dropArea.addEventListener(evt, e => { e.preventDefault(); dropArea.style.borderColor = '#0ff'; });
});

['dragleave', 'dragend'].forEach(evt => {
  dropArea.addEventListener(evt, () => dropArea.style.borderColor = '#0af');
});

dropArea.addEventListener('drop', e => {
  e.preventDefault();
  dropArea.style.borderColor = '#0af';
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => handleFiles(fileInput.files));

// 粘贴上传
document.addEventListener('paste', e => {
  const items = e.clipboardData.items;
  for (let item of items) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      handleFiles([file]);
    }
  }
});

async function handleFiles(files) {
  if (!files.length) return;
  status.innerHTML = '正在上传...';

  for (let file of files) {
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');

    const base64 = await fileToBase64(file);
    const path = Date.now() + '-' + encodeURIComponent(file.name);  // 防止重名

    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: `上传 ${file.name}`,
        content: base64.split(',')[1],
        branch: BRANCH
      })
    });

    if (res.ok) {
      const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;

      let preview = '';
      if (isImage) preview = `<img src="${rawUrl}" alt="${file.name}">`;
      else if (isAudio) preview = `<audio controls src="${rawUrl}"></audio><p>🎵 ${file.name}</p>`;

      fileList.innerHTML += `
        <div class="file-item">
          ${preview}
          <div class="links">
            <button onclick="copyText('${rawUrl}')">复制直链</button>
            ${isImage ? `<button onclick="copyText('![](${rawUrl})')">Markdown</button>` : ''}
            <button onclick="copyText('<a href=\\"${rawUrl}\\">${file.name}</a>')">HTML</button>
          </div>
        </div>
      `;

      status.innerHTML = `✅ ${file.name} 上传成功！直链已生成`;
    } else {
      status.innerHTML = `❌ ${file.name} 上传失败`;
      console.error(await res.text());
    }
  }
}

function fileToBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('已复制到剪贴板！');
  });
}
