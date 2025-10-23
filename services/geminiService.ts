
import { GoogleGenAI, Type } from '@google/genai';
import { Task, Employee } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder check. The actual environment variable is managed externally.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function generateTasksWithAI(
  goal: string,
  employees: Employee[]
): Promise<Omit<Task, 'id' | 'status'>[]> {
  const employeeIds = employees.map(e => e.id);
  const employeeNames = employees.map(e => e.name).join(', ');

  const prompt = `
    Based on the following high-level goal, break it down into a list of specific, actionable tasks.
    
    Goal: "${goal}"

    Here are the available employees to assign tasks to: ${employeeNames}.
    
    For each task, provide a concise title, a brief description, a suggested assignee ID from the list [${employeeIds.join(', ')}], and a due date.
    The due date should be a reasonable number of days from today's date (${new Date().toISOString().split('T')[0]}). For example, 'YYYY-MM-DD'.
    Assign tasks logically based on what their role might be inferred from the goal. Distribute the tasks among the employees.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: 'A short, clear title for the task.',
                  },
                  description: {
                    type: Type.STRING,
                    description: 'A brief description of what needs to be done.',
                  },
                  assigneeId: {
                    type: Type.STRING,
                    description: `The ID of the employee assigned to this task. Must be one of: ${employeeIds.join(', ')}.`,
                  },
                  dueDate: {
                    type: Type.STRING,
                    description: "The due date in YYYY-MM-DD format.",
                  },
                },
                required: ['title', 'description', 'assigneeId', 'dueDate'],
              },
            },
          },
          required: ['tasks'],
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (result && Array.isArray(result.tasks)) {
      // Validate that assigneeIds are valid
      return result.tasks.map((task: any) => ({
        ...task,
        assigneeId: employeeIds.includes(task.assigneeId) ? task.assigneeId : employeeIds[0], // fallback to first employee
      }));
    } else {
      throw new Error("AI response did not contain a valid 'tasks' array.");
    }

  } catch (error) {
    console.error('Error generating tasks with Gemini:', error);
    throw new Error('Failed to generate tasks. The AI model may be temporarily unavailable.');
  }
}
