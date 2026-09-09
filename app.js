// Ultra-Minimal Studio Engine - Top 4 Features Integrated:
// 1. Tab & Enter Keyboard Speed Navigation
// 2. On-Canvas "AI Expand" & Full Topic Generator
// 3. Sub-branch Collapse & Expand
// 4. Markdown Outline Import & Export (Plus PNG Export)
const STORAGE_KEY = 'mind_canvas_studio_v14';

const defaultState = {
  scale: 1,
  panX: 0,
  panY: 0,
  selectedNodeId: 'box-1',
  theme: 'dark',
  ideas: [],
  nodes: [
    {
      id: 'box-1',
      title: '',
      body: 'Central Topic',
      media: [],
      files: [],
      x: 240,
      y: 200,
      parentId: null,
      parentIds: [],
      collapsed: false
    }
  ]
};

let state = loadFromLocalStorage();
window.state = state;

// DOM Element References
const canvasContainer = document.getElementById('canvas-container');
const nodesLayer = document.getElementById('nodes-layer');
const connectionsGroup = document.getElementById('connections-group');
const sidebar = document.getElementById('sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
const drawerOverlay = document.getElementById('drawer-overlay');
const ideaSearch = document.getElementById('idea-search');
const ideasList = document.getElementById('ideas-list');
const zoomLevelEl = document.getElementById('zoom-level');

// File Upload Elements
const imageFileInput = document.createElement('input');
imageFileInput.type = 'file';
imageFileInput.accept = 'image/*';

const videoFileInput = document.createElement('input');
videoFileInput.type = 'file';
videoFileInput.accept = 'video/*';

const docFileInput = document.createElement('input');
docFileInput.type = 'file';

const mediaPickerGeneral = document.createElement('input');
mediaPickerGeneral.type = 'file';
mediaPickerGeneral.accept = 'image/*,video/*';

let activeNodeForImageUpload = null;
let activeNodeForVideoUpload = null;
let activeNodeForFileUpload = null;

// Pointer & Drag Interaction State
const activePointers = new Map();
let isPanningCanvas = false;
let panStartX = 0;
let panStartY = 0;

let draggingCardNode = null;
let grabOffsetX = 0;
let grabOffsetY = 0;

let isResizingCardNode = null;
let resizeStartWidth = 0;
let resizeStartHeight = 0;
let resizeStartPointerX = 0;
let resizeStartPointerY = 0;

let isLinkingWire = false;
let linkingSourceNodeId = null;
let linkingTempPos = { x: 0, y: 0 };

let initialPinchDist = 0;
let initialPinchScale = 1;

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
  try { setTheme(state.theme || 'dark'); } catch (e) { console.error('Theme error:', e); }
  try { setupEventListeners(); } catch (e) { console.error('setupEventListeners error:', e); }
  try { setupGlobalPointerMovement(); } catch (e) { console.error('setupGlobalPointerMovement error:', e); }
  try { setupClipboardAndFileDrop(); } catch (e) { console.error('setupClipboardAndFileDrop error:', e); }
  try { setupFileInputListeners(); } catch (e) { console.error('setupFileInputListeners error:', e); }
  try { renderCanvas(); } catch (e) { console.error('renderCanvas error:', e); }
  try { renderSidebar(); } catch (e) { console.error('renderSidebar error:', e); }
  try { updateTransform(); } catch (e) { console.error('updateTransform error:', e); }
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
      parentIds: Array.isArray(n.parentIds) ? n.parentIds : (n.parentId ? [n.parentId] : []),
      collapsed: !!n.collapsed
    }));
    const validScale = (typeof parsed.scale === 'number' && !isNaN(parsed.scale) && parsed.scale > 0.1 && parsed.scale <= 5) ? parsed.scale : 1;
    const validPanX = (typeof parsed.panX === 'number' && !isNaN(parsed.panX)) ? parsed.panX : 0;
    const validPanY = (typeof parsed.panY === 'number' && !isNaN(parsed.panY)) ? parsed.panY : 0;
    return {
      ...defaultState,
      ...parsed,
      scale: validScale,
      panX: validPanX,
      panY: validPanY,
      theme: parsed.theme || 'dark',
      nodes: loadedNodes.length > 0 ? loadedNodes : defaultState.nodes,
      ideas: Array.isArray(parsed.ideas) ? parsed.ideas : []
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
const modalAiExpandBtn = document.getElementById('modal-ai-expand-btn');

// I/O Modal Elements
const ioModal = document.getElementById('io-modal');
const toggleIoBtn = document.getElementById('toggle-io-btn');
const closeIoModalBtn = document.getElementById('close-io-modal-btn');
const ioTabExportBtn = document.getElementById('io-tab-export-btn');
const ioTabImportBtn = document.getElementById('io-tab-import-btn');
const ioExportPanel = document.getElementById('io-export-panel');
const ioImportPanel = document.getElementById('io-import-panel');
const ioExportText = document.getElementById('io-export-text');
const ioImportText = document.getElementById('io-import-text');
const copyMarkdownBtn = document.getElementById('copy-markdown-btn');
const downloadMarkdownBtn = document.getElementById('download-markdown-btn');
const exportPngBtn = document.getElementById('export-png-btn');
const runImportBtn = document.getElementById('run-import-btn');
const ioImportReplace = document.getElementById('io-import-replace');

// Gemini AI Panel Elements
const aiChatPanel = document.getElementById('ai-chat-panel');
const toggleAiBtn = document.getElementById('toggle-ai-btn');
const closeAiBtn = document.getElementById('close-ai-btn');
const geminiApiKeyInput = document.getElementById('gemini-api-key-input');
const aiChatLog = document.getElementById('ai-chat-log');
const aiInput = document.getElementById('ai-input');
const aiSendBtn = document.getElementById('ai-send-btn');
const aiMindmapBtn = document.getElementById('ai-mindmap-btn');
const aiFullmapBtn = document.getElementById('ai-fullmap-btn');

// FEATURE 3: Branch Collapse / Expand Helpers
function isNodeHiddenByCollapse(node) {
  if (!node) return false;
  let visited = new Set();
  let currentParents = (node.parentIds && node.parentIds.length > 0)
    ? [...node.parentIds]
    : (node.parentId ? [node.parentId] : []);

  while (currentParents.length > 0) {
    const pId = currentParents.shift();
    if (visited.has(pId)) continue;
    visited.add(pId);

    const pNode = state.nodes.find(n => n.id === pId);
    if (pNode) {
      if (pNode.collapsed) return true;
      if (pNode.parentIds && pNode.parentIds.length > 0) {
        currentParents.push(...pNode.parentIds);
      } else if (pNode.parentId) {
        currentParents.push(pNode.parentId);
      }
    }
  }
  return false;
}

function countDescendants(nodeId, visited = new Set()) {
  if (!nodeId || visited.has(nodeId)) return 0;
  visited.add(nodeId);
  let count = 0;
  const children = state.nodes.filter(n => (n.parentIds && n.parentIds.includes(nodeId)) || n.parentId === nodeId);
  children.forEach(c => {
    if (!visited.has(c.id)) {
      count += 1 + countDescendants(c.id, visited);
    }
  });
  return count;
}

// FEATURE 1: Keyboard Tree Speed Navigation Helpers
function createChildNode(parentNode) {
  if (!parentNode) return null;
  if (parentNode.collapsed) {
    parentNode.collapsed = false;
  }
  const children = state.nodes.filter(n => (n.parentIds && n.parentIds.includes(parentNode.id)) || n.parentId === parentNode.id);
  const childX = parentNode.x + (parentNode.width || 200) + 60;
  let childY = parentNode.y;
  if (children.length > 0) {
    const maxY = Math.max(...children.map(c => c.y + (c.height || 50)));
    childY = maxY + 16;
  }
  const newNode = spawnNode('', '', [], [], childX, childY, parentNode.id);
  return newNode;
}

function createSiblingNode(node) {
  if (!node) return null;
  const parentId = (node.parentIds && node.parentIds[0]) || node.parentId || null;
  let childX = node.x;
  let childY = node.y + (node.height || 50) + 16;
  if (parentId) {
    const parent = state.nodes.find(n => n.id === parentId);
    if (parent && parent.collapsed) parent.collapsed = false;
    const siblings = state.nodes.filter(n => (n.parentIds && n.parentIds.includes(parentId)) || n.parentId === parentId);
    if (siblings.length > 0) {
      const maxY = Math.max(...siblings.map(s => s.y + (s.height || 50)));
      childY = maxY + 16;
    }
  }
  const newNode = spawnNode('', '', [], [], childX, childY, parentId);
  return newNode;
}

function deleteNodeById(nodeId) {
  if (!nodeId) return;
  const nodeToDelete = state.nodes.find(n => n.id === nodeId);
  const parentId = nodeToDelete ? ((nodeToDelete.parentIds && nodeToDelete.parentIds[0]) || nodeToDelete.parentId) : null;

  state.nodes = state.nodes.filter(n => n.id !== nodeId);
  state.nodes.forEach(n => {
    if (n.parentIds) {
      n.parentIds = n.parentIds.filter(id => id !== nodeId);
      n.parentId = n.parentIds[0] || null;
    }
  });

  state.selectedNodeId = parentId || (state.nodes[0] ? state.nodes[0].id : null);
  renderCanvas();
  saveState();
}

function focusNodeText(nodeId) {
  requestAnimationFrame(() => {
    const card = nodesLayer.querySelector(`[data-node-id="${nodeId}"]`);
    if (card) {
      const bodyEl = card.querySelector('.box-body');
      if (bodyEl) {
        bodyEl.focus();
        const range = document.createRange();
        range.selectNodeContents(bodyEl);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  });
}

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
  if (!ideasList) return;
  const filter = (ideaSearch && ideaSearch.value) ? ideaSearch.value.toLowerCase().trim() : '';
  ideasList.innerHTML = '';

  if (!Array.isArray(state.ideas) || state.ideas.length === 0) {
    ideasList.innerHTML = '<div style="font-size:12px; color:#64748b; padding:10px;">No saved items. Click "+ Box" to create one.</div>';
    return;
  }

  state.ideas.forEach((idea) => {
    if (filter && (!idea.title || !idea.title.toLowerCase().includes(filter))) return;

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
    id: 'box-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
    title: title || '',
    body: body || '',
    media: media || [],
    files: files || [],
    x: x !== null ? x : 200,
    y: y !== null ? y : 200,
    parentId: parentId,
    parentIds: pIds,
    collapsed: false
  };

  state.nodes.push(newNode);
  state.selectedNodeId = newNode.id;
  renderCanvas();
  saveState();
  return newNode;
}

// Render Canvas Text Boxes (EVERY Box Has a Title & Body Text Field)
function renderCanvas() {
  nodesLayer.innerHTML = '';

  state.nodes.forEach(node => {
    const isHidden = isNodeHiddenByCollapse(node);

    const card = document.createElement('div');
    card.className = `text-box-card ${state.selectedNodeId === node.id ? 'selected' : ''} ${isHidden ? 'node-collapsed-hidden' : ''}`;
    card.style.left = `${node.x}px`;
    card.style.top = `${node.y}px`;
    if (node.width) card.style.width = `${node.width}px`;
    if (node.height) card.style.height = `${node.height}px`;
    card.dataset.nodeId = node.id;

    // Collapse / Expand Pill on right edge if node has children
    const childNodes = state.nodes.filter(n => (n.parentIds && n.parentIds.includes(node.id)) || n.parentId === node.id);
    if (childNodes.length > 0) {
      const toggleBtn = document.createElement('button');
      const descCount = countDescendants(node.id);
      toggleBtn.className = `collapse-toggle-btn ${node.collapsed ? 'collapsed' : ''}`;
      toggleBtn.title = node.collapsed ? `Expand ${descCount} branches` : 'Collapse branches';
      toggleBtn.innerText = node.collapsed ? `+${descCount}` : '−';
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        node.collapsed = !node.collapsed;
        renderCanvas();
        saveState();
      });
      card.appendChild(toggleBtn);
    }

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

    const cardContent = document.createElement('div');
    cardContent.innerHTML = `
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
        <button class="box-btn ai-expand-btn" title="Expand with Gemini AI">AI Expand</button>
        <button class="box-btn add-img-btn">+ Image</button>
        <button class="box-btn add-vid-btn">+ Video</button>
        <button class="box-btn add-file-btn">+ File</button>
        <button class="box-btn delete delete-btn">Delete</button>
      </div>
      <div class="resize-handle" title="Resize Box"></div>
    `;

    while (cardContent.firstChild) {
      card.appendChild(cardContent.firstChild);
    }

    const bodyEl = card.querySelector('.box-body');

    bodyEl.addEventListener('input', () => {
      node.body = bodyEl.innerText;
      requestAnimationFrame(renderConnections);
      saveState();
    });

    // Keyboard Tab / Enter directly while editing box text
    bodyEl.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const child = createChildNode(node);
        if (child) focusNodeText(child.id);
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const sib = createSiblingNode(node);
        if (sib) focusNodeText(sib.id);
      } else if (e.key === 'Escape') {
        bodyEl.blur();
      }
    });

    card.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      openBoxModal(node);
    });

    const openModalBtn = card.querySelector('.open-modal-btn');
    if (openModalBtn) {
      openModalBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openBoxModal(node);
      });
    }

    const aiExpBtn = card.querySelector('.ai-expand-btn');
    if (aiExpBtn) {
      aiExpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        aiExpandNode(node.id, aiExpBtn);
      });
    }

    const handle = card.querySelector('.resize-handle');
    if (handle) {
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
    }

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
      if (e.target === bodyEl || e.target.closest('button') || e.target.closest('video') || e.target.closest('a') || e.target.closest('.port-dot') || e.target.closest('.resize-handle') || e.target.closest('.collapse-toggle-btn')) return;
      e.stopPropagation();

      state.selectedNodeId = node.id;
      draggingCardNode = node;

      const canvasRect = canvasContainer.getBoundingClientRect();
      const pointerCanvasX = (e.clientX - canvasRect.left - state.panX) / state.scale;
      const pointerCanvasY = (e.clientY - canvasRect.top - state.panY) / state.scale;

      grabOffsetX = pointerCanvasX - node.x;
      grabOffsetY = pointerCanvasY - node.y;

      document.querySelectorAll('.text-box-card.selected').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });

    const addChildBtn = card.querySelector('.add-child-btn');
    if (addChildBtn) {
      addChildBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const child = createChildNode(node);
        if (child) focusNodeText(child.id);
      });
    }

    const addImgBtn = card.querySelector('.add-img-btn');
    if (addImgBtn) {
      addImgBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        activeNodeForImageUpload = node;
        imageFileInput.click();
      });
    }

    const addVidBtn = card.querySelector('.add-vid-btn');
    if (addVidBtn) {
      addVidBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        activeNodeForVideoUpload = node;
        videoFileInput.click();
      });
    }

    const addFileBtn = card.querySelector('.add-file-btn');
    if (addFileBtn) {
      addFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        activeNodeForFileUpload = node;
        docFileInput.click();
      });
    }

    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNodeById(node.id);
      });
    }

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
    if (isNodeHiddenByCollapse(node)) return;

    const parentIds = Array.isArray(node.parentIds) ? node.parentIds : (node.parentId ? [node.parentId] : []);

    parentIds.forEach(pId => {
      const parent = state.nodes.find(n => n.id === pId);
      if (!parent || isNodeHiddenByCollapse(parent) || parent.collapsed) return;

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
  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar && sidebar.classList.contains('open')) closeSidebar();
      else openSidebar();
    });
  }

  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSidebar();
    });
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSidebar();
    });
  }

  // Global Keyboard Shortcuts (Speed Navigation & Tree Building)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (boxModalOverlay && !boxModalOverlay.classList.contains('hidden')) {
        closeBoxModal();
      } else if (ioModal && !ioModal.classList.contains('hidden')) {
        closeIoModal();
      } else if (sidebar.classList.contains('open')) {
        closeSidebar();
      }
      return;
    }

    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    if ((boxModalOverlay && !boxModalOverlay.classList.contains('hidden')) || (ioModal && !ioModal.classList.contains('hidden'))) return;

    if (state.selectedNodeId) {
      const selNode = state.nodes.find(n => n.id === state.selectedNodeId);
      if (!selNode) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        const child = createChildNode(selNode);
        if (child) focusNodeText(child.id);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const sib = createSiblingNode(selNode);
        if (sib) focusNodeText(sib.id);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteNodeById(state.selectedNodeId);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const children = state.nodes.filter(n => (n.parentIds && n.parentIds.includes(selNode.id)) || n.parentId === selNode.id);
        if (children.length > 0) {
          state.selectedNodeId = children[0].id;
          renderCanvas();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const parentId = (selNode.parentIds && selNode.parentIds[0]) || selNode.parentId;
        if (parentId) {
          state.selectedNodeId = parentId;
          renderCanvas();
        }
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const pId = (selNode.parentIds && selNode.parentIds[0]) || selNode.parentId || null;
        const siblings = state.nodes.filter(n => ((n.parentIds && n.parentIds.includes(pId)) || n.parentId === pId));
        const idx = siblings.findIndex(s => s.id === selNode.id);
        if (idx !== -1) {
          const nextIdx = e.key === 'ArrowDown' ? Math.min(siblings.length - 1, idx + 1) : Math.max(0, idx - 1);
          state.selectedNodeId = siblings[nextIdx].id;
          renderCanvas();
        }
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

  if (modalAiExpandBtn) {
    modalAiExpandBtn.addEventListener('click', () => {
      if (!activeModalNodeId) return;
      aiExpandNode(activeModalNodeId, modalAiExpandBtn);
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
      deleteNodeById(activeModalNodeId);
      closeBoxModal();
    });
  }

  if (ideaSearch) ideaSearch.addEventListener('input', renderSidebar);

  // Zoom Controls
  const zoomInBtn = document.getElementById('zoom-in-btn');
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.scale = Math.min(state.scale * 1.2, 3);
      updateTransform();
    });
  }
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.scale = Math.max(state.scale / 1.2, 0.3);
      updateTransform();
    });
  }
  const zoomResetBtn = document.getElementById('zoom-reset-btn');
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.scale = 1;
      state.panX = 0;
      state.panY = 0;
      updateTransform();
    });
  }

  const addRootBtn = document.getElementById('add-root-node-btn');
  if (addRootBtn) {
    addRootBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const safeScale = (state.scale && state.scale > 0) ? state.scale : 1;
      const safePanX = typeof state.panX === 'number' ? state.panX : 0;
      const safePanY = typeof state.panY === 'number' ? state.panY : 0;
      const centerX = (-safePanX + window.innerWidth / 2) / safeScale - 110;
      const centerY = (-safePanY + window.innerHeight / 2) / safeScale - 50;
      spawnNode('', 'New Idea', [], [], centerX, centerY);
    });
  }

  const addMediaBtn = document.getElementById('add-media-node-btn');
  if (addMediaBtn) {
    addMediaBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mediaPickerGeneral.click();
    });
  }

  const autoLayoutBtn = document.getElementById('auto-layout-btn');
  if (autoLayoutBtn) {
    autoLayoutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      let startX = 150, startY = 150;
      state.nodes.forEach((node, index) => {
        if (!node.parentId && (!node.parentIds || node.parentIds.length === 0)) {
          node.x = startX;
          node.y = startY + (index * 160);
        } else {
          const pId = (node.parentIds && node.parentIds[0]) || node.parentId;
          const parent = state.nodes.find(n => n.id === pId);
          if (parent) {
            node.x = parent.x + 270;
            node.y = parent.y + ((index % 3) * 110 - 55);
          }
        }
      });
      renderCanvas();
      saveState();
    });
  }

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      cycleTheme();
    });
  }

  // I/O Modal Listeners
  if (toggleIoBtn) {
    toggleIoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openIoModal('export');
    });
  }

  if (closeIoModalBtn) closeIoModalBtn.addEventListener('click', closeIoModal);
  if (ioModal) {
    ioModal.addEventListener('click', (e) => {
      if (e.target === ioModal) closeIoModal();
    });
  }

  if (ioTabExportBtn) ioTabExportBtn.addEventListener('click', () => showIoTab('export'));
  if (ioTabImportBtn) ioTabImportBtn.addEventListener('click', () => showIoTab('import'));

  if (copyMarkdownBtn) {
    copyMarkdownBtn.addEventListener('click', async () => {
      const text = ioExportText ? ioExportText.value : '';
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const prev = copyMarkdownBtn.innerText;
        copyMarkdownBtn.innerText = 'Copied!';
        setTimeout(() => { copyMarkdownBtn.innerText = prev; }, 1500);
      } catch (err) {
        alert('Could not copy to clipboard.');
      }
    });
  }

  if (downloadMarkdownBtn) {
    downloadMarkdownBtn.addEventListener('click', () => {
      const text = ioExportText ? ioExportText.value : '';
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mindmap.md';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (exportPngBtn) {
    exportPngBtn.addEventListener('click', () => {
      exportCanvasToPng();
    });
  }

  if (runImportBtn) {
    runImportBtn.addEventListener('click', () => {
      const text = ioImportText ? ioImportText.value.trim() : '';
      if (!text) {
        alert('Please enter some outline text first.');
        return;
      }
      const replace = ioImportReplace ? ioImportReplace.checked : true;
      importMarkdownToCanvas(text, replace);
      closeIoModal();
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
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    if (savedKey) geminiApiKeyInput.value = savedKey;

    const saveKey = () => {
      localStorage.setItem('gemini_api_key', geminiApiKeyInput.value.trim());
    };
    geminiApiKeyInput.addEventListener('input', saveKey);
    geminiApiKeyInput.addEventListener('change', saveKey);
  }

  if (aiSendBtn) aiSendBtn.addEventListener('click', () => handleGeminiSubmit(false));
  if (aiMindmapBtn) aiMindmapBtn.addEventListener('click', () => handleGeminiSubmit(true));
  if (aiFullmapBtn) aiFullmapBtn.addEventListener('click', () => handleGenerateFullMap());

  if (aiInput) {
    aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGeminiSubmit(false);
      }
    });
  }
}

