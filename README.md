# ⚡ Neo-Brutalist Todo App // RAW PRODUCTIVITY

A high-performance, distraction-free productivity dashboard built with **React**, **Vite**, **Tailwind CSS**, and **Firebase** — engineered with an unapologetic **Neo-Brutalist** aesthetic, mechanical Web Audio sound effects, and zero fluff.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-FFD93D?style=for-the-badge&logo=vercel&logoColor=black)](https://todo-list-using-react-firebase.vercel.app/)
[![React](https://img.shields.io/badge/React-18-C4B5FD?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-FF6B6B?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-10B981?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🚀 Live Demo
Check out the live application at: **[todo-list-using-react-firebase.vercel.app](https://todo-list-using-react-firebase.vercel.app/)**

---

## ✨ Features at a Glance

### 🎯 Task Management & Priority System
- **P1 // URGENT, P2 // MEDIUM, P3 // LOW** priority tiers with distinct neo-brutalist color coding.
- **Collapsible Entry Bar**: Priority, deadline, and category controls stay cleanly collapsed until you start typing a task.
- **Inline Task Editing**: Edit titles, priorities, deadlines, and tags in place without modals or page reloads.

### 📅 Due Dates & Overdue Alerts
- Quick deadline presets (`TODAY`, `TOMORROW`, or custom native date picker).
- **Overdue Attention Badges**: Incomplete past-due tasks trigger high-contrast pulsing alert badges.
- Sort tasks by **Deadline**, **Priority**, or **Newest First**.

### 🏷️ Category Tagging & Instant Filtering
- Organize tasks with `#WORK`, `#DEV`, `#PERSONAL`, `#STUDY`, `#HEALTH`, and `#LIFE` tags.
- One-click filter pills to isolate tasks by category or priority level.

### ⏱️ Fullscreen Focus Timer (1s – 99:59:59)
- Custom numerical countdown inputs for **Hours**, **Minutes**, and **Seconds**.
- Quick sprint presets: `5M BREAK`, `15M SPRINT`, `25M POMODORO`, `50M DEEP`.
- **Fullscreen Distraction-Free Mode**: Expand to full screen (<kbd>F</kbd>) to completely hide tasks and focus on deep work.
- Built-in digital alarm chime and celebratory particle fanfare upon timer completion.

### 🔍 Instant Search & Keyboard Navigation
- High-contrast search bar positioned directly above the task list for live in-context filtering across task names, deadlines, and categories.
- Jump to search instantly from anywhere on the page using the **`/`** shortcut.

### 📊 Real-Time Progress Bar & Batch Actions
- Mechanical progress track with live percentage calculation and motivational status tags.
- **Bulk Actions**: `MARK ALL DONE` / `UNCHECK ALL` in one click.
- `CLEAR DONE` button to bulk-purge finished tasks from Firestore or local storage.

### 🔊 Zero-Dependency Mechanical Audio & Neo-Confetti
- Synthesized mechanical click, drop, and 8-bit victory arpeggio sound effects powered entirely by the native **Web Audio API** (0 external sound files needed).
- Persistent `SFX: ON / OFF` toggle in the top bar.
- Custom HTML5 Canvas geometric particle explosion upon completing tasks and sprints.

### 🌊 Smooth Momentum Scrolling
- Integrated **Lenis** smooth momentum scrolling with exponential easing.
- Floating back-to-top button with interactive hover animations.

### 🔐 Dual-Mode Storage (Firebase + Demo Mode)
- **Firebase Firestore + Auth**: Real-time cloud synchronization and user isolation.
- **Instant Demo Mode**: Automatically falls back to persistent `localStorage` if Firebase credentials are not configured, so anyone can clone and test immediately with zero setup!

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Where |
| :--- | :--- | :--- |
| <kbd>/</kbd> | Jump to & focus Search Bar | Anywhere on page |
| <kbd>Enter</kbd> | Submit task or save inline edit | Task input / Edit input |
| <kbd>Esc</kbd> | Cancel inline edit or close Focus Timer | Anywhere |
| <kbd>F</kbd> | Toggle Fullscreen mode | Inside Focus Timer |
| <kbd>Space</kbd> | Start / Pause countdown | Inside Focus Timer |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5
- **Styling**: Tailwind CSS with custom Neo-Brutalist design tokens (hard drop shadows, 3px-4px borders, zero blur)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio**: Native Browser Web Audio API Synthesizer
- **Smooth Scroll**: [@studio-freight/lenis](https://github.com/darkroomengineering/lenis)
- **Backend / Auth**: Firebase Authentication & Cloud Firestore (with local demo fallback)

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yashmishra11/Todolist-using-react.git
cd Todolist-using-react
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

> **Note**: The app includes an automatic **Local Demo Mode**. You can use the app immediately without adding Firebase keys.

### 4. (Optional) Configure Firebase
To enable cloud sync and real user authentication, create a project on [Firebase Console](https://console.firebase.google.com/) and create a `.env` or update `src/firebase.js` with your configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AddTodo/          # Collapsible task creation, priority & deadline picker
│   ├── Auth/             # Neo-brutalist authentication & demo mode switch
│   ├── Timer/            # Focus Timer with custom durations & fullscreen mode
│   ├── Todo/             # Task card item with inline editing, tags & badges
│   ├── TodoList/         # Task board, progress bar, instant search & batch actions
│   └── context/          # React contexts for global state
├── services/
│   └── api.js            # Unified data layer (Firebase Firestore + LocalStorage fallback)
├── utils/
│   ├── audio.js          # Web Audio API retro mechanical synthesizer
│   └── confetti.js       # Geometric neo-brutalist HTML5 canvas confetti
├── firebase.js           # Firebase app initialization
├── App.jsx               # Layout, Lenis smooth scroll & header controls
├── main.jsx              # Application bootstrap
└── index.css             # Neo-brutalist utility classes & typography
```

---

## 👤 Author

**Yash Mishra**
- **GitHub**: [@yashmishra11](https://github.com/yashmishra11)
- **LinkedIn**: [Yash Mishra](https://www.linkedin.com/in/yash-mishra-7b072224a/)
- **Portfolio**: [portfolio-vert-eight-34.vercel.app](https://portfolio-vert-eight-34.vercel.app/)

---

*Engineered with ⚡ for high-output productivity.*
