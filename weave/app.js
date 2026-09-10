// ==========================================================================
// PROJECTS MAP — MINIMAL DESIGN STUDIO ENGINE
// Responsive Visual Project Workspace
// ==========================================================================

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
      note: '',
      media: [],
      files: [],
      color: '#e67e22',
      hasCheckbox: false,
      isCompleted: false,
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
const drawerOverlay = document.getElementById('drawer-overlay');
const sidebar = document.getElementById('sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const ideaSearch = document.getElementById('idea-search');
const ideasList = document.getElementById('ideas-list');

// Floating Dock & Popovers
const floatingDock = document.getElementById('floating-dock');
const dockAddBtn = document.getElementById('dock-add-btn');
const dockSearchBtn = document.getElementById('dock-search-btn');
const dockAiBtn = document.getElementById('dock-ai-btn');
const dockMoreBtn = document.getElementById('dock-more-btn');

const createMenu = document.getElementById('create-menu');
const createIdeaBtn = document.getElementById('create-idea-btn');
const createBranchBtn = document.getElementById('create-branch-btn');
const createMediaBtn = document.getElementById('create-media-btn');

const moreMenu = document.getElementById('more-menu');
const moreFullscreenBtn = document.getElementById('more-fullscreen-btn');
const moreAutoLayoutBtn = document.getElementById('more-auto-layout-btn');
const moreFitMapBtn = document.getElementById('more-fit-map-btn');
const moreIdeasBtn = document.getElementById('more-ideas-btn');
const moreIoBtn = document.getElementById('more-io-btn');
const moreThemeBtn = document.getElementById('more-theme-btn');

// Floating Zoom Pill & Zoom Menu
const floatingZoomPill = document.getElementById('floating-zoom-pill');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomLevelBtn = document.getElementById('zoom-level-btn');
const zoomLevelEl = document.getElementById('zoom-level');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomMenu = document.getElementById('zoom-menu');
const zoomFullscreenBtn = document.getElementById('zoom-fullscreen-btn');
const zoomFitBtn = document.getElementById('zoom-fit-btn');
const zoomResetBtn = document.getElementById('zoom-reset-btn');
const zoomCenterBtn = document.getElementById('zoom-center-btn');

// Command Palette
const commandPaletteModal = document.getElementById('command-palette-modal');
const cmdPaletteInput = document.getElementById('cmd-palette-input');
const cmdPaletteResults = document.getElementById('cmd-palette-results');
let activePaletteIndex = 0;

// AI Project Copilot Elements
const aiChatPanel = document.getElementById('ai-chat-panel');
const closeAiBtn = document.getElementById('close-ai-btn');
const aiContextIndicator = document.getElementById('ai-context-indicator');
const aiQuickChips = document.getElementById('ai-quick-chips');
const aiChatLog = document.getElementById('ai-chat-log');
const aiInput = document.getElementById('ai-input');
const aiSendBtn = document.getElementById('ai-send-btn');
const aiImageBtn = document.getElementById('ai-image-btn');
const aiMindmapBtn = document.getElementById('ai-mindmap-btn');
const aiFullmapBtn = document.getElementById('ai-fullmap-btn');

// AI Preview Banner & State
const aiPreviewBanner = document.getElementById('ai-preview-banner');
const aiAcceptBtn = document.getElementById('ai-accept-btn');
const aiUndoBtn = document.getElementById('ai-undo-btn');
let lastAiAddedNodeIds = [];

// Floating Node Context Menu & Colors
const nodeContextMenu = document.getElementById('node-context-menu');
let contextActiveNodeId = null;
const hiddenImagePicker = document.getElementById('hidden-image-picker');
const hiddenFilePicker = document.getElementById('hidden-file-picker');
const BRANCH_COLORS = ['#e67e22', '#00cec9', '#e84393', '#6c5ce7', '#2ecc71', '#f1c40f', '#0984e3'];

// Hidden General Media Picker
const mediaPickerGeneral = document.createElement('input');
mediaPickerGeneral.type = 'file';
mediaPickerGeneral.accept = 'image/*,video/*';

let activeNodeForImageUpload = null;
let activeNodeForFileUpload = null;

// Box Modal Elements
let activeModalNodeId = null;
const boxModalOverlay = document.getElementById('box-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const boxModalBody = document.getElementById('box-modal-body');
const boxModalNote = document.getElementById('box-modal-note');
const boxModalMedia = document.getElementById('box-modal-media');
const boxModalFiles = document.getElementById('box-modal-files');
const modalAddImgBtn = document.getElementById('modal-add-img-btn');
const modalAddVidBtn = document.getElementById('modal-add-vid-btn');
const modalAddFileBtn = document.getElementById('modal-add-file-btn');
const modalDeleteBtn = document.getElementById('modal-delete-btn');
const modalAiExpandBtn = document.getElementById('modal-ai-expand-btn');
const modalWeaveBtn = document.getElementById('modal-weave-btn');
const modalOrchestrateBtn = document.getElementById('modal-orchestrate-btn');

// Weave Suggestions Dock Elements
const weaveDock = document.getElementById('weave-dock');
const weaveTargetTitle = document.getElementById('weave-target-title');
const weaveStatusHint = document.getElementById('weave-status-hint');
const weaveAutoToggle = document.getElementById('weave-auto-toggle');
const weaveRefreshBtn = document.getElementById('weave-refresh-btn');
const weaveCloseBtn = document.getElementById('weave-close-btn');
const weaveSuggestionsList = document.getElementById('weave-suggestions-list');
const weaveCustomInput = document.getElementById('weave-custom-input');
const weaveAddCustomBtn = document.getElementById('weave-add-custom-btn');
const dockWeaveBtn = document.getElementById('dock-weave-btn');
const dockOrchBtn = document.getElementById('dock-orch-btn');

// Execution Orchestrator Elements
const orchestratorModal = document.getElementById('orchestrator-modal');
const closeOrchestratorBtn = document.getElementById('close-orchestrator-btn');
const orchNodeTitle = document.getElementById('orch-node-title');
const orchNodePath = document.getElementById('orch-node-path');
const orchGenerateBtn = document.getElementById('orch-generate-btn');
const orchCopyPromptBtn = document.getElementById('orch-copy-prompt-btn');
const orchSaveNotesBtn = document.getElementById('orch-save-notes-btn');
const orchStatusBar = document.getElementById('orch-status-bar');
const orchOutputArea = document.getElementById('orch-output-area');
let activeOrchNodeId = null;
let lastGeneratedOrchPrompt = '';

// AI Settings Elements
const moreSettingsBtn = document.getElementById('more-settings-btn');
const aiSettingsModal = document.getElementById('ai-settings-modal');
const closeAiSettingsBtn = document.getElementById('close-ai-settings-btn');
const aiProviderSelect = document.getElementById('ai-provider-select');
const geminiKeyInput = document.getElementById('gemini-key-input');
const claudeKeyInput = document.getElementById('claude-key-input');
const openaiKeyInput = document.getElementById('openai-key-input');
const settingsAutoWeave = document.getElementById('settings-auto-weave');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const settingsSaveFeedback = document.getElementById('settings-save-feedback');

let currentAiProvider = localStorage.getItem('mind_ai_provider') || 'gemini';
let autoWeaveEnabled = localStorage.getItem('mind_auto_weave') !== 'false';
let currentWeaveNodeId = null;
let weaveDebounceTimer = null;

// I/O Modal Elements
const ioModal = document.getElementById('io-modal');
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

// Pointer & Interaction Tracking State
const activePointers = new Map();
let isPanningCanvas = false;
let panStartX = 0;
let panStartY = 0;

let draggingCardNode = null;
let grabOffsetX = 0;
let grabOffsetY = 0;
let potentialDrag = null;

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
let pinchFocalPoint = { x: 0, y: 0 };

let lastCanvasTapTime = 0;
let lastCanvasTapPos = { x: 0, y: 0 };

// ==========================================================================
// Theme Management
// ==========================================================================
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
    const colors = { dark: '#0e0f13', light: '#ffffff', grey: '#1e2025' };
    metaTheme.setAttribute('content', colors[themeName] || '#0e0f13');
  }
}

function cycleTheme() {
  const order = ['dark', 'light', 'grey'];
  const currentIdx = order.indexOf(state.theme || 'dark');
  const nextTheme = order[(currentIdx + 1) % order.length];
  setTheme(nextTheme);
  saveState();
}

// ==========================================================================
// LocalStorage Persistence
// ==========================================================================
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
      note: typeof n.note === 'string' ? n.note : '',
      color: n.color || null,
      hasCheckbox: !!n.hasCheckbox,
      isCompleted: !!n.isCompleted,
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

// ==========================================================================
// Intelligent Viewport & Auto-Fit
// ==========================================================================
function fitMapToScreen(paddingPercent = 0.15) {
  const visibleNodes = state.nodes.filter(n => !isNodeHiddenByCollapse(n));
  if (visibleNodes.length === 0) {
    state.scale = 1;
    state.panX = 0;
    state.panY = 0;
    updateTransform();
    return;
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  visibleNodes.forEach(n => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + (n.width || 180));
    maxY = Math.max(maxY, n.y + (n.height || 50));
  });

  const boundingW = Math.max(maxX - minX, 120);
  const boundingH = Math.max(maxY - minY, 80);
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  const targetW = viewW * (1 - paddingPercent * 2);
  const targetH = viewH * (1 - paddingPercent * 2);

  let targetScale = Math.min(targetW / boundingW, targetH / boundingH);
  targetScale = Math.min(Math.max(0.4, targetScale), 1.2);

  const mapCenterX = minX + boundingW / 2;
  const mapCenterY = minY + boundingH / 2;

  state.scale = targetScale;
  state.panX = (viewW / 2) - (mapCenterX * targetScale);
  state.panY = (viewH / 2) - (mapCenterY * targetScale);

  updateTransform();
  saveState();
}

function centerSelectedNode() {
  const sel = state.nodes.find(n => n.id === state.selectedNodeId) || state.nodes[0];
  if (!sel) return;
  const nodeW = sel.width || 180;
  const nodeH = sel.height || 48;
  state.panX = (window.innerWidth / 2) - ((sel.x + nodeW / 2) * state.scale);
  state.panY = (window.innerHeight / 2) - ((sel.y + nodeH / 2) * state.scale);
  updateTransform();
  saveState();
}

function updateTransform() {
  nodesLayer.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
  connectionsGroup.setAttribute('transform', `translate(${state.panX}, ${state.panY}) scale(${state.scale})`);
  if (zoomLevelEl) zoomLevelEl.innerText = `${Math.round(state.scale * 100)}%`;
}

// ==========================================================================
// Branch Collapse / Expand Helpers
// ==========================================================================
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

// ==========================================================================
// Node Creation & Tree Navigation Helpers
// ==========================================================================
function createChildNode(parentNode) {
  if (!parentNode) {
    const centerX = (-state.panX + window.innerWidth / 2) / state.scale - 90;
    const centerY = (-state.panY + window.innerHeight / 2) / state.scale - 25;
    return spawnNode('', 'New Idea', [], [], centerX, centerY);
  }
  if (parentNode.collapsed) {
    parentNode.collapsed = false;
  }
  const children = state.nodes.filter(n => (n.parentIds && n.parentIds.includes(parentNode.id)) || n.parentId === parentNode.id);
  const childX = parentNode.x + (parentNode.width || 180) + 60;
  let childY = parentNode.y;
  if (children.length > 0) {
    const maxY = Math.max(...children.map(c => c.y + (c.height || 48)));
    childY = maxY + 16;
  }
  const newNode = spawnNode('', '', [], [], childX, childY, parentNode.id, parentNode.color);
  return newNode;
}

