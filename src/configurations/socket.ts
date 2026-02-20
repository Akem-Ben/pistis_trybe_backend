/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server, Socket } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

let io: Server;

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
  };
}
//THIS IS A DUMMY SETUP, IT CAN BE CONFIGURED BETTER WHEN NEEDED
export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: string;
      };

      socket.user = { id: decoded.userId };

      next();
    } catch (error: any) {
      console.error("Socket Coection Error:", error);
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.user!.id;

    socket.join(`user:${userId}`);

    socket.on("join:conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("leave:conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on(
      "send_message",
      async (payload: {
        conversationId: string;
        content: string;
        mediaUrl?: string;
      }) => {
        io.to(`conversation:${payload.conversationId}`).emit(
          "receive_message",
          {
            senderId: userId,
            content: payload.content,
            mediaUrl: payload.mediaUrl,
            createdAt: new Date(),
          },
        );
      },
    );

    socket.on("disconnect", () => {});
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};
