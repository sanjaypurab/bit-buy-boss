import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Users, User, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

interface Profile {
  user_id: string;
  email: string | null;
}

const AdminMessagesTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Compose state
  const [mode, setMode] = useState<'direct' | 'broadcast'>('direct');
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  // Conversation view
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('admin-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchMessages(), fetchProfiles()]);
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setMessages(data || []);
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase.from('profiles').select('user_id, email');
    if (!error) setProfiles(data || []);
  };

  const getEmail = (userId: string) => {
    return profiles.find(p => p.user_id === userId)?.email || userId.slice(0, 8) + '…';
  };

  const sendMessage = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: 'Error', description: 'Subject and body are required', variant: 'destructive' });
      return;
    }
    if (mode === 'direct' && !recipientId) {
      toast({ title: 'Error', description: 'Select a recipient', variant: 'destructive' });
      return;
    }

    setSending(true);
    const { error } = await supabase.from('messages').insert({
      sender_id: user!.id,
      recipient_id: mode === 'direct' ? recipientId : null,
      subject: subject.trim(),
      body: body.trim(),
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Sent', description: mode === 'broadcast' ? 'Broadcast sent to all users' : 'Message sent' });
      setSubject('');
      setBody('');
      setRecipientId('');
      fetchMessages();
    }
    setSending(false);
  };

  const sendReply = async (toUserId: string) => {
    if (!replyBody.trim()) return;
    const { error } = await supabase.from('messages').insert({
      sender_id: user!.id,
      recipient_id: toUserId,
      subject: 'Re: reply',
      body: replyBody.trim(),
    });
    if (!error) {
      setReplyBody('');
      fetchMessages();
    }
  };

  // Group messages by user conversations (excluding broadcasts)
  const userConversations = () => {
    const convMap = new Map<string, Message[]>();
    messages.forEach(m => {
      // Find the "other" user (not admin)
      const otherId = m.sender_id === user!.id ? m.recipient_id : m.sender_id;
      if (!otherId) return; // skip broadcasts for conversation view
      if (!convMap.has(otherId)) convMap.set(otherId, []);
      convMap.get(otherId)!.push(m);
    });
    return convMap;
  };

  const broadcasts = messages.filter(m => m.recipient_id === null && m.sender_id === user!.id);
  const conversations = userConversations();

  if (loading) return <p className="text-muted-foreground text-center py-8">Loading…</p>;

  return (
    <div className="space-y-6">
      {/* Compose */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" /> Compose Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === 'direct' ? 'default' : 'outline'}
              onClick={() => setMode('direct')}
              className="gap-1"
            >
              <User className="h-3 w-3" /> Direct
            </Button>
            <Button
              size="sm"
              variant={mode === 'broadcast' ? 'default' : 'outline'}
              onClick={() => setMode('broadcast')}
              className="gap-1"
            >
              <Users className="h-3 w-3" /> Broadcast
            </Button>
          </div>
          {mode === 'direct' && (
            <div>
              <Label>Recipient</Label>
              <Select value={recipientId} onValueChange={setRecipientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {profiles
                    .filter(p => p.user_id !== user!.id)
                    .map(p => (
                      <SelectItem key={p.user_id} value={p.user_id}>
                        {p.email || p.user_id.slice(0, 8)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject" maxLength={200} />
          </div>
          <div>
            <Label>Body</Label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message…" rows={4} maxLength={2000} />
          </div>
          <Button onClick={sendMessage} disabled={sending} className="gap-2">
            <Send className="h-4 w-4" />
            {sending ? 'Sending…' : mode === 'broadcast' ? 'Send to All Users' : 'Send Message'}
          </Button>
        </CardContent>
      </Card>

      {/* Broadcasts */}
      {broadcasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Broadcasts Sent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {broadcasts.slice(0, 10).map(m => (
              <div key={m.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{m.subject}</span>
                  <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">{m.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Conversations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> User Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {conversations.size === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No conversations yet</p>
          ) : (
            Array.from(conversations.entries()).map(([userId, msgs]) => {
              const unread = msgs.filter(m => m.sender_id !== user!.id && !m.is_read).length;
              const isExpanded = expandedUser === userId;
              return (
                <div key={userId} className="border rounded-lg">
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedUser(isExpanded ? null : userId)}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{getEmail(userId)}</span>
                      {unread > 0 && <Badge variant="destructive" className="text-xs">{unread}</Badge>}
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t p-3 space-y-3">
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {msgs
                          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                          .map(m => (
                            <div
                              key={m.id}
                              className={`p-2 rounded-lg text-sm ${
                                m.sender_id === user!.id
                                  ? 'bg-primary/10 ml-8'
                                  : 'bg-muted mr-8'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-xs">
                                  {m.sender_id === user!.id ? 'You' : getEmail(m.sender_id)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(m.created_at).toLocaleString()}
                                </span>
                              </div>
                              {m.subject && <p className="font-medium text-xs text-muted-foreground">{m.subject}</p>}
                              <p>{m.body}</p>
                            </div>
                          ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Reply…"
                          value={replyBody}
                          onChange={e => setReplyBody(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendReply(userId)}
                          maxLength={2000}
                        />
                        <Button size="sm" onClick={() => sendReply(userId)}>
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMessagesTab;