function createSiblingNode(node) {
  if (!node) return null;
  const parentId = (node.parentIds && node.parentIds[0]) || node.parentId || null;
  let childX = node.x;
  let childY = node.y + (node.height || 48) + 16;
  if (parentId) {
    const parent = state.nodes.find(n => n.id === parentId);
    if (parent && parent.collapsed) parent.collapsed = false;
    const siblings = state.nodes.filter(n => (n.parentIds && n.parentIds.includes(parentId)) || n.parentId === parentId);
    if (siblings.length > 0) {
      const maxY = Math.max(...siblings.map(s => s.y + (s.height || 48)));
      childY = maxY + 16;
    }
  }
  const newNode = spawnNode('', '', [], [], childX, childY, parentId, node.color);
  return newNode;
}

function spawnNode(title = '', body = '', media = [], files = [], x = null, y = null, parentId = null, nodeColor = null) {
  const pIds = parentId ? [parentId] : [];
  const newNode = {
    id: 'box-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
    title: title || '',
    body: body || '',
    note: '',
    media: media || [],
    files: files || [],
    color: nodeColor || null,
    hasCheckbox: false,
    isCompleted: false,
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
  updateCopilotContextBadge();
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
  updateCopilotContextBadge();
}

function selectNode(nodeId) {
  state.selectedNodeId = nodeId;
  document.querySelectorAll('.text-box-card.selected').forEach(c => c.classList.remove('selected'));
  const target = nodesLayer.querySelector(`[data-node-id="${nodeId}"]`);
  if (target) target.classList.add('selected');
  updateCopilotContextBadge();
  requestAnimationFrame(renderConnections);

  if (autoWeaveEnabled && nodeId) {
    debounceWeaveSuggest(nodeId);
  }
}

function focusNodeText(nodeId) {
  selectNode(nodeId);
  requestAnimationFrame(() => {
    const card = nodesLayer.querySelector(`[data-node-id="${nodeId}"]`);
    if (card) {
      const bodyEl = card.querySelector('.box-body');
      if (bodyEl) {
        bodyEl.focus();
        try {
          const range = document.createRange();
          range.selectNodeContents(bodyEl);
          range.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (e) {}
      }
    }
  });
}

function focusNodeNote(nodeId) {
  selectNode(nodeId);
  requestAnimationFrame(() => {
    const card = nodesLayer.querySelector(`[data-node-id="${nodeId}"]`);
    if (card) {
      const noteEl = card.querySelector('.box-note-body');
      if (noteEl) {
        noteEl.focus();
        try {
          const range = document.createRange();
          range.selectNodeContents(noteEl);
          range.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (e) {}
      }
    }
  });
}

// ==========================================================================
// Render Canvas & Quiet Cards
// ==========================================================================
function renderCanvas() {
  nodesLayer.innerHTML = '';

  state.nodes.forEach(node => {
    const isHidden = isNodeHiddenByCollapse(node);

    const card = document.createElement('div');
    card.className = `text-box-card ${state.selectedNodeId === node.id ? 'selected' : ''} ${isHidden ? 'node-collapsed-hidden' : ''} ${node.isCompleted ? 'completed' : ''}`;
    card.style.left = `${node.x}px`;
    card.style.top = `${node.y}px`;
    if (node.width) card.style.width = `${node.width}px`;
    if (node.height) card.style.height = `${node.height}px`;
    card.dataset.nodeId = node.id;

    if (node.color) {
      card.style.borderLeft = `3.5px solid ${node.color}`;
      card.dataset.hasColor = 'true';
    }

    // Collapse / Expand Pill on right edge
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

    // Media & Files
    let mediaHtml = '';
    if (node.media && node.media.length > 0) {
      mediaHtml = '<div class="box-media-list">';
      node.media.forEach((m, idx) => {
        if (m.type === 'video') {
          mediaHtml += `
            <div class="media-item">
              <video src="${m.url}" controls playsinline class="box-media-video"></video>
              <button type="button" class="media-remove-btn" data-type="media" data-idx="${idx}">Remove Video</button>
            </div>
          `;
        } else {
          mediaHtml += `
            <div class="media-item">
              <img src="${m.url}" class="box-media-img" alt="Attached Image" />
              <button type="button" class="media-remove-btn" data-type="media" data-idx="${idx}">Remove Image</button>
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
            <button type="button" class="media-remove-btn" data-type="file" data-idx="${idx}">Remove File</button>
          </div>
        `;
      });
      filesHtml += '</div>';
    }

    const checkboxHtml = node.hasCheckbox ? `
      <input type="checkbox" class="node-checkbox" ${node.isCompleted ? 'checked' : ''} title="Mark done">
    ` : '';

    const noteHtml = (node.note && node.note.trim()) ? `
      <div class="box-note-area">
        <div class="box-note-header">
          <span class="box-note-label">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
            Note
          </span>
          <button type="button" class="box-note-delete-btn" title="Delete Note">&times;</button>
        </div>
        <div class="box-note-body" contenteditable="true" data-placeholder="Type note details...">${escapeHtml(node.note)}</div>
      </div>
    ` : '';

    card.innerHTML = `
      <div class="port-dot left" title="Connect Here"></div>
      <div class="port-dot right" title="Drag Wire to Connect"></div>
      <div class="port-dot top" title="Drag Wire to Connect"></div>
      <div class="port-dot bottom" title="Drag Wire to Connect"></div>

      <div style="display:flex;align-items:flex-start;gap:4px;">
        ${checkboxHtml}
        <div class="box-body" contenteditable="true" data-placeholder="Type idea here...">${escapeHtml(node.body || '')}</div>
      </div>

      ${noteHtml}
      ${mediaHtml}
      ${filesHtml}

      <div class="box-strip">
        <button type="button" class="strip-btn add-child-btn" title="Add Branch (+)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Branch</span>
        </button>
        <button type="button" class="strip-btn card-ai-btn" title="AI Expand this idea">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
          <span>AI</span>
        </button>
        <button type="button" class="strip-btn options-btn" title="Color & Actions">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>
        </button>
      </div>
      <div class="resize-handle" title="Resize"></div>
    `;

    const bodyEl = card.querySelector('.box-body');

    bodyEl.addEventListener('focus', () => {
      selectNode(node.id);
    });

    bodyEl.addEventListener('pointerdown', (e) => {
      // If actively focused and typing, stop propagation to allow native text selection
      if (document.activeElement === bodyEl) {
        e.stopPropagation();
        return;
      }
      // If not focused, allow bubbling to card so tablet users can drag the node
    });

    bodyEl.addEventListener('dblclick', (e) => {
      // Allow native double-click word selection without opening modals
      e.stopPropagation();
    });

    bodyEl.addEventListener('input', () => {
      node.body = bodyEl.innerText;
      requestAnimationFrame(renderConnections);
      saveState();
      updateCopilotContextBadge();
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

    const noteBodyEl = card.querySelector('.box-note-body');
    if (noteBodyEl) {
      noteBodyEl.addEventListener('focus', () => selectNode(node.id));
      noteBodyEl.addEventListener('pointerdown', (e) => {
        if (document.activeElement === noteBodyEl) {
          e.stopPropagation();
          return;
        }
      });
      noteBodyEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
      });
      noteBodyEl.addEventListener('input', () => {
        node.note = noteBodyEl.innerText;
        requestAnimationFrame(renderConnections);
        saveState();
      });
      noteBodyEl.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') noteBodyEl.blur();
      });
    }

    const noteDeleteBtn = card.querySelector('.box-note-delete-btn');
    if (noteDeleteBtn) {
      noteDeleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        node.note = '';
        saveState();
        renderCanvas();
      });
    }

    // Checkbox toggle
    const chk = card.querySelector('.node-checkbox');
    if (chk) {
      chk.addEventListener('change', (e) => {
        e.stopPropagation();
        node.isCompleted = chk.checked;
        card.classList.toggle('completed', node.isCompleted);
        saveState();
      });
      chk.addEventListener('pointerdown', (e) => e.stopPropagation());
    }

    // Quick Action: + Branch
    const addChildBtn = card.querySelector('.add-child-btn');
    if (addChildBtn) {
      addChildBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const child = createChildNode(node);
        if (child) focusNodeText(child.id);
      });
    }

    // Quick Action: ✦ In-Box AI Expand
    const cardAiBtn = card.querySelector('.card-ai-btn');
    if (cardAiBtn) {
      cardAiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectNode(node.id);
        const text = (node.body || node.title || '').trim();
        if (!text) {
          focusNodeText(node.id);
          return;
        }
        aiExpandNode(node.id, cardAiBtn);
      });
      cardAiBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
    }

    // Quick Action: ••• Options Context Menu
    const optBtn = card.querySelector('.options-btn');
    if (optBtn) {
      optBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectNode(node.id);
        const rect = optBtn.getBoundingClientRect();
        openNodeContextMenu(node, rect.left, rect.bottom + 6);
      });
    }

    // Right-click opens context menu
    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectNode(node.id);
      openNodeContextMenu(node, e.clientX, e.clientY);
    });

    // Resize Handle
    const handle = card.querySelector('.resize-handle');
    if (handle) {
      handle.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        isResizingCardNode = node;
        try { handle.setPointerCapture(e.pointerId); } catch (err) {}
        const rect = card.getBoundingClientRect();
        resizeStartWidth = rect.width / state.scale;
        resizeStartHeight = rect.height / state.scale;
        resizeStartPointerX = e.clientX;
        resizeStartPointerY = e.clientY;
      });

      handle.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        cycleNodeSize(node);
      });
    }

    // Port Dot Linking
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

    // Pointer Drag on Card (Entire card is draggable; tap to edit)
    card.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || e.target.closest('video') || e.target.closest('a') || e.target.closest('.port-dot') || e.target.closest('.resize-handle') || e.target.closest('.collapse-toggle-btn') || e.target.classList.contains('node-checkbox')) return;

      const isTextBody = (e.target === bodyEl || (noteBodyEl && e.target === noteBodyEl) || !!e.target.closest('.box-body') || !!e.target.closest('.box-note-body'));
      const isFocusedText = document.activeElement === e.target && (e.target.isContentEditable || e.target.tagName === 'INPUT');

      // If user is already actively typing inside this text field, allow cursor placement
      if (isFocusedText && isTextBody) {
        return;
      }

      e.stopPropagation();
      selectNode(node.id);
      closeAllPopovers();

      const canvasRect = canvasContainer.getBoundingClientRect();
      const pointerCanvasX = (e.clientX - canvasRect.left - state.panX) / state.scale;
      const pointerCanvasY = (e.clientY - canvasRect.top - state.panY) / state.scale;

      const grabX = pointerCanvasX - node.x;
      const grabY = pointerCanvasY - node.y;

      potentialDrag = {
        node: node,
        card: card,
        startX: e.clientX,
        startY: e.clientY,
        grabOffsetX: grabX,
        grabOffsetY: grabY,
        pointerId: e.pointerId,
        targetEl: e.target,
        isTouch: e.pointerType === 'touch' || e.pointerType === 'pen',
        isEditable: isTextBody
      };
      try { card.setPointerCapture(e.pointerId); } catch (err) {}
    });

    nodesLayer.appendChild(card);
  });

  renderConnections();
}

