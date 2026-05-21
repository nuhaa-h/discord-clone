# Discord Clone

A full-stack real-time messaging app inspired by Discord, built with ReactJS, ExpressJS, Socket.io, MongoDB, and pure CSS.

## Features

- **User Authentication** — Register and log in with JWT tokens
- **Real-time Messaging** — Instant message delivery via Socket.io
- **Channels** — Create, join, and delete text channels
- **Message History** — Persistent messages stored in MongoDB
- **Typing Indicators** — See when others are typing
- **Delete Messages** — Remove your own messages
- **Discord-inspired Dark UI** — Clean, familiar interface

## Tech Stack

| Layer     | Technology                |
|-----------|---------------------------|
| Frontend  | ReactJS, Axios, Socket.io-client |
| Backend   | ExpressJS, Socket.io      |
| Database  | MongoDB + Mongoose        |
| Auth      | JWT + bcryptjs            |
| Styling   | Pure CSS (CSS Variables)  |

## Project Structure

```
discord-clone/
├── client/               # React frontend
│   ├── public/
│   └── src/
│       ├── components/   # Sidebar, ChatArea, MessageItem
│       ├── context/      # AuthContext
│       ├── pages/        # AuthPage, ChatPage
│       └── services/     # Axios API layer
└── server/               # Express backend
    ├── middleware/        # JWT auth middleware
    ├── models/           # User, Channel, Message schemas
    └── routes/           # auth, channels, messages
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/nuhaa-h/discord-clone.git
cd discord-clone
```

### 2. Set up the server
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### 3. Set up the client
```bash
cd client
npm install
npm start
```

### 4. Open the app
Navigate to **http://localhost:3000**

## Environment Variables (server/.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/discord-clone
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:3000
```

## API Endpoints

| Method | Endpoint                    | Auth | Description          |
|--------|-----------------------------|------|----------------------|
| POST   | /api/auth/register          | No   | Create account       |
| POST   | /api/auth/login             | No   | Log in               |
| GET    | /api/auth/me                | Yes  | Get current user     |
| GET    | /api/channels               | Yes  | List all channels    |
| POST   | /api/channels               | Yes  | Create a channel     |
| DELETE | /api/channels/:id           | Yes  | Delete a channel     |
| GET    | /api/messages/:channelId    | Yes  | Get channel messages |
| DELETE | /api/messages/:id           | Yes  | Delete a message     |

## Socket Events

| Event          | Direction       | Description                    |
|----------------|-----------------|--------------------------------|
| join_channel   | Client → Server | Join a channel room            |
| send_message   | Client → Server | Send a message                 |
| typing         | Client → Server | Typing indicator               |
| new_message    | Server → Client | Broadcast new message          |
| user_typing    | Server → Client | Broadcast typing status        |
