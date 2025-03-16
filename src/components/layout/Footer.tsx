import React, { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";

interface FooterProps {
  logoSrc?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

const Footer = ({
  logoSrc = "/logo.png",
  contactEmail = "info@niniokindergarten.com",
  contactPhone = "+1 (555) 123-4567",
  contactAddress = "123 Education Lane, Childcare City, CC 12345",
  socialLinks = {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    youtube: "https://youtube.com",
  },
}: FooterProps) => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send this to your backend
    toast({
      title: "Subscribed!",
      description: "You've been successfully subscribed to our newsletter",
    });
    setEmail("");
  };

  return (
    <footer className="w-full bg-primary-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="flex items-center">
                <img
                  src={logoSrc}
                  alt="Ninio Kindergarten"
                  className="h-12 w-auto"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://api.dicebear.com/7.x/shapes/svg?seed=Ninio";
                  }}
                />
                <span className="ml-2 text-xl font-bold text-primary">
                  Ninio
                </span>
              </Link>
              <p className="text-gray-600 text-sm">
                Providing quality early childhood education and care in a
                nurturing environment where children can learn, play, and grow.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/facilities"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Our Facilities
                </Link>
              </li>
              <li>
                <Link
                  to="/philosophy"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Teaching Philosophy
                </Link>
              </li>
              <li>
                <Link
                  to="/programs"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Programs
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/login"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Parent Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-gray-600">{contactAddress}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-2" />
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  {contactPhone}
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2" />
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  {contactEmail}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Stay Updated
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Subscribe to our newsletter for updates on events and activities.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col space-y-2"
            >
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button type="submit" className="w-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Social Media and Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-4 md:mb-0">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {socialLinks.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
            <div className="text-gray-500 text-sm">
              <p>
                © {new Date().getFullYear()} Ninio Kindergarten. All rights
                reserved.
              </p>
              <p className="mt-1 flex items-center justify-center md:justify-end">
                Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> for
                little learners
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
