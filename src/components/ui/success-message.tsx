
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  title: string;
  message: string;
  className?: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
  title, 
  message, 
  className = '' 
}) => {
  return (
    <div className={`flex items-start gap-2 rounded-md bg-green-50 p-4 border border-green-200 ${className}`}>
      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-green-800">{title}</p>
        <p className="text-sm text-green-700">{message}</p>
      </div>
    </div>
  );
};

export default SuccessMessage;
