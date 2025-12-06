# 🧬 CER Argument Builder - 科學論證學習平台

> 一個結合 AI 智慧回饋的科學寫作輔助工具，幫助學生掌握「C主張-E證據-R推理」的論證架構。

![專案封面圖](https://placehold.co/1200x400/102222/13ecec?text=CER+Argument+Builder)
*(您可以將此處替換為您的應用程式實際截圖)*

## 📖 專案簡介

**CER Argument Builder** 是一個專為高中生物與科學探究課程設計的互動式學習平台。透過 Google Gemini AI 的強大語言分析能力，本系統能即時批改學生的科學論證寫作，並針對 **CER 架構** 提供具體的評分與改進建議。

### ✨ 核心功能
- **CER 引導式寫作**：分段輸入主張 (Claim)、證據 (Evidence) 與推理 (Reasoning)。
- **AI 即時評量**：數秒內獲得 0-100 的評分與詳細評語。
- **學習歷程紀錄**：自動儲存所有的練習紀錄，方便回顧進步軌跡。
- **徽章成就系統**：根據分數獲得不同等級的成就徽章 (如：論證大師)。
- **深色模式介面**：沈浸式的學習體驗，保護視力。

---

## 🚀 使用說明 (User Guide)

### 1. 輸入論證內容
在首頁依序填寫以下欄位：
* **探究主題**：例如「細胞膜的滲透作用」或「酵素活性與溫度的關係」。
* **主張 (Claim)**：你對問題的核心回答或結論。
* **證據 (Evidence)**：支持你主張的數據、實驗觀察結果或引用資料。
* **推理 (Reasoning)**：運用科學原理（如生物學機制）解釋證據如何支持你的主張。

### 2. AI 智能分析
點擊下方的 **「開始分析」** 按鈕。系統會透過 Netlify Functions 呼叫 Google Gemini 模型進行分析。
*(約需等待 3-5 秒)*

### 3. 查看回饋
分析完成後，您將看到：
* **總體評分**與成就徽章。
* 針對 Claim、Evidence、Reasoning 三個面向的**個別評分與具體建議**。
* 您可以點擊 **「修正論點」** 回到編輯頁面，根據 AI 建議修改內容以獲得更高分。

### 4. 學習歷程
點擊右上角的 **「歷史紀錄」** 圖示，可以查看過去所有的練習紀錄，點擊單筆紀錄可回顧當時的詳細回饋。

---

## 🛠️ 開發與部署 (For Developers)

本專案使用 React (Vite) 前端框架，並透過 Netlify Serverless Functions 串接 Google Gemini API。

### 技術棧
* **Frontend**: React, TypeScript, Tailwind CSS
* **Backend**: Netlify Functions (Node.js)
* **AI Model**: Google Gemini (gemini-2.5-flash)

### 本地端執行 (Local Development)

1.  **複製專案**
    ```bash
    git clone [https://github.com/AvatarBiology/CER-Argusruction.git](https://github.com/AvatarBiology/CER-Argusruction.git)
    cd cer-argument-builder
    ```

2.  **安裝依賴**
    ```bash
    npm install
    ```

3.  **設定環境變數**
    在專案根目錄建立 `.env.local` 檔案（用於純前端測試）或設定 Netlify CLI：
    ```text
    # 若在本地端透過 Vite 代理測試 Netlify Function，請確保 .env 檔設定正確
    GOOGLE_API_KEY=您的_Google_AI_Key
    ```

4.  **啟動開發伺服器**
    ```bash
    npm run dev
    ```

### ☁️ 部署至 Netlify

本專案已設定 `netlify.toml`，可直接連接 GitHub 進行自動部署。

**必要的環境變數 (Environment Variables):**
在 Netlify 後台 (`Site configuration` > `Environment variables`) 必須設定：

| Key | Value | 說明 |
| :--- | :--- | :--- |
| `GOOGLE_API_KEY` | `AIzaSy...` | Google AI Studio 申請的金鑰 |

---

## 👨‍🏫 教育理念：什麼是 CER？

CER 是一種幫助學生像科學家一樣思考與寫作的框架：
1.  **Claim (主張)**: 回答探究問題的陳述。
2.  **Evidence (證據)**: 來自實驗或觀察的數據，用來支持主張。
3.  **Reasoning (推理)**:連結證據與主張的邏輯橋樑，通常包含科學原理的解釋。

---

## 📝 License

[MIT License](LICENSE) © 2025 AvatarBiology
