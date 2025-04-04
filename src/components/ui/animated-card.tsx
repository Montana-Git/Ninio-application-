
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';
import { AnimationType } from '@/types/extended.types';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  delay?: number;
  animation?: AnimationType;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  title,
  description,
  footer,
  delay = 0,
  animation = 'fade-in',
}) => {
  const getAnimationProps = () => {
    switch (animation) {
      case 'fade-in':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5, delay }
        };
      case 'slide-in-right':
        return {
          initial: { x: 100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          transition: { duration: 0.5, delay }
        };
      case 'slide-in-left':
        return {
          initial: { x: -100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          transition: { duration: 0.5, delay }
        };
      case 'fade-in-up':
        return {
          initial: { y: 50, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.5, delay }
        };
      case 'none':
      default:
        return {};
    }
  };

  const MotionCard = motion.create(Card);

  return (
    <MotionCard className={className} {...getAnimationProps()}>
      {(title || description) && (
        <CardHeader className={headerClassName}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>{children}</CardContent>
      {footer && <CardFooter className={footerClassName}>{footer}</CardFooter>}
    </MotionCard>
  );
};

export { AnimatedCard };
