# TaskFlow

TaskFlow is a modern, responsive web application for tracking and managing daily employee tasks. It features a Kanban-style board, task creation/editing, real-time time tracking, and an AI-powered suite of tools using the Google Gemini API to optimize your workflow.

## ✨ Key Features

### ⚡️ Core Productivity
- **Dual Views**: Visualize your workflow with a classic Kanban Board or a monthly Calendar View.
- **Time Tracking**: Built-in start/stop timers on every task. Track duration and view detailed session history logs.
- **Subtasks & Checklists**: Break complex tasks into actionable steps. Use AI to automatically generate checklist items based on the task description.
- **Smart Tagging**: Organize tasks with custom, color-coded tags. Includes an intelligent autocomplete system for quick tagging.
- **Task Dependencies**: Create "blocking" relationships between tasks to ensure work is completed in the correct order.
- **Data Persistence**: All tasks, logs, and settings are automatically saved to your browser's local storage, ensuring your data survives page reloads.

### 🤖 AI Integration (Powered by Gemini)
- **Goal-to-Task Generation**: Describe a high-level objective, and Gemini will generate a complete list of assigned tasks to achieve it.
- **Smart Subtask Creation**: Automatically generate a checklist of subtasks for any specific task with one click.
- **Priority Suggestion**: AI analyzes task content to suggest appropriate priority levels (Low to Urgent).
- **Weekly Summaries**: Generate concise, natural-language status reports and summaries for the admin dashboard.
- **AI Assistant**: Context-aware chat to ask questions or get advice about specific tasks.

### 🎨 User Experience
- **Modern UI/UX**: A polished, split-screen login page with responsive design and smooth transitions.
- **Dark Mode**: Fully supported dark theme that respects system preferences.
- **Drag & Drop**: Intuitively move tasks between columns to update status.
- **Advanced Filtering**: Quickly find tasks by searching titles/tags or filtering by assignee and priority.

### 🛡️ Admin & Security
- **Role-Based Access**: Distinct 'Admin' and 'User' roles. Admins have exclusive access to dashboards and deletion capabilities.
- **Admin Dashboard**: Visual analytics including:
    - Task Status Distribution (Pie Chart)
    - Team Workload (Bar Chart)
    - Real-time Activity Feed
- **Safety Confirmations**: Confirmation modals prevent accidental deletion of important data.

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **State Management**: React Context API + LocalStorage
- **Icons**: Custom SVG Icons

## 🏁 Getting Started

This application is designed to run in a web-based development environment where the `API_KEY` for the Gemini API is provided as an environment variable.

### Prerequisites

- A valid Google Gemini API Key must be configured in the environment as `process.env.API_KEY`.

### Running the Application

Simply open the `index.html` file in a compatible browser or development environment. The application will mount and be ready to use.

## 📂 Project Structure

```
/
├── public/
├── src/
│   ├── auth/
│   │   └── AuthContext.tsx
│   ├── components/
│   │   ├── charts/               # Visualization components
│   │   ├── icons/                # SVG Icon library
│   │   ├── hooks/                # Custom React hooks
│   │   ├── AdminDashboard.tsx    # Analytics view
│   │   ├── AddTaskModal.tsx      # Task creation/editing
│   │   ├── TaskDetailsModal.tsx  # Extended details, subtasks, timer
│   │   ├── TaskBoard.tsx         # Kanban column layout
│   │   ├── CalendarView.tsx      # Monthly view
│   │   ├── LoginPage.tsx         # Authentication screen
│   │   └── ... (other components)
│   ├── context/
│   ├── services/
│   │   └── geminiService.ts      # AI integration logic
│   ├── App.tsx                   # Main application logic
│   ├── constants.ts              # Mock data & configs
│   └── types.ts                  # TypeScript definitions
├── index.html
└── metadata.json
```