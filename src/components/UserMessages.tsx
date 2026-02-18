import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, ChevronDown, ChevronUp, Users } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

const UserMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sending, setSending] = useState(false);
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('user-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchMessages = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`recipient_id.eq.${user.id},recipient_id.is.null,sender_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!error) setMessages(data || []);
    setLoading(false);
  };

  const markAsRead = async (msgId: string) => {
    await supabase.from('messages').update({ is_read: true }).eq('id', msgId);
  };

  const handleExpand = (msg: Message) => {
    const isExpanding = expandedMsg !== msg.id;
    setExpandedMsg(isExpanding ? msg.id : null);
    if (isExpanding && !msg.is_read && msg.sender_id !== user!.id) {
      markAsRead(msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    }
  };

  // Find admin sender for replies — get any sender that isn't the current user
  const getAdminId = () => {
    const adminMsg = messages.find(m => m.sender_id !== user!.id && m.recipient_id === user!.id);
    return adminMsg?.sender_id || null;
  };

  const sendReply = async (toMsgSenderId: string) => {
    if (!replyBody.trim()) return;
    const { error } = await supabase.from('messages').insert({
      sender_id: user!.id,
      recipient_id: toMsgSenderId,
      subject: 'Re: reply',
      body: replyBody.trim(),
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setReplyBody('');
      fetchMessages();
    }
  };

  const sendNewMessage = async () => {
    if (!composeSubject.trim() || !composeBody.trim()) {
      toast({ title: 'Error', description: 'Subject and message are required', variant: 'destructive' });
      return;
    }
    // Send to admin — find an admin from existing messages, or send without recipient (admin will see via RLS)
    const adminId = getAdminId();

    setSending(true);
    const { error } = await supabase.from('messages').insert({
      sender_id: user!.id,
      recipient_id: adminId, // may be null if no prior conversation
      subject: composeSubject.trim(),
      body: composeBody.trim(),
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Sent', description: 'Message sent to support' });
      setComposeSubject('');
      setComposeBody('');
      setShowCompose(false);
      fetchMessages();
    }
    setSending(false);
  };

  // Separate broadcasts and direct messages
  const broadcasts = messages.filter(m => m.recipient_id === null && m.sender_id !== user!.id);
  const directMessages = messages.filter(m => m.recipient_id !== null || m.sender_id === user!.id);

  // Group direct by conversation thread (with the other party)
  const threadMessages = directMessages.filter(m => 
    m.sender_id === user!.id || m.recipient_id === user!.id
  );

  const unreadCount = messages.filter(m => !m.is_read && m.sender_id !== user!.id).length;

  if (loading) return <p className="text-muted-foreground text-center py-4">Loading messages…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Messages
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
        </h2>
        <Button size="sm" onClick={() => setShowCompose(!showCompose)} className="gap-1">
          <Send className="h-3 w-3" />
          Contact Support
        </Button>
      </div>

      {showCompose && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <Input
              placeholder="Subject"
              value={composeSubject}
              onChange={e => setComposeSubject(e.target.value)}
              maxLength={200}
            />
            <Textarea
              placeholder="Write your message…"
              value={composeBody}
              onChange={e => setComposeBody(e.target.value)}
              rows={3}
              maxLength={2000}
            />
            <div className="flex gap-2">
              <Button onClick={sendNewMessage} disabled={sending} size="sm" className="gap-1">
                <Send className="h-3 w-3" /> {sending ? 'Sending…' : 'Send'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCompose(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Broadcasts */}
      {broadcasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {broadcasts.map(m => (
              <div
                key={m.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${!m.is_read ? 'bg-primary/5 border-primary/20' : ''}`}
                onClick={() => handleExpand(m)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!m.is_read && <div className="h-2 w-2 rounded-full bg-primary" />}
                    <span className="font-medium text-sm">{m.subject}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
                {expandedMsg === m.id && (
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{m.body}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Direct Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {threadMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No messages yet</p>
          ) : (
            threadMessages.map(m => (
              <div key={m.id} className="border rounded-lg">
                <button
                  className={`w-full text-left p-3 transition-colors hover:bg-muted/50 ${!m.is_read && m.sender_id !== user!.id ? 'bg-primary/5' : ''}`}
                  onClick={() => handleExpand(m)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {!m.is_read && m.sender_id !== user!.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                      <span className="font-medium text-sm">{m.subject}</span>
                      <Badge variant="outline" className="text-xs">
                        {m.sender_id === user!.id ? 'You' : 'Support'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</span>
                      {expandedMsg === m.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </div>
                  </div>
                </button>
                {expandedMsg === m.id && (
                  <div className="border-t p-3 space-y-3">
                    <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                    {m.sender_id !== user!.id && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Reply…"
                          value={replyBody}
                          onChange={e => setReplyBody(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendReply(m.sender_id)}
                          maxLength={2000}
                        />
                        <Button size="sm" onClick={() => sendReply(m.sender_id)}>
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserMessages;
