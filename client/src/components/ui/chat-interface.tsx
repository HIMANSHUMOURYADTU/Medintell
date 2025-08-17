import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Mic, Bot, User } from 'lucide-react';
import type { ChatMessage } from '@shared/schema';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  persona?: string;
  className?: string;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  persona = 'general',
  className = ''
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading) return;
    
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
  };

  const getPersonaConfig = (persona: string) => {
    const configs = {
      senior: { color: 'bg-blue-600', name: 'Senior Assistant' },
      child: { color: 'bg-green-600', name: 'Kid Helper' },
      anxious: { color: 'bg-purple-600', name: 'Calm Assistant' },
      caregiver: { color: 'bg-amber-500', name: 'Care Support' }
    };
    return configs[persona as keyof typeof configs] || { color: 'bg-primary', name: 'InteliMed' };
  };

  const config = getPersonaConfig(persona);

  return (
    <Card className={`h-96 flex flex-col ${className}`} data-testid="chat-interface">
      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto chat-container p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={`w-12 h-12 ${config.color} rounded-full flex items-center justify-center mb-4`}>
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Hello! I'm your {config.name}
            </h3>
            <p className="text-muted-foreground text-sm">
              How can I help you with your health today?
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={message.id || index}
                className={`flex items-start space-x-3 ${message.isUser ? 'justify-end' : ''}`}
              >
                {!message.isUser && (
                  <Avatar className={`${config.color} text-white shrink-0`}>
                    <AvatarFallback className={`${config.color} text-white`}>
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-xs ${message.isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                  <p className={`text-sm ${message.isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {message.message}
                  </p>
                </div>
                {message.isUser && (
                  <Avatar className="bg-primary text-primary-foreground shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <Avatar className={`${config.color} text-white`}>
                  <AvatarFallback className={`${config.color} text-white`}>
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-2xl rounded-tl-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
            data-testid="input-chat-message"
          />
          <Button
            onClick={toggleVoiceRecording}
            variant="outline"
            size="icon"
            className={isRecording ? "bg-red-100 border-red-300" : ""}
            data-testid="button-voice-record"
          >
            <Mic className={`w-4 h-4 ${isRecording ? "text-red-600" : ""}`} />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
