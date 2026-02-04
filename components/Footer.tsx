
import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#0b1736] pt-20 pb-10 hidden md:block text-white rounded-t-[40px] mt-12 mx-4 md:mx-0">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 space-y-6">
            <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center shadow-sm overflow-hidden backdrop-blur-sm">
                    <img src="https://www.karmisalon.com/wp-content/uploads/2026/01/Zuryo_L.webp" alt="Zuryo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-black text-white tracking-tight leading-none uppercase">ZURYO</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">On Demand Fitness</span>
                </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              India's first community-based fitness platform. We bring certified trainers to your doorstep, ensuring you never miss a workout again.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Facebook size={18} />} />
              <SocialIcon icon={<Twitter size={18} />} />
              <SocialIcon icon={<Instagram size={18} />} />
              <SocialIcon icon={<Linkedin size={18} />} />
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="font-bold text-white mb-6 text-lg">Quick Links</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-400">
              <li><button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button></li>
              <li><button onClick={() => navigate('/book')} className="hover:text-primary transition-colors">Book a Session</button></li>
              <li><button onClick={() => navigate('/trainers')} className="hover:text-primary transition-colors">Find Trainers</button></li>
              <li><button onClick={() => navigate('/profile')} className="hover:text-primary transition-colors">My Profile</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h4 className="font-bold text-white mb-6 text-lg">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-400">
              <li><button onClick={() => navigate('/about-us')} className="hover:text-primary transition-colors">About Us</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-primary transition-colors">Terms & Conditions</button></li>
              <li><button onClick={() => navigate('/privacy-policy')} className="hover:text-primary transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/refund-policy')} className="hover:text-primary transition-colors">Refund Policy</button></li>
              <li><button onClick={() => navigate('/posh-policy')} className="hover:text-primary transition-colors">POSH Policy</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="font-bold text-white mb-6 text-lg">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="shrink-0 text-primary mt-0.5" />
                <span className="leading-tight">3rd Floor, ASR Avenue, off Hosa Road, Choodasandra, Kasavanahalli, Bengaluru, Karnataka 560099</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-primary" />
                <span>founder@zuryo.co</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-primary" />
                <span>+91 73537 62555</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs font-medium">© {new Date().getFullYear()} Zuryo Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex gap-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon }: { icon: any }) => (
  <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-secondary transition-all">
    {icon}
  </button>
);
