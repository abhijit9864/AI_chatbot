"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatController = createChatController;
exports.getChatsController = getChatsController;
exports.getChatController = getChatController;
exports.renameChatController = renameChatController;
exports.deleteChatController = deleteChatController;
exports.createMessageController = createMessageController;
exports.getMessagesController = getMessagesController;
const chat_service_1 = require("../services/chat.service");
async function createChatController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const chat = await (0, chat_service_1.createChat)(req.user.userId);
        return res.status(201).json({
            chat,
        });
    }
    catch (error) {
        console.error("Create chat error:", error);
        return res.status(500).json({
            message: "Failed to create chat",
        });
    }
}
async function getChatsController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const chats = await (0, chat_service_1.getUserChats)(req.user.userId);
        return res.json({
            chats,
        });
    }
    catch (error) {
        console.error("Get chats error:", error);
        return res.status(500).json({
            message: "Failed to get chats",
        });
    }
}
async function getChatController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const chatId = String(req.params.chatId);
        const chat = await (0, chat_service_1.getChatById)(req.user.userId, chatId);
        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
            });
        }
        return res.json({
            chat,
        });
    }
    catch (error) {
        console.error("Get chat error:", error);
        return res.status(500).json({
            message: "Failed to get chat",
        });
    }
}
async function renameChatController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const chatId = String(req.params.chatId);
        const { title } = req.body;
        const chat = await (0, chat_service_1.renameChat)(req.user.userId, chatId, title);
        return res.json({
            chat,
        });
    }
    catch (error) {
        const message = error instanceof Error
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
async function deleteChatController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const chatId = String(req.params.chatId);
        await (0, chat_service_1.deleteChat)(req.user.userId, chatId);
        return res.json({
            message: "Chat deleted successfully",
        });
    }
    catch (error) {
        const message = error instanceof Error
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
async function createMessageController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const chatId = String(req.params.chatId);
        const { content } = req.body;
        const message = await (0, chat_service_1.createMessage)(req.user.userId, chatId, content);
        return res.status(201).json({
            message,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to create message";
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
async function getMessagesController(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const chatId = String(req.params.chatId);
        const messages = await (0, chat_service_1.getChatMessages)(req.user.userId, chatId);
        return res.json({
            messages,
        });
    }
    catch (error) {
        const message = error instanceof Error
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
