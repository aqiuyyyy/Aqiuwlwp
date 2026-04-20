<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>阿湫外链网盘</title>
  <meta name="description" content="个人免费外链网盘 - 支持图片、音乐直链">

  <!-- 阿湫网盘专用 CDN -->
  <link href="https://s4.zstatic.net/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
  <link href="https://s4.zstatic.net/ajax/libs/twitter-bootstrap/3.4.1/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://s4.zstatic.net/ajax/libs/bootstrap-material-design/0.5.10/css/bootstrap-material-design.min.css" rel="stylesheet">
  <link href="https://s4.zstatic.net/ajax/libs/bootstrap-material-design/0.5.10/css/ripples.min.css" rel="stylesheet">

  <style>
    body { background: #f8f8f8; font-family: "Microsoft YaHei", Arial, sans-serif; }
    .navbar { background: #337ab7; border-radius: 0; }
    .navbar-brand { color: white !important; font-weight: bold; }
    .well { background: white; border: 1px solid #ddd; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .table thead th { background: #f0f0f0; }
    .upload-area {
      border: 3px dashed #337ab7;
      padding: 50px 20px;
      text-align: center;
      margin: 20px 0;
      border-radius: 6px;
      background: #fafafa;
      transition: all 0.3s;
    }
    .upload-area:hover { background: #f0f8ff; border-color: #5cb85c; }
    .filelist td, .filelist th { vertical-align: middle; }
    audio { width: 100%; margin-top: 8px; }
    .alert { margin-top: 10px; }
  </style>
</head>
<body>

<div class="navbar navbar-default">
  <div class="container">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-responsive-collapse">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="./">阿湫外链网盘</a>
    </div>
    <div class="navbar-collapse collapse navbar-responsive-collapse">
      <ul class="nav navbar-nav">
        <li class="active"><a href="./"><i class="fa fa-list"></i> 文件列表</a></li>
        <li><a href="#" onclick="showUpload()"><i class="fa fa-upload"></i> 上传文件</a></li>
      </ul>
      <ul class="nav navbar-nav navbar-right">
        <li><a href="#"><i class="fa fa-user"></i> 未登录</a></li>
      </ul>
    </div>
  </div>
</div>

<div class="container">
  <div class="well bs-component">
    <h2>文件列表 
      <span class="pull-right">
        <input id="searchInput" type="text" class="form-control input-sm" placeholder="搜索文件名" style="width:250px;" onkeyup="filterTable()">
      </span>
    </h2>

    <!-- 上传区域 -->
    <div id="uploadSection" class="upload-area">
      <h4><i class="fa fa-cloud-upload"></i> 拖拽或点击上传文件</h4>
      <p>支持图片、音乐、文档等 • 推荐单文件小于 50MB</p>
      <input type="file" id="fileInput" multiple style="display:none;">
      <button class="btn btn-primary btn-raised" onclick="document.getElementById('fileInput').click()">
        <i class="fa fa-folder-open"></i> 选择文件
      </button>
      <p style="margin-top:15px; color:#666;">或直接 Ctrl + V 粘贴图片上传</p>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover filelist" id="fileTable">
        <thead>
          <tr>
            <th width="5%">#</th>
            <th width="15%">操作</th>
            <th>文件名</th>
            <th width="10%">文件大小</th>
            <th width="8%">格式</th>
            <th width="15%">上传时间</th>
          </tr>
        </thead>
        <tbody id="fileListBody"></tbody>
      </table>
    </div>

    <div id="status" class="alert alert-info" style="display:none;"></div>
  </div>

  <footer class="text-center text-muted">
    <p>Powered by GitHub + Vercel • 仅供个人使用</p>
  </footer>
</div>

<!-- 脚本库 -->
<script src="https://s4.zstatic.net/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
<script src="https://s4.zstatic.net/ajax/libs/twitter-bootstrap/3.4.1/js/bootstrap.min.js"></script>
<script src="https://s4.zstatic.net/ajax/libs/bootstrap-material-design/0.5.10/js/material.min.js"></script>
<script src="https://s4.zstatic.net/ajax/libs/bootstrap-material-design/0.5.10/js/ripples.min.js"></script>

<script>
// ================== 请在这里修改你的配置 ==================
const GITHUB_TOKEN = '';   // ← 必须修改！
const OWNER = 'aqiuyyyy';          // 例如: zhangsan
const REPO = 'aqiuwlwp';                 // 例如: my-picbed
const BRANCH = 'main';                     // 通常是 main 或 master
// =======================================================

let filesData = [];

$(document).ready(function() {
  $.material.init();
  console.log("✅ 页面加载完成");

  setupUpload();
  renderTable();   // 初始渲染
});

// 显示/隐藏上传区域
function showUpload() {
  $('#uploadSection').toggle();
}

// 核心上传函数
async function uploadFile(file) {
  const status = $('#status');
  status.show().html(`正在上传: ${file.name} ...`);

  console.log(`🚀 开始上传: ${file.name}`);

  if (!GITHUB_TOKEN || GITHUB_TOKEN.includes('你的PersonalAccessToken')) {
    alert("❌ 请先在代码中设置正确的 GitHub Token！");
    status.html("错误：Token 未设置").addClass("alert-danger");
    return;
  }

  try {
    const base64 = await fileToBase64(file);
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${timestamp}-${safeName}`;

    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `上传 ${file.name}`,
        content: base64.split(',')[1],
        branch: BRANCH
      })
    });

    if (response.ok) {
      const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;
      console.log("✅ 上传成功，直链:", rawUrl);

      const newFile = {
        id: filesData.length + 1,
        name: file.name,
        size: (file.size / (1024*1024)).toFixed(2) + ' MB',
        ext: file.name.split('.').pop().toLowerCase(),
        time: new Date().toLocaleString('zh-CN'),
        url: rawUrl,
        isAudio: file.type.startsWith('audio/')
      };

      filesData.unshift(newFile);
      renderTable();

      status.html(`✅ ${file.name} 上传成功！`).removeClass("alert-danger").addClass("alert-success");
      setTimeout(() => status.fadeOut(), 5000);
    } else {
      const errText = await response.text();
      console.error("上传失败:", response.status, errText);
      status.html(`❌ 上传失败 (状态码: ${response.status})`).addClass("alert-danger");
      alert("上传失败！请打开 F12 查看控制台详情");
    }
  } catch (err) {
    console.error("异常:", err);
    status.html("❌ 上传异常: " + err.message).addClass("alert-danger");
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 设置上传事件（点击、拖拽、粘贴）
function setupUpload() {
  const fileInput = $('#fileInput');

  // 点击选择文件
  fileInput.on('change', function() {
    Array.from(this.files).forEach(file => uploadFile(file));
    this.value = ''; // 清空，允许重复上传同名文件
  });

  // 拖拽上传
  const uploadArea = $('#uploadSection');
  uploadArea.on('dragover', e => {
    e.preventDefault();
    uploadArea.css('border-color', '#5cb85c');
  });
  uploadArea.on('dragleave', () => uploadArea.css('border-color', '#337ab7'));
  uploadArea.on('drop', e => {
    e.preventDefault();
    uploadArea.css('border-color', '#337ab7');
    Array.from(e.originalEvent.dataTransfer.files).forEach(file => uploadFile(file));
  });

  // 粘贴上传（Ctrl + V）
  document.addEventListener('paste', e => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) uploadFile(file);
      }
    }
  });
}

// 渲染表格
function renderTable() {
  let html = '';
  filesData.forEach((f, index) => {
    let preview = f.isAudio ? `<audio controls src="${f.url}"></audio>` : '';
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>
          <a href="${f.url}" target="_blank">下载</a> | 
          <a href="#" onclick="copyLink('${f.url}'); return false;">复制直链</a>
        </td>
        <td><i class="fa fa-file-o"></i> ${f.name}</td>
        <td>${f.size}</td>
        <td><font color="blue">${f.ext}</font></td>
        <td>${f.time}</td>
      </tr>
      ${preview ? `<tr><td colspan="6">${preview}</td></tr>` : ''}
    `;
  });
  $('#fileListBody').html(html);
}

function copyLink(url) {
  navigator.clipboard.writeText(url).then(() => {
    alert('✅ 直链已复制到剪贴板！');
  });
}

function filterTable() {
  const keyword = $('#searchInput').val().toLowerCase();
  $('#fileListBody tr').each(function() {
    const text = $(this).text().toLowerCase();
    $(this).toggle(text.includes(keyword));
  });
}
</script>

</body>
</html>
