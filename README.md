# NexusConnect — Landing Page Hero & Connect Sections

A modern landing page designed with pure **HTML5**, **CSS3**, and **JavaScript** featuring an interactive **Hero Section**, dynamic **Connect Hub**, **Architecture Pipeline**, and **Feature Bento Grid**.

---

## 🌟 Key Features

### 1. Hero Section with Interactive Connection Mesh
- **Dynamic SVG Connectors**: Live curved connector lines linking satellite service nodes (OpenAI, PostgreSQL, Auth & RBAC, Kafka Streams) to the central Nexus Mesh engine with animated gradient dashing.
- **Pulsing Core Hub**: Multi-layered rotating radar rings and status glow.
- **Live Terminal Telemetry**: Streaming mock network event logs and packet counters updating in real-time.
- **Micro Metrics**: Instant stats for Native Connectors (250+), Median Latency (<1.2ms), and SLA Uptime (99.999%).

### 2. Interactive "Connect Hub" Integration Matrix
- **Category Filtering**: Filter across *AI & LLMs*, *Databases*, *DevOps & Cloud*, and *Communication & Billing*.
- **Interactive Toggling**: Click any service card to connect or disconnect it from the active pipeline.
- **Live Topology Visualizer**: The active pipeline topology dynamically reflects connected services, updating payload particles and real-time JSON schema inspection.

### 3. Architecture & Flow Section (4-Step Pipeline)
- **Continuous Glowing Connection Rail**: Tracks data progression through *Ingest*, *Validate*, *Mesh Routing*, and *Realtime Delivery*.
- **Scroll-triggered animation**: Progress indicator expands smoothly as the user scrolls into view.

### 4. Bento Feature Grid & Live Interactive Demos
- **Realtime Sync Burst Slider**: Drag the interactive slider to simulate event bursts from 10 to 1,000 events/sec with dynamic load meters.
- **Zero-Trust Security & Self-Healing indicators**.

### 5. Interactive Sandbox Workspace Modal
- Click **"Launch Live Workspace"** or **"Start Free"** to open a real-time event simulator console.
- Dispatch synthetic events (`user.signup`, `payment.completed`, `vector.query`) and inspect simulated latency traces.

### 6. Themes & Design Polish
- **Dark & Light Mode**: Seamless toggle button with `localStorage` memory and adaptive canvas particles.
- **Background Interactive Mesh**: Subtle HTML5 canvas particle network that connects nearby nodes and reacts to mouse movements.
- **Responsive Layout**: Designed for screens from mobile devices (320px) to ultra-wide displays (4K).

---

## 📂 Project Structure

```text
├── index.html        # Semantic HTML5 markup, accessible SVG icons, and modal dialogs
├── style.css         # Modern CSS custom properties, glassmorphism, responsive grid & animations
├── script.js         # Canvas particle engine, dynamic SVG connector math, event simulator & toggles
└── README.md         # Project documentation
```

---

## 🚀 How to Run / Preview

### Option A: Open directly in browser
Double-click `index.html` or drag it into any modern web browser (Chrome, Edge, Firefox, Safari).

### Option B: Local development server
Using Python:
```bash
python -m http.server 3000
```
Then visit `http://localhost:3000` in your browser.
