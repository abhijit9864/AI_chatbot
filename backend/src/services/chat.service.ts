import { prisma } from "../config/prisma";
import { generateAIResponse } from "./ai.service";
import { streamAIResponse } from "./ai.service";

export async function createChat(userId: string) {
  return prisma.chat.create({
    data: {
      userId,
      title: "New Chat",
    },
  });
}

export async function getUserChats(userId: string) {
  return prisma.chat.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getChatById(
  userId: string,
  chatId: string
) {
  return prisma.chat.findFirst({
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

export async function renameChat(
  userId: string,
  chatId: string,
  title: string
) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    throw new Error("Chat title is required");
  }

  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId,
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  return prisma.chat.update({
    where: {
      id: chatId,
    },
    data: {
      title: trimmedTitle,
    },
  });
}

export async function deleteChat(
  userId: string,
  chatId: string
) {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId,
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  await prisma.chat.delete({
    where: {
      id: chatId,
    },
  });
}

export async function createMessage(
  userId: string,
  chatId: string,
  content: string
) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Message content is required");
  }

  // Check chat ownership
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId,
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  // Save user message
  const userMessage = await prisma.message.create({
    data: {
      chatId,
      role: "USER",
      content: trimmedContent,
    },
  });

  // Get complete conversation history
  const conversationMessages =
    await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        role: true,
        content: true,
      },
    });

  // Send conversation history to AI
  const aiResponse = await generateAIResponse(
    conversationMessages
  );

  // Save assistant response
  const assistantMessage =
    await prisma.message.create({
      data: {
        chatId,
        role: "ASSISTANT",
        content: aiResponse.content,
        model: aiResponse.model,
      },
    });

  // Update chat timestamp
  await prisma.chat.update({
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

export async function streamMessage(
  userId: string,
  chatId: string,
  content: string,
  onChunk: (chunk: string) => void
) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Message content is required");
  }

  // Check chat ownership
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId,
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  // Save user message
  const userMessage = await prisma.message.create({
    data: {
      chatId,
      role: "USER",
      content: trimmedContent,
    },
  });

  // Get complete conversation history
  const conversationMessages =
    await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        role: true,
        content: true,
      },
    });

  // Stream AI response
  const aiResponse = await streamAIResponse(
    conversationMessages,
    onChunk
  );

  // Save complete AI response after streaming finishes
  const assistantMessage =
    await prisma.message.create({
      data: {
        chatId,
        role: "ASSISTANT",
        content: aiResponse.content,
        model: aiResponse.model,
      },
    });

  // Update chat timestamp
  await prisma.chat.update({
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

export async function getChatMessages(
  userId: string,
  chatId: string
) {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId,
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  return prisma.message.findMany({
    where: {
      chatId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

