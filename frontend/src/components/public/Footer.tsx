import { motion } from "framer-motion";
import { 
  Home, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin 
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: "easeOut" 
      }
    }
  };

  const socialLinks = [
    { icon: <Twitter size={20} />, href: "#", label: "Twitter" },
    { icon: <Facebook size={20} />, href: "#", label: "Facebook" },
    { icon: <Instagram size={20} />, href: "#", label: "Instagram" },
    { icon: <Linkedin size={20} />, href: "#", label: "LinkedIn" },
  ];

  const footerLinks = [
    { title: "Product", links: ["Features", "Pricing", "Testimonials", "FAQ"] },
    { title: "Company", links: ["About", "Careers", "Blog", "Press"] },
    { title: "Support", links: ["Contact", "Documentation", "Status", "API"] },
  ];

  return (
    <motion.footer 
      className="w-full border-t bg-gradient-to-b from-gray-50 to-gray-100 pt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Brand Column */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white">
                <Home size={24} />
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent">
                RentEase
              </span>
            </div>
            <p className="text-gray-600 mb-4 max-w-xs">
              Simplifying property management for landlords and tenants with our innovative platform.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow duration-300"
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Links Columns */}
          {footerLinks.map((section, index) => (
            <motion.div key={index} variants={itemVariants}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 relative inline-block">
                {section.title}
                <motion.div 
                  className="absolute bottom-0 left-0 w-1/3 h-0.5 bg-gradient-to-r from-teal-400 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: "33%" }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                />
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li 
                    key={linkIndex}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <a 
                      href="#" 
                      className="text-gray-600 hover:text-teal-600 transition-colors"
                    >
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact Column */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 relative inline-block">
              Contact Us
              <motion.div 
                className="absolute bottom-0 left-0 w-1/3 h-0.5 bg-gradient-to-r from-teal-400 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: "33%" }}
                transition={{ delay: 0.4, duration: 0.5 }}
              />
            </h3>
            <ul className="space-y-4">
              <motion.li className="flex items-start gap-3" whileHover={{ x: 5 }}>
                <Mail className="mt-0.5 text-teal-500 flex-shrink-0" size={18} />
                <span className="text-gray-600">contact@rentease.com</span>
              </motion.li>
              <motion.li className="flex items-start gap-3" whileHover={{ x: 5 }}>
                <Phone className="mt-0.5 text-teal-500 flex-shrink-0" size={18} />
                <span className="text-gray-600">+1 (555) 123-4567</span>
              </motion.li>
              <motion.li className="flex items-start gap-3" whileHover={{ x: 5 }}>
                <MapPin className="mt-0.5 text-teal-500 flex-shrink-0" size={18} />
                <span className="text-gray-600">123 Property St, Real Estate City</span>
              </motion.li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div 
          className="border-t border-gray-200 my-8"
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        />

        {/* Copyright */}
        <motion.div 
          className="py-6 text-center text-sm text-gray-600 flex flex-col sm:flex-row justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="mb-4 sm:mb-0">
            © {currentYear} RentEase. All rights reserved.
          </div>
          <div className="flex gap-6">
            <motion.a 
              href="#" 
              className="hover:text-teal-600 transition-colors"
              whileHover={{ y: -2 }}
            >
              Privacy Policy
            </motion.a>
            <motion.a 
              href="#" 
              className="hover:text-teal-600 transition-colors"
              whileHover={{ y: -2 }}
            >
              Terms of Service
            </motion.a>
            <motion.a 
              href="#" 
              className="hover:text-teal-600 transition-colors"
              whileHover={{ y: -2 }}
            >
              Cookies
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}