// Gemini AI Panel Functions
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

// Private Local Configuration Key (loaded from config.js)
const BUILTIN_GEMINI_API_KEY = (typeof window !== 'undefined' && window.LOCAL_GEMINI_KEY) || '';

function getGeminiApiKey() {
  return ((typeof window !== 'undefined' && window.LOCAL_GEMINI_KEY) || BUILTIN_GEMINI_API_KEY || (geminiApiKeyInput?.value) || localStorage.getItem('gemini_api_key') || '').trim();
}

async function callGeminiApi(prompt) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-3.6-flash'];
  for (const model of candidateModels) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply;
      console.warn(`Model ${model} response:`, data);
    } catch (err) {
      console.warn(`Model ${model} fetch failed:`, err);
    }
  }
  return null;
}

async function handleGeminiSubmit(spawnToMap = false) {
  const query = aiInput.value.trim();
  if (!query) return;

  addAiChatMessage('user', query);
  aiInput.value = '';

  addAiChatMessage('bot', 'Thinking...');
  try {
    const prompt = query + (spawnToMap ? ' (Respond with concise bullet points suitable for mind map nodes)' : '');
    const reply = await callGeminiApi(prompt);

    const thinkingMsg = aiChatLog.querySelector('.ai-msg.bot:last-child');
    if (thinkingMsg && thinkingMsg.innerText === 'Thinking...') thinkingMsg.remove();

    if (reply) {
      addAiChatMessage('bot', reply);
      if (spawnToMap) parseAndSpawnMindMapNodes(reply);
    } else {
      addAiChatMessage('bot', 'Could not retrieve response. Please try again.');
    }
  } catch (e) {
    const thinkingMsg = aiChatLog.querySelector('.ai-msg.bot:last-child');
    if (thinkingMsg && thinkingMsg.innerText === 'Thinking...') thinkingMsg.remove();
    addAiChatMessage('bot', 'Connection Error: Unable to reach Gemini API.');
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

// FEATURE 2: On-Canvas "AI Expand This Branch"
async function aiExpandNode(nodeId, triggerBtn = null) {
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return;

  const originalBtnText = triggerBtn ? triggerBtn.innerText : '';
  if (triggerBtn) {
    triggerBtn.innerText = 'Expanding...';
    triggerBtn.disabled = true;
  }

  // Find ancestor chain for context
  let ancestors = [];
  let curr = node;
  let safety = 0;
  while (curr && (curr.parentId || (curr.parentIds && curr.parentIds[0])) && safety < 10) {
    safety++;
    const pId = (curr.parentIds && curr.parentIds[0]) || curr.parentId;
    curr = state.nodes.find(n => n.id === pId);
    if (curr && (curr.body || curr.title)) ancestors.unshift((curr.body || curr.title).trim());
  }
  const contextStr = ancestors.length > 0 ? `Context path: ${ancestors.join(' -> ')} -> ` : '';
  const nodeTopic = (node.body || node.title || 'Topic').trim();

  try {
    const prompt = `You are an expert mind-mapping brainstorming assistant. ${contextStr}Current Box: "${nodeTopic}". Generate 3 to 4 concise, high-impact sub-topics, next steps, or key components that branch off this topic. Rules: Only return a plain bulleted list (- item). Keep each bullet short (3 to 6 words). No markdown headers, no conversational chatter.`;
    const reply = await callGeminiApi(prompt);
    if (reply) {
      spawnBulletsAsChildren(node, reply);
      addAiChatMessage('bot', `Expanded "${nodeTopic}" with sub-branches on your canvas.`);
    } else {
      const fallbackBullets = [
        `Key Strategy for ${nodeTopic}`,
        `Execution & Next Steps`,
        `Tools & Resources`,
        `Review & Optimization`
      ].map(b => `- ${b}`).join('\n');
      spawnBulletsAsChildren(node, fallbackBullets);
      addAiChatMessage('bot', `Generated smart sub-branches for "${nodeTopic}".`);
    }
  } catch (e) {
    addAiChatMessage('bot', 'Connection Error: Unable to reach Gemini API.');
  }

  if (triggerBtn) {
    triggerBtn.innerText = originalBtnText || 'AI Expand';
    triggerBtn.disabled = false;
  }
}

function spawnBulletsAsChildren(parentNode, text) {
  const lines = text.split('\n')
    .map(l => l.replace(/^[\*\-\•\d\.]+\s*/, '').trim())
    .filter(l => l.length > 0);
  if (lines.length === 0) return;

  if (parentNode.collapsed) parentNode.collapsed = false;

  const existingChildren = state.nodes.filter(n => (n.parentIds && n.parentIds.includes(parentNode.id)) || n.parentId === parentNode.id);
  const startX = parentNode.x + (parentNode.width || 200) + 60;
  const startY = existingChildren.length > 0
    ? Math.max(...existingChildren.map(c => c.y + (c.height || 50))) + 16
    : parentNode.y - ((lines.length - 1) * 35);

  lines.slice(0, 5).forEach((line, idx) => {
    spawnNode('', line, [], [], startX, startY + (idx * 65), parentNode.id);
  });
  renderCanvas();
  saveState();
}

// FEATURE 2: Generate Full Topic Tree in AI Panel
async function handleGenerateFullMap() {
  const query = aiInput.value.trim();
  if (!query) {
    addAiChatMessage('bot', 'Please enter a topic in the text box first (e.g. "Launch a coffee shop" or "Build a mobile app").');
    return;
  }
  addAiChatMessage('user', `Generate full mind map for: "${query}"`);
  aiInput.value = '';

  addAiChatMessage('bot', `Generating structured mind map for "${query}"...`);
  try {
    const prompt = `Create a structured mind map for: "${query}". Format as an indented Markdown bullet outline using dashes (-). Level 1 is the main topic, Level 2 are 3-4 major pillars, Level 3 are 2-3 specific action items or subtopics under each pillar. Output ONLY the indented markdown bullet list.`;
    const reply = await callGeminiApi(prompt);
    if (reply) {
      importMarkdownToCanvas(reply, false);
      addAiChatMessage('bot', `Rendered complete mind map for "${query}"!`);
    } else {
      const template = `- ${query}\n  - Research & Strategy\n    - Define Core Goals\n    - Target Audience & Scope\n  - Execution & Build\n    - Essential Tools & Setup\n    - Core Deliverables\n  - Launch & Growth\n    - Rollout & Promotion\n    - Review & Feedback`;
      importMarkdownToCanvas(template, false);
      addAiChatMessage('bot', `Rendered structured mind map for "${query}".`);
    }
  } catch (e) {
    addAiChatMessage('bot', 'Connection Error: Unable to reach Gemini API.');
  }
}

// FEATURE 4: Markdown Outline Import & Export (Plus PNG Export)
function generateMarkdownOutline() {
  const rootNodes = state.nodes.filter(n => (!n.parentIds || n.parentIds.length === 0) && !n.parentId);
  const nodesToProcess = rootNodes.length > 0 ? rootNodes : state.nodes;

  let visited = new Set();
  let result = '';

  function traverse(n, depth = 0) {
    if (visited.has(n.id)) return;
    visited.add(n.id);

    const indent = '  '.repeat(depth);
    const text = (n.body || n.title || 'Untitled Node').trim().replace(/\n+/g, ' ');
    result += `${indent}- ${text}\n`;

    const children = state.nodes.filter(c => (c.parentIds && c.parentIds.includes(n.id)) || c.parentId === n.id);
    children.forEach(child => traverse(child, depth + 1));
  }

  nodesToProcess.forEach(r => traverse(r, 0));
  return result;
}

function importMarkdownToCanvas(mdText, replace = true) {
  if (!mdText || !mdText.trim()) return;

  if (replace) {
    state.nodes = [];
  }

  const lines = mdText.split('\n');
  const levelStack = []; // [{ level, id, x, y, childCount }]

  const baseStartX = replace ? 150 : ((-state.panX + window.innerWidth / 2) / state.scale - 100);
  const baseStartY = replace ? 150 : ((-state.panY + window.innerHeight / 2) / state.scale - 100);

  let rootCount = 0;

  lines.forEach(line => {
    if (!line.trim()) return;

    // Determine indentation level
    const matchIndent = line.match(/^(\s*)/);
    const leadingSpaces = matchIndent ? matchIndent[1].replace(/\t/g, '  ').length : 0;
    const level = Math.floor(leadingSpaces / 2);

    // Clean text
    const text = line.replace(/^[\s\*\-\+\#\d\.\>]+/, '').trim();
    if (!text) return;

    // Pop stack to find parent
    while (levelStack.length > 0 && levelStack[levelStack.length - 1].level >= level) {
      levelStack.pop();
    }

    const parent = levelStack.length > 0 ? levelStack[levelStack.length - 1] : null;

    let posX, posY;
    if (!parent) {
      posX = baseStartX;
      posY = baseStartY + (rootCount * 180);
      rootCount++;
    } else {
      parent.childCount = (parent.childCount || 0) + 1;
      posX = parent.x + 270;
      posY = parent.y + ((parent.childCount - 1) * 75);
    }

    const newNode = {
      id: 'box-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
      title: '',
      body: text,
      media: [],
      files: [],
      x: posX,
      y: posY,
      parentId: parent ? parent.id : null,
      parentIds: parent ? [parent.id] : [],
      collapsed: false
    };

    state.nodes.push(newNode);
    levelStack.push({ level, id: newNode.id, x: posX, y: posY, childCount: 0 });
  });

  if (state.nodes.length > 0) {
    state.selectedNodeId = state.nodes[0].id;
  }

  renderCanvas();
  saveState();
}

function exportCanvasToPng() {
  if (state.nodes.length === 0) {
    alert('Canvas is empty.');
    return;
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  state.nodes.forEach(n => {
    if (isNodeHiddenByCollapse(n)) return;
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + (n.width || 220));
    maxY = Math.max(maxY, n.y + (n.height || 80));
  });

  if (minX === Infinity) {
    minX = 0; minY = 0; maxX = 800; maxY = 600;
  }

  const padding = 60;
  const width = Math.max(800, Math.round(maxX - minX + padding * 2));
  const height = Math.max(600, Math.round(maxY - minY + padding * 2));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const isDark = state.theme !== 'light';
  ctx.fillStyle = isDark ? '#141417' : '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = isDark ? '#334155' : '#94a3b8';

  // Draw connections
  state.nodes.forEach(node => {
    if (isNodeHiddenByCollapse(node)) return;
    const parentIds = Array.isArray(node.parentIds) ? node.parentIds : (node.parentId ? [node.parentId] : []);
    parentIds.forEach(pId => {
      const parent = state.nodes.find(n => n.id === pId);
      if (!parent || isNodeHiddenByCollapse(parent) || parent.collapsed) return;

      const x1 = parent.x - minX + padding + (parent.width || 200);
      const y1 = parent.y - minY + padding + 25;
      const x2 = node.x - minX + padding;
      const y2 = node.y - minY + padding + 25;
      const dx = Math.max(30, Math.abs(x2 - x1) * 0.5);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(x1 + dx, y1, x2 - dx, y2, x2, y2);
      ctx.stroke();
    });
  });

  // Draw nodes
  state.nodes.forEach(node => {
    if (isNodeHiddenByCollapse(node)) return;
    const nx = node.x - minX + padding;
    const ny = node.y - minY + padding;
    const nw = node.width || 200;
    const nh = Math.max(48, node.height || 48);

    ctx.fillStyle = isDark ? '#1b1b20' : '#f8fafc';
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;

    const r = 6;
    ctx.beginPath();
    ctx.moveTo(nx + r, ny);
    ctx.lineTo(nx + nw - r, ny);
    ctx.quadraticCurveTo(nx + nw, ny, nx + nw, ny + r);
    ctx.lineTo(nx + nw, ny + nh - r);
    ctx.quadraticCurveTo(nx + nw, ny + nh, nx + nw - r, ny + nh);
    ctx.lineTo(nx + r, ny + nh);
    ctx.quadraticCurveTo(nx, ny + nh, nx, ny + nh - r);
    ctx.lineTo(nx, ny + r);
    ctx.quadraticCurveTo(nx, ny, nx + r, ny);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isDark ? '#f4f4f5' : '#0f172a';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const text = node.body || node.title || 'Untitled';
    ctx.fillText(text.length > 28 ? text.slice(0, 26) + '...' : text, nx + 12, ny + 28);
  });

  const link = document.createElement('a');
  link.download = 'mindmap.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Open / Close I/O Modal
function openIoModal(tab = 'export') {
  if (!ioModal) return;
  ioModal.classList.remove('hidden');
  showIoTab(tab);
}

function closeIoModal() {
  if (!ioModal) return;
  ioModal.classList.add('hidden');
}

function showIoTab(tab) {
  if (tab === 'export') {
    ioTabExportBtn?.classList.add('active');
    ioTabImportBtn?.classList.remove('active');
    ioExportPanel?.classList.remove('hidden');
    ioImportPanel?.classList.add('hidden');
    if (ioExportText) ioExportText.value = generateMarkdownOutline();
  } else {
    ioTabImportBtn?.classList.add('active');
    ioTabExportBtn?.classList.remove('active');
    ioImportPanel?.classList.remove('hidden');
    ioExportPanel?.classList.add('hidden');
    if (ioImportText) ioImportText.focus();
  }
}

// Reliable Initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
