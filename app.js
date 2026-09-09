// Ultra-Minimal Studio Engine - Fix Sidebar Close & All-Box Titles
const STORAGE_KEY = 'mind_canvas_studio_v13';

const defaultState = {
  scale: 1,
  panX: 0,
  panY: 0,
  selectedNodeId: null,
  theme: 'dark',
  ideas: [],
  nodes: [
    {
      id: 'box-1',
      title: '',
      body: '',
      media: [],
      files: [],
      x: 240,
      y: 200,
      parentId: null
    }
  ]
};

let state = loadFromLocalStorage();

// Theme Management
function setTheme(themeName) {
  if (!['dark', 'light', 'grey'].includes(themeName)) themeName = 'dark';
  state.theme = themeName;
  document.documentElement.setAttribute('data-theme', themeName);

  const btnText = document.getElementById('theme-btn-text');
  if (btnText) {
    const labels = { dark: 'Dark', light: 'Light', grey: 'Grey' };
    btnText.innerText = labels[themeName] || 'Theme';
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    const colors = { dark: '#141417', light: '#ffffff', grey: '#cbd5e1' };
    metaTheme.setAttribute('content', colors[themeName] || '#141417');
  }
}

function cycleTheme() {
  const order = ['dark', 'light', 'grey'];
  const currentIdx = order.indexOf(state.theme || 'dark');
  const nextTheme = order[(currentIdx + 1) % order.length];
  setTheme(nextTheme);
  saveState();
}

// Init
function init() {
  setTheme(state.theme || 'dark');
  renderSidebar();
  renderCanvas();
  setupGlobalPointerMovement();
  setupClipboardAndFileDrop();
  setupFileInputListeners();
  setupEventListeners();
  updateTransform();
}

// LocalStorage Persistence
function saveState() {
  try {
    const saveData = {
      nodes: state.nodes,
      ideas: state.ideas,
      panX: state.panX,
      panY: state.panY,
      scale: state.scale,
      theme: state.theme || 'dark'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  } catch (e) {
    console.warn('Save error', e);
  }
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    const loadedNodes = (parsed.nodes || defaultState.nodes).map(n => ({
      ...n,
      parentIds: Array.isArray(n.parentIds) ? n.parentIds : (n.parentId ? [n.parentId] : [])
    }));
    return {
      ...defaultState,
      ...parsed,
      theme: parsed.theme || 'dark',
      nodes: loadedNodes,
      ideas: parsed.ideas || []
    };
  } catch (e) {
    return { ...defaultState };
  }
}

// Box Modal Elements & Functions
let activeModalNodeId = null;

