interface ChatPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default async function ChatPage({
  params,
}: ChatPageProps) {
  const { chatId } = await params;

  return (
    <main>
      <h1>Chat</h1>
      <p>Chat ID: {chatId}</p>
    </main>
  );
}