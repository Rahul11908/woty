import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import type { ConversationWithParticipant } from "@shared/schema";

interface ConversationItemProps {
  conversation: ConversationWithParticipant;
}

export default function ConversationItem({ conversation }: ConversationItemProps) {
  const { participant, lastMessage, unreadCount } = conversation;

  return (
    <Link href={`/conversation/${conversation.id}`}>
      <a className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-primary/20 transition-colors cursor-pointer">
        <div className="relative">
          <img 
            src={participant.avatar || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150`}
            alt={`${participant.fullName} profile`}
            loading="lazy"
            className="w-12 h-12 rounded-full avatar-image-flat"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
            participant.isOnline ? 'bg-green-500' : 'bg-gray-300'
          }`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 truncate">
              {participant.fullName}
            </p>
            <p className="text-xs text-gray-500">
              {lastMessage ? formatDistanceToNow(new Date(lastMessage.createdAt!), { addSuffix: true }) : ''}
            </p>
          </div>
          <p className="text-sm text-gray-600 truncate">
            {lastMessage?.content || 'No messages yet'}
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="w-2 h-2 bg-primary rounded-full"></div>
        )}
      </a>
    </Link>
  );
}