// ==========================================================================
// SVG Connections (Smooth Bezier Curves)
// ==========================================================================
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

      const parentH = parentEl ? parentEl.offsetHeight : 44;
      const parentW = parentEl ? parentEl.offsetWidth : 180;
      const childH = childEl ? childEl.offsetHeight : 44;
      const childW = childEl ? childEl.offsetWidth : 180;

      let x1, y1, x2, y2;
      if (node.x >= parent.x) {
        x1 = parent.x + parentW;
        y1 = parent.y + (parentH / 2);
        x2 = node.x;
        y2 = node.y + (childH / 2);
      } else {
        x1 = parent.x;
        y1 = parent.y + (parentH / 2);
        x2 = node.x + childW;
        y2 = node.y + (childH / 2);
      }

      const dx = Math.max(30, Math.abs(x2 - x1) * 0.5);
      const pathD = `M ${x1} ${y1} C ${x1 + (node.x >= parent.x ? dx : -dx)} ${y1}, ${x2 + (node.x >= parent.x ? -dx : dx)} ${y2}, ${x2} ${y2}`;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('class', 'connection-path' + (node.id === state.selectedNodeId || parent.id === state.selectedNodeId ? ' active' : ''));

      const connColor = node.color || parent.color;
      if (connColor) {
        path.style.stroke = connColor;
        path.style.strokeWidth = (node.id === state.selectedNodeId || parent.id === state.selectedNodeId) ? '2.4px' : '1.8px';
      }

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
      const srcH = srcEl ? srcEl.offsetHeight : 44;
      const srcW = srcEl ? srcEl.offsetWidth : 180;

      const x1 = srcNode.x + srcW;
      const y1 = srcNode.y + (srcH / 2);
      const x2 = linkingTempPos.x;
      const y2 = linkingTempPos.y;
      const dx = Math.max(30, Math.abs(x2 - x1) * 0.5);

      const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tempPath.setAttribute('d', pathD);
      tempPath.setAttribute('class', 'connection-path active');
      if (srcNode.color) tempPath.style.stroke = srcNode.color;
      connectionsGroup.appendChild(tempPath);
    }
  }
}

// ==========================================================================
// Global Pointer Navigation (Pan, Pinch Zoom, Focal Wheel Zoom)
// ==========================================================================
function setupGlobalPointerMovement() {
  window.addEventListener('pointermove', (e) => {
    if (potentialDrag) {
      const sel = window.getSelection ? window.getSelection().toString() : '';
      if (sel && sel.length > 0) {
        potentialDrag = null;
        return;
      }

      const dist = Math.hypot(e.clientX - potentialDrag.startX, e.clientY - potentialDrag.startY);
      if (dist > 5) {
        e.preventDefault();
        draggingCardNode = potentialDrag.node;
        grabOffsetX = potentialDrag.grabOffsetX;
        grabOffsetY = potentialDrag.grabOffsetY;
        potentialDrag.card.classList.add('dragging');
        try { potentialDrag.card.setPointerCapture(potentialDrag.pointerId); } catch (err) {}

        if (document.activeElement && (document.activeElement.isContentEditable || document.activeElement.tagName === 'INPUT')) {
          document.activeElement.blur();
        }
        potentialDrag = null;
      }
    }

    if (isResizingCardNode) {
      const dx = (e.clientX - resizeStartPointerX) / state.scale;
      const dy = (e.clientY - resizeStartPointerY) / state.scale;
      const newW = Math.max(120, Math.min(800, Math.round(resizeStartWidth + dx)));
      const newH = Math.max(34, Math.min(600, Math.round(resizeStartHeight + dy)));
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
      e.preventDefault();
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
      const newScale = Math.min(Math.max(0.35, initialPinchScale * ratio), 2.5);

      // Zoom centered on pinch midpoint
      const midX = (pts[0].clientX + pts[1].clientX) / 2;
      const midY = (pts[0].clientY + pts[1].clientY) / 2;
      state.panX = midX - (midX - state.panX) * (newScale / state.scale);
      state.panY = midY - (midY - state.panY) * (newScale / state.scale);
      state.scale = newScale;

      updateTransform();
    }
  });

  window.addEventListener('pointerup', (e) => {
    if (potentialDrag) {
      if (potentialDrag.isEditable && potentialDrag.targetEl) {
        const editableEl = potentialDrag.targetEl.closest('.box-body') || potentialDrag.targetEl.closest('.box-note-body') || potentialDrag.targetEl;
        if (editableEl && typeof editableEl.focus === 'function') {
          editableEl.focus();
        }
      }
      try { potentialDrag.card.releasePointerCapture(potentialDrag.pointerId); } catch (err) {}
      potentialDrag = null;
    }

    if (isResizingCardNode) {
      isResizingCardNode = null;
      saveState();
    }

    if (draggingCardNode) {
      const cardEl = nodesLayer.querySelector(`[data-node-id="${draggingCardNode.id}"]`);
      if (cardEl) {
        cardEl.classList.remove('dragging');
        try { cardEl.releasePointerCapture(e.pointerId); } catch (err) {}
      }
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

  window.addEventListener('pointercancel', (e) => {
    if (potentialDrag) {
      try { potentialDrag.card.releasePointerCapture(potentialDrag.pointerId); } catch (err) {}
      potentialDrag = null;
    }
    if (draggingCardNode) {
      const cardEl = nodesLayer.querySelector(`[data-node-id="${draggingCardNode.id}"]`);
      if (cardEl) {
        cardEl.classList.remove('dragging');
        try { cardEl.releasePointerCapture(e.pointerId); } catch (err) {}
      }
      draggingCardNode = null;
      saveState();
    }
    if (isLinkingWire) {
      isLinkingWire = false;
      renderConnections();
    }
    activePointers.delete(e.pointerId);
    if (activePointers.size === 0) {
      isPanningCanvas = false;
      canvasContainer.classList.remove('panning');
    }
  });

  // Canvas background pointerdown (Pan & Double-Tap Node Creation)
  canvasContainer.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.text-box-card')) return;
    closeAllPopovers();

    const now = Date.now();
    const dist = Math.hypot(e.clientX - lastCanvasTapPos.x, e.clientY - lastCanvasTapPos.y);

    // Double-tap empty canvas creates node
    if (now - lastCanvasTapTime < 320 && dist < 25) {
      e.preventDefault();
      const canvasRect = canvasContainer.getBoundingClientRect();
      const spawnX = (e.clientX - canvasRect.left - state.panX) / state.scale - 90;
      const spawnY = (e.clientY - canvasRect.top - state.panY) / state.scale - 25;
      const newNode = spawnNode('', 'New Idea', [], [], spawnX, spawnY);
      if (newNode) focusNodeText(newNode.id);
      lastCanvasTapTime = 0;
      return;
    }
    lastCanvasTapTime = now;
    lastCanvasTapPos = { x: e.clientX, y: e.clientY };

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
      pinchFocalPoint = { x: (pts[0].clientX + pts[1].clientX) / 2, y: (pts[0].clientY + pts[1].clientY) / 2 };
    }
  });

  // Focal Point Wheel Zoom (Zooms towards cursor)
  canvasContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 1.08;
    const oldScale = state.scale;
    let newScale = e.deltaY < 0 ? oldScale * zoomFactor : oldScale / zoomFactor;
    newScale = Math.min(Math.max(0.35, newScale), 2.5);

    const rect = canvasContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    state.panX = mouseX - (mouseX - state.panX) * (newScale / oldScale);
    state.panY = mouseY - (mouseY - state.panY) * (newScale / oldScale);
    state.scale = newScale;

    updateTransform();
    saveState();
  }, { passive: false });
}

// ==========================================================================
// Floating Dock & Popovers Coordination
// ==========================================================================
function closeAllPopovers() {
  if (createMenu) createMenu.classList.add('hidden');
  if (moreMenu) moreMenu.classList.add('hidden');
  if (zoomMenu) zoomMenu.classList.add('hidden');
  if (dockAddBtn) dockAddBtn.classList.remove('active');
  if (dockMoreBtn) dockMoreBtn.classList.remove('active');
}

// ==========================================================================
// Full Screen Support
// ==========================================================================
function isFullscreenActive() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
}

function toggleFullscreen() {
  try {
    if (isFullscreenActive()) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn('exitFullscreen error', err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(err => console.warn('requestFullscreen error', err));
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    }
  } catch (err) {
    console.warn('Fullscreen error:', err);
  }
}

function updateFullscreenUI() {
  const isFs = isFullscreenActive();
  document.querySelectorAll('#more-fullscreen-btn, #zoom-fullscreen-btn').forEach(btn => {
    const enterIcon = btn.querySelector('.fs-icon-enter');
    const exitIcon = btn.querySelector('.fs-icon-exit');
    const label = btn.querySelector('.fs-btn-label');
    if (enterIcon) enterIcon.classList.toggle('hidden', isFs);
    if (exitIcon) exitIcon.classList.toggle('hidden', !isFs);
    if (label) label.textContent = isFs ? 'Exit Full Screen' : 'Full Screen';
    btn.setAttribute('title', isFs ? 'Exit Full Screen' : 'Enter Full Screen');
    btn.setAttribute('aria-label', isFs ? 'Exit Full Screen' : 'Enter Full Screen');
  });
}

['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
  document.addEventListener(evt, updateFullscreenUI);
});

function setupDockAndMenus() {
  if (dockAddBtn) {
    dockAddBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = createMenu.classList.contains('hidden');
      closeAllPopovers();
      if (isHidden) {
        createMenu.classList.remove('hidden');
        dockAddBtn.classList.add('active');
      }
    });
  }

  if (dockSearchBtn) {
    dockSearchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      openCommandPalette();
    });
  }

  if (dockAiBtn) {
    dockAiBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      if (aiChatPanel && !aiChatPanel.classList.contains('hidden')) {
        closeAiPanel();
      } else {
        openAiPanel();
      }
    });
  }

  if (dockMoreBtn) {
    dockMoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = moreMenu.classList.contains('hidden');
      closeAllPopovers();
      if (isHidden) {
        moreMenu.classList.remove('hidden');
        dockMoreBtn.classList.add('active');
      }
    });
  }

  // Create Menu actions
  if (createIdeaBtn) {
    createIdeaBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      const centerX = (-state.panX + window.innerWidth / 2) / state.scale - 90;
      const centerY = (-state.panY + window.innerHeight / 2) / state.scale - 25;
      const newNode = spawnNode('', 'New Idea', [], [], centerX, centerY);
      if (newNode) focusNodeText(newNode.id);
    });
  }

  if (createBranchBtn) {
    createBranchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      const sel = state.nodes.find(n => n.id === state.selectedNodeId) || state.nodes[0];
      const child = createChildNode(sel);
      if (child) focusNodeText(child.id);
    });
  }

  if (createMediaBtn) {
    createMediaBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      mediaPickerGeneral.click();
    });
  }

  // More Menu actions
  if (moreFullscreenBtn) {
    moreFullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      toggleFullscreen();
    });
  }

  if (moreAutoLayoutBtn) {
    moreAutoLayoutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      triggerAutoLayout();
    });
  }

  if (moreFitMapBtn) {
    moreFitMapBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      fitMapToScreen(0.15);
    });
  }

  if (moreIdeasBtn) {
    moreIdeasBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      openSidebar();
    });
  }

  if (moreIoBtn) {
    moreIoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      openIoModal('export');
    });
  }

  if (moreThemeBtn) {
    moreThemeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      cycleTheme();
    });
  }

  // Zoom Pill actions
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.scale = Math.max(state.scale / 1.15, 0.35);
      updateTransform();
      saveState();
    });
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.scale = Math.min(state.scale * 1.15, 2.5);
      updateTransform();
      saveState();
    });
  }

  if (zoomLevelBtn) {
    zoomLevelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = zoomMenu.classList.contains('hidden');
      closeAllPopovers();
      if (isHidden) zoomMenu.classList.remove('hidden');
    });
  }

  if (zoomFullscreenBtn) {
    zoomFullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      toggleFullscreen();
    });
  }

  if (zoomFitBtn) {
    zoomFitBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      fitMapToScreen(0.15);
    });
  }

  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      state.scale = 1;
      updateTransform();
      saveState();
    });
  }

  if (zoomCenterBtn) {
    zoomCenterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      centerSelectedNode();
    });
  }

  // Dismiss on clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.floating-dock') && !e.target.closest('.popover-menu') && !e.target.closest('.floating-zoom-pill')) {
      closeAllPopovers();
    }
  });
}

