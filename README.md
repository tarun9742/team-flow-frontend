# Team Platform

Welcome to Team Platform! This is a simple web app built to help teams work together better. Whether you're managing projects, organizing tasks, or chatting with your team, this platform has you covered. It's designed to be easy to use and helps keep everyone on the same page.

## What It Does

Team Platform is all about making team collaboration smooth and fun. Here are the main features:

- **Dashboard**: Get a quick overview of your projects and tasks right when you log in.
- **Kanban Board**: Organize your work with a visual board where you can drag and drop tasks between columns like "To Do," "In Progress," and "Done."
- **Team Chat**: Chat with your team members in real-time. You can have group chats or private conversations.
- **Project Management**: Create and manage projects, add details, and track progress.
- **Team Board**: See all your team members and manage who’s on which project.
- **Assistant**: A helpful AI assistant to answer questions or provide tips.
- **Authentication**: Secure login and registration so only your team can access the app.

## Tech Stack

This app is built using modern web technologies to make it fast and reliable:

- **Frontend**: React with TypeScript for building the user interface.
- **Build Tool**: Vite for quick development and building.
- **Styling**: Tailwind CSS for clean and responsive designs.
- **State Management**: Zustand for handling app data.
- **Backend**: Firebase for authentication, database, and real-time features.
- **Real-time Chat**: Socket.io for instant messaging.
- **UI Components**: Radix UI for accessible and customizable components.
- **Drag and Drop**: @dnd-kit for smooth task moving on the kanban board.

## Getting Started

To run this app on your computer, follow these steps:

1. **Install Node.js**: Make sure you have Node.js (version 16 or higher) installed. You can download it from [nodejs.org](https://nodejs.org/).

2. **Clone the Repository**: Download or clone this project to your computer.

3. **Install Dependencies**: Open a terminal in the project folder and run:
   ```
   npm install
   ```

4. **Set Up Firebase**: You'll need a Firebase project for authentication and data. Create one at [firebase.google.com](https://firebase.google.com/), then add your config to the app (check `src/lib/firebase.ts`).

5. **Run the App**: Start the development server with:
   ```
   npm run dev
   ```
   Open your browser and go to `http://localhost:5173` to see the app.

6. **Build for Production**: When you're ready to deploy, run:
   ```
   npm run build
   ```

## How to Use

- **Sign Up/Login**: Create an account or log in with your email.
- **Explore the Dashboard**: See your projects and recent activity.
- **Create a Project**: Click on "Projects" to add a new one and invite team members.
- **Use the Kanban Board**: Add tasks, assign them, and move them as you work.
- **Chat**: Go to the chat section to talk with your team.
- **Manage Teams**: Add or remove members from your team board.

## Contributing

We love contributions! If you want to help improve Team Platform:

1. Fork the repository.
2. Create a new branch for your changes.
3. Make your updates and test them.
4. Submit a pull request with a description of what you changed.

Please keep the code clean and follow the existing style. If you find bugs or have ideas, open an issue on GitHub.

## License

This project is open-source and available under the MIT License. Feel free to use it for your own teams!

---

If you have any questions or need help, check out the issues section or reach out. Happy collaborating!