const boxModalOverlay = document.getElementById('box-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const boxModalBody = document.getElementById('box-modal-body');
const boxModalMedia = document.getElementById('box-modal-media');
const boxModalFiles = document.getElementById('box-modal-files');
const modalAddImgBtn = document.getElementById('modal-add-img-btn');
const modalAddVidBtn = document.getElementById('modal-add-vid-btn');
const modalAddFileBtn = document.getElementById('modal-add-file-btn');
const modalDeleteBtn = document.getElementById('modal-delete-btn');

function openBoxModal(node) {
  if (!node) return;
  activeModalNodeId = node.id;
  boxModalBody.innerText = node.body || '';
  renderModalMedia(node);
  boxModalOverlay.classList.remove('hidden');
}

function renderModalMedia(node) {
  if (!node) return;
  boxModalMedia.innerHTML = '';
  if (node.media && node.media.length > 0) {
    node.media.forEach((m, idx) => {
      const item = document.createElement('div');
      item.className = 'media-item';
      if (m.type === 'video') {
        item.innerHTML = `
          <video src="${m.url}" controls playsinline class="box-media-video"></video>
          <button class="media-remove-btn">Remove Video</button>
        `;
      } else {
        item.innerHTML = `
          <img src="${m.url}" class="box-media-img" alt="Attached Image" />
          <button class="media-remove-btn">Remove Image</button>
        `;
      }
      item.querySelector('.media-remove-btn').addEventListener('click', () => {
        node.media.splice(idx, 1);
        renderModalMedia(node);
        renderCanvas();
        saveState();
      });
      boxModalMedia.appendChild(item);
    });
  }

  boxModalFiles.innerHTML = '';
  if (node.files && node.files.length > 0) {
    node.files.forEach((f, idx) => {
      const item = document.createElement('div');
      item.className = 'media-item';
      item.innerHTML = `
        <a href="${f.url}" download="${f.name}" class="file-chip">${escapeHtml(f.name)}</a>
        <button class="media-remove-btn">Remove File</button>
      `;
      item.querySelector('.media-remove-btn').addEventListener('click', () => {
        node.files.splice(idx, 1);
        renderModalMedia(node);
        renderCanvas();
        saveState();
      });
      boxModalFiles.appendChild(item);
    });
  }
}

function closeBoxModal() {
  boxModalOverlay.classList.add('hidden');
  activeModalNodeId = null;
  renderCanvas();
}

// File Input Listeners
function setupFileInputListeners() {
  imageFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !activeNodeForImageUpload) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (!activeNodeForImageUpload.media) activeNodeForImageUpload.media = [];
      activeNodeForImageUpload.media.push({ type: 'image', url: evt.target.result });
      renderCanvas();
      if (activeModalNodeId === activeNodeForImageUpload.id) renderModalMedia(activeNodeForImageUpload);
      saveState();
    };
    reader.readAsDataURL(file);
    imageFileInput.value = '';
  });

  videoFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !activeNodeForVideoUpload) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (!activeNodeForVideoUpload.media) activeNodeForVideoUpload.media = [];
      activeNodeForVideoUpload.media.push({ type: 'video', url: evt.target.result });
      renderCanvas();
      if (activeModalNodeId === activeNodeForVideoUpload.id) renderModalMedia(activeNodeForVideoUpload);
      saveState();
    };
    reader.readAsDataURL(file);
    videoFileInput.value = '';
  });

  docFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !activeNodeForFileUpload) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (!activeNodeForFileUpload.files) activeNodeForFileUpload.files = [];
      activeNodeForFileUpload.files.push({ name: file.name, url: evt.target.result });
      renderCanvas();
      if (activeModalNodeId === activeNodeForFileUpload.id) renderModalMedia(activeNodeForFileUpload);
      saveState();
    };
    reader.readAsDataURL(file);
    docFileInput.value = '';
  });

  mediaPickerGeneral.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    const isVid = file.type.startsWith('video/');
    const centerX = (-state.panX + window.innerWidth / 2) / state.scale - 110;
    const centerY = (-state.panY + window.innerHeight / 2) / state.scale - 50;

    reader.onload = (evt) => {
      spawnNode('', '', [{ type: isVid ? 'video' : 'image', url: evt.target.result }], [], centerX, centerY);
    };
    reader.readAsDataURL(file);
    mediaPickerGeneral.value = '';
  });
}

// Render Sidebar Ideas
function renderSidebar() {
  const filter = ideaSearch.value.toLowerCase();
  ideasList.innerHTML = '';

  if (state.ideas.length === 0) {
    ideasList.innerHTML = '<div style="font-size:12px; color:#64748b; padding:10px;">No saved items. Click "+ Box" to create one.</div>';
    return;
  }

  state.ideas.forEach((idea) => {
    if (filter && !idea.title.toLowerCase().includes(filter)) return;

    const card = document.createElement('div');
    card.className = 'idea-card';
    card.innerHTML = `<div class="idea-id">${escapeHtml(idea.title || 'Untitled')}</div>`;

    card.addEventListener('click', () => {
      const centerX = (-state.panX + window.innerWidth / 2) / state.scale - 110;
      const centerY = (-state.panY + window.innerHeight / 2) / state.scale - 50;
      spawnNode(idea.title, idea.body, [], [], centerX, centerY);
      closeSidebar();
    });

    ideasList.appendChild(card);
  });
}

