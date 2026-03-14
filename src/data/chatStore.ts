import { members } from "@/data/members";

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  isInstructor: boolean;
}

export interface Conversation {
  id: string;
  memberId: string;
  studentName: string;
  studentInitials: string;
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
}

type Listener = () => void;

const INSTRUCTOR_ID = "instructor-demo";

class ChatStore {
  private conversations: Conversation[] = [];
  private listeners: Set<Listener> = new Set();
  private initialized = false;

  private ensureInit() {
    if (this.initialized) return;
    this.initialized = true;
    // Seed with a subset of members and sample messages for demo purposes.
    const sampleMessages = [
      "I'm struggling with this module, can you help?",
      "Thanks for the extra practice materials!",
      "When is the retake available?",
      "Got it, will review before retaking.",
      "Completed all modules with mastery!",
      "Can we discuss the quiz results?",
      "I need more time on this topic.",
      "The resources you sent were very helpful.",
    ];
    this.conversations = members.slice(0, 20).map((m, i) => {
      const seedText = sampleMessages[i % sampleMessages.length];
      const ts = new Date(Date.now() - 1000 * 60 * (5 + i * 30)).toISOString();
      return {
        id: `c-${m.id}`,
        memberId: m.id,
        studentName: m.name,
        studentInitials: m.initials,
        lastMessage: seedText,
        lastTimestamp: ts,
        unread: i < 2 ? i + 1 : 0,
        online: i < 3,
        messages: [
          {
            id: `m-${m.id}-1`,
            senderId: m.id,
            recipientId: INSTRUCTOR_ID,
            text: seedText,
            timestamp: ts,
            isInstructor: false,
          },
        ],
      };
    });
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getConversations(): Conversation[] {
    this.ensureInit();
    return this.conversations;
  }

  private upsertConversationForMember(memberId: string): Conversation | undefined {
    this.ensureInit();
    let conv = this.conversations.find((c) => c.memberId === memberId);
    if (!conv) {
      const member = members.find((m) => m.id === memberId);
      if (!member) return undefined;
      conv = {
        id: `c-${member.id}`,
        memberId: member.id,
        studentName: member.name,
        studentInitials: member.initials,
        lastMessage: "No messages yet",
        lastTimestamp: new Date().toISOString(),
        unread: 0,
        online: false,
        messages: [],
      };
      this.conversations = [conv, ...this.conversations];
    }
    return conv;
  }

  sendDirectMessage(senderId: string, recipientId: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error("Message text is empty");
    }
    const member = members.find((m) => m.id === recipientId);
    if (!member) {
      throw new Error("Recipient not found");
    }

    const ts = new Date().toISOString();
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${recipientId}`,
      senderId,
      recipientId,
      text: trimmed,
      timestamp: ts,
      isInstructor: senderId === INSTRUCTOR_ID,
    };

    const conv = this.upsertConversationForMember(recipientId);
    if (!conv) {
      throw new Error("Unable to create conversation");
    }

    this.conversations = this.conversations.map((c) =>
      c.memberId === recipientId
        ? {
            ...c,
            messages: [...c.messages, msg],
            lastMessage: msg.text,
            lastTimestamp: ts,
            unread: c.unread,
          }
        : c,
    );

    this.notify();
  }

  sendMassMessage(senderId: string, recipientIds: string[], text: string) {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error("Message text is empty");
    }
    const uniqueIds = Array.from(new Set(recipientIds));
    if (uniqueIds.length === 0) {
      throw new Error("No recipients selected");
    }

    const validIds = uniqueIds.filter((id) => members.some((m) => m.id === id));
    if (validIds.length === 0) {
      throw new Error("No valid recipients found");
    }

    const tsBase = Date.now();
    for (let i = 0; i < validIds.length; i++) {
      const learnerId = validIds[i];
      const msgTs = new Date(tsBase + i).toISOString();
      const msg: ChatMessage = {
        id: `msg-${tsBase}-${learnerId}`,
        senderId,
        recipientId: learnerId,
        text: trimmed,
        timestamp: msgTs,
        isInstructor: senderId === INSTRUCTOR_ID,
      };
      const conv = this.upsertConversationForMember(learnerId);
      if (!conv) continue;
      this.conversations = this.conversations.map((c) =>
        c.memberId === learnerId
          ? {
              ...c,
              messages: [...c.messages, msg],
              lastMessage: msg.text,
              lastTimestamp: msgTs,
              unread: c.unread,
            }
          : c,
      );
    }

    this.notify();
  }
}

export const chatStore = new ChatStore();

// Instructor-side sender (used in instructor chat page)
export const sendDirectMessage = (recipientId: string, text: string) =>
  chatStore.sendDirectMessage(INSTRUCTOR_ID, recipientId, text);
export const sendMassMessage = (recipientIds: string[], text: string) =>
  chatStore.sendMassMessage(INSTRUCTOR_ID, recipientIds, text);