// ==========================================================================
// Command Palette (Ctrl/Cmd + K)
// ==========================================================================
function openCommandPalette() {
  if (!commandPaletteModal) return;
  commandPaletteModal.classList.remove('hidden');
  cmdPaletteInput.value = '';
  activePaletteIndex = 0;
  renderPaletteResults('');
  setTimeout(() => cmdPaletteInput.focus(), 50);
}

function closeCommandPalette() {
  if (!commandPaletteModal) return;
  commandPaletteModal.classList.add('hidden');
}

function renderPaletteResults(query) {
  if (!cmdPaletteResults) return;
  const q = query.trim().toLowerCase();

  const actions = [
    { id: 'act-new-idea', title: 'New Idea Box', icon: '＋', action: () => { createIdeaBtn.click(); } },
    { id: 'act-new-branch', title: 'New Branch off Selected', icon: '↳', action: () => { createBranchBtn.click(); } },
    { id: 'act-ask-ai', title: 'Open AI Project Copilot', icon: '✦', action: () => { openAiPanel(); } },
    { id: 'act-auto-layout', title: 'Auto Arrange Map', icon: '⊞', action: () => { triggerAutoLayout(); } },
    { id: 'act-fit-screen', title: 'Fit Map to Screen', icon: '⊡', action: () => { fitMapToScreen(0.15); } },
    { id: 'act-reset-zoom', title: 'Reset Zoom to 100%', icon: '↺', action: () => { state.scale = 1; updateTransform(); saveState(); } },
    { id: 'act-export-md', title: 'Export Markdown Outline', icon: '↓', action: () => { openIoModal('export'); } },
    { id: 'act-export-png', title: 'Export Canvas PNG', icon: '⬚', action: () => { exportCanvasToPng(); } },
    { id: 'act-fullscreen', title: 'Toggle Full Screen', icon: '⛶', action: () => { toggleFullscreen(); } },
    { id: 'act-cycle-theme', title: `Switch Theme (Current: ${state.theme})`, icon: '◐', action: () => { cycleTheme(); } }
  ];

  const matchedNodes = state.nodes.filter(n => {
    const text = (n.body || n.title || '').toLowerCase();
    const note = (n.note || '').toLowerCase();
    return text.includes(q) || note.includes(q);
  });

  const matchedActions = actions.filter(a => a.title.toLowerCase().includes(q));

  let html = '';

  if (matchedNodes.length > 0) {
    html += '<div class="cmd-section-title">Matching Ideas</div>';
    matchedNodes.slice(0, 8).forEach((n, idx) => {
      const preview = n.body || n.title || 'Untitled Node';
      html += `
        <div class="cmd-item" data-type="node" data-id="${n.id}">
          <span style="color: ${n.color || 'var(--text-dim)'}; font-size: 14px;">●</span>
          <span>${escapeHtml(preview.slice(0, 50))}</span>
        </div>
      `;
    });
  }

  if (matchedActions.length > 0) {
    html += '<div class="cmd-section-title">Actions & Tools</div>';
    matchedActions.forEach(a => {
      html += `
        <div class="cmd-item" data-type="action" data-id="${a.id}">
          <span style="font-weight: 600; width: 14px; text-align: center;">${a.icon}</span>
          <span>${escapeHtml(a.title)}</span>
        </div>
      `;
    });
  }

  if (matchedNodes.length === 0 && matchedActions.length === 0) {
    html = '<div style="padding: 16px; text-align: center; color: var(--text-dim); font-size: 12px;">No matching ideas or commands found.</div>';
  }

  cmdPaletteResults.innerHTML = html;

  cmdPaletteResults.querySelectorAll('.cmd-item').forEach(item => {
    item.addEventListener('click', () => {
      closeCommandPalette();
      const type = item.dataset.type;
      const id = item.dataset.id;
      if (type === 'node') {
        selectNode(id);
        centerSelectedNode();
      } else if (type === 'action') {
        const foundAction = actions.find(a => a.id === id);
        if (foundAction) foundAction.action();
      }
    });
  });
}

// ==========================================================================
// AI Project Copilot Integration
// ==========================================================================
function updateCopilotContextBadge() {
  if (!aiContextIndicator) return;
  const selNode = state.nodes.find(n => n.id === state.selectedNodeId);
  if (selNode && (selNode.body || selNode.title)) {
    const title = (selNode.body || selNode.title).trim();
    aiContextIndicator.innerText = `Focus: "${title.length > 20 ? title.slice(0, 18) + '...' : title}"`;
  } else {
    aiContextIndicator.innerText = 'Whole Map';
  }
}

function buildProjectCopilotContext() {
  const rootNodes = state.nodes.filter(n => (!n.parentIds || n.parentIds.length === 0) && !n.parentId);
  const centralTopic = (rootNodes[0]?.body || state.nodes[0]?.body || 'Project').trim();
  const selectedNode = state.nodes.find(n => n.id === state.selectedNodeId);

  let ctx = `PROJECT: "${centralTopic}"\n`;

  if (selectedNode) {
    ctx += `SELECTED FOCUSED ITEM: "${selectedNode.body || 'Untitled'}"\n`;
    if (selectedNode.note) ctx += `NOTE: "${selectedNode.note}"\n`;
    if (selectedNode.hasCheckbox) ctx += `STATUS: ${selectedNode.isCompleted ? 'COMPLETED' : 'PENDING'}\n`;

    let ancestors = [];
    let curr = selectedNode;
    let guard = 0;
    while (curr && guard < 10) {
      guard++;
      const pId = (curr.parentIds && curr.parentIds[0]) || curr.parentId;
      if (!pId) break;
      curr = state.nodes.find(n => n.id === pId);
      if (curr && (curr.body || curr.title)) ancestors.unshift((curr.body || curr.title).trim());
    }
    if (ancestors.length > 0) ctx += `PATH: ${ancestors.join(' -> ')} -> ${selectedNode.body}\n`;

    const children = state.nodes.filter(n => (n.parentIds && n.parentIds.includes(selectedNode.id)) || n.parentId === selectedNode.id);
    if (children.length > 0) {
      ctx += `CHILDREN:\n` + children.map(c => `- ${c.body || 'Untitled'}`).join('\n') + '\n';
    }
  }

  ctx += `OUTLINE SNAPSHOT:\n` + generateMarkdownOutline().split('\n').slice(0, 20).join('\n');
  return ctx;
}

// Multi-Provider AI Routing API Call
async function callAiApi(prompt) {
  const provider = currentAiProvider || 'gemini';
  const customKey = localStorage.getItem(`${provider}_api_key`) || '';

  // 1. Try secure server-side endpoint first
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, provider, apiKey: customKey })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.reply) return data.reply;
    }
  } catch (err) {
    console.info('Server AI proxy unavailable, testing fallback...');
  }

  // 2. Client fallback for Gemini if on static host
  if (provider === 'gemini') {
    let clientKey = (typeof window !== 'undefined' && window.LOCAL_GEMINI_KEY) || localStorage.getItem('gemini_api_key') || '';
    if (!clientKey) {
      const entered = window.prompt('To use AI in Weave on this device, enter your Google Gemini API Key once:\n(Saved privately on this device)');
      if (entered && entered.trim()) {
        clientKey = entered.trim();
        localStorage.setItem('gemini_api_key', clientKey);
      } else {
        return null;
      }
    }

    const candidateModels = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    for (const model of candidateModels) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${clientKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) return reply;
      } catch (e) {}
    }
  }
  return null;
}
const callGeminiApi = callAiApi;

// ==========================================================================
// Figma Weave Automatic Suggestion System (2-3 Suggestions & 1-Click Expand)
// ==========================================================================
function getNodePathContext(node) {
  if (!node) return '';
  let ancestors = [];
  let curr = node;
  let guard = 0;
  while (curr && guard < 10) {
    guard++;
    const pId = (curr.parentIds && curr.parentIds[0]) || curr.parentId;
    if (!pId) break;
    curr = state.nodes.find(n => n.id === pId);
    if (curr && (curr.body || curr.title)) ancestors.unshift((curr.body || curr.title).trim());
  }
  return ancestors.length > 0 ? ancestors.join(' -> ') + ' -> ' + (node.body || node.title) : (node.body || node.title || '');
}

function debounceWeaveSuggest(nodeId) {
  if (weaveDebounceTimer) clearTimeout(weaveDebounceTimer);
  weaveDebounceTimer = setTimeout(() => {
    openWeaveForNode(nodeId, false);
  }, 250);
}

let isFetchingWeave = false;

async function openWeaveForNode(nodeId, force = false) {
  if (!nodeId) return;
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return;

  currentWeaveNodeId = nodeId;
  if (!weaveDock) return;
  weaveDock.classList.remove('hidden');

  const topic = (node.body || node.title || 'Selected Idea').trim();
  weaveTargetTitle.innerText = topic.length > 32 ? topic.slice(0, 30) + '...' : topic;
  weaveTargetTitle.title = topic;

  if (isFetchingWeave && !force) return;

  weaveStatusHint.innerText = `Thinking with ${currentAiProvider.toUpperCase()}...`;
  weaveSuggestionsList.innerHTML = `
    <div class="weave-card" style="opacity: 0.6; pointer-events: none;"><span class="weave-card-num">1</span><span class="weave-card-text">Brainstorming direction A...</span></div>
    <div class="weave-card" style="opacity: 0.6; pointer-events: none;"><span class="weave-card-num">2</span><span class="weave-card-text">Brainstorming direction B...</span></div>
    <div class="weave-card" style="opacity: 0.6; pointer-events: none;"><span class="weave-card-num">3</span><span class="weave-card-text">Brainstorming direction C...</span></div>
  `;

  isFetchingWeave = true;

  try {
    const pathCtx = getNodePathContext(node);
    const prompt = `We are using an interactive thought exploration tree (like Figma Weave).
Root/Context Path: "${pathCtx}"
Current Focused Idea: "${topic}"

Task: Generate exactly 2 or 3 distinct, concise, high-impact next-level branches to explore or build on this idea.
Rules:
- Return ONLY 2 or 3 bullet items starting with "- "
- Each bullet must be 2 to 6 words maximum
- Keep them punchy and actionable
- Do NOT include numbering, intro text, or Markdown formatting other than "- "`;

    const reply = await callAiApi(prompt);
    isFetchingWeave = false;

    if (!reply) {
      weaveStatusHint.innerText = 'Unable to fetch suggestions. Click refresh to retry.';
      weaveSuggestionsList.innerHTML = `<div style="font-size:11.5px;color:var(--text-muted);padding:4px;">Could not connect to AI. Please check settings.</div>`;
      return;
    }

    const bullets = reply.split('\n')
      .map(line => line.replace(/^[\*\-\•\d\.\)]+\s*/, '').trim())
      .filter(line => line.length > 1 && !line.toLowerCase().startsWith('here are') && !line.toLowerCase().startsWith('sure'));

    const cleanSuggestions = bullets.slice(0, 3);
    if (cleanSuggestions.length === 0) {
      weaveStatusHint.innerText = 'No suggestions found. Try refreshing.';
      return;
    }

    weaveStatusHint.innerText = 'Click any suggestion to branch & weave deeper:';
    weaveSuggestionsList.innerHTML = '';

    cleanSuggestions.forEach((sugText, idx) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'weave-card';
      card.innerHTML = `
        <span class="weave-card-num">${idx + 1}</span>
        <span class="weave-card-text">${escapeHtml(sugText)}</span>
      `;
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        weaveApplySuggestion(node.id, sugText);
      });
      weaveSuggestionsList.appendChild(card);
    });

  } catch (err) {
    isFetchingWeave = false;
    weaveStatusHint.innerText = 'Error generating suggestions.';
  }
}