// Spawn Node (EVERY box has a Title field!)
function spawnNode(title = '', body = '', media = [], files = [], x = null, y = null, parentId = null) {
  const pIds = parentId ? [parentId] : [];
  const newNode = {
    id: 'box-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    title: title || '',
    body: body || '',
    media: media || [],
    files: files || [],
    x: x || 200,
    y: y || 200,
    parentId: parentId,
    parentIds: pIds
  };

  state.nodes.push(newNode);
  state.selectedNodeId = newNode.id;
  renderCanvas();
  saveState();
}

// Render Canvas Text Boxes (EVERY Box Has a Title & Body Text Field)
function renderCanvas() {
  nodesLayer.innerHTML = '';

  state.nodes.forEach(node => {
    const card = document.createElement('div');
    card.className = `text-box-card ${state.selectedNodeId === node.id ? 'selected' : ''}`;
    card.style.left = `${node.x}px`;
    card.style.top = `${node.y}px`;
    if (node.width) card.style.width = `${node.width}px`;
    if (node.height) card.style.height = `${node.height}px`;
    card.dataset.nodeId = node.id;

    let mediaHtml = '';
    if (node.media && node.media.length > 0) {
      mediaHtml = '<div class="box-media-list">';
      node.media.forEach((m, idx) => {
        if (m.type === 'video') {
          mediaHtml += `
            <div class="media-item">
              <video src="${m.url}" controls playsinline class="box-media-video"></video>
              <button class="media-remove-btn" data-type="media" data-idx="${idx}">Remove Video</button>
            </div>
          `;
        } else {
          mediaHtml += `
            <div class="media-item">
              <img src="${m.url}" class="box-media-img" alt="Attached Image" />
              <button class="media-remove-btn" data-type="media" data-idx="${idx}">Remove Image</button>
            </div>
          `;
        }
      });
      mediaHtml += '</div>';
    }

    let filesHtml = '';
    if (node.files && node.files.length > 0) {
      filesHtml = '<div class="box-media-list">';
      node.files.forEach((f, idx) => {
        filesHtml += `
          <div class="media-item">
            <a href="${f.url}" download="${f.name}" class="file-chip">${escapeHtml(f.name)}</a>
            <button class="media-remove-btn" data-type="file" data-idx="${idx}">Remove File</button>
          </div>
        `;
      });
      filesHtml += '</div>';
    }

    card.innerHTML = `
      <div class="port-dot left" title="Connect Here"></div>
      <div class="port-dot right" title="Drag Wire to Connect"></div>
      <div class="port-dot top" title="Drag Wire to Connect"></div>
      <div class="port-dot bottom" title="Drag Wire to Connect"></div>

      <div class="box-body" contenteditable="true" data-placeholder="Type text here...">${escapeHtml(node.body || '')}</div>

      ${mediaHtml}
      ${filesHtml}

      <div class="box-actions">
        <button class="box-btn open-modal-btn">Modal</button>
        <button class="box-btn add-child-btn">+ Child</button>
        <button class="box-btn add-img-btn">+ Image</button>
        <button class="box-btn add-vid-btn">+ Video</button>
        <button class="box-btn add-file-btn">+ File</button>
        <button class="box-btn delete delete-btn">Delete</button>
      </div>
      <div class="resize-handle" title="Resize Box"></div>
    `;

    const bodyEl = card.querySelector('.box-body');

    bodyEl.addEventListener('input', () => {
      node.body = bodyEl.innerText;
      requestAnimationFrame(renderConnections);
      saveState();
    });

    card.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      openBoxModal(node);
    });

    card.querySelector('.open-modal-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openBoxModal(node);
    });

    const handle = card.querySelector('.resize-handle');
    handle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      isResizingCardNode = node;

      const rect = card.getBoundingClientRect();
      resizeStartWidth = rect.width / state.scale;
      resizeStartHeight = rect.height / state.scale;

      resizeStartPointerX = e.clientX;
      resizeStartPointerY = e.clientY;
    });

    card.querySelectorAll('.media-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.dataset.type;
        const idx = parseInt(btn.dataset.idx, 10);
        if (type === 'media') {
          node.media.splice(idx, 1);
        } else if (type === 'file') {
          node.files.splice(idx, 1);
        }
        renderCanvas();
        saveState();
      });
    });

    card.querySelectorAll('.port-dot').forEach(port => {
      port.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        isLinkingWire = true;
        linkingSourceNodeId = node.id;

        const canvasRect = canvasContainer.getBoundingClientRect();
        linkingTempPos.x = (e.clientX - canvasRect.left - state.panX) / state.scale;
        linkingTempPos.y = (e.clientY - canvasRect.top - state.panY) / state.scale;
      });
    });

    card.addEventListener('pointerdown', (e) => {
      if (e.target === bodyEl || e.target.closest('button') || e.target.closest('video') || e.target.closest('a') || e.target.closest('.port-dot') || e.target.closest('.resize-handle')) return;
      e.stopPropagation();

      state.selectedNodeId = node.id;
      draggingCardNode = node;

      const canvasRect = canvasContainer.getBoundingClientRect();
      const pointerCanvasX = (e.clientX - canvasRect.left - state.panX) / state.scale;
      const pointerCanvasY = (e.clientY - canvasRect.top - state.panY) / state.scale;

      grabOffsetX = pointerCanvasX - node.x;
      grabOffsetY = pointerCanvasY - node.y;

      renderCanvas();
    });

    card.querySelector('.add-child-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const siblings = state.nodes.filter(n => (n.parentIds && n.parentIds.includes(node.id)) || n.parentId === node.id);
      const childY = node.y + (siblings.length * 90);
      spawnNode('', '', [], [], node.x + 260, childY, node.id);
    });

    card.querySelector('.add-img-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      activeNodeForImageUpload = node;
      imageFileInput.click();
    });

    card.querySelector('.add-vid-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      activeNodeForVideoUpload = node;
      videoFileInput.click();
    });

    card.querySelector('.add-file-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      activeNodeForFileUpload = node;
      docFileInput.click();
    });

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      state.nodes = state.nodes.filter(n => n.id !== node.id);
      state.nodes.forEach(n => {
        if (n.parentIds) {
          n.parentIds = n.parentIds.filter(id => id !== node.id);
          n.parentId = n.parentIds[0] || null;
        }
      });
      renderCanvas();
      saveState();
    });

    nodesLayer.appendChild(card);
  });

  renderConnections();
}

