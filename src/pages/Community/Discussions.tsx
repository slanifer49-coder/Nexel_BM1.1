import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

type Message = { 
  id: string; 
  user: string; 
  text: string; 
  ts: string 
};

export default function Discussions() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventRef = useRef<EventSource | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    
    // Close any existing connection
    if (eventRef.current) {
      eventRef.current.close();
    }

    setIsLoading(true);
    const es = new EventSource(`${base}/discussions/stream`, { 
      withCredentials: true 
    });
    eventRef.current = es;

    const handleMessage = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'connected') return;
        
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          if (!prev.some(m => m.id === msg.id)) {
            return [...prev, msg];
          }
          return prev;
        });
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    es.addEventListener('message', handleMessage);
    
    es.addEventListener('error', (error) => {
      console.error('EventSource error:', error);
      setIsLoading(false);
      toast.error('Connection to discussions lost. Please refresh the page.');
    });

    es.addEventListener('open', () => {
      console.log('EventSource connected');
      setIsLoading(false);
    });
    
    // Set loading to false after initial messages are loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      es.removeEventListener('message', handleMessage);
      es.close();
      eventRef.current = null;
    };
  }, []);

  const send = async () => {
    const messageText = text.trim();
    if (!messageText || isSending) return;

    setIsSending(true);
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    
    try {
      const response = await fetch(`${base}/discussions/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user: user?.name || user?.email || 'Guest', 
          text: messageText 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Send message error:', response.status, errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to send message');
      }
      
      setText("");
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="gradient-border p-0.5 rounded-lg mb-4 overflow-hidden">
        <div className="h-[60vh] overflow-y-auto bg-card/30 p-4">
          {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No messages yet</h3>
            <p className="text-muted-foreground">Be the first to start the conversation! 👋</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`p-4 rounded-lg ${
                  m.user === (user?.name || user?.email || 'Guest')
                    ? 'ml-8 bg-primary/10 border-l-4 border-primary'
                    : 'mr-8 bg-card/70 border-l-4 border-muted'
                }`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-semibold text-foreground">
                    {m.user}
                    {m.user === (user?.name || user?.email) && (
                      <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(m.ts)}
                  </span>
                </div>
                <div className="text-foreground break-words whitespace-pre-wrap">
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        </div>
      </div>
      
      <div className="bg-card/50 p-3 rounded-lg border border-border mt-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Type your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={isSending}
              className="pr-12 min-h-[44px]"
            />
            {text && (
              <button 
                onClick={() => setText('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
            )}
          </div>
          <Button 
            onClick={send} 
            disabled={!text.trim() || isSending}
            className="bg-gradient-primary hover:glow-primary min-w-[100px] h-[44px]"
            size="lg"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Send
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send-horizontal">
                  <path d="m3 3 3 9-3 9 19-9Z"/>
                  <path d="M6 12h16"/>
                </svg>
              </span>
            )}
          </Button>
        </div>
        
        {!user && (
          <div className="text-xs text-muted-foreground mt-2 text-center">
            You are chatting as <span className="font-medium">Guest</span>.{' '}
            <a href="/auth?tab=login" className="text-primary hover:underline">Login</a> to show your name.
          </div>
        )}
      </div>
    </div>
  );
}


