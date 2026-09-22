"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const chat_controller_1 = require("../controllers/chat.controller");
const router = (0, express_1.Router)();
// Every chat endpoint requires authentication
router.use(auth_middleware_1.authenticate);
// Create a new chat
router.post("/", chat_controller_1.createChatController);
// Get all chats belonging to logged-in user
router.get("/", chat_controller_1.getChatsController);
// Get one chat + its messages
router.get("/:chatId", chat_controller_1.getChatController);
// Rename chat
router.patch("/:chatId", chat_controller_1.renameChatController);
// Delete chat
router.delete("/:chatId", chat_controller_1.deleteChatController);
// Create a user message
router.post("/:chatId/messages", chat_controller_1.createMessageController);
// Get all messages in a chat
router.get("/:chatId/messages", chat_controller_1.getMessagesController);
exports.default = router;
