
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className = '' }) => {
  if (!message) return null;
  
  return (
    <div className={`flex items-start gap-2 rounded-md bg-red-50 p-3 text-red-700 ${className}`}>
      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-red-800">Error</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;
