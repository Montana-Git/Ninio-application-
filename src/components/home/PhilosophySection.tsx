import React from "react";
import { cn } from "@/lib/utils";
import { BookOpen, Heart, Lightbulb, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface PhilosophySectionProps {
  title?: string;
  description?: string;
  philosophies?: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
  testimonials?: {
    quote: string;
    author: string;
    role: string;
    avatar?: string;
  }[];
}

const PhilosophySection = ({
  title = "Our Teaching Philosophy",
  description = "At Ninio Kindergarten, we believe in nurturing the whole child through a balanced approach to early education that fosters creativity, curiosity, and confidence.",
  philosophies = [
    {
      icon: <Lightbulb className="h-10 w-10 text-amber-500" />,
      title: "Child-Centered Learning",
      description:
        "We place children at the center of the learning process, respecting their unique interests, abilities, and learning styles.",
    },
    {
      icon: <Heart className="h-10 w-10 text-rose-500" />,
      title: "Emotional Intelligence",
      description:
        "We prioritize emotional development, helping children recognize and manage their feelings while building empathy for others.",
    },
    {
      icon: <Users className="h-10 w-10 text-blue-500" />,
      title: "Social Development",
      description:
        "We create opportunities for children to develop social skills through collaborative play and group activities.",
    },
    {
      icon: <BookOpen className="h-10 w-10 text-emerald-500" />,
      title: "Holistic Education",
      description:
        "We balance academic foundations with creative expression, physical activity, and social-emotional growth.",
    },
  ],
  testimonials = [
    {
      quote:
        "The teachers at Ninio truly understand how to nurture my child's natural curiosity while providing structure and guidance.",
      author: "Sarah Johnson",
      role: "Parent",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    {
      quote:
        "I've watched my daughter blossom socially and academically since joining Ninio. Their philosophy really works!",
      author: "Michael Chen",
      role: "Parent",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    },
  ],
}: PhilosophySectionProps) => {
  return (
    <section className="w-full py-20 px-4 md:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        {/* Philosophy Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {philosophies.map((philosophy, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-gray-50">
                  {philosophy.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {philosophy.title}
                </h3>
                <p className="text-gray-600">{philosophy.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        {testimonials && testimonials.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-2xl font-semibold text-center mb-8 text-gray-800">
              What Parents Say
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="flex flex-col">
                  <div className="bg-gray-50 p-6 rounded-lg italic text-gray-700 mb-4 relative">
                    <svg
                      className="absolute top-2 left-2 h-8 w-8 text-gray-300 opacity-50"
                      fill="currentColor"
                      viewBox="0 0 32 32"
                    >
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                    <p className="relative z-10">"{testimonial.quote}"</p>
                  </div>
                  <div className="flex items-center">
                    {testimonial.avatar && (
                      <div className="mr-4">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.author}
                          className="h-12 w-12 rounded-full"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {testimonial.author}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Link to="/philosophy">
            <Button>
              Learn More About Our Approach
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;
