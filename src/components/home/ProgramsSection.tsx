import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Program {
  id: string;
  title: string;
  ageGroup: string;
  schedule: string;
  description: string;
  imageUrl: string;
  featured?: boolean;
}

interface ProgramsSectionProps {
  programs?: Program[];
}

const ProgramsSection = ({
  programs = [
    {
      id: "1",
      title: "Early Explorers",
      ageGroup: "2-3 years",
      schedule: "Mon-Fri, 9:00 AM - 12:00 PM",
      description:
        "A gentle introduction to structured learning through play, focusing on social skills, language development, and sensory exploration.",
      imageUrl:
        "https://images.unsplash.com/photo-1526634332515-d56c5fd16991?w=600&q=80",
      featured: true,
    },
    {
      id: "2",
      title: "Curious Minds",
      ageGroup: "3-4 years",
      schedule: "Mon-Fri, 9:00 AM - 1:00 PM",
      description:
        "Building on foundational skills with more structured activities focusing on pre-literacy, numeracy, and creative expression.",
      imageUrl:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    },
    {
      id: "3",
      title: "Kindergarten Prep",
      ageGroup: "4-5 years",
      schedule: "Mon-Fri, 9:00 AM - 2:00 PM",
      description:
        "Comprehensive program preparing children for kindergarten with focus on academic readiness, independence, and problem-solving skills.",
      imageUrl:
        "https://images.unsplash.com/photo-1543248939-ff40856f65d4?w=600&q=80",
    },
    {
      id: "4",
      title: "After School Enrichment",
      ageGroup: "3-5 years",
      schedule: "Mon-Fri, 2:00 PM - 5:00 PM",
      description:
        "Extended day program offering supervised play, homework help for older children, and specialized enrichment activities.",
      imageUrl:
        "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=600&q=80",
    },
  ],
}: ProgramsSectionProps) => {
  return (
    <section className="w-full py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Educational Programs
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover our age-appropriate programs designed to nurture your
            child's natural curiosity and love for learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {programs.map((program) => (
            <Card
              key={program.id}
              className={`overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${program.featured ? "border-primary border-2" : ""}`}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={program.imageUrl}
                  alt={program.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                {program.featured && (
                  <Badge className="absolute top-3 right-3 bg-primary">
                    Featured
                  </Badge>
                )}
              </div>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {program.title}
                  </h3>
                  <div className="flex flex-col space-y-1 text-sm text-gray-500">
                    <span>Age: {program.ageGroup}</span>
                    <span>Schedule: {program.schedule}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{program.description}</p>
                <Link to={`/programs#${program.id}`}>
                  <Button variant="outline" className="w-full group">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/programs">
            <Button size="lg" className="px-8">
              View All Programs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
