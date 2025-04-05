
import { cn } from '@/lib/utils';
import DashboardCard from './DashboardCard';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, formatDistanceToNow } from 'date-fns';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  icon?: React.ReactNode;
  user?: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  type?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

interface ActivityCardProps {
  title: string;
  activities: Activity[];
  emptyMessage?: string;
  maxHeight?: number;
  className?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  animate?: boolean;
  animationDelay?: number;
  isLoading?: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  activities,
  emptyMessage = 'No recent activities',
  maxHeight = 300,
  className,
  showViewAll = true,
  onViewAll,
  animate = true,
  animationDelay = 0,
  isLoading = false,
}) => {
  const getActivityTypeStyles = (type: Activity['type'] = 'default') => {
    const styles = {
      default: 'bg-muted',
      success: 'bg-success/20 text-success',
      warning: 'bg-warning/20 text-warning',
      error: 'bg-destructive/20 text-destructive',
      info: 'bg-info/20 text-info',
    };

    return styles[type];
  };

  return (
    <DashboardCard
      title={title}
      className={className}
      animate={animate}
      animationDelay={animationDelay}
      isLoading={isLoading}
      footer={
        showViewAll && activities.length > 0 ? (
          <Button variant="ghost" className="w-full" onClick={onViewAll}>
            View all activities
          </Button>
        ) : undefined
      }
    >
      <ScrollArea className={`pr-4 -mr-4 ${maxHeight ? `max-h-[${maxHeight}px]` : ''}`}>
        {activities.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                {activity.user ? (
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback>{activity.user.initials || activity.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-full', getActivityTypeStyles(activity.type))}>
                    {activity.icon}
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <time
                      className="text-xs text-muted-foreground"
                      title={format(activity.timestamp, 'PPpp')}
                    >
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </time>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </DashboardCard>
  );
};

export default ActivityCard;
