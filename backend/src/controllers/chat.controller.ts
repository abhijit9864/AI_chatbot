import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createChat,
  getUserChats,
  getChatById,
  renameChat,
  deleteChat,
  createMessage,
  streamMessage,
  getChatMessages,
} from "../services/chat.service";

export async function createChatController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const chat = await createChat(req.user.userId);

    return res.status(201).json({
      chat,
    });
  } catch (error) {
    console.error("Create chat error:", error);

    return res.status(500).json({
      message: "Failed to create chat",
    });
  }
}

export async function getChatsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const chats = await getUserChats(req.user.userId);

    return res.json({
      chats,
    });
  } catch (error) {
    console.error("Get chats error:", error);

    return res.status(500).json({
      message: "Failed to get chats",
    });
  }
}

export async function getChatController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const chatId = String(req.params.chatId);

    const chat = await getChatById(
      req.user.userId,
      chatId
    );

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    return res.json({
      chat,
    });
  } catch (error) {
    console.error("Get chat error:", error);

    return res.status(500).json({
      message: "Failed to get chat",
    });
  }
}

export async function renameChatController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const chatId = String(req.params.chatId);
    const { title } = req.body;

    const chat = await renameChat(
      req.user.userId,
      chatId,
      title
    );

    return res.json({
      chat,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to rename chat";

    if (message === "Chat not found") {
      return res.status(404).json({
        message,
      });
    }

    return res.status(400).json({
      message,
    });
  }
}

export async function deleteChatController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const chatId = String(req.params.chatId);

    await deleteChat(
      req.user.userId,
      chatId
    );

    return res.json({
      message: "Chat deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete chat";

    if (message === "Chat not found") {
      return res.status(404).json({
        message,
      });
    }

    return res.status(500).json({
      message,
    });
  }
}

export async function createMessageController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const chatId = String(req.params.chatId);
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    // Configure Server-Sent Events
    res.setHeader(
      "Content-Type",
      "text/event-stream"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache"
    );

    res.setHeader(
      "Connection",
      "keep-alive"
    );

    res.flushHeaders();

    // Tell frontend streaming has started
    res.write(
      `data: ${JSON.stringify({
        type: "start",
      })}\n\n`
    );

    // Stream Qwen3 response
    const result = await streamMessage(
      req.user.userId,
      chatId,
      content,
      (chunk) => {
        res.write(
          `data: ${JSON.stringify({
            type: "chunk",
            content: chunk,
          })}\n\n`
        );
      }
    );

    // Send final saved messages
    res.write(
      `data: ${JSON.stringify({
        type: "done",
        userMessage: result.userMessage,
        assistantMessage: result.assistantMessage,
      })}\n\n`
    );

    res.end();
  } catch (error) {
    console.error(
      "Create message streaming error:",
      error
    );

    if (!res.headersSent) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create message";

      if (message === "Chat not found") {
        return res.status(404).json({
          message,
        });
      }

      return res.status(500).json({
        message,
      });
    }

    // If streaming has already started,
    // send an SSE error event.
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create message",
      })}\n\n`
    );

    res.end();
  }
}

export async function getMessagesController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const chatId = String(req.params.chatId);

    const messages = await getChatMessages(
      req.user.userId,
      chatId
    );

    return res.json({
      messages,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get messages";

    if (message === "Chat not found") {
      return res.status(404).json({
        message,
      });
    }

    return res.status(500).json({
      message,
    });
  }
}