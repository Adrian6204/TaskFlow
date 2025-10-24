# TaskFlow

TaskFlow is a modern, responsive web application for tracking and managing daily employee tasks. It features a Kanban-style board, task creation/editing, and an AI-powered task generation capability using the Google Gemini API to break down high-level goals into actionable sub-tasks.

## ✨ Key Features

- **Kanban Board**: Visualize your workflow with 'To Do', 'In Progress', and 'Done' columns.
- **Drag & Drop**: Intuitively move tasks between columns to update their status.
- **User Authentication**: Secure login with distinct 'Admin' and 'User' roles.
- **Admin Dashboard**: Admins get an overview of total tasks, team workload, and status distribution.
- **AI-Powered Task Generation**: Describe a high-level goal, and Gemini will generate a list of actionable sub-tasks.
- **AI Task Assistant**: Get advice and suggestions on specific tasks from a helpful AI assistant.
- **CRUD for Tasks**: Full functionality to Create, Read, Update, and Delete tasks (delete restricted to admins).
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
│   │   └── AuthContext.tsx       # Handles user authentication state
│   ├── components/
│   │   ├── icons/                # SVG icon components
│   │   ├── hooks/                # Reusable React hooks (e.g., useTheme)
│   │   ├── AddTaskModal.tsx      # Modal for creating/editing tasks
│   │   ├── AdminDashboard.tsx    # Dashboard view for admin users
│   │   ├── GenerateTasksModal.tsx# Modal for AI task generation
│   │   ├── Header.tsx            # Top navigation bar
│   │   ├── LoginPage.tsx         # Login form component
│   │   ├── Notification.tsx      # Pop-up notification component
│   │   ├── TaskBoard.tsx         # Main container for task columns
│   │   ├── TaskCard.tsx          # Individual task card component
│   │   ├── TaskColumn.tsx        # 'To Do', 'In Progress', 'Done' columns
│   │   ├── TaskDetailsModal.tsx  # Modal for viewing task details and comments
│   │   └── ThemeToggle.tsx       # Light/Dark mode switch
│   ├── context/
│   │   └── NotificationContext.tsx # Manages global notifications
│   ├── services/
│   │   └── geminiService.ts      # Logic for interacting with the Gemini API
│   ├── App.tsx                   # Main application component and router
│   ├── constants.ts              # Initial data and constants
│   ├── index.tsx                 # Entry point of the React application
│   └── types.ts                  # TypeScript type definitions
├── index.html                    # Main HTML file
└── metadata.json                 # Project metadata
```