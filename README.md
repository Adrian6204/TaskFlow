# TaskFlow

TaskFlow is a modern, responsive web application for tracking and managing daily employee tasks. It features a Kanban-style board, an interactive calendar, task dependencies, advanced filtering, and an AI-powered suite of tools using the Google Gemini API to accelerate and enhance project management.

## ✨ Key Features

- **Dual Views**: Visualize your workflow with a classic Kanban Board or a monthly Calendar View to track deadlines.
- **Advanced Filtering & Search**: Instantly find tasks with a global search bar and filters for assignee and priority.
- **Task Dependencies**: Create "blocking" relationships between tasks to ensure work is completed in the correct order.
- **Drag & Drop**: Intuitively move tasks between columns on the Kanban board to update their status.
- **User Authentication**: Secure login with distinct 'Admin' and 'User' roles.
- **Advanced Admin Dashboard**: Admins get a powerful overview with:
    - **Visual Charts**: A pie chart for task status distribution and a bar chart for team workload.
    - **Real-time Activity Feed**: A log of all recent project activities.
    - **AI-Powered Weekly Summary**: Generate a natural-language summary of the team's progress with one click.
- **AI-Powered Task Generation**: Describe a high-level goal, and Gemini will generate a list of actionable sub-tasks.
- **AI Priority Suggestion**: Let AI analyze your task's content to suggest an appropriate priority level.
- **AI Task Assistant**: Get advice and suggestions on specific tasks from a helpful AI assistant.
- **Full Task Management**: Full functionality to Create, Read, Update, and Delete tasks (delete restricted to admins).
- **Task Details & Comments**: View detailed task information and collaborate through a real-time comment thread.
- **Notifications**: Get instant feedback when you update a task's status.
- **Light & Dark Mode**: A sleek theme toggle for user preference.
- **Responsive Design**: Fully functional on desktop, tablet, and mobile devices.

## 🚀 Tech Stack

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini API (`@google/genai`)
- **State Management**: React Context API

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
│   │   ├── charts/               # Reusable chart components for dashboard
│   │   ├── icons/
│   │   ├── hooks/
│   │   ├── AdminDashboard.tsx
│   │   ├── CalendarView.tsx      # New calendar component
│   │   ├── FilterBar.tsx         # New filter component
│   │   ├── Header.tsx
│   │   ├── TaskBoard.tsx
│   │   └── ... (other components)
│   ├── context/
│   ├── services/
│   │   └── geminiService.ts
│   ├── App.tsx
│   ├── constants.ts
│   ├── index.tsx
│   └── types.ts
├── index.html
└── metadata.json
```