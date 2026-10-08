export type Mode = 'bot' | 'human' | 'needs_admin';
export type Message = { id: string; sender: 'customer' | 'bot' | 'admin' | 'note'; text: string; at: number };
export type Activity = { id: string; text: string; at: number };
export type Conversation = {
  id: string; name: string; initials: string; color: string; city: string;
  mode: Mode; status: 'open' | 'resolved'; priority: boolean; unread: number;
  updatedAt: number; tags: string[]; assignee: string; summary: string;
  messages: Message[]; events: Activity[];
};
export type QuickReply = { id: string; title: string; text: string };
export type Workspace = { conversations: Conversation[]; processed: string[]; botEnabled?: boolean; quickReplies?: QuickReply[] };
export type Envelope = { state: Workspace; version: number };
export type Action = {
  type: 'handoff' | 'resume' | 'resolve' | 'reopen' | 'send' | 'note' | 'simulate' | 'read' | 'priority' | 'assign' | 'reset' | 'pause_all' | 'resume_all' | 'save_reply' | 'delete_reply';
  conversationId?: string; text?: string; requestId: string; replyId?: string; title?: string;
};
