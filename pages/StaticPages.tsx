
import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageHeader: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => {
    const navigate = useNavigate();
    return (
        <div className="mb-8">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-secondary">
                <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-3xl font-extrabold text-secondary mb-2">{title}</h1>
            {subtitle && <p className="text-gray-500 font-medium">{subtitle}</p>}
        </div>
    );
};

export const About: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-3xl mx-auto">
        <PageHeader title="About Zuryo" subtitle="Fitness on your terms." />
        <div className="prose prose-blue text-gray-600 leading-relaxed">
            <p>
                Zuryo is India's first community-based On Demand Fitness platform. We connect residents with certified fitness trainers in their vicinity within 60 minutes.
            </p>
            <p className="mt-4">
                Our mission is to make fitness accessible, affordable, and flexible. No long-term contracts, no travel time - just pure fitness delivered to your doorstep.
            </p>
            <h3 className="text-secondary font-bold text-xl mt-8 mb-4">Why we exist</h3>
            <p>
                We realized that the biggest barrier to fitness is convenience. By bringing the gym to your home, we remove the friction of travel and scheduling.
            </p>
        </div>
    </div>
);

export const Contact: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-3xl mx-auto">
        <PageHeader title="Contact Us" subtitle="Contact Information" />
        <div className="prose prose-sm text-gray-600 space-y-4">
            <p>If you have any questions, concerns, or requests regarding our services, policies, payments, or data usage, please contact us using the details below.</p>
            
            <h4 className="font-bold text-secondary">Company Name:</h4>
            <p>Zuryo Technologies Private Limited</p>
            
            <h4 className="font-bold text-secondary">Registered Office:</h4>
            <p>Flat No. 2141, Tower 2, Prestige Ferns Residency, HSR Layout, Bangalore, Bangalore South, Karnataka, India, 560102</p>
            
            <h4 className="font-bold text-secondary">Email:</h4>
            <p>founder@zuryo.co</p>
            
            <h4 className="font-bold text-secondary">Phone / WhatsApp:</h4>
            <p>+91-7353762555</p>
            
            <h4 className="font-bold text-secondary">Business Hours:</h4>
            <p>Monday to Sunday – 5:00 AM to 9:00 PM IST</p>
            
            <h4 className="font-bold text-secondary">Service Communication</h4>
            <p>By contacting us via email, WhatsApp, phone call, or website forms, you consent to receive service-related communications from Zuryo Technologies Pvt. Ltd.</p>
        </div>
    </div>
);

