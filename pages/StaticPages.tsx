import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageHeader: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => {
    const navigate = useNavigate();
    return (
        <div className="mb-8">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-500 font-bold text-sm hover:text-primary transition-colors">
                <ArrowLeft size={18} /> Back
            </button>
            <h1 className="text-3xl font-extrabold text-secondary mb-2">{title}</h1>
            {subtitle && <p className="text-gray-400 text-sm font-medium">{subtitle}</p>}
        </div>
    );
};

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-lg font-bold text-secondary mb-3">{title}</h2>
        <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
    </div>
);

export const About: React.FC = () => (
  <div className="min-h-screen bg-white pt-24 md:pt-4 px-6 pb-28 animate-in slide-in-from-right duration-300 max-w-4xl mx-auto rounded-3xl mt-6 shadow-2xl">
    <PageHeader title="About Zuryo" />
    <div className="prose prose-sm text-gray-600 space-y-4">
        <p>
            Zuryo is India's first community-based On Demand Fitness platform. We are on a mission to democratize fitness by connecting residents with top-tier certified trainers in under 60 minutes.
        </p>
        <p>
            Born from the need for flexibility in the fast-paced lives of urban Indians, Zuryo eliminates the need for expensive gym memberships that go unused. We bring fitness to your apartment gym.
        </p>
        <div className="my-8 rounded-2xl overflow-hidden shadow-lg">
            <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop" alt="Team" className="w-full h-48 object-cover" />
        </div>
        <h3 className="text-lg font-bold text-secondary">Our Promise</h3>
        <ul className="list-disc pl-5 space-y-2">
            <li>Certified & Vetted Trainers</li>
            <li>Safety First Protocol</li>
            <li>No Hidden Fees</li>
            <li>Personalized Attention</li>
        </ul>
    </div>
  </div>
);

export const Contact: React.FC = () => (
  <div className="min-h-screen bg-white pt-24 md:pt-4 px-6 pb-28 animate-in slide-in-from-right duration-300 max-w-4xl mx-auto rounded-3xl mt-6 shadow-2xl">
    <PageHeader title="Contact Us" subtitle="We're here to help." />
    
    <div className="space-y-6">
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-secondary mb-4">Contact Information</h3>
            <p className="text-gray-600 text-sm mb-4">If you have any questions, concerns, or requests regarding our services, policies, payments, or data usage, please contact us using the details below.</p>
            
            <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm shrink-0">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-secondary text-sm">Registered Office</h4>
                        <p className="text-gray-500 text-xs mt-1">
                            Zuryo Technologies Private Limited<br/>
                            3rd Floor, ASR Avenue, off Hosa Road, Choodasandra,<br/>
                            Kasavanahalli, Bengaluru, Karnataka 560099
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm shrink-0">
                        <Mail size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-secondary text-sm">Email</h4>
                        <p className="text-gray-500 text-xs">founder@zuryo.co</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm shrink-0">
                        <Phone size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-secondary text-sm">Phone / WhatsApp</h4>
                        <p className="text-gray-500 text-xs">+91-7353762555</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-secondary mb-2">Business Hours</h3>
            <p className="text-gray-600 text-sm">Monday to Sunday – 5:00 AM to 9:00 PM IST</p>
        </div>
    </div>
  </div>
);

