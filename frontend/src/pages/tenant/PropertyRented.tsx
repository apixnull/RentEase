import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bed,
  ShowerHead,
  Ruler,
  MapPin,
  Phone,
  MessageCircle,
} from "lucide-react";

export default function PropertyRented() {
  const property = {
    title: "Sunny 2‑Bed Condo",
    address: "123 Mango St., Makati, Metro Manila",
    description:
      "Bright, spacious 2‑bedroom condo in the heart of Makati. Walking distance to malls and MRT. Comes fully furnished with a balcony view of the skyline.",
    images: ["/images/condo1.jpg", "/images/condo2.jpg", "/images/condo3.jpg"],
    beds: 2,
    baths: 2,
    size: 75, // sqm
  };
  const landlord = {
    name: "Anna Santos",
    email: "anna.santos@example.com",
    phone: "+63 912 345 6789",
    avatar: "/images/landlord.jpg",
  };

  const [current, setCurrent] = useState(0);

  return (
    <div className="w-full max-w-screen-xl mx-auto p-4 md:p-8 space-y-8">
      {/* Top Section: Gallery + Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div className="space-y-4">
          <img
            src={property.images[current]}
            alt={`Photo ${current + 1}`}
            className="w-full h-[400px] object-cover rounded-lg"
          />
          <div className="flex space-x-2 overflow-x-auto">
            {property.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 ${
                  i === current ? "border-indigo-500" : "border-transparent"
                }`}
              >
                <img
                  src={src}
                  alt={`Thumb ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main Info & Contact */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">{property.title}</h1>
            <p className="flex items-center text-gray-600">
              <MapPin className="mr-2 h-5 w-5" />
              {property.address}
            </p>

            <div className="grid grid-cols-3 gap-4 text-gray-700">
              <div className="flex items-center">
                <Bed className="mr-2 h-5 w-5 text-blue-500" />
                {property.beds} Beds
              </div>
              <div className="flex items-center">
                <ShowerHead className="mr-2 h-5 w-5 text-teal-500" />
                {property.baths} Baths
              </div>
              <div className="flex items-center">
                <Ruler className="mr-2 h-5 w-5 text-purple-500" />
                {property.size} m²
              </div>
            </div>

            <Button size="lg" className="mt-4">
              View Lease Agreement
            </Button>
          </div>

          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <img
                  src={landlord.avatar}
                  alt={landlord.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span>{landlord.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="flex items-center text-gray-700">
                <Phone className="mr-2 h-4 w-4" />
                {landlord.phone}
              </p>
              <p className="flex items-center text-gray-700">
                <MessageCircle className="mr-2 h-4 w-4" />
                {landlord.email}
              </p>
              <div className="pt-2 flex space-x-2">
                <Button variant="outline" className="flex-1">
                  Message Landlord
                </Button>
                <Button variant="outline" className="flex-1">
                  Call Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full‑Width Description */}
      <Card>
        <CardHeader>
          <CardTitle>Property Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-800 leading-relaxed">
            {property.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
