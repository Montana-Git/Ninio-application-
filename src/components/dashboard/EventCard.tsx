import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    date: Date;
    time?: string;
    location?: string;
    description?: string;
    type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  };
  onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const { title, date, time, location, type = 'primary' } = event;
  
  // Format date
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  
  // Get color based on type
  const getColor = () => {
    switch (type) {
      case 'primary': return 'bg-blue-100 text-blue-800';
      case 'secondary': return 'bg-gray-100 text-gray-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'danger': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  
  return (
    <div 
      className="flex items-start space-x-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className={`p-2 rounded-md ${getColor()}`}>
        <Calendar className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">{title}</h4>
        <div className="mt-1 flex items-center text-xs text-gray-500">
          <span>{formattedDate}</span>
          {time && (
            <>
              <span className="mx-1">•</span>
              <span>{time}</span>
            </>
          )}
          {location && (
            <>
              <span className="mx-1">•</span>
              <span>{location}</span>
            </>
          )}
        </div>
      </div>
      <Button variant="ghost" size="sm" className="ml-auto">
        Details
      </Button>
    </div>
  );
}
