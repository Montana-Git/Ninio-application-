
import { cn } from '@/lib/utils';
import { Container } from './container';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
  as?: React.ElementType;
  containerMaxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  containerPadding?: boolean;
  withContainer?: boolean;
  background?: 'primary' | 'secondary' | 'muted' | 'accent' | 'white' | 'none';
}

const Section: React.FC<SectionProps> = ({
  children,
  className,
  containerClassName,
  id,
  as: Component = 'section',
  containerMaxWidth = 'xl',
  containerPadding = true,
  withContainer = true,
  background = 'none',
}) => {
  const backgroundClasses = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    muted: 'bg-muted text-muted-foreground',
    accent: 'bg-accent text-accent-foreground',
    white: 'bg-background text-foreground',
    none: '',
  };

  const content = withContainer ? (
    <Container 
      className={containerClassName} 
      maxWidth={containerMaxWidth} 
      padding={containerPadding}
    >
      {children}
    </Container>
  ) : (
    children
  );

  return (
    <Component
      id={id}
      className={cn(
        'py-12 md:py-16',
        backgroundClasses[background],
        className
      )}
    >
      {content}
    </Component>
  );
};

export { Section };
