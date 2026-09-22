"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChat = createChat;
exports.getUserChats = getUserChats;
exports.getChatById = getChatById;
exports.renameChat = renameChat;
exports.deleteChat = deleteChat;
exports.createMessage = createMessage;
exports.getChatMessages = getChatMessages;
const prisma_1 = require("../config/prisma");
const ai_service_1 = require("./ai.service");
async function createChat(userId) {
    return prisma_1.prisma.chat.create({
        data: {
            userId,
            title: "New Chat",
        },
    });
}
async function getUserChats(userId) {
    return prisma_1.prisma.chat.findMany({
        where: {
            userId,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });
}
async function getChatById(userId, chatId) {
    return prisma_1.prisma.chat.findFirst({
        where: {
            id: chatId,
            userId,
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: "asc",
                },
            },
        },
    });
}
async function renameChat(userId, chatId, title) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
        throw new Error("Chat title is required");
    }
    const chat = await prisma_1.prisma.chat.findFirst({
        where: {
            id: chatId,
            userId,
        },
    });
    if (!chat) {
        throw new Error("Chat not found");
    }
    return prisma_1.prisma.chat.update({
        where: {
            id: chatId,
        },
        data: {
            title: trimmedTitle,
        },
    });
}
async function deleteChat(userId, chatId) {
    const chat = await prisma_1.prisma.chat.findFirst({
        where: {
            id: chatId,
            userId,
        },
    });
    if (!chat) {
        throw new Error("Chat not found");
    }
    await prisma_1.prisma.chat.delete({
        where: {
            id: chatId,
        },
    });
}
// export async function createMessage(
//   userId: string,
//   chatId: string,
//   content: string
// ) {
//   const trimmedContent = content.trim();
//   if (!trimmedContent) {
//     throw new Error("Message content is required");
//   }
//   const chat = await prisma.chat.findFirst({
//     where: {
//       id: chatId,
//       userId,
//     },
//   });
//   if (!chat) {
//     throw new Error("Chat not found");
//   }
//   const message = await prisma.message.create({
//     data: {
//       chatId,
//       role: "USER",
//       content: trimmedContent,
//     },
//   });
//   await prisma.chat.update({
//     where: {
//       id: chatId,
//     },
//     data: {
//       updatedAt: new Date(),
//     },
//   });
//   return message;
// }
async function createMessage(userId, chatId, content) {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
        throw new Error("Message content is required");
    }
    const chat = await prisma_1.prisma.chat.findFirst({
        where: {
            id: chatId,
            userId,
        },
    });
    if (!chat) {
        throw new Error("Chat not found");
    }
    // Save user message
    const userMessage = await prisma_1.prisma.message.create({
        data: {
            chatId,
            role: "USER",
            content: trimmedContent,
        },
    });
    await prisma_1.prisma.chat.update({
        where: {
            id: chatId,
        },
        data: {
            updatedAt: new Date(),
        },
    });
    // Generate AI response
    const aiResponse = await (0, ai_service_1.generateAIResponse)(trimmedContent);
    // Save assistant message
    const assistantMessage = await prisma_1.prisma.message.create({
        data: {
            chatId,
            role: "ASSISTANT",
            content: aiResponse.content,
            model: aiResponse.model,
        },
    });
    await prisma_1.prisma.chat.update({
        where: {
            id: chatId,
        },
        data: {
            updatedAt: new Date(),
        },
    });
    return {
        userMessage,
        assistantMessage,
    };
}
async function getChatMessages(userId, chatId) {
    const chat = await prisma_1.prisma.chat.findFirst({
        where: {
            id: chatId,
            userId,
        },
    });
    if (!chat) {
        throw new Error("Chat not found");
    }
    return prisma_1.prisma.message.findMany({
        where: {
            chatId,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}
