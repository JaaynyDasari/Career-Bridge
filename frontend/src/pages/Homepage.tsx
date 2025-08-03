import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Zap, TrendingUp, ArrowRight, Briefcase, Heart, UserPlus, LogIn } from 'lucide-react';

type AuthAction = 'login' | 'signup' | null;
type UserRole = 'jobseeker' | 'recruiter';

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [authAction, setAuthAction] = useState<AuthAction>(null);
  const [userRole, setUserRole] = useState<UserRole>('jobseeker');

  const handleAuthAction = (action: AuthAction, role: UserRole) => {
    setAuthAction(action);
    setUserRole(role);
  };

  const handleLogin = async (email: string, password: string) => {
    if (await login(email, password)) {
     
      navigate(userRole === 'jobseeker' ? '/jobseeker/dashboard' : '/recruiter/dashboard');
    }
  };

  const handleSignup = async (userData: any) => {
    if (await signup(userData)) {
      navigate(userData.role === 'jobseeker' ? '/jobseeker/dashboard' : '/recruiter/dashboard');
    }
  };

  const renderAuthForm = () => {
    if (!authAction) return null;

    if (authAction === 'login') {
      return (
        <LoginForm
          type={userRole}
          onLogin={handleLogin}
          onBack={() => setAuthAction(null)}
          onSwitchToSignup={() => setAuthAction('signup')}
        />
      );
    }

    if (authAction === 'signup') {
      return (
        <SignUpForm
          type={userRole}
          onSignup={handleSignup}
          onBack={() => setAuthAction(null)}
          onSwitchToLogin={() => setAuthAction('login')}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">CareerBridge</h1>
            </div>
          </div>
        </div>
      </header>
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {authAction ? (
              renderAuthForm()
            ) : (
              <>
                <div className="space-y-6">
                  <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Bridge Your <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Career Dreams</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Connect passionate job seekers with forward-thinking recruiters.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-2xl">
                  <div className="p-6 border rounded-2xl bg-white shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">For Job Seekers</h3>
                    <p className="text-gray-600 mb-4">Find your perfect career opportunity.</p>
                    <div className="flex flex-col space-y-3">
                        <button onClick={() => handleAuthAction('signup', 'jobseeker')} className="w-full bg-teal-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-teal-600 flex items-center justify-center space-x-2"><UserPlus className="w-5 h-5" /><span>Sign Up</span></button>
                        <button onClick={() => handleAuthAction('login', 'jobseeker')} className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 flex items-center justify-center space-x-2"><LogIn className="w-5 h-5" /><span>Sign In</span></button>
                    </div>
                  </div>
                  <div className="p-6 border rounded-2xl bg-white shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">For Recruiters</h3>
                    <p className="text-gray-600 mb-4">Discover amazing talent effortlessly.</p>
                     <div className="flex flex-col space-y-3">
                        <button onClick={() => handleAuthAction('signup', 'recruiter')} className="w-full text-white py-3 px-6 rounded-xl font-semibold hover:opacity-90 flex items-center justify-center space-x-2" style={{ backgroundColor: '#736CED' }}><UserPlus className="w-5 h-5" /><span>Sign Up</span></button>
                        <button onClick={() => handleAuthAction('login', 'recruiter')} className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 flex items-center justify-center space-x-2"><LogIn className="w-5 h-5" /><span>Sign In</span></button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-teal-100 to-blue-100">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Professional diverse workspace"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-60"></div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full blur-xl opacity-40"></div>
          </div>
        </div>
      </section>
      
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose CareerBridge?</h2><p className="text-xl text-gray-600 max-w-3xl mx-auto">Bridging the gap between talent and opportunity with innovative features designed for success.</p></div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group"><div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Zap className="w-8 h-8 text-white" /></div><h3 className="text-xl font-semibold text-gray-900 mb-3">Fast hiring</h3><p className="text-gray-600">Streamlined processes to connect the right people in record time.</p></div>
            <div className="text-center group"><div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #736CED 0%, #5B54D3 100%)' }}><Heart className="w-8 h-8 text-white" /></div><h3 className="text-xl font-semibold text-gray-900 mb-3">AI Matches</h3><p className="text-gray-600">Advanced algorithms for perfect job-candidate matching.</p></div>
            <div className="text-center group"><div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><TrendingUp className="w-8 h-8 text-white" /></div><h3 className="text-xl font-semibold text-gray-900 mb-3">Career Growth</h3><p className="text-gray-600">Tools and insights to help professionals grow and companies scale.</p></div>
          </div>
        </div>
      </section>
      
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0"><div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center"><Briefcase className="w-5 h-5 text-white" /></div><span className="text-white font-semibold text-lg">CareerBridge</span></div>
            <p className="text-gray-400">© 2025 CareerBridge. Bridging careers, building futures.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- AUTH FORMS ---

interface AuthFormProps {
  type: UserRole;
  onBack: () => void;
}

interface LoginFormProps extends AuthFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ type, onLogin, onBack, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onLogin(email, password); };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border">
      <button onClick={onBack} className="text-gray-500 hover:text-gray-700 mb-4 flex items-center space-x-2"><ArrowRight className="w-4 h-4 rotate-180" /><span>Back</span></button>
      <h2 className="text-2xl font-bold mb-6">{type === 'jobseeker' ? 'Job Seeker Sign In' : 'Recruiter Sign In'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg" required /></div>
        <button type="submit" className="w-full py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: type === 'jobseeker' ? '#14B8A6' : '#736CED' }}>Sign In</button>
        <p className="text-center text-sm">Don't have an account? <button type="button" onClick={onSwitchToSignup} className="font-semibold text-teal-600 hover:underline">Sign Up</button></p>
      </form>
    </div>
  );
};

interface SignUpFormProps extends AuthFormProps {
  onSignup: (userData: any) => Promise<void>;
  onSwitchToLogin: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ type, onSignup, onBack, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState(''); // Only for recruiters

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData: any = { name, email, password, role: type };
    if (type === 'recruiter') {
      if (!company) {
        alert('Company name is required for recruiters.');
        return;
      }
      userData.company = company;
    }
    onSignup(userData);
  };
  
  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border">
      <button onClick={onBack} className="text-gray-500 hover:text-gray-700 mb-4 flex items-center space-x-2"><ArrowRight className="w-4 h-4 rotate-180" /><span>Back</span></button>
      <h2 className="text-2xl font-bold mb-6">{type === 'jobseeker' ? 'Create Job Seeker Account' : 'Create Recruiter Account'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border rounded-lg" required /></div>
        {type === 'recruiter' && (
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label><input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full px-4 py-3 border rounded-lg" required /></div>
        )}
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg" required /></div>
        <button type="submit" className="w-full py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: type === 'jobseeker' ? '#14B8A6' : '#736CED' }}>Create Account</button>
        <p className="text-center text-sm">Already have an account? <button type="button" onClick={onSwitchToLogin} className="font-semibold text-teal-600 hover:underline">Sign In</button></p>
      </form>
    </div>
  );
};

export default Homepage;