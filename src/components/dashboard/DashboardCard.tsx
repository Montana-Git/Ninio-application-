
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatedCard } from '@/components/ui/animated-card';
import { AnimationType } from '@/types/extended.types';

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  animate?: boolean;
  animationDelay?: number;
  animationType?: AnimationType;
  isLoading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  footer,
  children,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  variant = 'default',
  animate = true,
  animationDelay = 0,
  animationType,
  isLoading = false,
}) => {
  const variantStyles = {
    default: '',
    primary: 'border-primary/20 bg-primary/5',
    secondary: 'border-secondary/20 bg-secondary/5',
    success: 'border-success/20 bg-success/5',
    warning: 'border-warning/20 bg-warning/5',
    info: 'border-info/20 bg-info/5',
    error: 'border-destructive/20 bg-destructive/5',
  };

  const CardComponent = animate ? AnimatedCard : Card;
  const animationProps = animate ? {
    animation: animationType || 'fade-in-up' as AnimationType,
    delay: animationDelay,
  } : {};

  return (
    <CardComponent
      className={cn(variantStyles[variant], 'transition-all hover:shadow-md', className)}
      {...animationProps}
    >
      <CardHeader className={cn('flex flex-row items-center justify-between space-y-0 pb-2', headerClassName)}>
        <div>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {icon && <div className="h-8 w-8 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className={cn('pt-2', contentClassName)}>
        {/* Always render children, with loading indicator on top if needed */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-white bg-opacity-80">
              <div className="animate-pulse space-y-3 p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          )}
          {children}
        </div>
      </CardContent>
      {footer && (
        <CardFooter className={cn('pt-2', footerClassName)}>
          {footer}
        </CardFooter>
      )}
    </CardComponent>
  );
};

export default DashboardCard;
