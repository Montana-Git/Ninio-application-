
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
        {children}
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
