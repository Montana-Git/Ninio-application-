
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import DashboardCard from './DashboardCard';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  change?: number;
  changeText?: string;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  animate?: boolean;
  animationDelay?: number;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  change,
  changeText,
  className,
  variant = 'default',
  animate = true,
  animationDelay = 0,
  isLoading = false,
}) => {
  const renderChange = () => {
    if (change === undefined) return null;

    const isPositive = change >= 0;
    const Icon = isPositive ? ArrowUp : ArrowDown;
    const color = isPositive ? 'text-success' : 'text-destructive';

    return (
      <div className={cn('flex items-center text-sm font-medium', color)}>
        <Icon className="mr-1 h-4 w-4" />
        <span>{Math.abs(change)}%</span>
        {changeText && <span className="ml-1 text-muted-foreground">{changeText}</span>}
      </div>
    );
  };

  return (
    <DashboardCard
      title={title}
      icon={icon}
      variant={variant}
      className={className}
      animate={animate}
      animationDelay={animationDelay}
    >
      <div className="space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-16 mb-2" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
            </div>
          </>
        ) : (
          <>
            <div className="text-3xl font-bold">{value}</div>
            <div className="flex items-center justify-between">
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
              {renderChange()}
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
};

export default StatCard;
