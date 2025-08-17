import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ChatInterface from "@/components/ui/chat-interface";
import PersonaSelector from "@/components/ui/persona-selector";
import { apiRequest } from "@/lib/queryClient";
import { Send, Mic, Phone, MapPin, ClipboardList, Bot, User } from "lucide-react";
import type { ChatMessage } from "@shared/schema";

export default function ChatPage() {
  const { persona = "general" } = useParams();
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(persona);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Mock user ID for demo - in real app would come from auth
  const userId = "demo-user-123";

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat-messages", userId],
    enabled: !!userId
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, persona }: { message: string; persona: string }) => {
      const response = await apiRequest("POST", "/api/chat", {
        userId,
        message,
        persona
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-messages", userId] });
      setMessage("");
      scrollToBottom();
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setSelectedPersona(persona);
  }, [persona]);

  const handleSendMessage = async () => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    await sendMessageMutation.mutateAsync({
      message: message.trim(),
      persona: selectedPersona
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
  };

  const getPersonaTheme = (persona: string) => {
    const themes = {
      senior: "senior-theme",
      child: "child-theme", 
      anxious: "anxious-theme",
      caregiver: "caregiver-theme"
    };
    return themes[persona as keyof typeof themes] || "";
  };

  const getPersonaConfig = (persona: string) => {
    const configs = {
      senior: {
        name: "Senior Care Assistant",
        description: "Healthcare support for senior citizens",
        color: "bg-blue-600",
        icon: "👴"
      },
      child: {
        name: "Pediatric Assistant", 
        description: "Kid-friendly healthcare guidance",
        color: "bg-green-600",
        icon: "👶"
      },
      anxious: {
        name: "Calm Care Assistant",
        description: "Gentle support for anxious patients", 
        color: "bg-purple-600",
        icon: "🌸"
      },
      caregiver: {
        name: "Caregiver Support",
        description: "Tools for healthcare providers",
        color: "bg-amber-500",
        icon: "👩‍⚕️"
      }
    };
    return configs[persona as keyof typeof configs] || {
      name: "InteliMed Assistant",
      description: "General healthcare guidance",
      color: "bg-primary",
      icon: "🏥"
    };
  };

  const personaConfig = getPersonaConfig(selectedPersona);

  return (
    <div className={`min-h-screen pt-16 ${getPersonaTheme(selectedPersona)}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
                InteliMed Chat Assistant
              </h1>
              <p className="text-muted-foreground">
                Get personalized healthcare guidance tailored to your needs
              </p>
            </div>
            <PersonaSelector 
              selectedPersona={selectedPersona}
              onPersonaChange={setSelectedPersona}
            />
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col" data-testid="card-chat-interface">
              {/* Chat Header */}
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className={`${personaConfig.color} text-white`}>
                    <AvatarFallback className={`${personaConfig.color} text-white`}>
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{personaConfig.name}</h3>
                    <p className="text-sm text-muted-foreground">{personaConfig.description}</p>
                  </div>
                  <div className="ml-auto flex items-center space-x-2">
                    <Badge variant="outline" className="voice-pulse">
                      Available 24/7
                    </Badge>
                    {isRecording && (
                      <Badge variant="destructive" className="voice-pulse">
                        Recording...
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 overflow-y-auto chat-container p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-muted-foreground">Loading chat history...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className={`w-16 h-16 ${personaConfig.color} rounded-full flex items-center justify-center mb-4`}>
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Welcome to {personaConfig.name}!
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      I'm here to help with your healthcare questions. How can I assist you today?
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setMessage("I need help managing my medications")}
                        className="border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white transition-colors"
                        data-testid="button-medication-help"
                      >
                        💊 Medication Help
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setMessage("I want to set health goals")}
                        className="border-health-green text-health-green hover:bg-health-green hover:text-white transition-colors"
                        data-testid="button-health-goals"
                      >
                        🎯 Health Goals
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setMessage("Find doctors near me")}
                        className="border-futuristic-purple text-futuristic-purple hover:bg-futuristic-purple hover:text-white transition-colors"
                        data-testid="button-find-doctors"
                      >
                        🏥 Find Doctors
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setMessage("I have health concerns")}
                        className="border-warning-amber text-warning-amber hover:bg-warning-amber hover:text-white transition-colors"
                        data-testid="button-health-concerns"
                      >
                        🩺 Health Concerns
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((msg, index) => (
                      <div 
                        key={msg.id || index}
                        className={`flex items-start space-x-3 ${msg.isUser ? 'justify-end' : ''}`}
                      >
                        {!msg.isUser && (
                          <Avatar className={`${personaConfig.color} text-white shrink-0`}>
                            <AvatarFallback className={`${personaConfig.color} text-white`}>
                              <Bot className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-sm ${msg.isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                          <p className={`${msg.isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {msg.message}
                          </p>
                        </div>
                        {msg.isUser && (
                          <Avatar className="bg-primary text-primary-foreground shrink-0">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {sendMessageMutation.isPending && (
                      <div className="flex items-start space-x-3">
                        <Avatar className={`${personaConfig.color} text-white`}>
                          <AvatarFallback className={`${personaConfig.color} text-white`}>
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted p-4 rounded-2xl rounded-tl-sm">
                          <div className="flex space-x-2">
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
              <div className="p-6 border-t">
                <div className="flex space-x-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your health question..."
                    className="flex-1"
                    disabled={sendMessageMutation.isPending}
                    data-testid="input-chat-message"
                  />
                  <Button
                    onClick={toggleVoiceRecording}
                    variant="outline"
                    size="icon"
                    className={isRecording ? "bg-red-100 border-red-300" : ""}
                    data-testid="button-voice-record"
                  >
                    <Mic className={`w-5 h-5 ${isRecording ? "text-red-600" : ""}`} />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-white hover:bg-red-600 transition-all duration-200 border border-red-200 hover:border-red-600"
                    onClick={() => window.location.href = 'tel:108'}
                    data-testid="button-emergency-call"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    🚨 Emergency: 108
                  </Button>
                  <Button variant="ghost" size="sm" data-testid="button-find-doctor">
                    <MapPin className="w-4 h-4 mr-1" />
                    Find Doctor
                  </Button>
                  <Button variant="ghost" size="sm" data-testid="button-health-assessment">
                    <ClipboardList className="w-4 h-4 mr-1" />
                    Health Assessment
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar with Quick Actions */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Persona Info Card */}
              <Card data-testid="card-persona-info">
                <CardHeader>
                  <h3 className="font-semibold text-foreground">Current Mode</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${personaConfig.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {personaConfig.icon}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{personaConfig.name}</p>
                      <p className="text-sm text-muted-foreground">{personaConfig.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card data-testid="card-quick-actions">
                <CardHeader>
                  <h3 className="font-semibold text-foreground">Quick Actions</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Emergency Services
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Find Nearby Hospitals
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Health Assessment
                  </Button>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card data-testid="card-tips">
                <CardHeader>
                  <h3 className="font-semibold text-foreground">Tips</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div>
                      <strong>Voice Commands:</strong> Click the mic button to speak your questions
                    </div>
                    <div>
                      <strong>Emergency:</strong> Dial 108 for immediate medical assistance
                    </div>
                    <div>
                      <strong>Privacy:</strong> Your conversations are secure and encrypted
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
