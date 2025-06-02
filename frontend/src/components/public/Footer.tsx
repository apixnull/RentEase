import { motion } from "framer-motion";
import { 
  Zap, Home, Info, Sparkles, DollarSign, 
  Mail, Phone, MapPin, Facebook, Twitter,  
  Instagram, Linkedin, Heart, ShieldCheck,
  CreditCard, Headphones, Gift
} from "lucide-react";
// this four are depracated:  Facebook, Twitter, Instagram, Linkedin

const Footer = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    }
  };

  return (
    <motion.footer 
      className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-16 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand Column */}
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={itemVariants} className="flex items-center">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 3, 0],
                  scale: [1, 1.1, 1.05, 1.08, 1],
                  transition: { 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }
                }}
                className="mr-3"
              >
                <Zap className="w-8 h-8 text-teal-400" fill="currentColor" />
              </motion.div>
              <motion.span 
                className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  backgroundPosition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              >
                RentEase
              </motion.span>
            </motion.div>
            
            <motion.p variants={itemVariants} className="text-gray-300 max-w-xs">
              Your trusted platform for seamless property rentals. Find your perfect space with ease and confidence.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="bg-gray-800 p-2 rounded-full hover:bg-teal-500 transition-colors"
                  whileHover={{ 
                    y: -5,
                    scale: 1.1,
                    backgroundColor: "#0d9488"
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Quick Links */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h3 
              variants={itemVariants}
              className="text-xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block"
            >
              Quick Links
            </motion.h3>
            <motion.ul variants={itemVariants} className="space-y-3">
              {[
                { icon: Home, label: "Home", path: "/" },
                { icon: Info, label: "About Us", path: "/about" },
                { icon: Sparkles, label: "Features", path: "/features" },
                { icon: DollarSign, label: "Pricing", path: "/pricing" },
              ].map((link, index) => (
                <motion.li 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                >
                  <a 
                    href={link.path} 
                    className="flex items-center text-gray-300 hover:text-teal-400 transition-colors"
                  >
                    <link.icon className="w-4 h-4 mr-3" />
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
          
          {/* Contact Info */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h3 
              variants={itemVariants}
              className="text-xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block"
            >
              Contact Us
            </motion.h3>
            <motion.ul variants={itemVariants} className="space-y-4">
              {[
                { icon: MapPin, text: "123 Rental Street, Property City, PC 12345" },
                { icon: Phone, text: "+1 (555) 123-4567" },
                { icon: Mail, text: "support@rentease.com" },
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  variants={itemVariants}
                  className="flex items-start"
                  whileHover={{ x: 5 }}
                >
                  <item.icon className="w-5 h-5 mr-3 mt-0.5 text-teal-400 flex-shrink-0" />
                  <span className="text-gray-300">{item.text}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
          
          {/* Newsletter */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h3 
              variants={itemVariants}
              className="text-xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block"
            >
              Newsletter
            </motion.h3>
            <motion.p variants={itemVariants} className="text-gray-300 mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </motion.p>
            <motion.form 
              variants={itemVariants}
              className="flex flex-col space-y-3"
            >
              <input 
                type="email" 
                placeholder="Your email address" 
                className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                Subscribe
              </motion.button>
            </motion.form>
          </motion.div>
        </div>
        
        {/* Trust Badges */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 border-t border-gray-700 pt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {[
            { icon: ShieldCheck, title: "Secure Payments", desc: "SSL encrypted transactions" },
            { icon: CreditCard, title: "Flexible Payments", desc: "Multiple payment options" },
            { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
            { icon: Gift, title: "Special Offers", desc: "Exclusive member benefits" },
          ].map((item, index) => (
            <motion.div 
              key={index}
              className="flex items-center p-4 bg-gray-800 rounded-xl"
              whileHover={{ y: -5, backgroundColor: "#1e293b" }}
            >
              <div className="bg-teal-900/50 p-3 rounded-lg mr-4">
                <item.icon className="w-8 h-8 text-teal-400" />
              </div>
              <div>
                <h4 className="font-bold">{item.title}</h4>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <motion.p 
            className="text-gray-400 text-sm mb-4 md:mb-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            © {new Date().getFullYear()} RentEase. All rights reserved.
          </motion.p>
          
          <motion.div 
            className="flex space-x-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item, index) => (
              <motion.a
                key={index}
                href="#"
                className="text-gray-400 text-sm hover:text-teal-400 transition-colors"
                whileHover={{ y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </motion.div>
        </div>
        
        {/* Made with love */}
        <motion.div 
          className="flex justify-center mt-8 text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Made with <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" /> by RentEase Team
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;