export const Policies: React.FC = () => (
  <div className="min-h-screen bg-white pt-24 md:pt-4 px-6 pb-28 animate-in slide-in-from-right duration-300 max-w-4xl mx-auto rounded-3xl mt-6 shadow-2xl">
    <PageHeader title="Privacy Policy" subtitle="Last Updated: 20 January 2026" />
    
    <div className="space-y-8">
        <p className="text-gray-600 text-sm">Zuryo Technologies Pvt. Ltd. is committed to protecting your privacy and personal data.</p>
        
        <Section title="1. Information We Collect">
            <ul className="list-disc pl-5 space-y-1">
                <li>Name, phone number, email</li>
                <li>Address/location details for service delivery</li>
                <li>Payment confirmation (not payment credentials)</li>
                <li>Fitness Assessment details, session history and feedback</li>
            </ul>
        </Section>

        <Section title="2. Data Confidentiality">
            <ul className="list-disc pl-5 space-y-1">
                <li>Your personal data is <strong>confidential</strong></li>
                <li>We do not sell, rent, or trade your data</li>
                <li>Data is shared <strong>only with assigned trainers</strong> strictly for service execution</li>
            </ul>
        </Section>

        <Section title="3. Payment Security">
            <p>Payments are handled entirely by Razorpay. Zuryo does not store:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Card numbers</li>
                <li>CVV</li>
                <li>UPI PINs</li>
            </ul>
        </Section>

        <Section title="4. Data Usage">
            <p>Your data may be used to provide and improve services, communicate session updates, and ensure safety and compliance.</p>
        </Section>

        <Section title="5. Data Protection & Liability">
            <p>We implement reasonable technical and organizational safeguards. However, Zuryo shall not be liable for third-party breaches beyond reasonable control or force majeure events.</p>
        </Section>
        
        <Section title="6. User Rights">
             <p>You may request access to, correction of, or deletion of your data by emailing <strong>founder@zuryo.co</strong>.</p>
        </Section>
    </div>
  </div>
);

export const Terms: React.FC = () => (
  <div className="min-h-screen bg-white pt-24 md:pt-4 px-6 pb-28 animate-in slide-in-from-right duration-300 max-w-4xl mx-auto rounded-3xl mt-6 shadow-2xl">
    <PageHeader title="Terms & Conditions" subtitle="Last Updated: 20 January 2026" />
    
    <div className="space-y-6">
        <p className="text-gray-600 text-sm">These Terms govern your access to services provided by Zuryo Technologies Private Limited.</p>

        <Section title="1. Nature of Services">
            <p>Zuryo is a technology and service facilitation platform connecting customers with independent, verified fitness professionals. <strong>Zuryo does not provide medical advice</strong>, diagnosis, or treatment.</p>
        </Section>

        <Section title="2. User Eligibility">
            <ul className="list-disc pl-5 space-y-1">
                <li>You are at least 18 years old (or have guardian consent).</li>
                <li>You are physically capable of participating in fitness activities.</li>
                <li>You have disclosed any relevant medical conditions to the trainer.</li>
            </ul>
        </Section>

        <Section title="3. Health & Injury Disclaimer">
            <p>Fitness activities carry inherent risks. By booking, you agree that:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>You participate voluntarily and at your own risk.</li>
                <li>Zuryo is <strong>not responsible for injuries, accidents, or health complications</strong>.</li>
                <li>You are solely responsible for determining your fitness readiness.</li>
            </ul>
        </Section>

        <Section title="4. Trainer Conduct & POSH Policy">
            <p>Zuryo has a zero-tolerance policy toward sexual harassment, abuse, or discrimination. Report misconduct to <strong>founder@zuryo.co</strong>.</p>
        </Section>
        
        <Section title="5. Payments">
            <ul className="list-disc pl-5 space-y-1">
                <li>All payments are processed securely via Razorpay.</li>
                <li>Prices are clearly displayed before payment.</li>
                <li>Zuryo does not store card or UPI details.</li>
            </ul>
        </Section>

        <Section title="6. Limitation of Liability">
            <p>Zuryo acts as a facilitator and is not liable for actions of independent trainers, service quality beyond facilitation, or delays due to force majeure.</p>
        </Section>
        
        <Section title="7. Governing Law">
            <p>These terms are governed by the laws of Bengaluru, India.</p>
        </Section>
    </div>
  </div>
);