export const Terms: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-3xl mx-auto">
        <PageHeader title="Terms and Conditions" subtitle="Last Updated: 20 January 2026" />
        <div className="prose prose-sm text-gray-600 space-y-4">
            <p>These Terms and Conditions (“Terms”) govern your access to and use of the services provided by <strong>Zuryo Technologies Private Limited</strong> (“Zuryo”, “we”, “our”, “us”).</p>
            <p>By using our website, booking a session, or making a payment, you agree to be bound by these Terms.</p>
            
            <h4 className="font-bold text-secondary">1. Nature of Services</h4>
            <p>Zuryo is a <strong>technology and service facilitation platform</strong> that connects customers with independent, verified fitness professionals for on-demand fitness sessions.</p>
            <p>Zuryo <strong>does not provide medical advice</strong>, diagnosis, or treatment.</p>
            
            <h4 className="font-bold text-secondary">2. User Eligibility</h4>
            <p>You confirm that:</p>
            <ul className="list-disc pl-5">
                <li>You are at least <strong>18 years old</strong>, or have parental/guardian consent.</li>
                <li>You are physically capable of participating in fitness activities.</li>
                <li>You have disclosed any relevant medical conditions to the trainer before the session.</li>
            </ul>
            
            <h4 className="font-bold text-secondary">3. Health & Injury Disclaimer</h4>
            <p>Fitness activities carry inherent risks.</p>
            <p>By booking a session, you acknowledge and agree that:</p>
            <ul className="list-disc pl-5">
                <li>You participate <strong>voluntarily and at your own risk</strong></li>
                <li>Zuryo <strong>is not responsible for injuries, accidents, health complications, or losses</strong> occurring before, during, or after a session</li>
                <li>You are solely responsible for determining your fitness and medical readiness</li>
            </ul>
            <p>Zuryo shall not be liable for any <strong>direct, indirect, incidental, or consequential damages</strong> arising from participation in fitness activities.</p>
            
            <h4 className="font-bold text-secondary">4. Trainer Conduct & POSH Policy</h4>
            <p>Zuryo follows a <strong>zero-tolerance policy</strong> toward:</p>
            <ul className="list-disc pl-5">
                <li>Sexual harassment</li>
                <li>Verbal or physical abuse</li>
                <li>Discrimination of any kind</li>
            </ul>
            <p>All trainers are required to maintain professional behavior.</p>
            <p>If you experience inappropriate conduct, report it immediately to <strong>founder@zuryo.co</strong>.</p>
            <p>Zuryo reserves the right to <strong>suspend or permanently ban</strong> any user or trainer found violating conduct standards.</p>
            
            <h4 className="font-bold text-secondary">5. Payments</h4>
            <ul className="list-disc pl-5">
                <li>All payments are processed securely via <strong>Razorpay</strong></li>
                <li>Prices are clearly displayed before payment</li>
                <li>Zuryo does not store your card or UPI details</li>
            </ul>
            
            <h4 className="font-bold text-secondary">6. Platform Limitation of Liability</h4>
            <p>Zuryo acts solely as a <strong>facilitator</strong> and is not liable for:</p>
            <ul className="list-disc pl-5">
                <li>Actions or omissions of independent trainers</li>
                <li>Service quality beyond reasonable facilitation</li>
                <li>Delays due to force majeure events</li>
            </ul>
            
            <h4 className="font-bold text-secondary">7. Termination</h4>
            <p>We reserve the right to suspend or terminate access to our services without notice if:</p>
            <ul className="list-disc pl-5">
                <li>These Terms are violated</li>
                <li>Fraudulent or abusive activity is detected</li>
            </ul>
            
            <h4 className="font-bold text-secondary">8. Governing Law</h4>
            <p>These Terms are governed by the laws of <strong>Bengaluru, India</strong>, and courts in <strong>India</strong> shall have exclusive jurisdiction</p>
        </div>
    </div>
);

export const Policies: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-3xl mx-auto">
        <PageHeader title="Privacy Policy" subtitle="Last Updated: 20 January 2026" />
        <div className="prose prose-sm text-gray-600 space-y-4">
            <p>Zuryo Technologies Pvt. Ltd. is committed to protecting your privacy and personal data.</p>
            
            <h4 className="font-bold text-secondary">1. Information We Collect</h4>
            <p>We may collect:</p>
            <ul className="list-disc pl-5">
                <li>Name, phone number, email</li>
                <li>Address/location details for service delivery</li>
                <li>Payment confirmation (not payment credentials)</li>
                <li>Fitness Assessment details, session history and feedback</li>
            </ul>
            
            <h4 className="font-bold text-secondary">2. Data Confidentiality</h4>
            <ul className="list-disc pl-5">
                <li>Your personal data is <strong>confidential</strong></li>
                <li>We do <strong>not sell, rent, or trade</strong> your data</li>
                <li>Data is shared <strong>only with assigned trainers</strong> strictly for service execution</li>
            </ul>
            
            <h4 className="font-bold text-secondary">3. Payment Security</h4>
            <p>Payments are handled entirely by <strong>Razorpay</strong>.</p>
            <p>Zuryo <strong>does not store</strong>:</p>
            <ul className="list-disc pl-5">
                <li>Card numbers</li>
                <li>CVV</li>
                <li>UPI PINs</li>
            </ul>
            
            <h4 className="font-bold text-secondary">4. Data Usage</h4>
            <p>Your data may be used to:</p>
            <ul className="list-disc pl-5">
                <li>Provide and improve services</li>
                <li>Communicate session updates</li>
                <li>Ensure safety and compliance</li>
            </ul>
            
            <h4 className="font-bold text-secondary">5. Data Protection Measures</h4>
            <p>We implement reasonable technical and organizational safeguards to protect your data from unauthorized access.</p>
            
            <h4 className="font-bold text-secondary">6. Limitation of Liability</h4>
            <p>While we take data protection seriously, Zuryo shall not be liable for:</p>
            <ul className="list-disc pl-5">
                <li>Third-party breaches beyond reasonable control</li>
                <li>Force majeure or cyber incidents despite safeguards</li>
            </ul>
            
            <h4 className="font-bold text-secondary">7. User Rights</h4>
            <p>You may request:</p>
            <ul className="list-disc pl-5">
                <li>Access to your data</li>
                <li>Correction or deletion of your data</li>
            </ul>
            <p>by emailing <strong>founder@zuryo.co</strong></p>
            
            <h4 className="font-bold text-secondary">8. Policy Updates</h4>
            <p>This policy may be updated periodically. Continued use of our services implies acceptance of the revised policy.</p>
        </div>
    </div>
);

