import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, Search, FileText, User, Heart, Star, LogOut, Clock, MapPin, Users,
  BrainCircuit, CheckCircle, DollarSign, Check
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

// --- INTERFACES (Unchanged) ---
interface Job {
  _id: string; title: string; company: string; location: string; roleType: string;
  createdAt: string; applicants: number; tags: string[]; salary: number;
}
interface Application {
  id: string; jobId: string; jobTitle: string; company: string; status: 'Pending' | 'Shortlisted' | 'Rejected';
}
interface UserProfile {
  name: string; email: string; age: number; education: string; skills: string[]; resumeUrl: string;
}

// --- Typing Effect Hook (Unchanged) ---
const useTypingEffect = (texts: string[], typingSpeed = 100, deletingSpeed = 50, delay = 2000) => {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    const handleTyping = () => {
      const currentText = texts[index];
      if (isDeleting) { setText(currentText.substring(0, text.length - 1)); } 
      else { setText(currentText.substring(0, text.length + 1)); }
      if (!isDeleting && text === currentText) { setTimeout(() => setIsDeleting(true), delay); } 
      else if (isDeleting && text === '') {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % texts.length);
      }
    };
    const timeout = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, texts, typingSpeed, deletingSpeed, delay]);
  return text;
};

// --- HELPER FUNCTION (Moved outside for stability) ---
const timeAgo = (dateString: string) => {
    const minutes = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return new Date(dateString).toLocaleDateString();
};

// --- PROPS FOR THE STANDALONE JobCard COMPONENT ---
interface JobCardProps {
  job: Job;
  appliedJobIds: Set<string>;
  onApplyClick: (job: Job) => void;
}

