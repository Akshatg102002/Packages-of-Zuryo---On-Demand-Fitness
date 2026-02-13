import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Clock, AlertCircle, FileText, Shield, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageHeader: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => {
    const navigate = useNavigate();
    return (
        <div className="mb-8">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-secondary transition-colors">
                <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-3xl font-extrabold text-secondary mb-2">{title}</h1>
            {subtitle && <p className="text-gray-500 font-medium">{subtitle}</p>}
        </div>
    );
};

export const About: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-4xl mx-auto">
        <PageHeader title="About Zuryo" subtitle="Fitness on your terms." />
        <div className="prose prose-blue text-gray-600 leading-relaxed">
            <p>
                Zuryo Technologies Private Limited is a technology and service facilitation platform that connects customers with independent, verified fitness professionals for on-demand fitness sessions.
            </p>
            <p>
                Our mission is to make fitness accessible, affordable, and flexible. We realize that the biggest barrier to fitness is convenience. We remove the friction of travel and scheduling.
            </p>

            <h3 className="text-secondary font-bold text-xl mt-8 mb-4">Nature of Services</h3>
            <p>
                Zuryo acts solely as a facilitator connecting users with trainers. Please note that Zuryo does not provide medical advice, diagnosis, or treatment.
            </p>
        </div>
    </div>
);

export const Contact: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-4xl mx-auto">
        <PageHeader title="Contact Information" subtitle="Get in touch with us" />
        <div className="space-y-6">
            <p className="text-gray-600 mb-6">
                If you have any questions, concerns, or requests regarding our services, policies, payments, or data usage, please contact us using the details below.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary"><MapPin size={20} /></div>
                        <h3 className="font-bold text-secondary">Registered Office</h3>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        3rd Floor, ASR Avenue, off Hosa Road, Choodasandra, Kasavanahalli, Bengaluru, Karnataka 560099
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary"><Clock size={20} /></div>
                        <h3 className="font-bold text-secondary">Business Hours</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                        Monday to Sunday<br />
                        5:00 AM to 9:00 PM IST
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary"><Mail size={20} /></div>
                        <h3 className="font-bold text-secondary">Email</h3>
                    </div>
                    <a href="mailto:founder@zuryo.co" className="text-sm text-primary font-medium hover:underline">founder@zuryo.co</a>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary"><Phone size={20} /></div>
                        <h3 className="font-bold text-secondary">Phone / WhatsApp</h3>
                    </div>
                    <p className="text-sm text-gray-500">+91-7353762555</p>
                </div>
            </div>

            <div className="mt-8 bg-gray-50 p-4 rounded-xl text-xs text-gray-500 border border-gray-100">
                <strong>Service Communication:</strong> By contacting us via email, WhatsApp, phone call, or website forms, you consent to receive service-related communications from Zuryo Technologies Pvt. Ltd.
            </div>
        </div>
    </div>
);

