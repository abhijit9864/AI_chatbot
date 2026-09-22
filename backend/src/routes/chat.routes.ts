import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createChatController,
  getChatsController,
  getChatController,
  renameChatController,
  deleteChatController,
  createMessageController,
  getMessagesController,
} from "../controllers/chat.controller";

const router = Router();

// Every chat endpoint requires authentication
router.use(authenticate);

// Create a new chat
router.post("/", createChatController);

// Get all chats belonging to logged-in user
router.get("/", getChatsController);

// Get one chat + its messages
router.get("/:chatId", getChatController);

// Rename chat
router.patch("/:chatId", renameChatController);

// Delete chat
router.delete("/:chatId", deleteChatController);

// Create a user message
router.post(
  "/:chatId/messages",
  createMessageController
);

// Get all messages in a chat
router.get(
  "/:chatId/messages",
  getMessagesController
);

export default router;