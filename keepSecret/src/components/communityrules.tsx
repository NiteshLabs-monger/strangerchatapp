import React from 'react';
import { 
  ShieldCheck, 
  Ban, 
  UserCheck, 
  EyeOff, 
  AlertTriangle, 
  HeartHandshake,
  Flag
} from 'lucide-react';

interface RuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isWarning?: boolean;
}

const RuleCard: React.FC<RuleCardProps> = ({ icon, title, description, isWarning }) => (
  <div className="group relative bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1">
    {/* Subtle hover accent line using your oklch accent */}
    <div 
      className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ backgroundColor: 'oklch(82.8% 0.189 84.429)' }}
    />
    <div className="flex items-start gap-4">
      <div 
        className="p-3 rounded-xl flex-shrink-0"
        style={{ 
          backgroundColor: isWarning ? '#7b3306' : 'rgba(255, 255, 255, 0.05)',
          color: 'oklch(82.8% 0.189 84.429)'
        }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-neutral-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </div>
);

export const RulesSection: React.FC = () => {
  const rules = [
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Must be 18 or Older",
      description: "You must be at least 18 years old to use this platform. Minors are strictly prohibited from entering."
    },
    {
      icon: <HeartHandshake className="w-6 h-6" />,
      title: "Be Respectful",
      description: "Treat everyone with kindness. Bullying, hate speech, racism, and harassment will result in an immediate permanent ban."
    },
    {
      icon: <Ban className="w-6 h-6" />,
      title: "No Inappropriate Content",
      description: "Nudity, sexually explicit content, and violence are strictly prohibited. Automated AI filters actively monitor video feeds."
    },
    {
      icon: <EyeOff className="w-6 h-6" />,
      title: "Protect Your Privacy",
      description: "Never share sensitive personal information such as full names, financial details, phone numbers, or passwords."
    },
    {
      icon: <Ban className="w-6 h-6" />,
      title: "No Spam or Advertising",
      description: "Do not use the platform to promote products, websites, services, or send automated bot messages."
    },
    {
      icon: <Flag className="w-6 h-6" />,
      title: "Report Violations",
      description: "Encountering someone breaking the rules? Use the in-chat report button immediately so our moderators can act."
    }
  ];

  return (
    <section id="safety" className="relative bg-neutral-950 text-white py-24 px-6 overflow-hidden">
      {/* Background Decorative Glow */}
      <div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full opacity-10 blur-[150px] pointer-events-none"
        style={{ backgroundColor: 'oklch(82.8% 0.189 84.429)' }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 border border-neutral-800"
            style={{ 
              backgroundColor: 'rgba(123, 51, 6, 0.3)',
              color: 'oklch(82.8% 0.189 84.429)' 
            }}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Community Standards</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Rules of the <span style={{ color: 'oklch(82.8% 0.189 84.429)' }}>Chat</span>
          </h2>
          <p className="text-neutral-400 text-base md:text-lg">
            We aim to keep our community safe, friendly, and enjoyable for everyone. Please read and respect our platform guidelines before starting a conversation.
          </p>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {rules.map((rule, index) => (
            <RuleCard 
              key={index}
              icon={rule.icon}
              title={rule.title}
              description={rule.description}
            />
          ))}
        </div>

        {/* Zero Tolerance Warning Callout */}
        <div 
          className="rounded-3xl p-8 border border-neutral-800 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
          style={{
            background: 'linear-gradient(135deg, rgba(123, 51, 6, 0.4) 0%, rgba(23, 23, 23, 0.9) 100%)'
          }}
        >
          <div className="flex items-center gap-5">
            <div 
              className="p-4 rounded-2xl flex-shrink-0"
              style={{ backgroundColor: 'oklch(82.8% 0.189 84.429)', color: '#7b3306' }}
            >
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-1">
                Zero Tolerance Policy
              </h4>
              <p className="text-sm text-neutral-300 max-w-xl">
                Our automated AI system combined with 24/7 human moderation instantly bans IPs that violate our safety policies. Keep it clean and fun!
              </p>
            </div>
          </div>

          <a
            href="#full-terms"
            className="px-6 py-3 rounded-xl text-sm font-bold flex-shrink-0 transition-transform active:scale-95 hover:brightness-110"
            style={{ 
              backgroundColor: 'oklch(82.8% 0.189 84.429)', 
              color: '#000000' 
            }}
          >
            Read Full Terms
          </a>
        </div>
      </div>
    </section>
  );
};

export default RulesSection;