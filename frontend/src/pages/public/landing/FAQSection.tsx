// src/sections/FAQSection.jsx
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const FAQSection = () => {
  const faqs = [
    { question: "How do I verify my account?", answer: "Upload a government ID and complete our verification process." },
    { question: "Is there a fee to list my property?", answer: "Listing is free. We charge a small commission only after successful rental." },
    { question: "How does the digital signing work?", answer: "We use bank-level encryption for all documents. Sign with just a few clicks." },
    { question: "Can I schedule multiple viewings?", answer: "Yes! Our calendar system lets you book multiple viewings in one go." },
  ];

  return (
    <section className="py-16 bg-gray-50 relative">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Frequently Asked <span className="text-teal-500">Questions</span>
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
          >
            Everything you need to know about RentEase
          </motion.p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center cursor-pointer">
                <h3 className="text-lg font-bold text-gray-800">{faq.question}</h3>
                <Plus className="text-teal-500" size={20} />
              </div>
              <p className="mt-4 text-gray-600 text-sm">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;