export const RefundPolicy: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-3xl mx-auto">
        <PageHeader title="Cancellation and Refund Policy" subtitle="Last Updated: 20 January 2026" />
        <div className="prose prose-sm text-gray-600 space-y-4">
            <p>This policy outlines the cancellation and refund rules for services booked through Zuryo Technologies Pvt. Ltd.</p>
            
            <h4 className="font-bold text-secondary">1. Session Cancellations</h4>
            <ul className="list-disc pl-5">
                <li>Cancellations <strong>more than 4 hours before the session</strong> may be eligible for rescheduling (subject to availability)</li>
                <li>Cancellations <strong>within 4 hours of the session</strong> are <strong>non-refundable</strong></li>
            </ul>
            
            <h4 className="font-bold text-secondary">2. No-Show Policy</h4>
            <p>If the customer:</p>
            <ul className="list-disc pl-5">
                <li>Is unavailable at the scheduled time</li>
                <li>Denies access to the trainer</li>
                <li>Fails to respond</li>
            </ul>
            <p>The session will be marked as <strong>completed</strong>, and <strong>no refund will be issued</strong>.</p>
            
            <h4 className="font-bold text-secondary">3. Trainer No-Show</h4>
            <p>If a trainer fails to arrive:</p>
            <ul className="list-disc pl-5">
                <li>The session will be <strong>rescheduled or refunded</strong> at Zuryo’s discretion</li>
            </ul>
            
            <h4 className="font-bold text-secondary">4. Refund Processing</h4>
            <ul className="list-disc pl-5">
                <li>Approved refunds are processed within <strong>5–7 business days</strong></li>
                <li>Refunds are credited back to the original payment method via Razorpay</li>
            </ul>
            
            <h4 className="font-bold text-secondary">5. Non-Refundable Scenarios</h4>
            <p>No refunds will be provided for:</p>
            <ul className="list-disc pl-5">
                <li>Completed sessions</li>
                <li>User dissatisfaction unrelated to service delivery</li>
                <li>Health issues arising during or after the session</li>
            </ul>
        </div>
    </div>
);

