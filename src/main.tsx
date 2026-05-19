import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  ChevronLeft,
  CircleUserRound,
  FileMusic,
  Home,
  Megaphone,
  MessageSquareText,
  MoreHorizontal,
  Music2,
  PanelLeft,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import "./styles.css";

type Role = "member" | "sectionLeader" | "director";
type PreviewMode = "web" | "mobile";
type ChannelType = "section" | "director" | "ensemble";

type Conversation = {
  id: string;
  name: string;
  type: ChannelType;
  section?: string;
  preview: string;
  time: string;
  unread: number;
  pinned?: string;
};

type Message = {
  id: string;
  author: string;
  role?: string;
  body: string;
  time: string;
  mine?: boolean;
  tone?: "default" | "announcement" | "system";
};

const conversations: Conversation[] = [
  {
    id: "brass",
    name: "Brass Section",
    type: "section",
    section: "Brass",
    preview: "Use the shared markup?",
    time: "2 min",
    unread: 3,
    pinned: "Meet near Gate C after warmup.",
  },
  {
    id: "director",
    name: "Director Announcements",
    type: "director",
    preview: "Call time moved to 4:15 PM",
    time: "18 min",
    unread: 1,
  },
  {
    id: "low-brass",
    name: "Low Brass",
    type: "section",
    section: "Low Brass",
    preview: "Music check before rehearsal",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: "ensemble",
    name: "Full Ensemble",
    type: "ensemble",
    preview: "Final run starts at measure 12",
    time: "Mon",
    unread: 0,
  },
];

const messagesByConversation: Record<string, Message[]> = {
  brass: [
    {
      id: "m1",
      author: "Maya",
      role: "Section Leader",
      body: "Please mark measure 42 before the next full run.",
      time: "10:18 AM",
      tone: "announcement",
    },
    {
      id: "m2",
      author: "You",
      body: "Got it. Updating my part now.",
      time: "10:19 AM",
      mine: true,
    },
    {
      id: "m3",
      author: "Director Smith",
      body: "New drill sheet is uploaded for pregame.",
      time: "10:24 AM",
    },
    {
      id: "m4",
      author: "You",
      body: "Should we use the shared markup?",
      time: "10:25 AM",
      mine: true,
    },
    {
      id: "m5",
      author: "System",
      body: "Maya shared 2 markup notes with Brass Section.",
      time: "10:26 AM",
      tone: "system",
    },
  ],
  director: [
    {
      id: "d1",
      author: "Director Smith",
      body: "Call time moved to 4:15 PM. Hydrate before rehearsal.",
      time: "9:46 AM",
      tone: "announcement",
    },
    {
      id: "d2",
      author: "System",
      body: "SMS queued for 312 recipients. No delivery failures.",
      time: "9:47 AM",
      tone: "system",
    },
  ],
  "low-brass": [
    {
      id: "l1",
      author: "Eli",
      role: "Section Leader",
      body: "Check the last two pages before warmup block.",
      time: "Yesterday",
      tone: "announcement",
    },
  ],
  ensemble: [
    {
      id: "e1",
      author: "Director Smith",
      body: "Final run starts at measure 12. Keep phones silent on the sideline.",
      time: "Monday",
      tone: "announcement",
    },
  ],
};

const roleLabels: Record<Role, string> = {
  member: "Member",
  sectionLeader: "Section Leader",
  director: "Director",
};

function App() {
  return <LiveChatDemo />;
}

