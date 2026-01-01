
# User Guide: TrendVentures AI

## Introduction
**TrendVentures AI** is an advanced market intelligence suite designed to help entrepreneurs, developers, and strategists turn real-time market signals into actionable business blueprints. It leverages cutting-edge AI (Google Gemini 3 & OpenAI GPT-4o) to scan global news, identify trends, and generate comprehensive execution plans.

---

## 🚀 Getting Started

### Accessing the App
1.  Navigate to the deployed URL (or `localhost:5173` if running locally).
2.  **No Login Required** for basic research. You can start searching immediately.
3.  **Login (Optional)**: Click the "Login" button in the top right to sync your saved projects to the cloud using Supabase.

### The Dashboard
-   **Search Bar**: The central hub for initiating research.
-   **Live Ticker**: Displays real-time market signals detected by the system.
-   **Navigation**:
    -   **Discover**: Browse blueprints created by the community.
    -   **Library**: Access your saved projects (Local & Cloud).
    -   **Dashboard**: Manage your published blueprints (requires login).

---

## 🔍 Core Workflows

### 1. Trend Research
1.  **Enter a Niche**: Type a topic (e.g., "SaaS Pricing", "Sustainable Fashion", "AI Regulation").
2.  **Configure Filters**:
    -   **Region**: Select a target market (Global, USA, Asia, etc.).
    -   **Timeframe**: Choose how far back to scan (24h to 90d).
    -   **Deep Mode**: Toggle this for slower, more thorough reasoning (uses Gemini 3 Pro).
3.  **Analyze**: Click "Research Now". The AI will scan live news sources.

### 2. Deep Dive & Analysis
Once trends appear:
-   **Trend Cards**: View velocity (growth) and impact scores.
-   **Deep Dive**: Click "Deep Dive" on any trend to open a detailed modal with:
    -   Key Events Timeline.
    -   Sentiment Analysis.
    -   Strategic Tips.
    -   **Ask Analyst**: Use the chat interface to ask specific questions about the trend.

### 3. Generating Opportunities
1.  **Select Trends**: Click the checkboxes on trend cards to select which signals you want to capitalize on.
2.  **Generate**: Click "Generate Opportunities". The AI will synthesize these trends into 3 distinct business ideas.
3.  **Review Ideas**: Compare Difficulty, Revenue Potential, and Models.

### 4. Building the Blueprint
1.  **Select an Idea**: Click "Build Blueprint" on your chosen concept.
2.  **Wait for Architecture**: The AI will draft a comprehensive document including:
    -   Executive Summary
    -   Tech Stack & Marketing Strategy
    -   Revenue Models & Roadmap
    -   SWOT Analysis

---

## 🛠️ Advanced Features

### 🎤 Live Pitch (Voice Mode)
Practice pitching your idea to an AI persona in real-time.
1.  Open a Blueprint.
2.  Click the **"Pitch"** button (requires Gemini Provider).
3.  Select a Persona (e.g., **Skeptical VC**, **Curious Customer**).
4.  Speak into your microphone. The AI will respond with audio.

### 🎨 Brand Studio
Generate a visual identity for your business.
1.  Scroll to the **Brand Identity** section in the Blueprint view.
2.  Click **"Generate Identity"**.
3.  The AI will create:
    -   Business Names & Slogans.
    -   Color Palette (Hex codes).
    -   Brand Tone & Values.
    -   **Logo Generation**: Generate a visual logo concept (saved to local storage).

### 👥 Customer Personas
Understand your audience deeply.
1.  Locate the **Customer Personas** section.
2.  Click **"Identify Personas"**.
3.  The AI generates 3 detailed profiles (ICP) with pain points and goals.
4.  **Generate Avatar**: Click the image placeholder to generate a realistic AI portrait of the persona.

### 🚀 Launchpad
Create marketing assets instantly.
1.  Go to the **Marketing Launchpad** section.
2.  Generate:
    -   **Landing Page Copy**: Headlines, benefits, CTA.
    -   **Social Posts**: Viral tweets/LinkedIn posts.
    -   **Cold Emails**: Outreach templates.
    -   **React Code**: Convert the landing page copy into a functional React component.
    -   **Content Calendar**: A 30-day posting strategy.

### 🎥 Veo Video (Gemini Only)
Generate a high-quality marketing teaser video.
1.  In the Visuals section, click **"Generate Teaser"**.
2.  Requires a paid Google Cloud project linked to your API Key.
3.  Wait ~1-2 minutes for the video to render.

---

## ⚙️ Administration

### Admin Panel
Access via the Shield icon in the header.
-   **Affiliates**: Manage products that get auto-injected into blueprints based on keywords.
-   **Leads**: View emails captured from public blueprint waitlists.
-   **Prompts**: Edit the system prompts used by the AI to customize output behavior.
-   **Telemetry**: View system logs and errors.

**Note**: The first user to access the Admin Panel claims "Ownership" of the device installation.

---

## ❓ FAQ

**Q: Where is my data saved?**
A: By default, data is saved to your browser's **IndexedDB** (Local). If you log in, you can sync projects to the **Cloud** (Supabase).

**Q: Why do I need an API Key?**
A: This is a BYOK (Bring Your Own Key) application. The app runs entirely in your browser and communicates directly with AI providers using your credentials.

**Q: Can I export my blueprint?**
A: Yes. You can export as **JSON**, **Markdown**, or **Print to PDF** via the header actions.
