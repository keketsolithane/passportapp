"use client";
import Image from "next/image";
import { FaPhone, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaGoogle } from "react-icons/fa";

export default function Header() {
  return (
    <header className="bg-white border-b">
      {/* Top bar */}
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center py-2 px-4 text-sm">
        {/* Left - Logo + Title */}
        <div className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="Logo" width={300} height={200} />
          <div>
        
          </div>
        </div>

        {/* Right - Contacts */}
        <div className="flex items-center gap-6 mt-3 sm:mt-0">
          <div className="flex items-center gap-1">
            <FaPhone /> <span>+266 8005 0074</span>
          </div>
          <div className="flex items-center gap-1">
            <FaMapMarkerAlt /> <span>Corner Moshoeshoe and Lerotholi Roads</span>
          </div>
          <div className="flex gap-3 text-slate-600">
            <FaFacebookF className="hover:text-blue-600 cursor-pointer" />
            <FaTwitter className="hover:text-sky-500 cursor-pointer" />
            <FaInstagram className="hover:text-pink-500 cursor-pointer" />
            <FaGoogle className="hover:text-red-500 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Bottom notification bar */}
      <div className="bg-slate-100 flex justify-between items-center px-4 py-2 text-blue-800 font-medium">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔔</span>
          <span>ONLINE PASSPORT APPLICATIONS OPENED!</span>
        </div>
        {/* Animated flag */}
        <div className="w-10 h-6 relative overflow-hidden">
          <Image
            src="/lesotho-flag.gif"
            alt="Lesotho Flag" width={500} height={400}
            className="object-cover waving-flag"
          />
        </div>
      </div>
    </header>
  );
}