export const RefundPolicy: React.FC = () => (
  <div className="min-h-screen bg-white pt-24 md:pt-4 px-6 pb-28 animate-in slide-in-from-right duration-300 max-w-4xl mx-auto rounded-3xl mt-6 shadow-2xl">
    <PageHeader title="Cancellation & Refund Policy" subtitle="Last Updated: 20 January 2026" />
    
    <div className="space-y-6">
        <Section title="1. Session Cancellations">
            <ul className="list-disc pl-5 space-y-2">
                <li>Cancellations <strong>more than 4 hours</strong> before the session may be eligible for rescheduling (subject to availability).</li>
                <li>Cancellations <strong>within 4 hours</strong> of the session are <strong>non-refundable</strong>.</li>
            </ul>
        </Section>

        <Section title="2. No-Show Policy">
            <p>If the customer is unavailable, denies access, or fails to respond at the scheduled time, the session will be marked as completed, and <strong>no refund will be issued</strong>.</p>
        </Section>

        <Section title="3. Trainer No-Show">
            <p>If a trainer fails to arrive, the session will be <strong>rescheduled or refunded</strong> at Zuryo’s discretion.</p>
        </Section>

        <Section title="4. Refund Processing">
            <ul className="list-disc pl-5 space-y-1">
                <li>Approved refunds are processed within <strong>5–7 business days</strong>.</li>
                <li>Refunds are credited back to the original payment method via Razorpay.</li>
            </ul>
        </Section>

        <Section title="5. Non-Refundable Scenarios">
            <p>No refunds provided for:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>Completed sessions</li>
                <li>User dissatisfaction unrelated to service delivery</li>
                <li>Health issues arising during or after the session</li>
            </ul>
        </Section>
    </div>
  </div>
);

export const POSHPolicy: React.FC = () => (
  <div className="min-h-screen bg-white pt-24 md:pt-4 px-6 pb-28 animate-in slide-in-from-right duration-300 max-w-4xl mx-auto rounded-3xl mt-6 shadow-2xl">
    <PageHeader title="Prevention of Sexual Harassment (POSH)" subtitle="Zero Tolerance Policy" />
    
    <div className="space-y-6">
        <Section title="1. Policy Statement">
            <p>Zuryo Technologies Private Limited is committed to providing a safe, respectful, and harassment-free environment for all individuals associated with our platform. This policy is framed in accordance with the <strong>Sexual Harassment of Women at Workplace Act, 2013</strong>.</p>
        </Section>

        <Section title="2. Scope">
            <p>Applies to customers, independent trainers, employees, and contractors during sessions, digital interactions, or at service locations.</p>
        </Section>

        <Section title="3. Code of Conduct">
            <div className="bg-red-50 p-4 rounded-xl mb-4 border border-red-100">
                <h4 className="font-bold text-red-800 text-sm mb-2">What Constitutes Harassment?</h4>
                <ul className="list-disc pl-5 space-y-1 text-red-700 text-xs">
                    <li>Unwelcome physical contact or advances</li>
                    <li>Sexually colored remarks or jokes</li>
                    <li>Inappropriate staring or gestures</li>
                    <li>Requests for sexual favors</li>
                    <li>Intimidating or hostile environment</li>
                </ul>
            </div>
            <p><strong>For Trainers:</strong> Maintain professional behavior, no personal contact beyond instruction, no solicitation.</p>
            <p><strong>For Customers:</strong> Treat trainers with dignity. No coercion or inappropriate behavior.</p>
        </Section>

        <Section title="4. Complaint Mechanism">
             <p>Experience or witness harassment? File a complaint immediately:</p>
             <div className="mt-3 p-4 bg-gray-50 rounded-xl font-medium text-sm">
                <p>Email: <strong>founder@zuryo.co</strong></p>
                <p>Phone: <strong>+91-7353762555</strong></p>
             </div>
             <p className="mt-3 text-xs">Complaints are treated with strict confidentiality and handled without retaliation.</p>
        </Section>

        <Section title="5. Investigation & Action">
            <p>Zuryo may initiate an internal review. Actions may include warning, suspension, permanent removal from the platform, or reporting to legal authorities.</p>
        </Section>
    </div>
  </div>
);