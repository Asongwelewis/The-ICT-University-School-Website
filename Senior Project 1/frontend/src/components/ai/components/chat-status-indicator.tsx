'use client';

import React, { memo } from 'react';
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AIServiceStatus } from '@/hooks/use-ai-status';

interface ChatStatusIndicatorProps {
  status: AIServiceStatus;
  service: string;
  lastChecked?: string;
  error?: string;
  onRetry?: () => void;
  compact?: boolean;
}

const StatusIcon = memo<{ status: AIServiceStatus; className?: string }>(({ status, className = "h-4 w-4" }) => {
  switch (status) {
    case 'online':
      return <Wifi className={`${className} text-green-500`} />;
    case 'offline':
      return <WifiOff className={`${className} text-red-500`} />;
    case 'checking':
      return <Loader2 className={`${className} text-blue-500 animate-spin`} />;
    case 'error':
      return <AlertTriangle className={`${className} text-yellow-500`} />;
    default:
      return <WifiOff className={`${className} text-gray-400`} />;
  }
});

StatusIcon.displayName = 'StatusIcon';

const getStatusMessage = (status: AIServiceStatus, service: string, error?: string): string => {
  switch (status) {
    case 'online':
      return `${service} is online and ready`;
    case 'offline':
      return `${service} is offline. Please check your internet connection and API key.`;
    case 'checking':
      return `Checking ${service} status...`;
    case 'error':
      return error || `Error connecting to ${service}`;
    default:
      return `${service} status unknown`;
  }
};

const getStatusColor = (status: AIServiceStatus): string => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'offline':
      return 'bg-red-500';
    case 'checking':
      return 'bg-blue-500';
    case 'error':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-400';
  }
};

export const ChatStatusIndicator = memo<ChatStatusIndicatorProps>(({
  status,
  service,
  lastChecked,
  error,
  onRetry,
  compact = false
}) => {
  const statusMessage = getStatusMessage(status, service, error);
  const statusColor = getStatusColor(status);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
        <StatusIcon status={status} className="h-3 w-3" />
        {status === 'offline' && (
          <Badge variant="destructive" className="text-xs px-1 py-0">
            Offline
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <StatusIcon status={status} />
        <span className="text-sm font-medium">{service}</span>
        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
      </div>
      
      <p className={`text-xs ${
        status === 'online' ? 'text-green-600' : 
        status === 'offline' ? 'text-red-600' : 
        status === 'error' ? 'text-yellow-600' : 
        'text-blue-600'
      }`}>
        {statusMessage}
      </p>

      {lastChecked && (
        <p className="text-xs text-gray-500">
          Last checked: {new Date(lastChecked).toLocaleTimeString()}
        </p>
      )}

      {(status === 'offline' || status === 'error') && onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
        >
          <Loader2 className="h-3 w-3 mr-1" />
          Retry Connection
        </Button>
      )}
    </div>
  );
});

ChatStatusIndicator.displayName = 'ChatStatusIndicator';