function weaveApplySuggestion(parentNodeId, text) {
  const parentNode = state.nodes.find(n => n.id === parentNodeId);
  if (!parentNode) return;

  if (parentNode.collapsed) {
    parentNode.collapsed = false;
  }

  const children = state.nodes.filter(n => (n.parentIds && n.parentIds.includes(parentNode.id)) || n.parentId === parentNode.id);
  const childX = parentNode.x + (parentNode.width || 180) + 70;
  let childY = parentNode.y;
  if (children.length > 0) {
    const maxY = Math.max(...children.map(c => c.y + (c.height || 48)));
    childY = maxY + 16;
  }

  const newNode = spawnNode('', text, [], [], childX, childY, parentNode.id, parentNode.color);
  renderCanvas();
  saveState();
  selectNode(newNode.id);

  if (autoWeaveEnabled) {
    openWeaveForNode(newNode.id, true);
  }
}

function closeWeaveDock() {
  if (weaveDock) weaveDock.classList.add('hidden');
}

// ==========================================================================
// Execution Orchestrator System
// ==========================================================================
function openOrchestratorForNode(nodeId) {
  const targetId = nodeId || state.selectedNodeId || (state.nodes[0] ? state.nodes[0].id : null);
  if (!targetId) return;

  const node = state.nodes.find(n => n.id === targetId);
  if (!node) return;

  activeOrchNodeId = targetId;
  orchNodeTitle.innerText = node.body || node.title || 'Untitled';
  orchNodePath.innerText = 'Path: ' + getNodePathContext(node);

  if (orchestratorModal) {
    orchestratorModal.classList.remove('hidden');
    if (drawerOverlay) drawerOverlay.classList.remove('hidden');
  }
}

function closeOrchestratorModal() {
  if (orchestratorModal) orchestratorModal.classList.add('hidden');
  if (drawerOverlay && (!sidebar || !sidebar.classList.contains('open')) && (!aiChatPanel || aiChatPanel.classList.contains('hidden'))) {
    drawerOverlay.classList.add('hidden');
  }
}

async function runOrchestration(nodeId) {
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return;

  orchStatusBar.classList.remove('hidden');
  orchStatusBar.innerText = `Orchestrating actionable execution plan with ${currentAiProvider.toUpperCase()}...`;
  orchGenerateBtn.disabled = true;

  try {
    const pathContext = getNodePathContext(node);
    const prompt = `You are an Execution Orchestrator inside a visual mind map workspace.
Active Item: "${node.body || node.title}"
Context / Hierarchy: "${pathContext}"
Item Note: "${node.note || 'None'}"

Generate a complete, concrete Execution Plan to implement and execute this idea.
Structure your response exactly as:

### 1. Scope & Core Objectives
- Primary objective in 1-2 clear sentences.
- Expected key deliverable.

### 2. Actionable Checklist
- [ ] Phase 1: Preparation & Requirements
- [ ] Phase 2: Core Implementation
- [ ] Phase 3: Testing & Quality Verification
- [ ] Phase 4: Final Launch / Deployment

### 3. AI Agent Instructions (Anti-Gravity / Codex Prompt)
\`\`\`text
Objective: ${node.body || node.title}
Instructions: [Clear, step-by-step instructions an AI coder/agent can execute to build this]
\`\`\``;

    const reply = await callAiApi(prompt);
    orchStatusBar.classList.add('hidden');
    orchGenerateBtn.disabled = false;

    if (reply) {
      lastGeneratedOrchPrompt = reply;
      orchOutputArea.innerHTML = formatOrchestratorOutput(reply);
    } else {
      orchOutputArea.innerHTML = `<div style="color:#f87171;">Failed to generate plan. Please verify AI key or network settings.</div>`;
    }
  } catch (e) {
    orchStatusBar.classList.add('hidden');
    orchGenerateBtn.disabled = false;
    orchOutputArea.innerHTML = `<div style="color:#f87171;">Error executing AI orchestration request.</div>`;
  }
}