export const Terms: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-4xl mx-auto">
        <PageHeader title="Terms and Conditions" subtitle="Last Updated: 20 January 2026" />
        <div className="prose prose-sm text-gray-500 space-y-8">
            <p>
                These Terms and Conditions ("Terms") govern your access to and use of the services provided by Zuryo Technologies Private Limited ("Zuryo", "we", "our", "us"). By using our website, booking a session, or making a payment, you agree to be bound by these Terms.
            </p>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2 flex items-center gap-2">
                    <FileText size={18} className="text-primary" /> 1. Nature of Services
                </h4>
                <p>
                    Zuryo is a technology and service facilitation platform that connects customers with independent, verified fitness professionals for on-demand fitness sessions. Zuryo does not provide medical advice, diagnosis, or treatment.
                </p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2 flex items-center gap-2">
                    <Shield size={18} className="text-primary" /> 2. User Eligibility
                </h4>
                <p>You confirm that:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>You are at least 18 years old, or have parental/guardian consent.</li>
                    <li>You are physically capable of participating in fitness activities.</li>
                    <li>You have disclosed any relevant medical conditions to the trainer before the session.</li>
                </ul>
            </section>

            <section className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                <h4 className="font-bold text-orange-800 text-lg mb-2 flex items-center gap-2">
                    <AlertCircle size={18} /> 3. Health & Injury Disclaimer
                </h4>
                <p className="text-orange-900 mb-2"><strong>Fitness activities carry inherent risks.</strong></p>
                <p className="text-sm text-orange-800">
                    By booking a session, you acknowledge that you participate voluntarily and at your own risk. Zuryo is not responsible for injuries, accidents, health complications, or losses occurring before, during, or after a session. You are solely responsible for determining your fitness and medical readiness.
                </p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">4. Trainer Conduct & POSH Policy</h4>
                <p>
                    Zuryo follows a zero-tolerance policy toward sexual harassment, verbal or physical abuse, and discrimination of any kind. All trainers are required to maintain professional behavior. If you experience inappropriate conduct, report it immediately to founder@zuryo.co.
                </p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">5. Payments</h4>
                <ul className="list-disc pl-5 space-y-1">
                    <li>All payments are processed securely via Razorpay.</li>
                    <li>Prices are clearly displayed before payment.</li>
                    <li>Zuryo does not store your card or UPI details.</li>
                </ul>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">6. Platform Limitation of Liability</h4>
                <p>
                    Zuryo acts solely as a facilitator and is not liable for actions or omissions of independent trainers, service quality beyond reasonable facilitation, or delays due to force majeure events.
                </p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">7. Termination</h4>
                <p>
                    We reserve the right to suspend or terminate access to our services without notice if these Terms are violated or if fraudulent or abusive activity is detected.
                </p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">8. Governing Law</h4>
                <p>
                    These Terms are governed by the laws of Bengaluru, India, and courts in India shall have exclusive jurisdiction.
                </p>
            </section>
        </div>
    </div>
);

export const RefundPolicy: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-4xl mx-auto">
        <PageHeader title="Cancellation and Refund Policy" subtitle="Last Updated: 20 January 2026" />
        <div className="prose prose-sm text-gray-500 space-y-8">
            <p>
                This policy outlines the cancellation and refund rules for services booked through Zuryo Technologies Pvt. Ltd.
            </p>

            <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-secondary text-lg mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-primary" /> 1. Session Cancellations
                </h4>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                        <div className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-xs mt-0.5"> &gt; 4 HRS</div>
                        <p>Cancellations <strong>more than 4 hours</strong> before the session may be eligible for rescheduling (subject to availability).</p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded text-xs mt-0.5"> &lt; 4 HRS</div>
                        <p>Cancellations <strong>within 4 hours</strong> of the session are non-refundable.</p>
                    </li>
                </ul>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">2. No-Show Policy</h4>
                <p>The session will be marked as completed, and no refund will be issued if the customer:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Is unavailable at the scheduled time.</li>
                    <li>Denies access to the trainer.</li>
                    <li>Fails to respond.</li>
                </ul>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">3. Trainer No-Show</h4>
                <p>
                    If a trainer fails to arrive, the session will be rescheduled or refunded at Zuryo's discretion.
                </p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2 flex items-center gap-2">
                    <CreditCard size={18} className="text-primary" /> 4. Refund Processing
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Approved refunds are processed within <strong>5-7 business days</strong>.</li>
                    <li>Refunds are credited back to the original payment method via Razorpay.</li>
                </ul>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">5. Non-Refundable Scenarios</h4>
                <p>No refunds will be provided for:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Completed sessions.</li>
                    <li>User dissatisfaction unrelated to service delivery.</li>
                    <li>Health issues arising during or after the session.</li>
                </ul>
            </section>
        </div>
    </div>
);