// ==================================================================
// --- THE JobCard COMPONENT (Moved Outside for button functionality) ---
// ==================================================================
const JobCard: React.FC<JobCardProps> = ({ job, appliedJobIds, onApplyClick }) => (
    <div key={job._id} className="border border-gray-200 bg-white rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-gray-700 text-xl">
          {job.company.charAt(0)}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-center">
            <Link to={`/job/${job._id}`} className="hover:underline">
                <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>
            </Link>
            <p className="text-xs text-gray-500 flex items-center"><Clock size={12} className="mr-1.5"/>{timeAgo(job.createdAt)}</p>
          </div>
          <p className="text-gray-600 font-medium">{job.company}</p>
          
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mt-2">
            <span className="flex items-center"><MapPin size={14} className="mr-1.5"/>{job.location}</span>
            <span className="flex items-center"><Briefcase size={14} className="mr-1.5"/>{job.roleType}</span>
            <span className="flex items-center">₹ {job.salary ? job.salary.toLocaleString('en-IN') : 'N/A'} / Year</span>
            <span className="flex items-center"><Users size={14} className="mr-1.5"/>{job.applicants} applicants</span>
          </div>

          {job.tags && job.tags.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-3">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-teal-50 text-teal-800 font-semibold px-3 py-1 rounded-full">{job.tags.join(', ')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button 
          onClick={() => onApplyClick(job)}
          disabled={appliedJobIds.has(job._id)} 
          className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 ${
            appliedJobIds.has(job._id) 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-[#6366F1] text-white hover:bg-[#5153c2]'
          }`}
        >
          {appliedJobIds.has(job._id) ? <><CheckCircle size={16}/> Applied</> : 'Apply Now'}
        </button>
      </div>
    </div>
  );


const JobSeekerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('find-jobs');
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [jobToApply, setJobToApply] = useState<Job | null>(null);
  const [formName, setFormName] = useState(user?.name || '');
  const [formEmail, setFormEmail] = useState(user?.email || '');
  const [formSkills, setFormSkills] = useState('');
  const [formReadyToJoin, setFormReadyToJoin] = useState('Yes');
  const [formResumeFile, setFormResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editProfile, setEditProfile] = useState<Partial<UserProfile & { skills: string }>>({});
  const [filters, setFilters] = useState({ role: '', location: '', type: 'All' });

  const fetchData = useCallback(async (tab: string, currentFilters: typeof filters) => {
    setLoading(true);
    const token = localStorage.getItem("userToken");
    if(!token){ logout(); navigate("/"); return; }
    try{
      const authHeader = { Authorization: `Bearer ${token}` };
      if("find-jobs" === tab) {
        const queryParams = new URLSearchParams(currentFilters).toString();
        const [jobsRes, appsRes] = await Promise.all([
          fetch(`${API_URL}/api/jobs?${queryParams}`, { headers: authHeader }), // <-- CORRECTED
          fetch(`${API_URL}/api/jobs/my-applications`, { headers: authHeader }) // <-- CORRECTED
        ]);
        if(jobsRes.ok) setJobs(await jobsRes.json());
        if(appsRes.ok) {
          const myApps:Application[] = await appsRes.json();
          setAppliedJobIds(new Set(myApps.map(app => app.jobId)));
        }
      } else if("applications" === tab) {
        const res = await fetch(`${API_URL}/api/jobs/my-applications`, { headers: authHeader }); // <-- CORRECTED
        if(res.ok) setApplications(await res.json());
      } else if("profile" === tab) {
        const res = await fetch(`${API_URL}/api/users/profile`, { headers: authHeader }); // <-- CORRECTED
        if(res.ok) {
          const data = await res.json();
          setProfile(data);
          setEditProfile({ ...data, skills: (data.skills || []).join(", ") });
        }
      } else if("ai-matches" === tab) {
        const [recoRes, appsRes] = await Promise.all([
          fetch(`${API_URL}/api/jobs/recommended`, { headers: authHeader }), // <-- CORRECTED
          fetch(`${API_URL}/api/jobs/my-applications`, { headers: authHeader }) // <-- CORRECTED
        ]);
        if(recoRes.ok) setRecommendedJobs(await recoRes.json());
        if(appsRes.ok) {
          const myApps:Application[] = await appsRes.json();
          setAppliedJobIds(new Set(myApps.map(app => app.jobId)));
        }
      }
    } catch(error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);
  
  useEffect(() => {
    if (activeTab === 'find-jobs') {
      setLoading(true);
      const timerId = setTimeout(() => {
        fetchData(activeTab, filters);
      }, 500);
      return () => clearTimeout(timerId);
    } else {
      fetchData(activeTab, filters);
    }
  }, [activeTab, filters, fetchData]);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobToApply || !formResumeFile || !user) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', formName);
    formData.append('email', formEmail);
    formData.append('skills', formSkills);
    formData.append('readyToJoin', formReadyToJoin);
    formData.append('resume', formResumeFile);
    const token = localStorage.getItem('userToken');
    try {
      const headers = new Headers();
      if(token) headers.append('Authorization', `Bearer ${token}`);
      // The error in your code was here: `queryParams` is not defined in this scope.
      // The correct URL is the one that points to the specific job ID for applying.
      const res = await fetch(`${API_URL}/api/jobs/${jobToApply._id}/apply`, { method: 'POST', headers, body: formData }); // <-- CORRECTED
      const data = await res.json();
      if (res.ok) {
        alert('Application submitted!');
        setShowApplyForm(false);
        fetchData(activeTab, filters);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('userToken');
    const formData = new FormData();
    if(editProfile.name) formData.append('name', editProfile.name);
    if(editProfile.age) formData.append('age', String(editProfile.age));
    if(editProfile.education) formData.append('education', editProfile.education);
    if(editProfile.skills) formData.append('skills', Array.isArray(editProfile.skills) ? editProfile.skills.join(', ') : editProfile.skills);
    if(formResumeFile) formData.append('resume', formResumeFile);
    try {
        const headers = new Headers();
        if(token) headers.append('Authorization', `Bearer ${token}`);
        const res = await fetch(`${API_URL}/api/users/profile`, { method: 'PUT', headers, body: formData }); // <-- CORRECTED
        if(res.ok){
            alert('Profile updated successfully!');
            fetchData('profile', filters);
        } else {
            alert('Failed to update profile.');
        }
    } catch (error) {
        alert('An error occurred while updating profile.');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const motivationalTexts = useTypingEffect([ "Your next chapter starts now.", "Let's find your dream job.", "Opportunity is just a click away." ]);

  return (
    <div className="min-h-screen bg-[#111827] text-gray-300">
      <header className="border-b border-gray-700 bg-[#1F2937]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#6366F1] text-white shadow-md shadow-black/20">
              <Briefcase size={24}/>
            </div>
            <div>
              <h1 className="font-bold text-gray-100 text-lg">Welcome back, {user?.name}!</h1>
              <p className="text-sm text-gray-400 h-5">
                {motivationalTexts}
                <span className="inline-block border-r-2 border-gray-400 h-4 w-px translate-y-0.5 animate-pulse ml-1"></span>
              </p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="text-gray-400 hover:text-white flex items-center space-x-2 text-sm font-medium"><LogOut size={16}/><span>Logout</span></button>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-8 py-8 grid grid-cols-12 gap-8">
        <aside className="col-span-3">
          <div className="rounded-xl border border-gray-700 bg-[#1F2937] p-2 space-y-1 shadow-sm">
            {['find-jobs', 'applications', 'profile', 'ai-matches'].map(tab => {
              const icons = {'find-jobs': Search, 'applications': FileText, 'profile': User, 'ai-matches': Heart}; 
              const labels = {'find-jobs': 'Find Jobs', 'applications': 'My Applications', 'profile': 'My Profile', 'ai-matches': "Jobs You'll Love"};
              const Icon = icons[tab as keyof typeof icons]; 
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} 
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-semibold transition-colors duration-200 ${
                    activeTab === tab 
                      ? 'bg-[#6366F1] text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{labels[tab as keyof typeof labels]}</span>
                </button>
              )
            })}
          </div>
          
          <div className="rounded-xl border border-gray-700 p-5 mt-6 bg-[#1F2937] shadow-sm">
            <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-3 text-lg">
              <BrainCircuit className="w-7 h-7 text-[#6366F1]" />
              AI Assistance
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2"><Check size={16} className="text-green-500"/> Match Score Analysis</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-green-500"/> Personalized Recommendations</li>
            </ul>
            <button className="w-full mt-5 bg-gray-700/50 text-gray-200 font-semibold py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Run Analysis
            </button>
          </div>
        </aside>

        <main className="col-span-9">
          {activeTab === 'find-jobs' && (
            <div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Role or Title</label>
                            <input type="text" name="role" value={filters.role} onChange={handleFilterChange} placeholder="e.g., Frontend Developer" className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Location</label>
                            <input type="text" name="location" value={filters.location} onChange={handleFilterChange} placeholder="e.g., Remote" className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Job Type</label>
                            <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]">
                                <option>All</option> <option>Full-time</option> <option>Part-time</option> <option>Contract</option> <option>Internship</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    {loading ? <p className="text-center text-gray-400">Loading jobs...</p> : jobs.length > 0 ? jobs.map(job => (
                        <JobCard 
                            key={job._id}
                            job={job}
                            appliedJobIds={appliedJobIds}
                            onApplyClick={(selectedJob) => {
                                setJobToApply(selectedJob);
                                setShowApplyForm(true);
                            }}
                        />
                    )) : <div className="rounded-xl border border-gray-700 p-5 text-center"><p className="text-gray-400">No jobs match your filters. Try adjusting your search.</p></div>}
                </div>
            </div>
          )}
           {activeTab === 'applications' && (<div className="rounded-xl bg-[#1F2937] border border-gray-700 shadow-sm p-5"><h2 className="text-2xl font-bold text-gray-100 mb-4">My Applications</h2>{loading ? <p>Loading...</p> : applications.length === 0 ? <p className="text-gray-400">You have not applied to any jobs yet.</p> : <div className="divide-y divide-gray-700">{applications.map(app => (<div key={app.id} className="py-3 flex justify-between items-center"><p className="font-bold text-gray-200">{app.jobTitle} <span className="font-normal text-gray-400">at {app.company}</span></p><span className={`text-xs font-medium px-2 py-1 rounded-full ${app.status === 'Shortlisted' ? 'bg-green-900/50 text-green-300' : app.status === 'Rejected' ? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'}`}>{app.status}</span></div>))}</div>}</div>)}
           {activeTab === 'profile' && (<div className="rounded-xl bg-[#1F2937] border border-gray-700 shadow-sm p-5"><h2 className="text-2xl font-bold text-gray-100 mb-4">My Profile</h2>{loading ? <p>Loading...</p> : (<form onSubmit={handleProfileUpdate} className="space-y-4 text-gray-300"><div className="grid grid-cols-2 gap-4"><div><label className="text-sm font-medium">Full Name</label><input type="text" value={editProfile.name || ''} onChange={e => setEditProfile({...editProfile, name: e.target.value})} className="w-full mt-1 p-2 border border-gray-600 rounded-md bg-gray-800"/></div><div><label className="text-sm font-medium">Age</label><input type="number" value={editProfile.age || ''} onChange={e => setEditProfile({...editProfile, age: Number(e.target.value)})} className="w-full mt-1 p-2 border border-gray-600 rounded-md bg-gray-800"/></div></div><div><label className="text-sm font-medium">Education</label><input type="text" value={editProfile.education || ''} onChange={e => setEditProfile({...editProfile, education: e.target.value})} className="w-full mt-1 p-2 border border-gray-600 rounded-md bg-gray-800"/></div><div><label className="text-sm font-medium">Skills (comma-separated)</label><input type="text" value={editProfile.skills || ''} onChange={e => setEditProfile({...editProfile, skills: e.target.value})} className="w-full mt-1 p-2 border border-gray-600 rounded-md bg-gray-800"/></div><div><label className="text-sm font-medium">Update Resume</label>{profile.resumeUrl && <p className="text-xs text-gray-500">Current: <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-[#6366F1] hover:underline">View Uploaded Resume</a></p>}<input type="file" accept=".pdf,.doc,.docx" onChange={e => setFormResumeFile(e.target.files ? e.target.files[0] : null)} className="w-full mt-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600" /></div><div className="flex justify-end pt-2"><button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[#6366F1] text-white rounded-lg font-semibold disabled:bg-gray-500 hover:bg-[#5356e8]">{isSubmitting ? 'Saving...' : 'Save Changes'}</button></div></form>)}</div>)}
           {activeTab === 'ai-matches' && (<div className="space-y-4"><h2 className="text-2xl font-bold text-gray-100 mb-0">Jobs You'll Love ❤️</h2>{loading ? <p>Finding matches...</p> : recommendedJobs.length > 0 ? recommendedJobs.map(job => (<JobCard key={job._id} job={job} appliedJobIds={appliedJobIds} onApplyClick={(selectedJob) => { setJobToApply(selectedJob); setShowApplyForm(true);}} />)) : <div className="rounded-xl border p-5 text-center"><p className="text-gray-400">Update your skills in the Profile tab to get personalized recommendations!</p></div>}</div>)}
        </main>
      </div>
      {showApplyForm && jobToApply && (<div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50"><div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-lg text-gray-200"><h2 className="text-xl font-bold mb-4">Apply to {jobToApply.title}</h2><form onSubmit={handleApplyFormSubmit} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="text-sm font-medium">Full Name</label><input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full mt-1 p-2 border border-gray-600 rounded-md bg-gray-700" required /></div><div><label className="text-sm font-medium">Email</label><input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full mt-1 p-2 border border-gray-600 rounded-md bg-gray-700" required /></div></div><div><label className="text-sm font-medium">Your Top Skills (comma-separated)</label><input type="text" value={formSkills} onChange={e => setFormSkills(e.target.value)} className="w-full mt-1 p-2 border border-gray-600 rounded-md bg-gray-700" placeholder="e.g. JavaScript, Python, SQL" required /></div><div><label className="text-sm font-medium">Ready to join immediately?</label><select value={formReadyToJoin} onChange={e => setFormReadyToJoin(e.target.value)} className="w-full mt-1 p-2 border border-gray-600 rounded-md bg-gray-700"><option>Yes</option><option>No</option></select></div><div><label className="text-sm font-medium">Upload Resume (PDF/DOC)</label><input type="file" accept=".pdf,.doc,.docx" onChange={e => setFormResumeFile(e.target.files ? e.target.files[0] : null)} className="w-full mt-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500" required /></div><div className="flex justify-end space-x-3 pt-4 border-t border-gray-700"><button type="button" onClick={() => setShowApplyForm(false)} className="px-4 py-2 bg-gray-600 rounded-lg font-semibold hover:bg-gray-500">Cancel</button><button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#6366F1] text-white rounded-lg font-semibold disabled:bg-gray-500 hover:bg-[#5356e8]">{isSubmitting ? 'Submitting...' : 'Submit Application'}</button></div></form></div></div>)}
    </div>
  );
};

export default JobSeekerDashboard;