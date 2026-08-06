/**
 * Vista embebible del chat educativo (iframe desde campusdemo).
 * Recibe JWT vía postMessage del host padre.
 */
"use client";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { EmbedAuthListener } from "@/components/widget/EmbedAuthListener";

export default function EmbedChatPage() {
  return (
    <EmbedAuthListener>
      <main className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        <ChatWindow compact skipHistory={false} />
      </main>
    </EmbedAuthListener>
  );
}
