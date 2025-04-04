
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface Facility {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  features: string[];
}

interface FacilitiesSectionProps {
  facilities?: Facility[];
  title?: string;
  subtitle?: string;
}

const FacilitiesSection = ({
  facilities = [
    {
      id: "1",
      title: "Modern Classrooms",
      description:
        "Bright, spacious classrooms equipped with interactive learning tools and comfortable furniture designed for young learners.",
      imageUrl:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
      features: [
        "Interactive whiteboards",
        "Child-sized furniture",
        "Reading corners",
        "Natural lighting",
      ],
    },
    {
      id: "2",
      title: "Safe Playground",
      description:
        "Secure outdoor play area with age-appropriate equipment, soft surfaces, and shaded spaces for year-round enjoyment.",
      imageUrl:
        "https://images.unsplash.com/photo-1597430203889-c93cce4aaa47?w=800&q=80",
      features: [
        "Soft impact surfaces",
        "Age-appropriate equipment",
        "Secure fencing",
        "Shaded areas",
      ],
    },
    {
      id: "3",
      title: "Creative Arts Studio",
      description:
        "Dedicated space for artistic expression with materials and tools that encourage creativity and fine motor skill development.",
      imageUrl:
        "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=800&q=80",
      features: [
        "Art supplies",
        "Display areas",
        "Washable surfaces",
        "Multi-purpose tables",
      ],
    },
    {
      id: "4",
      title: "Dining Area",
      description:
        "Clean, welcoming space where children enjoy nutritious meals and learn important social skills during mealtimes.",
      imageUrl:
        "https://images.unsplash.com/photo-1544781508-91a38e1084c9?w=800&q=80",
      features: [
        "Child-friendly tables",
        "Hygienic surfaces",
        "Allergen-free zones",
        "Bright atmosphere",
      ],
    },
  ],
  title = "Our Facilities",
  subtitle = "Explore our purpose-built spaces designed to nurture learning, creativity, and growth in a safe environment.",
}: FacilitiesSectionProps) => {
  return (
    <section className="w-full py-20 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {facilities.map((facility, index) => (
            <Card
              key={facility.id}
              className="overflow-hidden border-gray-200 h-full hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={facility.imageUrl}
                  alt={facility.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {facility.title}
                </h3>
                <p className="text-gray-600 mb-4">{facility.description}</p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Features:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {facility.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* This button could link to a detailed page about each facility */}
                <Link to={`/facilities#${facility.id}`}>
                  <Button
                    variant="outline"
                    className="mt-2 w-full sm:w-auto group"
                  >
                    Learn More{" "}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Link to="/facilities">
            <Button className="px-6 py-3">Schedule a Tour</Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Want to see our facilities in person? Schedule a tour today!
          </p>
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;