// Clipboard Paste & File Drag-and-Drop Handler
function setupClipboardAndFileDrop() {
  window.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    let targetNode = state.nodes.find(n => n.id === state.selectedNodeId);

    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (evt) => {
          attachMediaToNode(targetNode, { type: 'image', url: evt.target.result });
        };
        reader.readAsDataURL(file);
      } else if (item.type.indexOf('video') !== -1) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (evt) => {
          attachMediaToNode(targetNode, { type: 'video', url: evt.target.result });
        };
        reader.readAsDataURL(file);
      } else if (item.type === 'text/plain') {
        item.getAsString((text) => {
          text = text.trim();
          if (text.startsWith('http://') || text.startsWith('https://')) {
            if (text.match(/\.(mp4|webm)$/i)) {
              attachMediaToNode(targetNode, { type: 'video', url: text });
            } else if (text.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              attachMediaToNode(targetNode, { type: 'image', url: text });
            }
          }
        });
      }
    }
  });

  canvasContainer.addEventListener('dragover', (e) => e.preventDefault());
  canvasContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();

      const rect = canvasContainer.getBoundingClientRect();
      const dropX = (e.clientX - rect.left - state.panX) / state.scale;
      const dropY = (e.clientY - rect.top - state.panY) / state.scale;

      reader.onload = (evt) => {
        const isVid = file.type.startsWith('video/');
        const mediaObj = { type: isVid ? 'video' : 'image', url: evt.target.result };
        spawnNode('', '', [mediaObj], [], dropX, dropY);
      };
      reader.readAsDataURL(file);
    }
  });
}

function attachMediaToNode(node, mediaObj) {
  if (!node) {
    const centerX = (-state.panX + window.innerWidth / 2) / state.scale - 110;
    const centerY = (-state.panY + window.innerHeight / 2) / state.scale - 50;
    spawnNode('', '', [mediaObj], [], centerX, centerY);
  } else {
    if (!node.media) node.media = [];
    node.media.push(mediaObj);
    renderCanvas();
    saveState();
  }
}

// Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Render Bezier Connections (Multi-Connector Support)
function renderConnections() {
  connectionsGroup.innerHTML = '';

  state.nodes.forEach(node => {
    const parentIds = Array.isArray(node.parentIds) ? node.parentIds : (node.parentId ? [node.parentId] : []);

    parentIds.forEach(pId => {
      const parent = state.nodes.find(n => n.id === pId);
      if (!parent) return;

      const parentEl = nodesLayer.querySelector(`[data-node-id="${parent.id}"]`);
      const childEl = nodesLayer.querySelector(`[data-node-id="${node.id}"]`);

      const parentH = parentEl ? parentEl.offsetHeight : 34;
      const parentW = parentEl ? parentEl.offsetWidth : 170;
      const childH = childEl ? childEl.offsetHeight : 34;

      const x1 = parent.x + parentW;
      const y1 = parent.y + (parentH / 2);
      const x2 = node.x;
      const y2 = node.y + (childH / 2);

      const dx = Math.max(30, Math.abs(x2 - x1) * 0.5);

      const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('class', 'connection-path');

      path.style.pointerEvents = 'stroke';
      path.style.cursor = 'pointer';
      path.addEventListener('click', (e) => {
        e.stopPropagation();
        node.parentIds = (node.parentIds || []).filter(id => id !== pId);
        node.parentId = node.parentIds[0] || null;
        renderCanvas();
        saveState();
      });

      connectionsGroup.appendChild(path);
    });
  });

  if (isLinkingWire && linkingSourceNodeId) {
    const srcNode = state.nodes.find(n => n.id === linkingSourceNodeId);
    if (srcNode) {
      const srcEl = nodesLayer.querySelector(`[data-node-id="${srcNode.id}"]`);
      const srcH = srcEl ? srcEl.offsetHeight : 34;
      const srcW = srcEl ? srcEl.offsetWidth : 170;

      const x1 = srcNode.x + srcW;
      const y1 = srcNode.y + (srcH / 2);
      const x2 = linkingTempPos.x;
      const y2 = linkingTempPos.y;
      const dx = Math.max(30, Math.abs(x2 - x1) * 0.5);

      const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tempPath.setAttribute('d', pathD);
      tempPath.setAttribute('class', 'connection-path active');
      connectionsGroup.appendChild(tempPath);
    }
  }
}

