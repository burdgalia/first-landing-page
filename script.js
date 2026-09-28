/**
 * NexusConnect — Interactive Frontend Engine
 * Handles Canvas Particle Mesh, Dynamic SVG Connectors, Interactive Hub,
 * Metric Counters, Event Simulation & Theme Switcher.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBackgroundCanvas();
  initHeroConnectors();
  initConnectHub();
  initBentoSlider();
  initStepProgress();
  initCounterAnimations();
  initModalAndSandbox();
  initMobileNav();
});

/* ===================================================================
   1. THEME TOGGLE (Dark / Light)
   =================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Retrieve saved preference or system preference
  const savedTheme = localStorage.getItem('nexus_theme');
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    html.setAttribute('data-theme', 'light');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('nexus_theme', newTheme);
      
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
      // Redraw canvas with new palette
      if (window.updateCanvasTheme) {
        window.updateCanvasTheme(newTheme);
      }
    });
  }
}

/* ===================================================================
   2. BACKGROUND INTERACTIVE PARTICLE CANVAS
   =================================================================== */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 18000), 75);
  const maxDistance = 140;

  let mouse = { x: null, y: null, radius: 120 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 1.6 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx = -this.vx;
      if (this.y < 0 || this.y > height) this.vy = -this.vy;

      // Mouse collision repulsion
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const dirX = dx / dist;
          const dirY = dy / dist;
          this.x -= dirX * force * 1.5;
          this.y -= dirY * force * 1.5;
        }
      }
    }

    draw(theme) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = theme === 'dark' ? 'rgba(0, 242, 254, 0.45)' : 'rgba(59, 130, 246, 0.45)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';

    // Draw connecting lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = theme === 'dark' 
            ? `rgba(0, 242, 254, ${alpha})` 
            : `rgba(59, 130, 246, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Update and draw particles
    particles.forEach((p) => {
      p.update();
      p.draw(theme);
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ===================================================================
   3. HERO DYNAMIC SVG CONNECTORS (Lines between Core Hub and Satellites)
   =================================================================== */
function initHeroConnectors() {
  const stage = document.getElementById('hero-connection-stage');
  const svg = document.getElementById('hero-svg-connectors');
  const core = document.getElementById('node-core');
  const satellites = [
    document.getElementById('node-ai'),
    document.getElementById('node-db'),
    document.getElementById('node-auth'),
    document.getElementById('node-webhook')
  ];

  if (!stage || !svg || !core) return;

  function renderConnectors() {
    // Remove existing dynamic paths (retain defs)
    const existingPaths = svg.querySelectorAll('.connector-line-path');
    existingPaths.forEach(p => p.remove());

    const stageRect = stage.getBoundingClientRect();
    const coreRect = core.getBoundingClientRect();

    const coreCenterX = coreRect.left + coreRect.width / 2 - stageRect.left;
    const coreCenterY = coreRect.top + coreRect.height / 2 - stageRect.top;

    satellites.forEach((sat, idx) => {
      if (!sat) return;
      const satRect = sat.getBoundingClientRect();
      const satCenterX = satRect.left + satRect.width / 2 - stageRect.left;
      const satCenterY = satRect.top + satRect.height / 2 - stageRect.top;

      // Draw gentle bezier curve towards core
      const midX = (satCenterX + coreCenterX) / 2;
      const midY = (satCenterY + coreCenterY) / 2;
      
      // Add slight curvature offset
      const curveOffset = (idx % 2 === 0 ? 1 : -1) * 20;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute(
        'd',
        `M ${satCenterX} ${satCenterY} Q ${midX + curveOffset} ${midY - curveOffset} ${coreCenterX} ${coreCenterY}`
      );
      path.setAttribute('class', 'connector-line-path');
      path.setAttribute('id', `line-${sat.id}`);
      
      svg.appendChild(path);
    });
  }

  // Initial draw & bind resize
  renderConnectors();
  window.addEventListener('resize', renderConnectors);

  // Terminal log stream simulator
  const streamLog = document.getElementById('terminal-stream-log');
  const packetCounter = document.getElementById('terminal-packet-counter');
  let packets = 4921;

  const mockLogs = [
    { src: 'AI_INGEST', msg: 'Prompt token stream hooked to vector retrieval engine.' },
    { src: 'POSTGRES', msg: 'Replication slot wal_sync acknowledged 1,420 rows.' },
    { src: 'AUTH_MESH', msg: 'Session token refreshed with zero revocation drift.' },
    { src: 'WEBHOOK', msg: 'Stripe charge.succeeded parsed in 0.42ms.' },
    { src: 'CORE', msg: 'Auto-balanced traffic to 8 global edge nodes.' }
  ];

  setInterval(() => {
    packets += Math.floor(Math.random() * 12) + 3;
    if (packetCounter) {
      packetCounter.textContent = `Packets: ${packets.toLocaleString()} transmitted`;
    }

    if (streamLog) {
      const now = new Date();
      const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
      const randLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
      
      streamLog.innerHTML = `
        <span class="log-time">${timeStr}</span>
        <span class="log-source">${randLog.src} &rarr; CORE:</span>
        <span class="log-message">${randLog.msg}</span>
      `;
    }
  }, 2400);

  // Interactive node hover highlight
  satellites.forEach(sat => {
    if (!sat) return;
    sat.addEventListener('mouseenter', () => {
      const path = document.getElementById(`line-${sat.id}`);
      if (path) {
        path.style.stroke = '#ec4899';
        path.style.strokeWidth = '3.5';
      }
    });
    sat.addEventListener('mouseleave', () => {
      const path = document.getElementById(`line-${sat.id}`);
      if (path) {
        path.style.stroke = '';
        path.style.strokeWidth = '';
      }
    });
  });
}

/* ===================================================================
   4. CONNECT HUB (Filtering, Service Toggling, Live Payload Syncer)
   =================================================================== */
function initConnectHub() {
  const tabs = document.querySelectorAll('.hub-tab');
  const cards = document.querySelectorAll('.connector-card');
  const activeCountEl = document.getElementById('active-connect-count');
  const sourceNodesWrapper = document.getElementById('topo-source-nodes');
  const codeView = document.getElementById('payload-code-view');

  // Filter tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.getAttribute('data-category');
      cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Toggle card connection state
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      const isCurrentlyActive = card.classList.contains('active');
      const connectorName = card.querySelector('h4').textContent;
      const chip = card.querySelector('.status-chip');
      const actionIndicator = card.querySelector('.connect-action-indicator');

      if (isCurrentlyActive) {
        // Disconnect
        card.classList.remove('active');
        if (chip) {
          chip.textContent = 'Click to Connect';
          chip.className = 'status-chip stand-by';
        }
        if (actionIndicator) {
          actionIndicator.innerHTML = '<button class="mini-connect-btn">Connect</button>';
        }
        showToast(`Disconnected ${connectorName}`);
      } else {
        // Connect
        card.classList.add('active');
        if (chip) {
          chip.textContent = 'Connected';
          chip.className = 'status-chip active';
        }
        if (actionIndicator) {
          actionIndicator.innerHTML = '<span class="pulse-indicator"></span>';
        }
        showToast(`Connected ${connectorName} to pipeline!`);
      }

      updatePipelinePreview();
    });
  });

  function updatePipelinePreview() {
    const activeCards = document.querySelectorAll('.connector-card.active');
    const count = activeCards.length;

    if (activeCountEl) {
      activeCountEl.textContent = `${count} Connected Service${count === 1 ? '' : 's'}`;
    }

    // Refresh dynamic bubbles in right preview
    if (sourceNodesWrapper) {
      sourceNodesWrapper.innerHTML = '';
      if (count === 0) {
        sourceNodesWrapper.innerHTML = '<div class="topo-bubble" style="color: var(--text-muted);">No services active</div>';
      } else {
        activeCards.forEach(c => {
          const title = c.querySelector('h4').textContent.split(' ')[0];
          const bubble = document.createElement('div');
          bubble.className = 'topo-bubble';
          bubble.innerHTML = `<span class="bubble-dot green"></span> ${title}`;
          sourceNodesWrapper.appendChild(bubble);
        });
      }
    }

    // Update Live Code Payload
    if (codeView) {
      const activeIds = Array.from(activeCards).map(c => c.getAttribute('data-connector'));
      const mockPayload = {
        event_id: `evt_${Math.random().toString(36).substring(2, 8)}`,
        status: count > 0 ? "active_mesh" : "idle",
        connected_nodes: activeIds,
        pipeline: "nexus-mesh-v3",
        transformed: true,
        dispatch_latency_ms: (Math.random() * 0.4 + 0.6).toFixed(2),
        total_throughput_ops: `${(count * 3420).toLocaleString()}/s`
      };
      codeView.innerHTML = `<code>${JSON.stringify(mockPayload, null, 2)}</code>`;
    }
  }
}

/* ===================================================================
   5. BENTO SLIDER (Event Burst Simulator)
   =================================================================== */
function initBentoSlider() {
  const slider = document.getElementById('sync-slider');
  const sliderVal = document.getElementById('slider-val');
  const meterFill = document.getElementById('sync-meter-fill');

  if (!slider) return;

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value, 10);
    if (sliderVal) sliderVal.textContent = `${val} events/sec`;
    if (meterFill) {
      const pct = ((val - 10) / (1000 - 10)) * 100;
      meterFill.style.width = `${pct}%`;
      if (pct > 75) {
        meterFill.style.background = 'linear-gradient(90deg, #ec4899, #ef4444)';
      } else {
        meterFill.style.background = 'var(--gradient-brand)';
      }
    }
  });
}

/* ===================================================================
   6. ARCHITECTURE STEP PROGRESS ON SCROLL
   =================================================================== */
function initStepProgress() {
  const trackFill = document.getElementById('flow-line-fill');
  const pipelineSection = document.getElementById('pipeline');

  if (!trackFill || !pipelineSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        trackFill.style.width = '100%';
      }
    });
  }, { threshold: 0.3 });

  observer.observe(pipelineSection);
}

/* ===================================================================
   7. STATS METRICS NUMBER COUNTERS
   =================================================================== */
function initCounterAnimations() {
  const statsSection = document.getElementById('stats');
  if (!statsSection) return;

  let hasAnimated = false;

  const countUp = (el, target, decimals = 0, duration = 1800) => {
    const startTime = performance.now();
    const startVal = 0;

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (target - startVal) * ease;

      el.textContent = decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = decimals > 0 ? target.toFixed(decimals) : target.toLocaleString();
      }
    }

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        const eventsEl = document.getElementById('counter-events');
        const latencyEl = document.getElementById('counter-latency');
        const connectorsEl = document.getElementById('counter-connectors');
        const relEl = document.getElementById('counter-reliability');

        if (eventsEl) countUp(eventsEl, 14.8, 1);
        if (latencyEl) countUp(latencyEl, 1.18, 2);
        if (connectorsEl) countUp(connectorsEl, 250);
        if (relEl) countUp(relEl, 99.999, 3);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsSection);
}

/* ===================================================================
   8. INTERACTIVE WORKSPACE MODAL & SANDBOX SIMULATOR
   =================================================================== */
function initModalAndSandbox() {
  const openBtn = document.getElementById('open-demo-btn');
  const headerBtn = document.getElementById('header-cta-btn');
  const footerBtn = document.getElementById('footer-cta-btn');
  const heroBadge = document.getElementById('hero-badge');
  const modal = document.getElementById('demo-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const doneBtn = document.getElementById('modal-done-btn');
  const fireEventBtn = document.getElementById('btn-fire-event');
  const clearLogBtn = document.getElementById('btn-clear-log');
  const logOutput = document.getElementById('sandbox-log-output');
  const latencyDisplay = document.getElementById('sim-latency');

  function openModal() {
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  [openBtn, headerBtn, footerBtn, heroBadge].forEach(btn => {
    if (btn) btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (doneBtn) doneBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Sandbox Synthetic Dispatcher
  if (fireEventBtn && logOutput) {
    const eventTypes = [
      { name: 'user.signup', source: 'Auth0/JWT', dest: 'Postgres & Segment' },
      { name: 'payment.completed', source: 'Stripe API', dest: 'QuickBooks & Slack' },
      { name: 'vector.query', source: 'OpenAI Embeddings', dest: 'Pinecone Cluster' },
      { name: 'telemetry.metric', source: 'Edge Node us-east', dest: 'Datadog Agent' }
    ];

    fireEventBtn.addEventListener('click', () => {
      const randEvt = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const randLatency = (Math.random() * 0.7 + 0.3).toFixed(2);
      const timestamp = new Date().toLocaleTimeString();

      if (latencyDisplay) latencyDisplay.textContent = `${randLatency}ms`;

      const entry = document.createElement('div');
      entry.className = 'log-entry dispatch';
      entry.innerHTML = `[${timestamp}] ⚡ DISPATCH <strong>${randEvt.name}</strong> from <em>${randEvt.source}</em> &rarr; <em>${randEvt.dest}</em> (${randLatency}ms)`;
      logOutput.appendChild(entry);
      logOutput.scrollTop = logOutput.scrollHeight;

      showToast(`Dispatched ${randEvt.name} in ${randLatency}ms`);
    });
  }

  if (clearLogBtn && logOutput) {
    clearLogBtn.addEventListener('click', () => {
      logOutput.innerHTML = '<div class="log-entry system">[SYSTEM] Event stream cleared. Listening for next signal...</div>';
    });
  }
}

/* ===================================================================
   9. MOBILE NAVIGATION HAMBURGER
   =================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
      });
    });
  }
}

/* ===================================================================
   10. TOAST NOTIFICATION HELPER
   =================================================================== */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent-cyan);">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4M12 8h.01"/>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => toast.classList.add('show'), 50);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}