function LiveChatDemo() {
  const [role, setRole] = useState<Role>("sectionLeader");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("web");
  const [activeId, setActiveId] = useState("brass");
  const [draft, setDraft] = useState("");
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [audience, setAudience] = useState("Brass");

  const activeConversation = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];
  const baseMessages = messagesByConversation[activeConversation.id] ?? [];
  const messages = useMemo(
    () => [...baseMessages, ...sentMessages.filter((message) => message.id.startsWith(activeConversation.id))],
    [activeConversation.id, baseMessages, sentMessages],
  );

  function sendMessage() {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setSentMessages((current) => [
      ...current,
      {
        id: `${activeConversation.id}-${Date.now()}`,
        author: "You",
        body: trimmed,
        time: "Now",
        mine: true,
      },
    ]);
    setDraft("");
  }

  const canBroadcast = role === "director" || role === "sectionLeader";

  return (
    <main className="demo-shell">
      <header className="demo-topbar">
        <div>
          <p className="eyebrow">Staccato Music</p>
          <h1>Live Chat Prototype</h1>
          <p className="topbar-copy">Standalone component for section chat, announcements, SMS-ready broadcasts, and shared markup context.</p>
        </div>

        <div className="topbar-controls">
          <div className="mode-tabs" aria-label="Preview mode">
            {(["web", "mobile"] as PreviewMode[]).map((mode) => (
              <button key={mode} className={previewMode === mode ? "is-active" : ""} onClick={() => setPreviewMode(mode)}>
                {mode === "web" ? "Web App" : "Mobile App"}
              </button>
            ))}
          </div>

          <div className="role-switcher" aria-label="Preview role">
            {(Object.keys(roleLabels) as Role[]).map((nextRole) => (
              <button key={nextRole} className={role === nextRole ? "is-active" : ""} onClick={() => setRole(nextRole)}>
                {roleLabels[nextRole]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className={previewMode === "web" ? "prototype-stage web-stage" : "prototype-stage mobile-stage"}>
        {previewMode === "web" ? (
          <DesktopLiveChat
            role={role}
            activeConversation={activeConversation}
            activeId={activeId}
            conversations={conversations}
            messages={messages}
            draft={draft}
            audience={audience}
            smsEnabled={smsEnabled}
            canBroadcast={canBroadcast}
            onAudienceChange={setAudience}
            onDraftChange={setDraft}
            onSend={sendMessage}
            onSelectConversation={setActiveId}
            onToggleSms={() => setSmsEnabled((value) => !value)}
          />
        ) : (
          <MobileLiveChat
            role={role}
            activeConversation={activeConversation}
            conversations={conversations}
            messages={messages}
            draft={draft}
            canBroadcast={canBroadcast}
            onDraftChange={setDraft}
            onSend={sendMessage}
            onSelectConversation={setActiveId}
          />
        )}
      </section>
    </main>
  );
}

type SharedProps = {
  role: Role;
  activeConversation: Conversation;
  conversations: Conversation[];
  messages: Message[];
  draft: string;
  canBroadcast: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onSelectConversation: (id: string) => void;
};

type DesktopProps = SharedProps & {
  activeId: string;
  audience: string;
  smsEnabled: boolean;
  onAudienceChange: (value: string) => void;
  onToggleSms: () => void;
};

function DesktopLiveChat({
  role,
  activeConversation,
  activeId,
  conversations,
  messages,
  draft,
  audience,
  smsEnabled,
  canBroadcast,
  onAudienceChange,
  onDraftChange,
  onSend,
  onSelectConversation,
  onToggleSms,
}: DesktopProps) {
  return (
    <article className="desktop-frame" aria-label="Desktop live chat preview">
      <aside className="sidebar">
        <div className="brand">
          <strong>Staccato</strong>
          <span>Director Portal</span>
        </div>
        <nav className="nav-list" aria-label="Main">
          <NavItem icon={<Home />} label="Dashboard" />
          <NavItem icon={<UsersRound />} label="Roster" />
          <NavItem icon={<FileMusic />} label="Music" />
          <NavItem icon={<Music2 />} label="Sections" />
          <NavItem icon={<MessageSquareText />} label="Messages" active />
          <NavItem icon={<Settings />} label="Settings" />
        </nav>
        <button className="sidebar-cta">
          <Megaphone size={16} />
          Compose SMS
        </button>
      </aside>

      <section className="desktop-content">
        <div className="workspace-header">
          <div>
            <h2>{role === "director" ? "Director Messaging" : "Live Chat"}</h2>
            <p>{role === "director" ? "Compose announcements, choose audience, and monitor delivery." : "Section conversations, director announcements, and SMS-ready updates."}</p>
          </div>
          <div className="header-actions">
            <button className="dark-button">
              <Plus size={16} />
              New Message
            </button>
            {canBroadcast && (
              <button className="yellow-button" onClick={onToggleSms}>
                <Bell size={16} />
                {smsEnabled ? "SMS On" : "SMS Off"}
              </button>
            )}
          </div>
        </div>

        <div className="desktop-panels">
          <section className="panel conversation-panel">
            <PanelTitle title="Conversations" />
            <SearchBox placeholder="Search chats" />
            <div className="chips">
              <Chip active>All</Chip>
              <Chip tone="accent">Section</Chip>
              <Chip>Directors</Chip>
            </div>
            <div className="conversation-list">
              {conversations.map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  active={conversation.id === activeId}
                  onClick={() => onSelectConversation(conversation.id)}
                />
              ))}
            </div>
          </section>

          <section className="panel thread-panel">
            <ThreadHeader conversation={activeConversation} canBroadcast={canBroadcast} />
            {activeConversation.pinned && <PinnedNote note={activeConversation.pinned} />}
            <MessageList messages={messages} />
            <Composer value={draft} onChange={onDraftChange} onSend={onSend} />
          </section>

          <aside className="panel context-panel">
            <PanelTitle title="Context" />
            <div className="context-card dark">
              <strong>{activeConversation.name}</strong>
              <span>{activeConversation.section ? `${activeConversation.section} section` : "Full band channel"}</span>
            </div>

            {canBroadcast && (
              <div className="context-card broadcast">
                <div className="context-label">Audience</div>
                <div className="audience-options">
                  {["Full Band", "Brass", "Leaders"].map((option) => (
                    <button key={option} className={audience === option ? "selected" : ""} onClick={() => onAudienceChange(option)}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="context-card status">
              <strong>Delivery status</strong>
              <span>App sent • SMS {smsEnabled ? "pending" : "disabled"} • 0 failures</span>
            </div>

            <div className="context-card">
              <strong>Shared Markup</strong>
              <span>2 active notes</span>
            </div>

            <button className="dark-button wide-button">
              <ShieldCheck size={16} />
              Open Section
            </button>
          </aside>
        </div>
      </section>
    </article>
  );
}

function MobileLiveChat({ role, activeConversation, conversations, messages, draft, canBroadcast, onDraftChange, onSend, onSelectConversation }: SharedProps) {
  const [screen, setScreen] = useState<"list" | "thread">("list");

  return (
    <article className="mobile-frame" aria-label="Mobile live chat preview">
      <div className="phone-shell">
        {screen === "list" ? (
          <>
            <div className="mobile-header">
              <div>
                <h2>Live Chat</h2>
                <p>{roleLabels[role]} preview</p>
              </div>
              <button className="small-dark-button">New</button>
            </div>
            <SearchBox placeholder="Search" />
            <div className="chips">
              <Chip active>All</Chip>
              <Chip>Sections</Chip>
              <Chip>Directors</Chip>
            </div>
            <button
              className="mobile-feature-card"
              onClick={() => {
                onSelectConversation("brass");
                setScreen("thread");
              }}
            >
              <span>
                <strong>Brass Section</strong>
                <small>3 unread messages</small>
              </span>
              <b>3</b>
            </button>
            <div className="mobile-conversation-list">
              {conversations.slice(1).map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  compact
                  onClick={() => {
                    onSelectConversation(conversation.id);
                    setScreen("thread");
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mobile-thread-header">
              <button onClick={() => setScreen("list")} aria-label="Back to chats">
                <ChevronLeft size={24} />
              </button>
              <div>
                <h2>{activeConversation.name}</h2>
                <p>{activeConversation.section ? `${activeConversation.section} • Live chat` : "Announcement thread"}</p>
              </div>
              {canBroadcast && <button className="sms-pill">SMS</button>}
            </div>
            {activeConversation.pinned && <PinnedNote note={activeConversation.pinned} />}
            <MessageList messages={messages} />
            <Composer value={draft} onChange={onDraftChange} onSend={onSend} />
          </>
        )}
        <MobileNav active="Chat" />
      </div>
    </article>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <a className={active ? "nav-item active" : "nav-item"} href="#">
      {icon}
      {label}
    </a>
  );
}

function PanelTitle({ title }: { title: string }) {
  return <h3 className="panel-title">{title}</h3>;
}

function SearchBox({ placeholder }: { placeholder: string }) {
  return (
    <label className="search-box">
      <Search size={16} />
      <input placeholder={placeholder} />
    </label>
  );
}

function Chip({ children, active = false, tone = "default" }: { children: React.ReactNode; active?: boolean; tone?: "default" | "accent" }) {
  return <button className={`chip ${active ? "active" : ""} ${tone === "accent" ? "accent" : ""}`}>{children}</button>;
}

function ConversationRow({ conversation, active = false, compact = false, onClick }: { conversation: Conversation; active?: boolean; compact?: boolean; onClick: () => void }) {
  return (
    <button className={`conversation-row ${active ? "active" : ""} ${compact ? "compact" : ""}`} onClick={onClick}>
      <span className={conversation.unread ? "avatar unread" : "avatar"} />
      <span className="conversation-copy">
        <strong>{conversation.name}</strong>
        <small>{conversation.preview}</small>
      </span>
      <span className="conversation-meta">
        <small>{conversation.time}</small>
        {conversation.unread > 0 && <i />}
      </span>
    </button>
  );
}

function ThreadHeader({ conversation, canBroadcast }: { conversation: Conversation; canBroadcast: boolean }) {
  return (
    <div className="thread-header">
      <div>
        <h3>{conversation.name}</h3>
        <p>{conversation.section ? `42 members • ${conversation.section} live chat` : "Director announcement channel"}</p>
      </div>
      {canBroadcast && <button className="sms-pill">SMS</button>}
      <button className="icon-button" aria-label="More options">
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}

function PinnedNote({ note }: { note: string }) {
  return <div className="pinned-note">Pinned: {note}</div>;
}

function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.mine ? "mine" : ""} ${message.tone ?? ""}`}>
          <div className="message-author">
            {message.author}
            {message.role && <span> • {message.role}</span>}
          </div>
          <p>{message.body}</p>
          <time>{message.time}</time>
        </div>
      ))}
    </div>
  );
}

function Composer({ value, onChange, onSend }: { value: string; onChange: (value: string) => void; onSend: () => void }) {
  return (
    <div className="composer">
      <input
        value={value}
        placeholder="Write a message..."
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSend();
        }}
      />
      <button className="attachment-button" aria-label="Add attachment">
        <Plus size={18} />
      </button>
      <button className="send-button" onClick={onSend}>
        <Send size={16} />
        Send
      </button>
    </div>
  );
}

function MobileNav({ active }: { active: string }) {
  const items = [
    ["Home", Home],
    ["Music", FileMusic],
    ["Chat", MessageSquareText],
    ["Profile", CircleUserRound],
  ] as const;

  return (
    <nav className="mobile-nav">
      {items.map(([label, Icon]) => (
        <a key={label} className={label === active ? "active" : ""} href="#">
          <Icon size={18} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