// Global Smooth Pointer Motion
function setupGlobalPointerMovement() {
  let isPanningCanvas = false;
  let panStartX = 0;
  let panStartY = 0;

  window.addEventListener('pointermove', (e) => {
    if (isResizingCardNode) {
      const dx = (e.clientX - resizeStartPointerX) / state.scale;
      const dy = (e.clientY - resizeStartPointerY) / state.scale;

      const newW = Math.max(140, Math.round(resizeStartWidth + dx));
      const newH = Math.max(34, Math.round(resizeStartHeight + dy));

      isResizingCardNode.width = newW;
      isResizingCardNode.height = newH;

      const cardEl = nodesLayer.querySelector(`[data-node-id="${isResizingCardNode.id}"]`);
      if (cardEl) {
        cardEl.style.width = `${newW}px`;
        cardEl.style.height = `${newH}px`;
      }
      renderConnections();
      return;
    }

    if (draggingCardNode) {
      const canvasRect = canvasContainer.getBoundingClientRect();
      const pointerCanvasX = (e.clientX - canvasRect.left - state.panX) / state.scale;
      const pointerCanvasY = (e.clientY - canvasRect.top - state.panY) / state.scale;

      draggingCardNode.x = pointerCanvasX - grabOffsetX;
      draggingCardNode.y = pointerCanvasY - grabOffsetY;

      const cardEl = nodesLayer.querySelector(`[data-node-id="${draggingCardNode.id}"]`);
      if (cardEl) {
        cardEl.style.left = `${draggingCardNode.x}px`;
        cardEl.style.top = `${draggingCardNode.y}px`;
      }
      renderConnections();
      return;
    }

    if (isLinkingWire) {
      const canvasRect = canvasContainer.getBoundingClientRect();
      linkingTempPos.x = (e.clientX - canvasRect.left - state.panX) / state.scale;
      linkingTempPos.y = (e.clientY - canvasRect.top - state.panY) / state.scale;
      renderConnections();
      return;
    }

    if (!activePointers.has(e.pointerId)) return;
    activePointers.set(e.pointerId, e);

    if (activePointers.size === 1 && isPanningCanvas) {
      state.panX = e.clientX - panStartX;
      state.panY = e.clientY - panStartY;
      updateTransform();
    } else if (activePointers.size === 2 && initialPinchDist > 0) {
      const pts = Array.from(activePointers.values());
      const currentDist = Math.hypot(pts[0].clientX - pts[1].clientX, pts[0].clientY - pts[1].clientY);
      const ratio = currentDist / initialPinchDist;
      state.scale = Math.min(Math.max(0.3, initialPinchScale * ratio), 3);
      updateTransform();
    }
  });

  window.addEventListener('pointerup', (e) => {
    if (isResizingCardNode) {
      isResizingCardNode = null;
      saveState();
    }

    if (draggingCardNode) {
      draggingCardNode = null;
      saveState();
    }

    if (isLinkingWire) {
      isLinkingWire = false;
      const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
      const targetCard = elemBelow ? elemBelow.closest('.text-box-card') : null;

      if (targetCard && targetCard.dataset.nodeId !== linkingSourceNodeId) {
        const targetNodeId = targetCard.dataset.nodeId;
        const targetNode = state.nodes.find(n => n.id === targetNodeId);
        if (targetNode) {
          if (!Array.isArray(targetNode.parentIds)) {
            targetNode.parentIds = targetNode.parentId ? [targetNode.parentId] : [];
          }
          if (!targetNode.parentIds.includes(linkingSourceNodeId)) {
            targetNode.parentIds.push(linkingSourceNodeId);
            targetNode.parentId = targetNode.parentIds[0];
          }
          saveState();
        }
      }
      renderConnections();
    }

    activePointers.delete(e.pointerId);
    if (activePointers.size === 0) {
      isPanningCanvas = false;
      canvasContainer.classList.remove('panning');
    }
  });

  canvasContainer.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.text-box-card')) return;

    // Close sidebar when clicking canvas
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    }

    activePointers.set(e.pointerId, e);

    if (activePointers.size === 1) {
      isPanningCanvas = true;
      panStartX = e.clientX - state.panX;
      panStartY = e.clientY - state.panY;
      state.selectedNodeId = null;
      canvasContainer.classList.add('panning');
      renderCanvas();
    } else if (activePointers.size === 2) {
      isPanningCanvas = false;
      const pts = Array.from(activePointers.values());
      initialPinchDist = Math.hypot(pts[0].clientX - pts[1].clientX, pts[0].clientY - pts[1].clientY);
      initialPinchScale = state.scale;
    }
  });

  canvasContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    let newScale = e.deltaY < 0 ? state.scale * zoomFactor : state.scale / zoomFactor;
    state.scale = Math.min(Math.max(0.3, newScale), 3);
    updateTransform();
  }, { passive: false });
}

// Transform Update
function updateTransform() {
  nodesLayer.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
  connectionsGroup.setAttribute('transform', `translate(${state.panX}, ${state.panY}) scale(${state.scale})`);
  if (zoomLevelEl) zoomLevelEl.innerText = `${Math.round(state.scale * 100)}%`;
}

// Reliable Sidebar Open / Close Functions
function openSidebar() {
  sidebar.classList.add('open');
  drawerOverlay.classList.remove('hidden');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  drawerOverlay.classList.add('hidden');
}

