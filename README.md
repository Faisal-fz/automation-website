# Browser Automation Agent

A sophisticated browser automation tool built with **Playwright** and **OpenAI Agents** for automating ChaiCode signup workflows and other web interactions.

---

## 🚀 Features

- **Intelligent Automation**: Uses OpenAI Agents for smart decision-making during automation  
- **Human-like Interactions**: Realistic typing delays and human-like behavior patterns  
- **Multi-step Workflows**: Handles complex navigation flows (Main page → Signup → Form completion)  
- **Visual Documentation**: Automatic screenshot capture at key workflow steps  
- **Robust Element Detection**: Advanced selector strategies with fallback mechanisms  
- **Cross-platform Support**: Works on Windows, macOS, and Linux  

---

## 🛠️ Technologies Used

- [Playwright](https://playwright.dev/) - Cross-browser automation library  
- [OpenAI Agents](https://github.com/openai/agents) - AI-powered automation agents  
- [Zod](https://zod.dev/) - TypeScript-first schema validation  
- **Node.js** - JavaScript runtime environment  

---

## 📋 Prerequisites

- Node.js (v14 or higher)  
- npm (comes with Node.js)  
- OpenAI API key (for agent functionality)  

---

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/faisalfaiz/browser-auto.git
cd browser-auto


Install dependencies

npm install

npm install playwright

Set up environment variables

🚀 Usage
Basic Usage
node agent.js

What the automation does:

Opens Browser – Launches Chromium in non-headless mode

Navigates to Main Page – Goes to https://ui.chaicode.com

Finds Signup Link – Intelligently locates and clicks signup button/link

Captures Screenshots – At key steps for documentation

Fills Signup Form – With human-like typing delays:

First Name: Alex

Last Name: Johnson

Email: alex.johnson@example.com

Password: MySecurePass**

Submits Form – Clicks submit and waits for response

Final Screenshot – Captures the result page

📁 Project Structure
browser-automation/
├── agent.js             # Main automation script
├── package.json         # Project dependencies
├── package-lock.json    # Exact dependency versions
├── .env                 # Environment variables (not tracked)
├── .gitignore           # Git ignore rules
├── signup-page.png      # Screenshot of signup page
├── after-submit.png     # Screenshot after form submission
└── README.md            # Project documentation

⚙️ Configuration Options

Typing Delays

perCharDelay: Delay between character keystrokes (default: 120ms)

betweenFieldsMs: Delay between form fields (default: 600ms)

Wait Times

waitMs: Page load wait time (default: 800ms)

Screenshot Settings

Screenshots saved as .png in project root

Customizable filenames for each step

📝 License

This project is licensed under the MIT License – see the LICENSE
 file.

🙏 Acknowledgments

Playwright Team

OpenAI

ChaiCode