function formatOrchestratorOutput(text) {
  return escapeHtml(text)
    .replace(/^### (.*$)/gim, '<h4 style="margin:12px 0 6px 0; color:var(--accent-cyan);">$1</h4>')
    .replace(/^- \[ \] (.*$)/gim, '<div style="margin:4px 0;"><input type="checkbox" disabled> $1</div>')
    .replace(/^- \[x\] (.*$)/gim, '<div style="margin:4px 0;"><input type="checkbox" checked disabled> <strike>$1</strike></div>')
    .replace(/^- (.*$)/gim, '<div style="margin:3px 0 3px 12px;">• $1</div>')
    .replace(/```text\n([\s\S]*?)```/gim, '<pre style="background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);padding:10px;border-radius:6px;overflow-x:auto;">$1</pre>')
    .replace(/```([\s\S]*?)```/gim, '<pre style="background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);padding:10px;border-radius:6px;overflow-x:auto;">$1</pre>')
    .replace(/\n/g, '<br>');
}

// ==========================================================================
// AI Settings & Routing Modal Handlers
// ==========================================================================
function openAiSettingsModal() {
  if (!aiSettingsModal) return;
  aiProviderSelect.value = currentAiProvider;
  geminiKeyInput.value = localStorage.getItem('gemini_api_key') || '';
  claudeKeyInput.value = localStorage.getItem('claude_api_key') || '';
  openaiKeyInput.value = localStorage.getItem('openai_api_key') || '';
  settingsAutoWeave.checked = autoWeaveEnabled;
  if (settingsSaveFeedback) settingsSaveFeedback.classList.add('hidden');

  aiSettingsModal.classList.remove('hidden');
  if (drawerOverlay) drawerOverlay.classList.remove('hidden');
}

function closeAiSettingsModal() {
  if (aiSettingsModal) aiSettingsModal.classList.add('hidden');
  if (drawerOverlay && (!sidebar || !sidebar.classList.contains('open')) && (!aiChatPanel || aiChatPanel.classList.contains('hidden'))) {
    drawerOverlay.classList.add('hidden');
  }
}

function saveAiSettings() {
  currentAiProvider = aiProviderSelect.value;
  localStorage.setItem('mind_ai_provider', currentAiProvider);

  if (geminiKeyInput.value.trim()) localStorage.setItem('gemini_api_key', geminiKeyInput.value.trim());
  if (claudeKeyInput.value.trim()) localStorage.setItem('claude_api_key', claudeKeyInput.value.trim());
  if (openaiKeyInput.value.trim()) localStorage.setItem('openai_api_key', openaiKeyInput.value.trim());

  autoWeaveEnabled = settingsAutoWeave.checked;
  localStorage.setItem('mind_auto_weave', autoWeaveEnabled ? 'true' : 'false');
  if (weaveAutoToggle) weaveAutoToggle.checked = autoWeaveEnabled;

  if (settingsSaveFeedback) {
    settingsSaveFeedback.classList.remove('hidden');
    setTimeout(() => {
      settingsSaveFeedback.classList.add('hidden');
      closeAiSettingsModal();
    }, 800);
  }
}

async function handleCopilotSubmit(customPrompt = null, spawnAll = false) {
  const query = (customPrompt || aiInput.value).trim();
  if (!query) return;

  const isImageIntent = query.match(/^(\/image|image:|draw\s|generate\s+image)/i);
  if (isImageIntent) {
    const promptText = query.replace(/^(\/image|image:|draw\s+|generate\s+image\s*(of|for)?)/i, '').trim() || query;
    return handleGenerateImage(promptText);
  }

  addAiChatMessage('user', query);
  if (!customPrompt) aiInput.value = '';

  addAiChatMessage('bot', 'Analyzing map context...');
  try {
    const mapContext = buildProjectCopilotContext();
    const systemPrompt = `You are a Project Mapping Copilot inside an infinite canvas workspace.
Map Context:
${mapContext}

User Request: "${query}"

Guidelines:
- Give a concise, high-impact answer.
- Formulate your actionable suggestions as a clean bullet list (- item).
- Keep each suggested point short (3 to 8 words) so they work as clean map cards.
- Do not write walls of text. Focus on next steps, missing pieces, or structured milestones.`;

    const reply = await callGeminiApi(systemPrompt);

    const thinkingMsg = aiChatLog.querySelector('.ai-msg.bot:last-child');
    if (thinkingMsg && thinkingMsg.innerText.includes('Analyzing map context...')) thinkingMsg.remove();

    if (reply) {
      renderAiResponseWithPills(reply);
      if (spawnAll) {
        applyAiSuggestionsToMap(parseAiBullets(reply));
      }
    } else {
      addAiChatMessage('bot', 'Could not connect to AI. Please verify network or key settings.');
    }
  } catch (e) {
    const thinkingMsg = aiChatLog.querySelector('.ai-msg.bot:last-child');
    if (thinkingMsg && thinkingMsg.innerText.includes('Analyzing map context...')) thinkingMsg.remove();
    addAiChatMessage('bot', 'Connection error: Unable to reach Gemini API.');
  }
}

async function handleGenerateImage(customPrompt = null) {
  const query = (customPrompt || aiInput.value).trim();
  if (!query) {
    addAiChatMessage('bot', 'Please enter a description for the image you want to create.');
    return;
  }

  addAiChatMessage('user', `Generate image: "${query}"`);
  if (!customPrompt) aiInput.value = '';

  addAiChatMessage('bot', `Creating image for "${query}"...`);
  const thinkingMsg = aiChatLog.querySelector('.ai-msg.bot:last-child');

  try {
    let imageUrl = null;

    // 1. Try server endpoint first (self-contained base64 data)
    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) imageUrl = data.imageUrl;
      }
    } catch (e) {
      console.warn('Server image proxy failed, falling back to direct...');
    }

    // 2. Direct fallback
    if (!imageUrl) {
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=768&height=768&nologo=true`;
    }

    if (thinkingMsg && thinkingMsg.parentNode) thinkingMsg.remove();
    renderAiImageCard(imageUrl, query);
  } catch (err) {
    if (thinkingMsg && thinkingMsg.parentNode) thinkingMsg.remove();
    addAiChatMessage('bot', 'Unable to generate image. Please verify your connection and try again.');
  }
}

function renderAiImageCard(imageUrl, prompt) {
  if (!aiChatLog) return;
  const msg = document.createElement('div');
  msg.className = 'ai-msg bot';

  const card = document.createElement('div');
  card.className = 'ai-image-card';

  const preview = document.createElement('img');
  preview.className = 'ai-image-preview';
  preview.src = imageUrl;
  preview.alt = prompt;

  const meta = document.createElement('div');
  meta.className = 'ai-image-meta';
  meta.innerText = `"${prompt}"`;

  const actions = document.createElement('div');
  actions.className = 'ai-image-actions';

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'ai-image-add-btn';
  addBtn.innerText = '＋ Add to Map';
  addBtn.addEventListener('click', () => {
    const targetNode = state.nodes.find(n => n.id === state.selectedNodeId);
    const mediaObj = { type: 'image', url: imageUrl, name: prompt.slice(0, 24) || 'AI Image' };
    if (targetNode) {
      attachMediaToNode(targetNode, mediaObj);
    } else {
      const centerX = (-state.panX + window.innerWidth / 2) / state.scale - 90;
      const centerY = (-state.panY + window.innerHeight / 2) / state.scale - 25;
      const newNode = spawnNode('', prompt.slice(0, 30), [mediaObj], [], centerX, centerY);
      if (newNode) selectNode(newNode.id);
    }
    addBtn.innerText = '✓ Added to Map';
    addBtn.disabled = true;
  });

  const downloadLink = document.createElement('a');
  downloadLink.className = 'ai-image-download-btn';
  downloadLink.href = imageUrl;
  downloadLink.download = `${prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 24) || 'image'}.jpg`;
  downloadLink.target = '_blank';
  downloadLink.innerText = 'Download';

  actions.appendChild(addBtn);
  actions.appendChild(downloadLink);

  card.appendChild(preview);
  card.appendChild(meta);
  card.appendChild(actions);
  msg.appendChild(card);

  aiChatLog.appendChild(msg);
  aiChatLog.scrollTop = aiChatLog.scrollHeight;
}

function parseAiBullets(text) {
  return text.split('\n')
    .map(l => l.replace(/^[\*\-\•\d\.]+\s*/, '').trim())
    .filter(l => l.length > 1 && !l.startsWith('#') && !l.toLowerCase().startsWith('here is') && !l.toLowerCase().startsWith('here are'));
}

function renderAiResponseWithPills(replyText) {
  if (!aiChatLog) return;
  const msg = document.createElement('div');
  msg.className = 'ai-msg bot';

  const bullets = parseAiBullets(replyText);

  let formattedText = escapeHtml(replyText).replace(/\n/g, '<br>');
  msg.innerHTML = `<div>${formattedText}</div>`;

  if (bullets.length > 0) {
    const suggestionsBox = document.createElement('div');
    suggestionsBox.className = 'ai-suggestions-container';

    const addAllBtn = document.createElement('button');
    addAllBtn.className = 'ai-add-all-btn';
    addAllBtn.innerText = `＋ Add All (${bullets.length}) to Map`;
    addAllBtn.addEventListener('click', () => {
      applyAiSuggestionsToMap(bullets);
    });
    suggestionsBox.appendChild(addAllBtn);

    bullets.forEach(bullet => {
      const itemRow = document.createElement('div');
      itemRow.className = 'ai-item-pill';
      itemRow.innerHTML = `
        <span class="ai-item-text">${escapeHtml(bullet)}</span>
        <button type="button" class="ai-item-add-btn">＋ Add</button>
      `;
      itemRow.querySelector('.ai-item-add-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        applyAiSuggestionsToMap([bullet]);
        itemRow.querySelector('.ai-item-add-btn').innerText = '✓ Added';
        itemRow.querySelector('.ai-item-add-btn').disabled = true;
      });
      suggestionsBox.appendChild(itemRow);
    });

    msg.appendChild(suggestionsBox);
  }

  aiChatLog.appendChild(msg);
  aiChatLog.scrollTop = aiChatLog.scrollHeight;
}

// AI Nodes to Map with Preview & Undo Banner
function applyAiSuggestionsToMap(suggestions, specificTargetNode = null) {
  if (!suggestions || suggestions.length === 0) return;

  const targetNode = specificTargetNode || state.nodes.find(n => n.id === state.selectedNodeId) || state.nodes[0];
  const rootX = targetNode ? targetNode.x + (targetNode.width || 180) + 60 : (-state.panX + window.innerWidth / 2) / state.scale - 90;
  const rootY = targetNode ? targetNode.y : (-state.panY + window.innerHeight / 2) / state.scale - 25;

  const addedIds = [];
  const spacing = 58;
  const totalH = (suggestions.length - 1) * spacing;
  const startY = rootY - (totalH / 2) + 12;

  suggestions.forEach((itemText, idx) => {
    const spawnY = startY + (idx * spacing);
    const newNode = spawnNode('', itemText, [], [], rootX, spawnY, targetNode ? targetNode.id : null, targetNode?.color);
    if (newNode) {
      addedIds.push(newNode.id);
    }
  });

  lastAiAddedNodeIds = addedIds;

  // Highlight preview state
  addedIds.forEach(id => {
    const cardEl = nodesLayer.querySelector(`[data-node-id="${id}"]`);
    if (cardEl) cardEl.classList.add('ai-preview');
  });

  if (aiPreviewBanner) {
    aiPreviewBanner.classList.remove('hidden');
    const label = aiPreviewBanner.querySelector('.ai-preview-text');
    if (label && targetNode) {
      label.innerText = `AI proposed ${addedIds.length} branches for "${(targetNode.body || 'idea').slice(0, 24)}"`;
    }
  }

  renderCanvas();
  saveState();
}

function acceptAiPreview() {
  if (aiPreviewBanner) aiPreviewBanner.classList.add('hidden');
  lastAiAddedNodeIds.forEach(id => {
    const cardEl = nodesLayer.querySelector(`[data-node-id="${id}"]`);
    if (cardEl) cardEl.classList.remove('ai-preview');
  });
  lastAiAddedNodeIds = [];
}

function undoAiPreview() {
  if (aiPreviewBanner) aiPreviewBanner.classList.add('hidden');
  if (lastAiAddedNodeIds.length > 0) {
    state.nodes = state.nodes.filter(n => !lastAiAddedNodeIds.includes(n.id));
    lastAiAddedNodeIds = [];
    renderCanvas();
    saveState();
  }
}

function openAiPanel() {
  if (!aiChatPanel) return;
  if (sidebar && sidebar.classList.contains('open')) sidebar.classList.remove('open');
  aiChatPanel.classList.remove('hidden');
  if (drawerOverlay) drawerOverlay.classList.remove('hidden');
  if (dockAiBtn) dockAiBtn.classList.add('active');
  updateCopilotContextBadge();
}

function closeAiPanel() {
  if (!aiChatPanel) return;
  aiChatPanel.classList.add('hidden');
  if (dockAiBtn) dockAiBtn.classList.remove('active');
  if (drawerOverlay && (!sidebar || !sidebar.classList.contains('open'))) {
    drawerOverlay.classList.add('hidden');
  }
}

function addAiChatMessage(role, text) {
  if (!aiChatLog) return;
  const msg = document.createElement('div');
  msg.className = `ai-msg ${role}`;
  msg.innerText = text;
  aiChatLog.appendChild(msg);
  aiChatLog.scrollTop = aiChatLog.scrollHeight;
}

// AI Expand from Context Menu or In-Box AI Button
async function aiExpandNode(nodeId, triggerBtn = null) {
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node) return;

  const originalHtml = triggerBtn ? triggerBtn.innerHTML : '';
  if (triggerBtn) {
    triggerBtn.innerHTML = `
      <svg class="spin-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      <span>Thinking...</span>
    `;
    triggerBtn.disabled = true;
  }

  const topicText = (node.body || node.title || '').trim();
  const prompt = `Topic: "${topicText}". Generate 3 to 4 concise, high-impact sub-topics or next steps that branch off this idea. Rules: Return only a plain bulleted list (- item). 3 to 6 words per bullet.`;
  const reply = await callGeminiApi(prompt);

  if (reply) {
    const bullets = parseAiBullets(reply);
    applyAiSuggestionsToMap(bullets, node);
  }

  if (triggerBtn) {
    triggerBtn.innerHTML = originalHtml || '<span>AI</span>';
    triggerBtn.disabled = false;
  }
}

// Full Map Tree Generator
async function handleGenerateFullMap() {
  const query = aiInput.value.trim();
  if (!query) {
    addAiChatMessage('bot', 'Please type a project topic first (e.g. "Launch a podcast" or "Design mobile app").');
    return;
  }
  addAiChatMessage('user', `Generate full mind map for: "${query}"`);
  aiInput.value = '';

  addAiChatMessage('bot', `Building full project roadmap for "${query}"...`);
  try {
    const prompt = `Create a structured project mind map outline for: "${query}". Format as an indented Markdown bullet outline using dashes (-). Level 1 is the main topic, Level 2 are 3-4 major pillars, Level 3 are 2-3 specific action items or deliverables under each pillar. Output ONLY the indented markdown bullet list.`;
    const reply = await callGeminiApi(prompt);
    if (reply) {
      importMarkdownToCanvas(reply, false);
      addAiChatMessage('bot', `Rendered complete project roadmap for "${query}"!`);
      fitMapToScreen(0.15);
    } else {
      const template = `- ${query}\n  - Research & Strategy\n    - Define Core Goals\n    - Target Audience & Scope\n  - Execution & Build\n    - Essential Tools & Setup\n    - Core Deliverables\n  - Launch & Growth\n    - Rollout & Promotion\n    - Review & Feedback`;
      importMarkdownToCanvas(template, false);
      fitMapToScreen(0.15);
    }
  } catch (e) {
    addAiChatMessage('bot', 'Unable to reach Gemini API.');
  }
}

// ==========================================================================
// Floating Node Context Menu
// ==========================================================================
function openNodeContextMenu(node, clientX, clientY) {
  if (!nodeContextMenu) return;
  contextActiveNodeId = node.id;

  // Temporarily tuck/hide Weave dock so it never collides with the action menu
  if (weaveDock && !weaveDock.classList.contains('hidden')) {
    weaveDock.classList.add('hidden');
  }

  nodeContextMenu.querySelectorAll('.color-swatch-dot').forEach(dot => {
    dot.classList.toggle('active-swatch', dot.dataset.color === node.color);
  });

  // Highlight active size preset button
  nodeContextMenu.querySelectorAll('.context-size-btn').forEach(btn => {
    const s = btn.dataset.size;
    let isActive = false;
    if (s === 'small' && node.width && node.width <= 160) isActive = true;
    else if (s === 'medium' && node.width && node.width > 160 && node.width <= 260) isActive = true;
    else if (s === 'large' && node.width && node.width > 260) isActive = true;
    else if (s === 'auto' && !node.width) isActive = true;
    btn.classList.toggle('active-size', isActive);
  });

  const addNoteSpan = nodeContextMenu.querySelector('[data-action="add-note"] span');
  if (addNoteSpan) {
    addNoteSpan.innerText = (node.note && node.note.trim()) ? 'Edit Note' : 'Add Note';
  }

  // Show first to measure actual dynamic size
  nodeContextMenu.classList.remove('context-menu-hidden');

  const menuW = nodeContextMenu.offsetWidth || 195;
  const menuH = nodeContextMenu.offsetHeight || 360;
  const pad = 12;

  // Bottom dock safe limit
  const dockEl = document.getElementById('floating-dock');
  const dockH = dockEl ? (dockEl.offsetHeight + 24) : 80;
  const bottomLimit = window.innerHeight - dockH;

  let posX = clientX + 8;
  let posY = clientY + 8;

  // If opening downward would collide with bottom dock or bottom of screen, flip UPWARD!
  if (posY + menuH > bottomLimit) {
    const upY = clientY - menuH - 8;
    if (upY >= pad) {
      posY = upY; // Clean upward position above the node
    } else {
      // If neither fits vertically, place to the side of the node
      posY = Math.max(pad, Math.min(bottomLimit - menuH, clientY - menuH / 2));
      if (clientX + menuW + 16 < window.innerWidth - pad) {
        posX = clientX + 16;
      } else {
        posX = Math.max(pad, clientX - menuW - 16);
      }
    }
  }

  // Ensure horizontal fit
  if (posX + menuW > window.innerWidth - pad) {
    posX = Math.max(pad, clientX - menuW - 8);
  }

  nodeContextMenu.style.left = Math.round(posX) + 'px';
  nodeContextMenu.style.top = Math.round(posY) + 'px';
}

function hideNodeContextMenu() {
  if (nodeContextMenu) {
    nodeContextMenu.classList.add('context-menu-hidden');
    contextActiveNodeId = null;
  }
  // If a node is still selected and auto-weave is enabled, restore the Weave suggestions dock
  if (state.selectedNodeId && autoWeaveEnabled && weaveDock) {
    weaveDock.classList.remove('hidden');
  }
}

function setNodeSizeMode(node, sizeMode) {
  if (!node) return;
  if (sizeMode === 'small') {
    node.width = 150;
    delete node.height;
  } else if (sizeMode === 'medium') {
    node.width = 220;
    delete node.height;
  } else if (sizeMode === 'large') {
    node.width = 340;
    delete node.height;
  } else if (sizeMode === 'auto') {
    delete node.width;
    delete node.height;
  }
  saveState();
  renderCanvas();
  selectNode(node.id);
}

function cycleNodeSize(node) {
  if (!node) return;
  const currW = node.width || 200;
  if (currW < 180) {
    setNodeSizeMode(node, 'medium');
  } else if (currW < 280) {
    setNodeSizeMode(node, 'large');
  } else if (currW < 400) {
    setNodeSizeMode(node, 'auto');
  } else {
    setNodeSizeMode(node, 'small');
  }
}

function setupContextMenu() {
  if (!nodeContextMenu) return;

  nodeContextMenu.querySelectorAll('.color-swatch-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const color = dot.dataset.color;
      if (!contextActiveNodeId) return;
      const node = state.nodes.find(n => n.id === contextActiveNodeId);
      if (node) {
        node.color = color;
        saveState();
        renderCanvas();
        requestAnimationFrame(renderConnections);
      }
      hideNodeContextMenu();
    });
  });

  // Quick box size buttons listener
  nodeContextMenu.querySelectorAll('.context-size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!contextActiveNodeId) return;
      const node = state.nodes.find(n => n.id === contextActiveNodeId);
      if (!node) return;
      const sizeMode = btn.dataset.size;
      setNodeSizeMode(node, sizeMode);
      hideNodeContextMenu();
    });
  });

  nodeContextMenu.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || !contextActiveNodeId) return;
    e.stopPropagation();
    const action = btn.dataset.action;
    const node = state.nodes.find(n => n.id === contextActiveNodeId);
    if (!node) return;

    if (action === 'weave-suggest') {
      hideNodeContextMenu();
      openWeaveForNode(node.id, true);
    } else if (action === 'orchestrate-node') {
      hideNodeContextMenu();
      openOrchestratorForNode(node.id);
    } else if (action === 'add-branch') {
      hideNodeContextMenu();
      const child = createChildNode(node);
      if (child) focusNodeText(child.id);
    } else if (action === 'ai-expand') {
      hideNodeContextMenu();
      aiExpandNode(node.id);
    } else if (action === 'add-image') {
      hideNodeContextMenu();
      if (hiddenImagePicker) {
        activeNodeForImageUpload = node;
        hiddenImagePicker.click();
      }
    } else if (action === 'add-file') {
      hideNodeContextMenu();
      if (hiddenFilePicker) {
        activeNodeForFileUpload = node;
        hiddenFilePicker.click();
      }
    } else if (action === 'add-note') {
      hideNodeContextMenu();
      if (!node.note || !node.note.trim()) {
        node.note = 'Note details...';
        saveState();
        renderCanvas();
      }
      focusNodeNote(node.id);
    } else if (action === 'toggle-checkbox') {
      hideNodeContextMenu();
      node.hasCheckbox = !node.hasCheckbox;
      renderCanvas();
      saveState();
    } else if (action === 'edit-node') {
      hideNodeContextMenu();
      focusNodeText(node.id);
    } else if (action === 'delete-node') {
      hideNodeContextMenu();
      deleteNodeById(node.id);
    }
  });

  // Hidden attachment pickers
  if (hiddenImagePicker) {
    hiddenImagePicker.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file || !activeNodeForImageUpload) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        activeNodeForImageUpload.media = activeNodeForImageUpload.media || [];
        activeNodeForImageUpload.media.push({ type: 'image', url: evt.target.result, name: file.name });
        renderCanvas();
        saveState();
      };
      reader.readAsDataURL(file);
      hiddenImagePicker.value = '';
    });
  }

  if (hiddenFilePicker) {
    hiddenFilePicker.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file || !activeNodeForFileUpload) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        activeNodeForFileUpload.files = activeNodeForFileUpload.files || [];
        activeNodeForFileUpload.files.push({ name: file.name, url: evt.target.result });
        renderCanvas();
        saveState();
      };
      reader.readAsDataURL(file);
      hiddenFilePicker.value = '';
    });
  }

  // Dismiss on click outside
  document.addEventListener('pointerdown', (e) => {
    if (nodeContextMenu && !e.target.closest('#node-context-menu')) {
      hideNodeContextMenu();
    }
  });
}

// ==========================================================================
// Box Details Modal
// ==========================================================================
function openBoxModal(node) {
  if (!node) return;
  activeModalNodeId = node.id;
  boxModalBody.innerText = node.body || '';
  if (boxModalNote) boxModalNote.innerText = node.note || '';
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

// ==========================================================================
// Ideas Sidebar Drawer
// ==========================================================================
function openSidebar() {
  sidebar.classList.add('open');
  drawerOverlay.classList.remove('hidden');
  renderSidebar();
}

function closeSidebar() {
  sidebar.classList.remove('open');
  if (drawerOverlay && (!aiChatPanel || aiChatPanel.classList.contains('hidden'))) {
    drawerOverlay.classList.add('hidden');
  }
}

function renderSidebar() {
  if (!ideasList) return;
  const q = ideaSearch ? ideaSearch.value.trim().toLowerCase() : '';
  const filtered = state.nodes.filter(n => (n.body || n.title || '').toLowerCase().includes(q));

  ideasList.innerHTML = '';
  if (filtered.length === 0) {
    ideasList.innerHTML = '<div style="color: var(--text-dim); font-size: 11.5px; padding: 8px;">No matching ideas.</div>';
    return;
  }

  filtered.forEach(node => {
    const item = document.createElement('div');
    item.className = 'idea-card';
    item.innerHTML = `
      <span style="color: ${node.color || 'var(--text-dim)'}; margin-right: 8px;">●</span>
      <span class="idea-id">${escapeHtml((node.body || node.title || 'Untitled Node').slice(0, 45))}</span>
    `;
    item.addEventListener('click', () => {
      selectNode(node.id);
      centerSelectedNode();
      closeSidebar();
    });
    ideasList.appendChild(item);
  });
}

// ==========================================================================
// Auto Layout Engine
// ==========================================================================
function triggerAutoLayout() {
  let startX = 160, startY = 160;
  state.nodes.forEach((node, index) => {
    if (!node.parentId && (!node.parentIds || node.parentIds.length === 0)) {
      node.x = startX;
      node.y = startY + (index * 160);
    } else {
      const pId = (node.parentIds && node.parentIds[0]) || node.parentId;
      const parent = state.nodes.find(n => n.id === pId);
      if (parent) {
        node.x = parent.x + (parent.width || 180) + 70;
        node.y = parent.y + ((index % 3) * 110 - 55);
      }
    }
  });
  renderCanvas();
  saveState();
  fitMapToScreen(0.15);
}

// ==========================================================================
// Markdown Outline I/O & PNG Export
// ==========================================================================
function generateMarkdownOutline() {
  const rootNodes = state.nodes.filter(n => (!n.parentIds || n.parentIds.length === 0) && !n.parentId);
  const nodesToProcess = rootNodes.length > 0 ? rootNodes : state.nodes;

  let visited = new Set();
  let result = '';

  function traverse(n, depth = 0) {
    if (visited.has(n.id)) return;
    visited.add(n.id);

    const indent = '  '.repeat(depth);
    let text = (n.body || n.title || 'Untitled Node').trim().replace(/\n+/g, ' ');
    if (n.note && n.note.trim()) {
      text += ` (Note: ${n.note.trim().replace(/\n+/g, ' ')})`;
    }
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
  const levelStack = [];
  const baseStartX = replace ? 160 : ((-state.panX + window.innerWidth / 2) / state.scale - 90);
  const baseStartY = replace ? 160 : ((-state.panY + window.innerHeight / 2) / state.scale - 90);
  let rootCount = 0;

  lines.forEach(line => {
    if (!line.trim()) return;
    const matchIndent = line.match(/^(\s*)/);
    const leadingSpaces = matchIndent ? matchIndent[1].replace(/\t/g, '  ').length : 0;
    const level = Math.floor(leadingSpaces / 2);
    const text = line.replace(/^[\s\*\-\+\#\d\.\>]+/, '').trim();
    if (!text) return;

    while (levelStack.length > 0 && levelStack[levelStack.length - 1].level >= level) {
      levelStack.pop();
    }

    const parent = levelStack.length > 0 ? levelStack[levelStack.length - 1] : null;

    let posX, posY;
    if (!parent) {
      posX = baseStartX;
      posY = baseStartY + (rootCount * 170);
      rootCount++;
    } else {
      parent.childCount = (parent.childCount || 0) + 1;
      posX = parent.x + 250;
      posY = parent.y + ((parent.childCount - 1) * 70);
    }

    const newNode = {
      id: 'box-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
      title: '',
      body: text,
      note: '',
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
    maxX = Math.max(maxX, n.x + (n.width || 180));
    maxY = Math.max(maxY, n.y + (n.height || 60));
  });

  if (minX === Infinity) { minX = 0; minY = 0; maxX = 800; maxY = 600; }

  const padding = 60;
  const width = Math.max(800, Math.round(maxX - minX + padding * 2));
  const height = Math.max(600, Math.round(maxY - minY + padding * 2));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const isDark = state.theme !== 'light';
  ctx.fillStyle = isDark ? '#0e0f13' : '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = isDark ? '#2e3340' : '#cbd5e1';

  // Draw connections
  state.nodes.forEach(node => {
    if (isNodeHiddenByCollapse(node)) return;
    const parentIds = Array.isArray(node.parentIds) ? node.parentIds : (node.parentId ? [node.parentId] : []);
    parentIds.forEach(pId => {
      const parent = state.nodes.find(n => n.id === pId);
      if (!parent || isNodeHiddenByCollapse(parent) || parent.collapsed) return;

      const x1 = parent.x - minX + padding + (parent.width || 180);
      const y1 = parent.y - minY + padding + 24;
      const x2 = node.x - minX + padding;
      const y2 = node.y - minY + padding + 24;
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
    const nw = node.width || 180;
    const nh = Math.max(44, node.height || 44);

    ctx.fillStyle = isDark ? '#18191f' : '#f8fafc';
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;

    const r = 11;
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

    ctx.fillStyle = isDark ? '#e2e4e9' : '#0f172a';
    ctx.font = '12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const text = node.body || node.title || 'Untitled';
    ctx.fillText(text.length > 26 ? text.slice(0, 24) + '...' : text, nx + 12, ny + 26);
  });

  const link = document.createElement('a');
  link.download = 'project-map.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

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

// ==========================================================================
// Clipboard & File Drag Drop
// ==========================================================================
function setupClipboardAndFileDrop() {
  window.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    let targetNode = state.nodes.find(n => n.id === state.selectedNodeId);

    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (evt) => attachMediaToNode(targetNode, { type: 'image', url: evt.target.result, name: file.name });
        reader.readAsDataURL(file);
      } else if (item.type.indexOf('video') !== -1) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (evt) => attachMediaToNode(targetNode, { type: 'video', url: evt.target.result, name: file.name });
        reader.readAsDataURL(file);
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
        const mediaObj = { type: isVid ? 'video' : 'image', url: evt.target.result, name: file.name };
        spawnNode('', '', [mediaObj], [], dropX, dropY);
      };
      reader.readAsDataURL(file);
    }
  });
}

function attachMediaToNode(node, mediaObj) {
  if (!node) {
    const centerX = (-state.panX + window.innerWidth / 2) / state.scale - 90;
    const centerY = (-state.panY + window.innerHeight / 2) / state.scale - 25;
    spawnNode('', '', [mediaObj], [], centerX, centerY);
  } else {
    node.media = node.media || [];
    node.media.push(mediaObj);
    renderCanvas();
    saveState();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ==========================================================================
// Global Event Setup
// ==========================================================================
function setupEventListeners() {
  setupDockAndMenus();

  // Command Palette Input
  if (cmdPaletteInput) {
    cmdPaletteInput.addEventListener('input', (e) => {
      renderPaletteResults(e.target.value);
    });
  }

  // Keyboard Shortcuts (Ctrl/Cmd + K, Tab, Enter, Delete, Escape)
  window.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K opens Command Palette
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (commandPaletteModal && !commandPaletteModal.classList.contains('hidden')) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
      return;
    }

    if (e.key === 'Escape') {
      if (commandPaletteModal && !commandPaletteModal.classList.contains('hidden')) {
        closeCommandPalette();
      } else if (boxModalOverlay && !boxModalOverlay.classList.contains('hidden')) {
        closeBoxModal();
      } else if (ioModal && !ioModal.classList.contains('hidden')) {
        closeIoModal();
      } else if (sidebar.classList.contains('open')) {
        closeSidebar();
      } else if (aiChatPanel && !aiChatPanel.classList.contains('hidden')) {
        closeAiPanel();
      }
      closeAllPopovers();
      hideNodeContextMenu();
      return;
    }

    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    if ((boxModalOverlay && !boxModalOverlay.classList.contains('hidden')) || (ioModal && !ioModal.classList.contains('hidden')) || (commandPaletteModal && !commandPaletteModal.classList.contains('hidden'))) return;

    // Full Screen Toggle Shortcut: F or F11
    if (e.key === 'F11' || ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey)) {
      e.preventDefault();
      toggleFullscreen();
      return;
    }

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
      }
    }
  });

  // Copilot Input & Buttons
  if (aiSendBtn) aiSendBtn.addEventListener('click', () => handleCopilotSubmit());
  if (aiImageBtn) aiImageBtn.addEventListener('click', () => handleGenerateImage());
  if (aiMindmapBtn) aiMindmapBtn.addEventListener('click', () => handleCopilotSubmit(null, true));
  if (aiFullmapBtn) aiFullmapBtn.addEventListener('click', () => handleGenerateFullMap());
  if (closeAiBtn) closeAiBtn.addEventListener('click', closeAiPanel);

  if (aiInput) {
    aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleCopilotSubmit();
      }
    });
  }

  // Quick Action Chips in Copilot
  if (aiQuickChips) {
    aiQuickChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.ai-chip');
      if (!chip) return;
      if (chip.dataset.action === 'image') {
        const targetNode = state.nodes.find(n => n.id === state.selectedNodeId);
        const topic = targetNode ? (targetNode.body || targetNode.title) : 'project goals and creative vision';
        const imagePrompt = `visual illustration of: ${topic}`;
        handleGenerateImage(imagePrompt);
        return;
      }
      const prompt = chip.dataset.prompt;
      if (prompt) handleCopilotSubmit(prompt);
    });
  }

  // AI Preview Banner
  if (aiAcceptBtn) aiAcceptBtn.addEventListener('click', acceptAiPreview);
  if (aiUndoBtn) aiUndoBtn.addEventListener('click', undoAiPreview);

  // General Media Picker
  mediaPickerGeneral.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    const isVid = file.type.startsWith('video/');
    reader.onload = (evt) => {
      const targetNode = state.nodes.find(n => n.id === state.selectedNodeId);
      attachMediaToNode(targetNode, { type: isVid ? 'video' : 'image', url: evt.target.result, name: file.name });
    };
    reader.readAsDataURL(file);
    mediaPickerGeneral.value = '';
  });

  // Drawer Overlay Click
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', () => {
      closeSidebar();
      closeAiPanel();
      closeAllPopovers();
    });
  }

  // Box Modal Events
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

  if (modalWeaveBtn) {
    modalWeaveBtn.addEventListener('click', () => {
      if (!activeModalNodeId) return;
      const targetId = activeModalNodeId;
      closeBoxModal();
      openWeaveForNode(targetId, true);
    });
  }

  if (modalOrchestrateBtn) {
    modalOrchestrateBtn.addEventListener('click', () => {
      if (!activeModalNodeId) return;
      const targetId = activeModalNodeId;
      closeBoxModal();
      openOrchestratorForNode(targetId);
    });
  }

  if (modalDeleteBtn) {
    modalDeleteBtn.addEventListener('click', () => {
      if (!activeModalNodeId) return;
      deleteNodeById(activeModalNodeId);
      closeBoxModal();
    });
  }

  // Weave Floating Dock Listeners
  if (dockWeaveBtn) {
    dockWeaveBtn.addEventListener('click', () => {
      if (weaveDock && !weaveDock.classList.contains('hidden')) {
        closeWeaveDock();
      } else {
        const targetId = state.selectedNodeId || (state.nodes[0] ? state.nodes[0].id : null);
        if (targetId) openWeaveForNode(targetId, true);
      }
    });
  }

  if (weaveCloseBtn) weaveCloseBtn.addEventListener('click', closeWeaveDock);

  if (weaveRefreshBtn) {
    weaveRefreshBtn.addEventListener('click', () => {
      if (currentWeaveNodeId) openWeaveForNode(currentWeaveNodeId, true);
    });
  }

  if (weaveAutoToggle) {
    weaveAutoToggle.addEventListener('change', (e) => {
      autoWeaveEnabled = e.target.checked;
      localStorage.setItem('mind_auto_weave', autoWeaveEnabled ? 'true' : 'false');
    });
  }

  function handleAddCustomWeave() {
    if (!weaveCustomInput) return;
    const text = weaveCustomInput.value.trim();
    if (!text) return;
    const targetId = currentWeaveNodeId || state.selectedNodeId || (state.nodes[0] ? state.nodes[0].id : null);
    if (!targetId) return;
    weaveCustomInput.value = '';
    weaveApplySuggestion(targetId, text);
  }

  if (weaveAddCustomBtn) weaveAddCustomBtn.addEventListener('click', handleAddCustomWeave);
  if (weaveCustomInput) {
    weaveCustomInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAddCustomWeave();
    });
  }

  // Execution Orchestrator Listeners
  if (dockOrchBtn) {
    dockOrchBtn.addEventListener('click', () => {
      openOrchestratorForNode(state.selectedNodeId);
    });
  }

  if (closeOrchestratorBtn) closeOrchestratorBtn.addEventListener('click', closeOrchestratorModal);

  if (orchGenerateBtn) {
    orchGenerateBtn.addEventListener('click', () => {
      if (activeOrchNodeId) runOrchestration(activeOrchNodeId);
    });
  }

  if (orchCopyPromptBtn) {
    orchCopyPromptBtn.addEventListener('click', async () => {
      if (!lastGeneratedOrchPrompt) return;
      let promptText = lastGeneratedOrchPrompt;
      const match = lastGeneratedOrchPrompt.match(/```(?:text|markdown)?\n([\s\S]*?)```/);
      if (match && match[1]) promptText = match[1].trim();
      try {
        await navigator.clipboard.writeText(promptText);
        const prev = orchCopyPromptBtn.innerText;
        orchCopyPromptBtn.innerText = '✓ Copied Agent Prompt!';
        setTimeout(() => { orchCopyPromptBtn.innerText = prev; }, 1800);
      } catch (err) {}
    });
  }

  if (orchSaveNotesBtn) {
    orchSaveNotesBtn.addEventListener('click', () => {
      if (!activeOrchNodeId || !lastGeneratedOrchPrompt) return;
      const node = state.nodes.find(n => n.id === activeOrchNodeId);
      if (!node) return;
      node.note = (node.note ? node.note + '\n\n' : '') + '--- EXECUTION PLAN ---\n' + lastGeneratedOrchPrompt;
      saveState();
      const prev = orchSaveNotesBtn.innerText;
      orchSaveNotesBtn.innerText = '✓ Saved to Node Notes!';
      setTimeout(() => { orchSaveNotesBtn.innerText = prev; }, 1800);
    });
  }

  // AI Settings & Routing Listeners
  if (moreSettingsBtn) {
    moreSettingsBtn.addEventListener('click', () => {
      const moreMenu = document.getElementById('more-menu');
      if (moreMenu) moreMenu.classList.add('hidden');
      openAiSettingsModal();
    });
  }

  if (closeAiSettingsBtn) closeAiSettingsBtn.addEventListener('click', closeAiSettingsModal);
  if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveAiSettings);

  // I/O Modal Events
  if (closeIoModalBtn) closeIoModalBtn.addEventListener('click', closeIoModal);
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
      } catch (err) {}
    });
  }
  if (downloadMarkdownBtn) {
    downloadMarkdownBtn.addEventListener('click', () => {
      const text = ioExportText ? ioExportText.value : '';
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project-map.md';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
  if (exportPngBtn) exportPngBtn.addEventListener('click', exportCanvasToPng);
  if (runImportBtn) {
    runImportBtn.addEventListener('click', () => {
      const text = ioImportText ? ioImportText.value.trim() : '';
      if (!text) return;
      importMarkdownToCanvas(text, ioImportReplace ? ioImportReplace.checked : true);
      closeIoModal();
      fitMapToScreen(0.15);
    });
  }

  // Sidebar events
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
  if (ideaSearch) ideaSearch.addEventListener('input', renderSidebar);

  // PWA Install Prompt for Weave
  let deferredWeaveInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredWeaveInstallPrompt = e;
  });

  const moreInstallBtn = document.getElementById('more-install-btn');
  if (moreInstallBtn) {
    moreInstallBtn.addEventListener('click', async () => {
      const moreMenu = document.getElementById('more-menu');
      if (moreMenu) moreMenu.classList.add('hidden');
      if (deferredWeaveInstallPrompt) {
        deferredWeaveInstallPrompt.prompt();
        const { outcome } = await deferredWeaveInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          deferredWeaveInstallPrompt = null;
        }
      } else {
        alert('To install Weave Mind Map:\n• On iPhone / iPad: Tap the Share button (square with arrow) → tap "Add to Home Screen".\n• On Android / Chrome: Tap the three dots (⋮) → tap "Install app" or "Add to Home screen".\n• On Computer: Click the Install icon in your browser address bar.');
      }
    });
  }
}

// ==========================================================================
// Engine Initialization
// ==========================================================================
function init() {
  try { setTheme(state.theme || 'dark'); } catch (e) { console.error('Theme init error:', e); }
  try { setupEventListeners(); } catch (e) { console.error('Listeners error:', e); }
  try { setupContextMenu(); } catch (e) { console.error('Context menu error:', e); }
  try { setupGlobalPointerMovement(); } catch (e) { console.error('Pointer motion error:', e); }
  try { setupClipboardAndFileDrop(); } catch (e) { console.error('Drop error:', e); }
  try { renderCanvas(); } catch (e) { console.error('Render error:', e); }
  try { updateTransform(); } catch (e) { console.error('Transform error:', e); }
  try { updateCopilotContextBadge(); } catch (e) {}

  // Smart initial framing: fit map nicely on first load
  setTimeout(() => {
    if (state.nodes.length <= 2) {
      centerSelectedNode();
    } else if (!localStorage.getItem(STORAGE_KEY)) {
      fitMapToScreen(0.15);
    }
  }, 100);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
