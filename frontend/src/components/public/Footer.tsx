import { motion } from "framer-motion";
import { 
  Zap, Home, Info, Sparkles, DollarSign, 
  Mail, Phone, MapPin, Heart, ShieldCheck,
  CreditCard, Headphones, Gift, Github, Youtube,
  Linkedin, Facebook
} from "lucide-react";

const Footer = () => {
  return (
    <motion.footer 
      className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-16 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          {/* **************************** BRAND COLUMN **************************** */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-teal-400 mr-3" fill="currentColor" />
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                RentEase
              </span>
            </div>
            
            <p className="text-gray-300 max-w-xs">
              Your trusted platform for seamless property rentals. Find your perfect space with ease and confidence.
            </p>
            
            <div className="flex space-x-4">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Github, label: "GitHub" },
                { icon: Youtube, label: "YouTube" },
                { icon: Linkedin, label: "LinkedIn" },
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="bg-gray-800 p-2 rounded-full hover:bg-teal-500 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>
          
          {/* **************************** QUICK LINKS **************************** */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { icon: Home, label: "Home", path: "/" },
                { icon: Info, label: "About Us", path: "/about" },
                { icon: Sparkles, label: "Features", path: "/features" },
                { icon: DollarSign, label: "Pricing", path: "/pricing" },
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.path} 
                    className="flex items-center text-gray-300 hover:text-teal-400 transition-colors"
                  >
                    <link.icon className="w-4 h-4 mr-3" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* **************************** CONTACT INFO **************************** */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block">
              Contact Us
            </h3>
            <ul className="space-y-4">
              {[
                { icon: MapPin, text: "123 Rental Street, Property City, PC 12345" },
                { icon: Phone, text: "+1 (555) 123-4567" },
                { icon: Mail, text: "support@rentease.com" },
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <item.icon className="w-5 h-5 mr-3 mt-0.5 text-teal-400 flex-shrink-0" />
                  <span className="text-gray-300">{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* **************************** NEWSLETTER **************************** */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block">
              Newsletter
            </h3>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form className="flex flex-col space-y-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
                aria-label="Email address"
              />
              <button
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
        
        {/* **************************** TRUST BADGES **************************** */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 border-t border-gray-700 pt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {[
            { icon: ShieldCheck, title: "Secure Payments", desc: "SSL encrypted transactions" },
            { icon: CreditCard, title: "Flexible Payments", desc: "Multiple payment options" },
            { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
            { icon: Gift, title: "Special Offers", desc: "Exclusive member benefits" },
          ].map((item, index) => (
            <div 
              key={index}
              className="flex items-center p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <div className="bg-teal-900/50 p-3 rounded-lg mr-4">
                <item.icon className="w-8 h-8 text-teal-400" />
              </div>
              <div>
                <h4 className="font-bold">{item.title}</h4>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
        
        {/* **************************** COPYRIGHT **************************** */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} RentEase. All rights reserved.
          </p>
          
          <div className="flex space-x-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item, index) => (
              <a
                key={index}
                href="#"
                className="text-gray-400 text-sm hover:text-teal-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        
        {/* **************************** MADE WITH LOVE **************************** */}
        <div className="flex justify-center mt-8 text-gray-500 text-sm">
          Made with <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" /> by RentEase Team
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;