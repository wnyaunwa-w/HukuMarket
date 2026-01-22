import { conversations } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

export default function MessagesPage() {
  const activeConversation = conversations[0];

  return (
    <div className="container mx-auto py-8 h-[calc(100vh-8rem)]">
      <Card className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full">
          {/* Conversations List */}
          <div className="col-span-1 border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold font-headline">Messages</h2>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search messages..." className="pl-10" />
              </div>
            </div>
            <ScrollArea className="flex-grow">
              {conversations.map((convo, index) => (
                <div
                  key={convo.id}
                  className={cn(
                    "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 border-b",
                    index === 0 ? "bg-muted" : ""
                  )}
                >
                  <Avatar>
                    <AvatarImage src={convo.participant.avatarUrl} />
                    <AvatarFallback>{convo.participant.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold truncate">{convo.participant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {convo.lastMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-muted-foreground truncate">{convo.lastMessage.text}</p>
                      {convo.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full">
                          {convo.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full">
            {activeConversation ? (
              <>
                <div className="flex items-center gap-4 p-4 border-b">
                  <Avatar>
                    <AvatarImage src={activeConversation.participant.avatarUrl} />
                    <AvatarFallback>{activeConversation.participant.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{activeConversation.participant.name}</h3>
                    <p className="text-sm text-muted-foreground">Online</p>
                  </div>
                </div>
                <ScrollArea className="flex-grow p-4 bg-muted/20">
                  <div className="space-y-4">
                    {/* Dummy Messages */}
                    <div className="flex justify-start">
                      <div className="bg-card p-3 rounded-lg max-w-xs">
                        <p>Hi, are the Ross 308 chickens still available?</p>
                        <p className="text-xs text-right text-muted-foreground mt-1">10:30 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                        <p>Yes, they are still available. When can you collect?</p>
                        <p className="text-xs text-right text-primary-foreground/80 mt-1">10:32 AM</p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="relative">
                    <Input placeholder="Type a message..." className="pr-12" />
                    <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center text-muted-foreground">
                <p>Select a conversation to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
