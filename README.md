
  
# 📄✨ CV_ana (Resume Analyzer Pro) ✨📄

*A full-stack, AI-powered Resume Analyzer that utilizes Natural Language Processing (NLP) to evaluate candidates' resumes against job descriptions.*

**It provides detailed feedback, including ATS scores, keyword matching, gap detection, and semantic scoring.**

</div>

---

## 🌟 Features

- 📝 **Automated Resume Parsing:** Extracts skills, experience, and metadata from `.docx` and `.pdf` files.
- 🧠 **Advanced NLP Analysis:** Uses *Spacy* and *HuggingFace Transformers* to generate semantic similarity scores.
- 📊 **Comprehensive Candidate Scoring:** Calculates **ATS**, **Keyword**, and **Semantic** scores.
- ⚡ **Asynchronous Processing:** Offloads heavy NLP workloads to background *Celery workers*.
- 🎨 **Modern User Interface:** Fast, responsive frontend built with React, Vite, and TailwindCSS.

---

## 🛠️ Tech Stack

### 💻 Frontend
- **Framework:** ⚛️ React 18 (TypeScript) with ⚡ Vite
- **State Management:** 📦 Redux Toolkit
- **Styling:** 🎨 TailwindCSS, 🌀 Framer Motion
- **Data Visualization:** 📈 Recharts
- **Icons:** 🖼️ Lucide React

### ⚙️ Backend
- **Framework:** 🚀 FastAPI (Python)
- **Database:** 🐘 PostgreSQL (with Asyncpg & SQLAlchemy ORM)
- **Queue / Caching:** 🧱 Redis + 🥬 Celery
- **NLP Libraries:** 🤖 Spacy, 🤗 HuggingFace Transformers, `pdfplumber`, `python-docx`

---

## 🚀 Getting Started

### 📋 Prerequisites
- 🐳 [Docker](https://www.docker.com/) and Docker Compose
- 🟢 Node.js (v24 or newer recommended for frontend development)
- 🐍 Python 3.11+ (if running the backend locally without Docker)

### ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/OrbIndraneel/CV_ana.git
   cd CV_ana
   ```

2. **Environment Variables:** 🔑
   Rename `.env.example` to `.env` in the root (or inside the backend directory, depending on your setup) and fill in the required credentials.
   ```bash
   cp .env.example .env
   ```

3. **Run with Docker Compose:** 🐳
   The easiest way to get the entire stack (Database, Redis, Backend, and Celery Worker) up and running is through Docker.
   ```bash
   docker-compose up --build
   ```
   > ⚠️ **Note:** The initial run might take some time as the backend will download the required Spacy and HuggingFace models.

4. **Frontend Setup (Local Development):** 💻
   Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 💡 Usage

1. 🌐 Open your browser and navigate to the frontend URL (typically `http://localhost:5173` for Vite).
2. 📎 Upload a candidate's resume (PDF or DOCX).
3. 🎯 Provide a target Job Description.
4. 🔍 View the detailed analysis report, including the overall score, missing keywords, and structural suggestions.

---

## 📁 Project Structure

```text
CV_ana/
│
├── backend/            # ⚙️ FastAPI Application & NLP Logic
│   ├── app/            # Main application code (API, Core, DB, Models, NLP, Services, Tasks)
│   ├── Dockerfile      # Backend container definition
│   └── requirements.txt# Python dependencies
│
├── frontend/           # 💻 React + Vite Frontend
│   ├── src/            # Source code (Components, Pages, Redux store)
│   ├── package.json    # Node dependencies
│   └── vite.config.ts  # Vite bundler configuration
│
├── resumes/            # 📄 Directory containing sample resumes
├── docker-compose.yml  # 🐳 Orchestrates PostgreSQL, Redis, FastAPI, and Celery
└── README.md           # 📖 Project Documentation
```

## 📜 License
[MIT License](LICENSE)