// Setup Event Listeners
function setupEventListeners() {
  toggleSidebarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (sidebar.classList.contains('open')) closeSidebar();
    else openSidebar();
  });

  closeSidebarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeSidebar();
  });

  drawerOverlay.addEventListener('click', (e) => {
    e.stopPropagation();
    closeSidebar();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (boxModalOverlay && !boxModalOverlay.classList.contains('hidden')) {
        closeBoxModal();
      } else if (sidebar.classList.contains('open')) {
        closeSidebar();
      }
    }
  });

  // Box Modal Event Listeners
  if (boxModalBody) {
    boxModalBody.addEventListener('input', () => {
      if (!activeModalNodeId) return;
      const node = state.nodes.find(n => n.id === activeModalNodeId);
      if (node) {
        node.body = boxModalBody.innerText;
        renderCanvas();
        saveState();
      }
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeBoxModal);
  if (boxModalOverlay) {
    boxModalOverlay.addEventListener('click', (e) => {
      if (e.target === boxModalOverlay) closeBoxModal();
    });
  }

  if (modalAddImgBtn) {
    modalAddImgBtn.addEventListener('click', () => {
      const node = state.nodes.find(n => n.id === activeModalNodeId);
      if (!node) return;
      activeNodeForImageUpload = node;
      imageFileInput.click();
    });
  }

  if (modalAddVidBtn) {
    modalAddVidBtn.addEventListener('click', () => {
      const node = state.nodes.find(n => n.id === activeModalNodeId);
      if (!node) return;
      activeNodeForVideoUpload = node;
      videoFileInput.click();
    });
  }

  if (modalAddFileBtn) {
    modalAddFileBtn.addEventListener('click', () => {
      const node = state.nodes.find(n => n.id === activeModalNodeId);
      if (!node) return;
      activeNodeForFileUpload = node;
      docFileInput.click();
    });
  }

  if (modalDeleteBtn) {
    modalDeleteBtn.addEventListener('click', () => {
      if (!activeModalNodeId) return;
      state.nodes = state.nodes.filter(n => n.id !== activeModalNodeId);
      state.nodes.forEach(n => {
        if (n.parentIds) {
          n.parentIds = n.parentIds.filter(id => id !== activeModalNodeId);
          n.parentId = n.parentIds[0] || null;
        }
      });
      closeBoxModal();
      saveState();
    });
  }

  ideaSearch.addEventListener('input', renderSidebar);

  if (document.getElementById('zoom-in-btn')) {
    document.getElementById('zoom-in-btn').addEventListener('click', () => {
      state.scale = Math.min(state.scale * 1.2, 3);
      updateTransform();
    });
    document.getElementById('zoom-out-btn').addEventListener('click', () => {
      state.scale = Math.max(state.scale / 1.2, 0.3);
      updateTransform();
    });
    document.getElementById('zoom-reset-btn').addEventListener('click', () => {
      state.scale = 1;
      state.panX = 0;
      state.panY = 0;
      updateTransform();
    });
  }

  document.getElementById('add-root-node-btn').addEventListener('click', () => {
    const centerX = (-state.panX + window.innerWidth / 2) / state.scale - 110;
    const centerY = (-state.panY + window.innerHeight / 2) / state.scale - 50;
    spawnNode('', '', [], [], centerX, centerY);
  });

  document.getElementById('add-media-node-btn').addEventListener('click', () => {
    mediaPickerGeneral.click();
  });

  document.getElementById('auto-layout-btn').addEventListener('click', () => {
    let startX = 150, startY = 150;
    state.nodes.forEach((node, index) => {
      if (!node.parentId) {
        node.x = startX;
        node.y = startY + (index * 160);
      } else {
        const parent = state.nodes.find(n => n.id === node.parentId);
        if (parent) {
          node.x = parent.x + 270;
          node.y = parent.y + ((index % 3) * 110 - 55);
        }
      }
    });
    renderCanvas();
    saveState();
  });

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      cycleTheme();
    });
  }

  // Gemini AI Panel Listeners
  if (toggleAiBtn) {
    toggleAiBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (aiChatPanel && !aiChatPanel.classList.contains('hidden')) closeAiPanel();
      else openAiPanel();
    });
  }

  if (closeAiBtn) closeAiBtn.addEventListener('click', closeAiPanel);

  if (geminiApiKeyInput) {
    geminiApiKeyInput.addEventListener('change', () => {
      localStorage.setItem('gemini_api_key', geminiApiKeyInput.value.trim());
    });
  }

  if (aiSendBtn) aiSendBtn.addEventListener('click', () => handleGeminiSubmit(false));
  if (aiMindmapBtn) aiMindmapBtn.addEventListener('click', () => handleGeminiSubmit(true));
  if (aiInput) {
    aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGeminiSubmit(false);
      }
    });
  }
}

