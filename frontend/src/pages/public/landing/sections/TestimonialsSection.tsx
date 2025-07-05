// src/sections/TestimonialsSection.jsx
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    { name: "Sarah J.", role: "Software Engineer", text: "Found my dream apartment in 3 days! The virtual tours saved me so much time.", rating: 5 },
    { name: "Michael T.", role: "University Student", text: "Perfect room near campus. The roommate matching feature is genius!", rating: 4 },
    { name: "Emma L.", role: "Marketing Director", text: "Relocated for work and RentEase made it stress-free. Highly recommend!", rating: 5 },
  ];

  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-100 to-teal-100 blur-3xl opacity-30"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            What Our <span className="text-teal-500">Customers</span> Say
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
          >
            Join thousands of happy renters who found their perfect home
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 text-sm">"{testimonial.text}"</p>
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                <div className="ml-4">
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;