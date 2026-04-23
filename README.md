# StepOne Content Intelligence Engine

> **Built for StepOne AI Buildathon 2026** — Content & Design Engine Challenge

An AI-powered pipeline that transforms raw event media into publish-ready marketing assets across LinkedIn, Instagram, Instagram Stories, and a structured Case Study — with zero manual intervention.

---

## 🚀 Live Demo

**[→ View Live on Vercel](https://stepone-content-engine.vercel.app)**

---

## 🧠 How It Works

```
Raw Event Photos
      ↓
[1] Media Ingestion
    Upload up to 20 images via drag-and-drop
      ↓
[2] AI Asset Scoring (GPT-4o Vision)
    Each image scored on: Sharpness · Composition · Brand Relevance · Human Engagement
      ↓
[3] Intelligent Asset Selection
    AI selects the best image for each platform with documented rationale
      ↓
[4] Platform-Specific Content Generation (GPT-4o)
    ├── LinkedIn Post (professional narrative + hashtags + CTA)
    ├── Instagram Post (scroll-stopping caption + 20+ hashtags)
    ├── Instagram Story (bold text overlay + CTA button)
    └── Case Study Draft (metrics + brand narrative + conclusion)
      ↓
[5] Publish-Ready Output Package
    All content displayed in a tabbed dashboard, copyable in one click
```

---

## ✨ Key Features

- **Zero manual intervention** — upload photos + fill a brief → get 4 platform outputs
- **AI asset scoring** — every image scored on 4 dimensions with reasoning
- **Platform differentiation** — each output is purpose-built, not repurposed
- **Selection explainability** — AI documents *why* each image was chosen
- **Story image renderer** — generates a 1080×1920 Instagram Story with text overlay using Canvas API
- **Real-time progress** — live pipeline status with step-by-step updates

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, Tailwind CSS, Framer Motion |
| AI | GPT-4o (Vision + Text), JSON mode |
| Image Processing | Canvas API (browser-side story generation) |
| Deployment | Vercel |

---

## 🏃 Running Locally

### 1. Clone & Install

```bash
git clone https://github.com/your-username/stepone-content-engine
cd stepone-content-engine
npm install
```

### 2. Set up environment

```bash
cp .env.local.example .env.local
# Edit .env.local and add your OpenAI API key
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚢 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set the `OPENAI_API_KEY` environment variable in your Vercel project settings.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── process/route.ts     # Start pipeline job
│   │   ├── status/[jobId]/      # Poll job status
│   │   └── health/route.ts      # Health check
│   ├── layout.tsx
│   ├── page.tsx                 # Main app (step router)
│   └── globals.css
├── components/
│   ├── HeroSection.tsx          # Landing page
│   ├── UploadStep.tsx           # Media upload with drag-drop
│   ├── BriefStep.tsx            # Event brief form
│   ├── ProcessingView.tsx       # Real-time pipeline progress
│   └── ResultsDashboard.tsx     # Tabbed results (all 4 outputs)
├── lib/
│   ├── openai.ts                # GPT-4o client
│   ├── assetScorer.ts           # Vision-based image scoring
│   ├── contentGenerator.ts      # Platform content generation
│   ├── storyImageGenerator.ts   # Canvas story renderer
│   ├── pipeline.ts              # End-to-end orchestration
│   └── jobStore.ts              # In-memory job state
└── types/
    └── index.ts                 # TypeScript types
```

---

## 🏆 Why This Wins

1. **Solves the exact problem** — StepOne manually processes event photos. This automates 100% of that workflow.
2. **Selection intelligence** — not just generation, but *choosing* the right asset for each platform with documented reasoning.
3. **Platform differentiation** — LinkedIn gets a professional narrative, Instagram gets scroll-stopping copy, Stories get bold overlays. Not the same content repurposed.
4. **Explainability** — every decision is documented. Production-ready, not just a demo.
5. **End-to-end in < 3 minutes** — from raw upload to 4 publish-ready outputs.

---

## 👥 Team

Built for the StepOne AI Buildathon 2026.

---