export const POSHPolicy: React.FC = () => (
    <div className="pt-8 md:pt-4 px-6 pb-20 max-w-3xl mx-auto">
        <PageHeader title="Prevention of Sexual Harassment (POSH) Policy" subtitle="Last Updated: 20 January 2026" />
        <div className="prose prose-sm text-gray-600 space-y-4">
            <h4 className="font-bold text-secondary">1. Policy Statement</h4>
            <p><strong>Zuryo Technologies Private Limited</strong> (“Zuryo”, “we”, “our”, “us”) is committed to providing a <strong>safe, respectful, and harassment-free environment</strong> for all individuals associated with our platform, including customers, fitness professionals (trainers), employees, contractors, and partners.</p>
            <p>This policy is framed in accordance with the <strong>Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013</strong> (“POSH Act”).</p>
            <p>Zuryo maintains a <strong>zero-tolerance policy</strong> toward sexual harassment in any form.</p>
            
            <h4 className="font-bold text-secondary">2. Scope of the Policy</h4>
            <p>This policy applies to:</p>
            <ul className="list-disc pl-5">
                <li>Customers booking fitness sessions via Zuryo</li>
                <li>Independent fitness trainers associated with Zuryo</li>
                <li>Employees, interns, consultants, and contractors of Zuryo</li>
                <li>All interactions occurring:
                    <ul className="list-circle pl-5">
                        <li>During fitness sessions</li>
                        <li>Through phone calls, WhatsApp, messages, or emails</li>
                        <li>At apartment communities, gyms, or fitness areas</li>
                        <li>On digital platforms operated by Zuryo</li>
                    </ul>
                </li>
            </ul>
            
            <h4 className="font-bold text-secondary">3. What Constitutes Sexual Harassment</h4>
            <p>Sexual harassment includes, but is not limited to:</p>
            <ul className="list-disc pl-5">
                <li>Unwelcome physical contact or advances</li>
                <li>Sexually colored remarks, jokes, or comments</li>
                <li>Inappropriate staring, gestures, or expressions</li>
                <li>Requests or demands for sexual favors</li>
                <li>Showing or sharing sexually explicit content</li>
                <li>Any behavior that creates an <strong>intimidating, hostile, or offensive environment</strong></li>
            </ul>
            <p>Harassment may occur <strong>regardless of gender</strong>, and complaints may be raised by or against <strong>any party</strong>.</p>
            
            <h4 className="font-bold text-secondary">4. Expected Code of Conduct</h4>
            <p className="text-secondary font-semibold">For Trainers</p>
            <ul className="list-disc pl-5">
                <li>Maintain professional behavior at all times</li>
                <li>No personal or inappropriate conversations</li>
                <li>No physical contact beyond professional fitness instruction and only with explicit consent</li>
                <li>No solicitation, personal relationships, or private communication outside the platform</li>
            </ul>
            <p className="text-secondary font-semibold">For Customers</p>
            <ul className="list-disc pl-5">
                <li>Treat trainers with dignity and respect</li>
                <li>No inappropriate comments, gestures, or behavior</li>
                <li>No coercion, threats, or personal advances</li>
            </ul>
            
            <h4 className="font-bold text-secondary">5. Complaint Redressal Mechanism</h4>
            <p>Any individual who experiences or witnesses sexual harassment may file a complaint by contacting:</p>
            <p><strong>Email:</strong> founder@zuryo.co<br/><strong>WhatsApp / Phone:</strong> +91-7353762555</p>
            <p>Complaints should ideally include:</p>
            <ul className="list-disc pl-5">
                <li>Date and time of incident</li>
                <li>Description of the incident</li>
                <li>Names of involved parties (if known)</li>
                <li>Any supporting evidence (messages, screenshots, etc.)</li>
            </ul>
            <p>All complaints will be:</p>
            <ul className="list-disc pl-5">
                <li>Treated with <strong>strict confidentiality</strong></li>
                <li>Reviewed promptly and fairly</li>
                <li>Handled without retaliation</li>
            </ul>
            
            <h4 className="font-bold text-secondary">6. Investigation & Action</h4>
            <p>Upon receiving a complaint:</p>
            <ul className="list-disc pl-5">
                <li>Zuryo may initiate an internal review or inquiry</li>
                <li>Temporary suspension of the accused may be applied if required</li>
                <li>Based on findings, Zuryo may take actions including:
                    <ul className="list-circle pl-5">
                        <li>Warning</li>
                        <li>Suspension</li>
                        <li>Permanent removal from the platform</li>
                        <li>Reporting to appropriate legal authorities (if applicable)</li>
                    </ul>
                </li>
            </ul>
            
            <h4 className="font-bold text-secondary">7. Confidentiality</h4>
            <p>All information related to complaints, investigations, and outcomes shall be kept <strong>strictly confidential</strong>, except where disclosure is required by law.</p>
            <p>Breach of confidentiality may result in disciplinary action.</p>
            
            <h4 className="font-bold text-secondary">8. False or Malicious Complaints</h4>
            <p>While Zuryo encourages genuine complaints, <strong>malicious or intentionally false allegations</strong> may lead to appropriate action as per applicable laws and internal policies.</p>
            
            <h4 className="font-bold text-secondary">9. Limitation of Liability</h4>
            <p>Zuryo acts as a <strong>facilitation platform</strong>.</p>
            <p>While Zuryo takes reasonable steps to ensure safety and compliance, it shall not be held liable for:</p>
            <ul className="list-disc pl-5">
                <li>Acts committed beyond reasonable control</li>
                <li>Incidents occurring outside the scope of platform-facilitated services</li>
            </ul>
            
            <h4 className="font-bold text-secondary">10. Policy Review</h4>
            <p>This policy may be updated periodically to remain compliant with applicable laws. Continued use of Zuryo’s services constitutes acceptance of this policy.</p>
        </div>
    </div>
);
