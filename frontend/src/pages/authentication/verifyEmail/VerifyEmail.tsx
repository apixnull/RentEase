import { Link} from "react-router-dom";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";
import VerifyEmailForm from "./VerifyEmailForm";
import VerifyEmailVisualDesign from "./VerifyEmailVisualDesign";


const VerifyEmail = () => {

  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        {/* Left Panel - Form Section */}
        <div className="flex flex-col gap-4 p-6 md:p-10 bg-gradient-to-br from-white to-gray-50">
          <div className="flex justify-center md:justify-start">
            <Link to={"/"} className="flex items-center gap-2 font-medium">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-sm" />
                <Zap className="size-6 text-teal-500" fill="currentColor" />
              </div>
              <span className="text-lg font-extrabold bg-gradient-to-r from-teal-600 via-blue-600 to-teal-600 bg-[length:300%_auto] bg-clip-text text-transparent">
                RentEase
              </span>
            </Link>
          </div>

          <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.1,
            }}
          >
            <VerifyEmailForm />
          </motion.div>
        </div>
        
        <VerifyEmailVisualDesign />
      </div>
    </>
  );
}

export default VerifyEmail