export const Policies: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-4xl mx-auto">
        <PageHeader title="Privacy Policy" subtitle="Last Updated: 20 January 2026" />
        <div className="prose prose-sm text-gray-500 space-y-8">
            <p>
                Zuryo Technologies Pvt. Ltd. is committed to protecting your privacy and personal data.
            </p>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">1. Information We Collect</h4>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Name, phone number, email.</li>
                    <li>Address/location details for service delivery.</li>
                    <li>Payment confirmation (not payment credentials).</li>
                    <li>Fitness Assessment details, session history and feedback.</li>
                </ul>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">2. Data Confidentiality</h4>
                <p>
                    Your personal data is confidential. We do not sell, rent, or trade your data. Data is shared only with assigned trainers strictly for service execution.
                </p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">3. Payment Security</h4>
                <p>
                    Payments are handled entirely by Razorpay. Zuryo does not store Card numbers, CVV, or UPI PINs.
                </p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">4. Data Usage</h4>
                <p>Your data may be used to provide and improve services, communicate session updates, and ensure safety and compliance.</p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">5. Data Protection & Liability</h4>
                <p>
                    We implement reasonable technical and organizational safeguards. However, Zuryo shall not be liable for third-party breaches beyond reasonable control or force majeure events.
                </p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">6. User Rights</h4>
                <p>
                    You may request access to, correction, or deletion of your data by emailing founder@zuryo.co.
                </p>
            </section>
        </div>
    </div>
);

export const POSHPolicy: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-4xl mx-auto">
        <PageHeader title="POSH Policy" subtitle="Prevention of Sexual Harassment" />
        <div className="prose prose-sm text-gray-500 space-y-8">
            <p className="italic text-xs text-gray-400">Last Updated: 20 January 2026</p>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">1. Policy Statement</h4>
                <p>
                    Zuryo maintains a <strong>zero-tolerance policy</strong> toward sexual harassment in any form. We are committed to providing a safe, respectful, and harassment-free environment for all individuals associated with our platform.
                </p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">2. Scope</h4>
                <p>This policy applies to customers, independent trainers, and employees/contractors of Zuryo. It covers all interactions occurring during fitness sessions, or via digital platforms (WhatsApp, calls).</p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">3. What Constitutes Sexual Harassment</h4>
                <p>Sexual harassment includes, but is not limited to:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Unwelcome physical contact or advances.</li>
                    <li>Sexually colored remarks, jokes, or comments.</li>
                    <li>Inappropriate staring, gestures, or expressions.</li>
                    <li>Requests or demands for sexual favors.</li>
                    <li>Showing or sharing sexually explicit content.</li>
                </ul>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">4. Code of Conduct</h4>
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <strong className="block text-secondary mb-2">For Trainers</strong>
                        <p className="text-xs">No personal relationships, solicitation, or private communication outside the platform. No physical contact beyond professional instruction without consent.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <strong className="block text-secondary mb-2">For Customers</strong>
                        <p className="text-xs">Treat trainers with dignity. No inappropriate comments, coercion, or personal advances.</p>
                    </div>
                </div>
            </section>

            <section className="bg-red-50 p-6 rounded-xl border border-red-100">
                <h4 className="font-bold text-red-800 text-lg mb-4 flex items-center gap-2">
                    <AlertCircle size={20} /> 5. Complaint Redressal Mechanism
                </h4>
                <p className="text-sm mb-4">Any individual who experiences or witnesses sexual harassment may file a complaint. All complaints will be treated with strict confidentiality.</p>
                <div className="space-y-2 mb-4 bg-white/50 p-4 rounded-lg">
                    <p className="text-sm"><strong>Email:</strong> founder@zuryo.co</p>
                    <p className="text-sm"><strong>WhatsApp/Phone:</strong> +91-7353762555</p>
                </div>
                <p className="text-xs text-gray-600">
                    Complaints should include date/time, description, names, and evidence if available.
                </p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">6. Investigation & Action</h4>
                <p>
                    Zuryo may initiate an internal inquiry and temporarily suspend the accused. Actions based on findings may include warning, suspension, permanent removal from the platform, or reporting to legal authorities.
                </p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">7. False Complaints</h4>
                <p>
                    Malicious or intentionally false allegations may lead to appropriate action as per applicable laws and internal policies.
                </p>
            </section>

            <section>
                <h4 className="font-bold text-secondary text-lg mb-2">8. Limitation of Liability</h4>
                <p>
                    Zuryo acts as a facilitation platform. While we take reasonable steps to ensure safety, we are not liable for acts committed beyond reasonable control or incidents outside the scope of platform-facilitated services.
                </p>
            </section>
        </div>
    </div>
);