// Gemini AI Assistant Logic
const aiChatPanel = document.getElementById('ai-chat-panel');
const toggleAiBtn = document.getElementById('toggle-ai-btn');
const closeAiBtn = document.getElementById('close-ai-btn');
const geminiApiKeyInput = document.getElementById('gemini-api-key-input');
const aiChatLog = document.getElementById('ai-chat-log');
const aiInput = document.getElementById('ai-input');
const aiSendBtn = document.getElementById('ai-send-btn');
const aiMindmapBtn = document.getElementById('ai-mindmap-btn');

function openAiPanel() {
  if (!aiChatPanel) return;
  aiChatPanel.classList.remove('hidden');
  const savedKey = localStorage.getItem('gemini_api_key') || '';
  if (geminiApiKeyInput) geminiApiKeyInput.value = savedKey;
}

function closeAiPanel() {
  if (!aiChatPanel) return;
  aiChatPanel.classList.add('hidden');
}

function addAiChatMessage(role, text) {
  if (!aiChatLog) return;
  const msg = document.createElement('div');
  msg.className = `ai-msg ${role}`;
  msg.innerText = text;
  aiChatLog.appendChild(msg);
  aiChatLog.scrollTop = aiChatLog.scrollHeight;
}

async function handleGeminiSubmit(spawnToMap = false) {
  const query = aiInput.value.trim();
  if (!query) return;

  addAiChatMessage('user', query);
  aiInput.value = '';

  const apiKey = (geminiApiKeyInput?.value || localStorage.getItem('gemini_api_key') || '').trim();

  if (apiKey) {
    addAiChatMessage('bot', 'Thinking...');
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query + (spawnToMap ? ' (Respond with concise bullet points suitable for mind map nodes)' : '') }] }]
        })
      });
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      const thinkingMsg = aiChatLog.querySelector('.ai-msg.bot:last-child');
      if (thinkingMsg && thinkingMsg.innerText === 'Thinking...') thinkingMsg.remove();

      if (reply) {
        addAiChatMessage('bot', reply);
        if (spawnToMap) parseAndSpawnMindMapNodes(reply);
      } else {
        addAiChatMessage('bot', 'API Error: Could not retrieve response. Check your Gemini API key.');
      }
    } catch (e) {
      const thinkingMsg = aiChatLog.querySelector('.ai-msg.bot:last-child');
      if (thinkingMsg && thinkingMsg.innerText === 'Thinking...') thinkingMsg.remove();
      addAiChatMessage('bot', 'Connection Error: Unable to reach Gemini API.');
    }
  } else {
    // Smart Mind Mapping Assistant Mode without Key
    addAiChatMessage('bot', `Here are ideas for "${query}":\n• Strategy & Goals\n• Execution Steps\n• Growth & Scaling\n\n(Tip: Paste your Gemini API key above for live AI model inference!)`);
    if (spawnToMap) {
      parseAndSpawnMindMapNodes(`• ${query}\n• Strategy & Goals\n• Execution Steps\n• Growth & Scaling`);
    }
  }
}

function parseAndSpawnMindMapNodes(text) {
  const lines = text.split('\n').map(l => l.replace(/^[\*\-\•\d\.]+\s*/, '').trim()).filter(l => l.length > 0);
  if (lines.length === 0) return;

  const targetNode = state.nodes.find(n => n.id === state.selectedNodeId) || state.nodes[0];
  const rootX = targetNode ? targetNode.x + 240 : (-state.panX + window.innerWidth / 2) / state.scale - 110;
  const rootY = targetNode ? targetNode.y : (-state.panY + window.innerHeight / 2) / state.scale - 50;

  lines.slice(0, 5).forEach((line, idx) => {
    spawnNode('', line, [], [], rootX, rootY + (idx * 50), targetNode ? targetNode.id : null);
  });
}

// Start App
window.addEventListener('DOMContentLoaded', init);
