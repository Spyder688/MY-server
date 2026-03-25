<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>AI Chat</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0a0f;
      --surface: #13131a;
      --surface2: #1c1c27;
      --border: #2a2a3a;
      --accent: #7c6bff;
      --accent2: #ff6b9d;
      --accent3: #6bffda;
      --text: #e8e8f0;
      --text2: #888899;
      --user-bubble: #1e1a3a;
      --ai-bubble: #131a1e;
    }

    html, body { height: 100%; background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; overflow: hidden; }

    body::before {
      content: ''; position: fixed; inset: 0;
      background:
        radial-gradient(ellipse 80% 50% at 20% 10%, rgba(124,107,255,0.07) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 90%, rgba(107,255,218,0.05) 0%, transparent 60%);
      pointer-events: none; z-index: 0;
    }

    .app { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100dvh; max-width: 780px; margin: 0 auto; }

    header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); background: rgba(10,10,15,0.8); backdrop-filter: blur(20px); flex-shrink: 0; }

    .logo { display: flex; align-items: center; gap: 10px; }

    .logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 0 20px rgba(124,107,255,0.4); animation: pulse-glow 3s ease-in-out infinite; }

    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(124,107,255,0.4); }
      50% { box-shadow: 0 0 30px rgba(124,107,255,0.7), 0 0 60px rgba(124,107,255,0.2); }
    }

    .logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; background: linear-gradient(90deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

    .status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text2); }

    .status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent3); animation: blink 2s ease-in-out infinite; }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .messages { flex: 1; overflow-y: auto; padding: 24px 20px; display: flex; flex-direction: column; gap: 20px; scroll-behavior: smooth; }

    .messages::-webkit-scrollbar { width: 4px; }
    .messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

    .welcome { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 16px; text-align: center; padding: 40px 20px; animation: fade-up 0.6s ease both; }

    @keyframes fade-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .welcome-icon { width: 72px; height: 72px; border-radius: 20px; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: 0 0 40px rgba(124,107,255,0.3); margin-bottom: 8px; }

    .welcome h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(24px, 5vw, 32px); background: linear-gradient(135deg, var(--text), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

    .welcome p { color: var(--text2); font-size: 15px; max-width: 340px; line-height: 1.6; }

    .suggestions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 8px; }

    .suggestion { padding: 8px 14px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface); color: var(--text2); font-size: 13px; cursor: pointer; transition: all 0.2s ease; font-family: 'DM Sans', sans-serif; }

    .suggestion:hover { border-color: var(--accent); color: var(--text); background: var(--user-bubble); transform: translateY(-1px); }

    .message { display: flex; gap: 12px; animation: fade-up 0.3s ease both; max-width: 100%; }
    .message.user { flex-direction: row-reverse; }

    .avatar { width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; margin-top: 2px; }

    .message.ai .avatar { background: linear-gradient(135deg, var(--accent), var(--accent2)); box-shadow: 0 0 12px rgba(124,107,255,0.3); }
    .message.user .avatar { background: var(--surface2); border: 1px solid var(--border); }

    .bubble { max-width: min(75%, 520px); padding: 12px 16px; border-radius: 16px; font-size: 14.5px; line-height: 1.65; word-break: break-word; }

    .message.user .bubble { background: var(--user-bubble); border: 1px solid rgba(124,107,255,0.3); border-bottom-right-radius: 4px; color: var(--text); }
    .message.ai .bubble { background: var(--ai-bubble); border: 1px solid var(--border); border-bottom-left-radius: 4px; color: var(--text); }

    .bubble-meta { font-size: 11px; color: var(--text2); margin-top: 5px; opacity: 0.7; }
    .message.user .bubble-meta { text-align: right; }

    .file-preview { display: flex; align-items: center; gap: 10px; background: rgba(124,107,255,0.1); border: 1px solid rgba(124,107,255,0.2); border-radius: 10px; padding: 10px 12px; margin-bottom: 8px; }
    .file-preview-icon { font-size: 24px; flex-shrink: 0; }
    .file-preview-info { flex: 1; min-width: 0; }
    .file-preview-name { font-size: 13px; font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .file-preview-size { font-size: 11px; color: var(--text2); margin-top: 2px; }
    .image-preview { max-width: 100%; max-height: 200px; border-radius: 10px; display: block; margin-bottom: 8px; object-fit: cover; }

    .typing { display: flex; align-items: center; gap: 5px; padding: 14px 16px; }
    .typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: typing-bounce 1.2s ease-in-out infinite; }
    .typing span:nth-child(2) { animation-delay: 0.2s; background: var(--accent2); }
    .typing span:nth-child(3) { animation-delay: 0.4s; background: var(--accent3); }

    @keyframes typing-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-8px); opacity: 1; }
    }

    .attachments-bar { display: none; flex-wrap: wrap; gap: 8px; padding: 10px 20px 0; background: rgba(10,10,15,0.9); }
    .attachments-bar.has-files { display: flex; }

    .attachment-chip { display: flex; align-items: center; gap: 6px; background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; padding: 4px 10px 4px 8px; font-size: 12px; color: var(--text2); max-width: 160px; }
    .attachment-chip .chip-icon { font-size: 14px; flex-shrink: 0; }
    .attachment-chip .chip-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .attachment-chip .chip-remove { width: 16px; height: 16px; border-radius: 50%; background: rgba(255,255,255,0.1); border: none; color: var(--text2); cursor: pointer; font-size: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-left: 2px; transition: background 0.2s; }
    .attachment-chip .chip-remove:hover { background: rgba(255,107,107,0.3); color: #ff9999; }

    .input-area { padding: 16px 20px 20px; border-top: 1px solid var(--border); background: rgba(10,10,15,0.9); backdrop-filter: blur(20px); flex-shrink: 0; }

    .input-wrapper { display: flex; align-items: flex-end; gap: 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 10px 12px; transition: border-color 0.2s ease, box-shadow 0.2s ease; }

    .input-wrapper:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(124,107,255,0.1); }

    .attach-btn { width: 34px; height: 34px; border-radius: 10px; border: none; background: var(--surface2); color: var(--text2); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s ease; font-size: 16px; }
    .attach-btn:hover { background: var(--border); color: var(--text); transform: scale(1.05); }

    .attach-menu { position: absolute; bottom: 80px; left: 20px; background: var(--surface2); border: 1px solid var(--border); border-radius: 14px; padding: 8px; display: none; flex-direction: column; gap: 4px; z-index: 100; box-shadow: 0 8px 32px rgba(0,0,0,0.4); animation: fade-up 0.2s ease both; }
    .attach-menu.open { display: flex; }

    .attach-option { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: none; background: none; color: var(--text); cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; transition: background 0.2s ease; white-space: nowrap; }
    .attach-option:hover { background: rgba(124,107,255,0.1); }
    .attach-option .opt-icon { font-size: 20px; width: 28px; text-align: center; }
    .attach-option .opt-label { font-weight: 500; }
    .attach-option .opt-desc { font-size: 11px; color: var(--text2); }

    textarea { flex: 1; background: none; border: none; outline: none; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14.5px; line-height: 1.5; resize: none; max-height: 120px; min-height: 24px; padding: 2px 0; }
    textarea::placeholder { color: var(--text2); }

    .send-btn { width: 36px; height: 36px; border-radius: 10px; border: none; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s ease; box-shadow: 0 0 16px rgba(124,107,255,0.3); }
    .send-btn:hover { transform: scale(1.05); box-shadow: 0 0 24px rgba(124,107,255,0.5); }
    .send-btn:active { transform: scale(0.95); }
    .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .send-btn svg { width: 16px; height: 16px; fill: white; }

    .input-hint { text-align: center; font-size: 11px; color: var(--text2); margin-top: 10px; opacity: 0.6; }

    .bubble code { background: rgba(124,107,255,0.15); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: var(--accent3); }
    .bubble pre { background: #0d0d14; border: 1px solid var(--border); border-radius: 10px; padding: 12px; overflow-x: auto; margin-top: 8px; font-family: monospace; font-size: 13px; color: var(--accent3); }

    @media (max-width: 480px) {
      header { padding: 12px 16px; }
      .messages { padding: 16px; gap: 16px; }
      .input-area { padding: 12px 16px 16px; }
      .bubble { max-width: 85%; font-size: 14px; }
      .welcome h1 { font-size: 22px; }
    }

    .error-bubble { background: rgba(255, 107, 107, 0.1) !important; border-color: rgba(255, 107, 107, 0.3) !important; color: #ff9999 !important; }
    #fileInput, #imageInput, #videoInput { display: none; }
  </style>
</head>
<body>
  <div class="app">
    <header>
      <div class="logo">
        <div class="logo-icon">🤖</div>
        <span class="logo-text">AI Chat</span>
      </div>
      <div class="status">
        <div class="status-dot"></div>
        <span>Online</span>
      </div>
    </header>

    <div class="messages" id="messages">
      <div class="welcome" id="welcome">
        <div class="welcome-icon">✨</div>
        <h1>How can I help you?</h1>
        <p>Powered by LLaMA 3.3 via Groq. Ask me anything — attach photos, documents or videos too!</p>
        <div class="suggestions">
          <button class="suggestion" onclick="useSuggestion(this)">Explain quantum computing</button>
          <button class="suggestion" onclick="useSuggestion(this)">Write a Python script</button>
          <button class="suggestion" onclick="useSuggestion(this)">Help me study for exams</button>
          <button class="suggestion" onclick="useSuggestion(this)">What is machine learning?</button>
        </div>
      </div>
    </div>

    <div class="attachments-bar" id="attachmentsBar"></div>

    <div class="attach-menu" id="attachMenu">
      <button class="attach-option" onclick="triggerInput('imageInput')">
        <span class="opt-icon">🖼️</span>
        <div>
          <div class="opt-label">Photo</div>
          <div class="opt-desc">JPG, PNG, GIF, WebP</div>
        </div>
      </button>
      <button class="attach-option" onclick="triggerInput('videoInput')">
        <span class="opt-icon">🎬</span>
        <div>
          <div class="opt-label">Video</div>
          <div class="opt-desc">MP4, MOV, AVI</div>
        </div>
      </button>
      <button class="attach-option" onclick="triggerInput('fileInput')">
        <span class="opt-icon">📄</span>
        <div>
          <div class="opt-label">Document</div>
          <div class="opt-desc">PDF, DOCX, TXT, CSV</div>
        </div>
      </button>
    </div>

    <div class="input-area">
      <div class="input-wrapper">
        <button class="attach-btn" onclick="toggleAttachMenu()" title="Attach file">📎</button>
        <textarea id="input" placeholder="Message AI..." rows="1" onkeydown="handleKey(event)" oninput="autoResize(this)"></textarea>
        <button class="send-btn" id="sendBtn" onclick="sendMessage()">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      <div class="input-hint">Press Enter to send · Shift+Enter for new line · 📎 to attach files</div>
    </div>

    <input type="file" id="imageInput" accept="image/*" multiple onchange="handleFiles(this.files, 'image')">
    <input type="file" id="videoInput" accept="video/*" multiple onchange="handleFiles(this.files, 'video')">
    <input type="file" id="fileInput" accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.pptx" multiple onchange="handleFiles(this.files, 'document')">
  </div>

  <script>
    let isLoading = false;
    let attachedFiles = [];
    let attachMenuOpen = false;

    function autoResize(el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }

    function handleKey(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    }

    function useSuggestion(btn) {
      document.getElementById('input').value = btn.textContent;
      sendMessage();
    }

    function getTime() {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function toggleAttachMenu() {
      attachMenuOpen = !attachMenuOpen;
      document.getElementById('attachMenu').classList.toggle('open', attachMenuOpen);
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.attach-btn') && !e.target.closest('.attach-menu')) {
        attachMenuOpen = false;
        document.getElementById('attachMenu').classList.remove('open');
      }
    });

    function triggerInput(id) {
      document.getElementById(id).click();
      toggleAttachMenu();
    }

    function getFileIcon(type, name) {
      if (type === 'image') return '🖼️';
      if (type === 'video') return '🎬';
      const ext = name.split('.').pop().toLowerCase();
      if (ext === 'pdf') return '📕';
      if (['doc','docx'].includes(ext)) return '📘';
      if (['xls','xlsx'].includes(ext)) return '📗';
      if (['ppt','pptx'].includes(ext)) return '📙';
      if (ext === 'txt') return '📄';
      if (ext === 'csv') return '📊';
      return '📎';
    }

    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function handleFiles(files, type) {
      Array.from(files).forEach(file => {
        const id = Date.now() + Math.random();
        attachedFiles.push({ id, file, type });
        addChip(id, file, type);
      });
    }

    function addChip(id, file, type) {
      const bar = document.getElementById('attachmentsBar');
      bar.classList.add('has-files');
      const chip = document.createElement('div');
      chip.className = 'attachment-chip';
      chip.id = 'chip-' + id;
      chip.innerHTML = `
        <span class="chip-icon">${getFileIcon(type, file.name)}</span>
        <span class="chip-name">${file.name}</span>
        <button class="chip-remove" onclick="removeFile('${id}')" title="Remove">✕</button>
      `;
      bar.appendChild(chip);
    }

    function removeFile(id) {
      attachedFiles = attachedFiles.filter(f => f.id != id);
      const chip = document.getElementById('chip-' + id);
      if (chip) chip.remove();
      if (attachedFiles.length === 0) {
        document.getElementById('attachmentsBar').classList.remove('has-files');
      }
    }

    function addMessage(text, role, files = [], isError = false) {
      const welcome = document.getElementById('welcome');
      if (welcome) welcome.remove();

      const messages = document.getElementById('messages');
      const div = document.createElement('div');
      div.className = `message ${role}`;

      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = role === 'ai' ? '🤖' : '👤';

      const content = document.createElement('div');
      const bubble = document.createElement('div');
      bubble.className = `bubble${isError ? ' error-bubble' : ''}`;

      if (files.length > 0) {
        files.forEach(({ file, type }) => {
          if (type === 'image') {
            const img = document.createElement('img');
            img.className = 'image-preview';
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            bubble.appendChild(img);
          } else {
            const fp = document.createElement('div');
            fp.className = 'file-preview';
            fp.innerHTML = `
              <span class="file-preview-icon">${getFileIcon(type, file.name)}</span>
              <div class="file-preview-info">
                <div class="file-preview-name">${file.name}</div>
                <div class="file-preview-size">${formatSize(file.size)}</div>
              </div>
            `;
            bubble.appendChild(fp);
          }
        });
      }

      if (text) {
        const textNode = document.createElement('div');
        textNode.innerHTML = formatText(text);
        bubble.appendChild(textNode);
      }

      const meta = document.createElement('div');
      meta.className = 'bubble-meta';
      meta.textContent = getTime();

      content.appendChild(bubble);
      content.appendChild(meta);
      div.appendChild(avatar);
      div.appendChild(content);
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
      return div;
    }

    function addTyping() {
      const welcome = document.getElementById('welcome');
      if (welcome) welcome.remove();
      const messages = document.getElementById('messages');
      const div = document.createElement('div');
      div.className = 'message ai';
      div.id = 'typing';
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = '🤖';
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
      div.appendChild(avatar);
      div.appendChild(bubble);
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
      const t = document.getElementById('typing');
      if (t) t.remove();
    }

    function formatText(text) {
      return text
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    }

    async function sendMessage() {
      if (isLoading) return;
      const input = document.getElementById('input');
      const msg = input.value.trim();
      const files = [...attachedFiles];
      if (!msg && files.length === 0) return;

      input.value = '';
      input.style.height = 'auto';
      attachedFiles = [];
      document.getElementById('attachmentsBar').innerHTML = '';
      document.getElementById('attachmentsBar').classList.remove('has-files');

      isLoading = true;
      document.getElementById('sendBtn').disabled = true;

      let fullMessage = msg;
      if (files.length > 0) {
        const fileNames = files.map(f => f.file.name).join(', ');
        fullMessage = msg
          ? `${msg}\n\n[Attached files: ${fileNames}]`
          : `[Attached files: ${fileNames}] Please describe or help with these files.`;
      }

      addMessage(msg, 'user', files.map(f => ({ file: f.file, type: f.type })));
      addTyping();

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: fullMessage })
        });
        const data = await res.json();
        removeTyping();
        if (data.reply) {
          addMessage(data.reply, 'ai');
        } else {
          addMessage('Something went wrong. Please try again.', 'ai', [], true);
        }
      } catch (err) {
        removeTyping();
        addMessage('Connection error. Check your server.', 'ai', [], true);
      }

      isLoading = false;
      document.getElementById('sendBtn').disabled = false;
      document.getElementById('input').focus();
    }
  </script>
</body>
</html>
