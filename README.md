# 🏗️ 3D CAD Viewer

This is a **3D CAD Viewer** that allows users to upload and view **STL files** directly in their browser. Built using **Vite, React, TypeScript, and TailwindCSS** on the frontend, and **Node.js with Express** on the backend. 🎨📐

## 📂 Project Structure

```
└── tarun516-cad-viewer/
    ├── backend/              # Backend (Node.js & Express)
    │   ├── package.json      # Backend dependencies
    │   ├── server.js         # Express server
    │   └── uploads/          # Uploaded STL files
    ├── frontend/             # Frontend (Vite + React + TypeScript)
    │   ├── src/
    │   │   ├── components/   # UI Components
    │   │   │   ├── FileUpload.tsx
    │   │   │   ├── ModelViewer.tsx
    │   │   ├── App.tsx       # Main App Component
    │   ├── index.html        # Root HTML File
    │   ├── package.json      # Frontend dependencies
    │   ├── vite.config.ts    # Vite Configuration
    └── README.md             # Project Documentation
```

## ✨ Features

- 🔼 **Upload STL files** and view them in 3D.
- 📐 **Interactive 3D Model Viewer** using Three.js.
- 🚀 **Fast and lightweight** with Vite & React.
- 🎨 **Modern UI** powered by TailwindCSS.
- 🌐 **Backend API** for file management with Express.js.

## 🚀 Getting Started

### 🔧 Prerequisites

Ensure you have **Node.js** and **npm/yarn** installed.

### 🛠️ Installation

#### 1️⃣ Clone the repository

```sh
git clone https://github.com/tarun516/tarun516-cad-viewer.git
cd tarun516-cad-viewer
```

#### 2️⃣ Install dependencies

##### Backend:

```sh
cd backend
npm install
```

##### Frontend:

```sh
cd ../frontend
npm install
```

### ▶️ Running the Application

##### Start Backend Server:

```sh
cd backend
node server.js
```

##### Start Frontend:

```sh
cd frontend
npm run dev
```

Now open **[http://localhost:5173](http://localhost:5173)** in your browser! 🌍

## 📸 Screenshots (Coming Soon) 📷

## 💡 Tech Stack

| Tech        | Description                 |
| ----------- | --------------------------- |
| React.js    | Frontend UI Library         |
| Vite        | Lightning-fast Dev Server   |
| TypeScript  | Typed JavaScript            |
| TailwindCSS | Utility-first CSS Framework |
| Node.js     | Backend Runtime             |
| Express     | Backend Framework           |
| Three.js    | 3D Rendering Library        |

## 📬 Contributing

Feel free to fork, open issues, or submit pull requests. 🤝

##

---

Enjoy using **3D CAD Viewer**! 🎉🚀

