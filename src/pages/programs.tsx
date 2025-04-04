
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Palette,
  Music,
  Dumbbell,
  Brain,
  Heart,
  Star,
} from "lucide-react";

const ProgramsPage = () => {
  const ageGroups = [
    {
      id: "toddlers",
      name: "Toddlers",
      ageRange: "2-3 years",
      description:
        "Gentle introduction to structured learning through play and exploration.",
      icon: <Heart className="h-6 w-6 text-rose-500" />,
    },
    {
      id: "preschool",
      name: "Preschool",
      ageRange: "3-4 years",
      description:
        "Building foundational skills with more structured activities and social development.",
      icon: <Star className="h-6 w-6 text-amber-500" />,
    },
    {
      id: "kindergarten",
      name: "Kindergarten",
      ageRange: "4-5 years",
      description:
        "Comprehensive preparation for elementary school with focus on academic readiness.",
      icon: <BookOpen className="h-6 w-6 text-blue-500" />,
    },
  ];

  const programTypes = [
    {
      id: "core",
      name: "Core Programs",
      description:
        "Our foundational educational programs form the backbone of our curriculum, providing children with essential skills and knowledge.",
      programs: [
        {
          title: "Early Explorers",
          ageGroup: "2-3 years",
          schedule: "Mon-Fri, 9:00 AM - 12:00 PM",
          description:
            "A gentle introduction to structured learning through play, focusing on social skills, language development, and sensory exploration.",
          imageUrl:
            "https://images.unsplash.com/photo-1526634332515-d56c5fd16991?w=600&q=80",
          highlights: [
            "Sensory play stations",
            "Circle time activities",
            "Outdoor exploration",
            "Music and movement",
          ],
          icon: <Users className="h-5 w-5 text-blue-500" />,
        },
        {
          title: "Curious Minds",
          ageGroup: "3-4 years",
          schedule: "Mon-Fri, 9:00 AM - 1:00 PM",
          description:
            "Building on foundational skills with more structured activities focusing on pre-literacy, numeracy, and creative expression.",
          imageUrl:
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
          highlights: [
            "Alphabet recognition",
            "Counting activities",
            "Science experiments",
            "Collaborative projects",
          ],
          icon: <Brain className="h-5 w-5 text-purple-500" />,
        },
        {
          title: "Kindergarten Prep",
          ageGroup: "4-5 years",
          schedule: "Mon-Fri, 9:00 AM - 2:00 PM",
          description:
            "Comprehensive program preparing children for kindergarten with focus on academic readiness, independence, and problem-solving skills.",
          imageUrl:
            "https://images.unsplash.com/photo-1543248939-ff40856f65d4?w=600&q=80",
          highlights: [
            "Early reading skills",
            "Mathematical concepts",
            "Scientific inquiry",
            "Social studies",
          ],
          icon: <BookOpen className="h-5 w-5 text-green-500" />,
        },
      ],
    },
    {
      id: "enrichment",
      name: "Enrichment Programs",
      description:
        "Our enrichment programs offer specialized learning experiences that complement our core curriculum and nurture children's unique interests and talents.",
      programs: [
        {
          title: "Little Artists",
          ageGroup: "All ages",
          schedule: "Tuesdays & Thursdays, 3:00 PM - 4:00 PM",
          description:
            "Explore various art mediums and techniques while developing creativity, fine motor skills, and self-expression.",
          imageUrl:
            "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=600&q=80",
          highlights: [
            "Painting",
            "Sculpture",
            "Mixed media",
            "Art appreciation",
          ],
          icon: <Palette className="h-5 w-5 text-pink-500" />,
        },
        {
          title: "Music & Movement",
          ageGroup: "All ages",
          schedule: "Mondays & Wednesdays, 3:00 PM - 4:00 PM",
          description:
            "Develop rhythm, coordination, and musical appreciation through singing, dancing, and playing simple instruments.",
          imageUrl:
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80",
          highlights: [
            "Rhythm activities",
            "Basic instrument play",
            "Dance",
            "Musical games",
          ],
          icon: <Music className="h-5 w-5 text-yellow-500" />,
        },
        {
          title: "Active Bodies",
          ageGroup: "All ages",
          schedule: "Fridays, 3:00 PM - 4:00 PM",
          description:
            "Focus on physical development, coordination, and healthy habits through structured physical activities and games.",
          imageUrl:
            "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=600&q=80",
          highlights: [
            "Gross motor skills",
            "Team games",
            "Balance activities",
            "Coordination exercises",
          ],
          icon: <Dumbbell className="h-5 w-5 text-red-500" />,
        },
      ],
    },
    {
      id: "extended",
      name: "Extended Care",
      description:
        "Our extended care options provide flexible scheduling for busy families while maintaining our high standards of care and enrichment.",
      programs: [
        {
          title: "Early Birds",
          ageGroup: "All ages",
          schedule: "Mon-Fri, 7:30 AM - 9:00 AM",
          description:
            "Before-school program offering a calm start to the day with breakfast, quiet activities, and preparation for the day ahead.",
          imageUrl:
            "https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=600&q=80",
          highlights: [
            "Breakfast provided",
            "Quiet reading time",
            "Gentle wake-up activities",
            "Transition support",
          ],
          icon: <Clock className="h-5 w-5 text-amber-500" />,
        },
        {
          title: "Afternoon Explorers",
          ageGroup: "All ages",
          schedule: "Mon-Fri, 2:00 PM - 5:30 PM",
          description:
            "After-school program offering supervised play, homework help for older children, and specialized enrichment activities.",
          imageUrl:
            "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=600&q=80",
          highlights: [
            "Homework support",
            "Outdoor play",
            "Themed activities",
            "Healthy snacks",
          ],
          icon: <Clock className="h-5 w-5 text-blue-500" />,
        },
        {
          title: "Holiday Camp",
          ageGroup: "All ages",
          schedule: "School holidays, 8:00 AM - 5:00 PM",
          description:
            "Full-day program during school holidays featuring special themes, field trips, and engaging activities to keep children learning and having fun.",
          imageUrl:
            "https://images.unsplash.com/photo-1536337005238-94b997371b40?w=600&q=80",
          highlights: [
            "Themed weeks",
            "Special guests",
            "Field trips",
            "Extended projects",
          ],
          icon: <Calendar className="h-5 w-5 text-green-500" />,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary/80 to-primary/60 py-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-8 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl z-0" />
            <div className="absolute bottom-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-2xl z-0" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Educational Programs
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Discover our comprehensive range of age-appropriate programs
                designed to nurture your child's natural curiosity, creativity,
                and love for learning.
              </p>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
              >
                Schedule a Tour
              </Button>
            </div>
          </div>
        </section>

        {/* Age Groups Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Programs by Age Group
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {ageGroups.map((group) => (
                <Card
                  key={group.id}
                  className="border-2 hover:border-primary/50 transition-all duration-300"
                >
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                      {group.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{group.name}</h3>
                    <Badge className="mb-4">{group.ageRange}</Badge>
                    <p className="text-gray-600">{group.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Tabs Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              Our Educational Programs
            </h2>
            <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
              At Ninio Kindergarten, we offer a variety of programs to meet the
              needs of every child and family. Explore our offerings below.
            </p>

            <Tabs defaultValue="core" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  {programTypes.map((type) => (
                    <TabsTrigger key={type.id} value={type.id}>
                      {type.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {programTypes.map((type) => (
                <TabsContent
                  key={type.id}
                  value={type.id}
                  className="space-y-8"
                >
                  <div className="text-center max-w-3xl mx-auto mb-8">
                    <p className="text-gray-600">{type.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {type.programs.map((program, index) => (
                      <Card
                        key={index}
                        className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="relative h-48 w-full overflow-hidden">
                          <img
                            src={program.imageUrl}
                            alt={program.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold">
                              {program.title}
                            </h3>
                            <div className="p-2 rounded-full bg-gray-100">
                              {program.icon}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1 text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              <span>Age: {program.ageGroup}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>Schedule: {program.schedule}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4">
                            {program.description}
                          </p>

                          <div className="mt-4">
                            <h4 className="font-semibold mb-2">
                              Program Highlights:
                            </h4>
                            <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
                              {program.highlights.map((highlight, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center text-sm text-gray-600"
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></div>
                                  {highlight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Curriculum Approach */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Our Curriculum Approach
              </h2>
              <p className="text-gray-600">
                Our curriculum is designed to provide a balanced approach to
                early childhood education, incorporating elements from various
                educational philosophies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-t-4 border-t-blue-500">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-blue-700">
                    Play-Based Learning
                  </h3>
                  <p className="text-gray-600">
                    We believe children learn best through play. Our curriculum
                    incorporates structured and unstructured play opportunities
                    that develop critical thinking and problem-solving skills.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-green-500">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-green-700">
                    Montessori Elements
                  </h3>
                  <p className="text-gray-600">
                    We incorporate Montessori principles by providing
                    child-directed activities, mixed-age groupings, and
                    specially designed learning materials that promote
                    independence.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-purple-500">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-purple-700">
                    Reggio Emilia Inspiration
                  </h3>
                  <p className="text-gray-600">
                    Inspired by the Reggio Emilia approach, we view children as
                    capable researchers and emphasize documentation of learning,
                    project-based exploration, and aesthetic environments.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-amber-500">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-amber-700">
                    Waldorf Influences
                  </h3>
                  <p className="text-gray-600">
                    We draw from Waldorf education by emphasizing rhythm and
                    routine, imaginative play, connection to nature, and the
                    development of the whole child—head, heart, and hands.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Join Our Community?
              </h2>
              <p className="text-gray-600 mb-8">
                Schedule a tour to see our programs in action and learn how we
                can support your child's unique learning journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">Schedule a Tour</Button>
                <Button variant="outline" size="lg">
                  Download Program Guide
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question:
                    "What is the teacher-to-student ratio in your programs?",
                  answer:
                    "Our teacher-to-student ratios vary by age group: Toddlers (2-3 years) have a 1:4 ratio, Preschool (3-4 years) has a 1:6 ratio, and Kindergarten (4-5 years) has a 1:8 ratio. These low ratios ensure each child receives personalized attention and support.",
                },
                {
                  question:
                    "How do you handle transitions between programs as children age up?",
                  answer:
                    "We implement a gradual transition process that includes visits to the new classroom, introduction to new teachers, and parent-teacher conferences to discuss the transition. Children typically move up with a few peers to maintain social connections while embracing new challenges.",
                },
                {
                  question:
                    "Can I enroll my child in multiple enrichment programs?",
                  answer:
                    "Yes! Many families choose to combine enrichment programs based on their child's interests. We help create a balanced schedule that provides variety without overwhelming your child. Special pricing is available for multiple program enrollment.",
                },
                {
                  question:
                    "How do you accommodate children with special needs or different learning styles?",
                  answer:
                    "We believe in inclusive education and work closely with families to develop individualized approaches for children with diverse needs. Our staff receives ongoing training in inclusive practices, and we collaborate with specialists when additional support is beneficial.",
                },
                {
                  question:
                    "What is your approach to technology in early childhood education?",
                  answer:
                    "We take a balanced approach to technology. For younger children, we limit screen time and focus on hands-on learning. For older children, we introduce educational technology in intentional ways that complement our curriculum and develop digital literacy skills appropriate for their age.",
                },
              ].map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProgramsPage;
