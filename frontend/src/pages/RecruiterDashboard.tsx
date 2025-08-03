import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import {
  Plus, LogOut, Building, Briefcase, Users, UserCheck, Edit, XCircle, FileSpreadsheet, Mail, Award, Download, CheckCircle, UserCheck2, Wallet, BarChart
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

// --- INTERFACES ---
interface Job {
  _id: string;
  title: string;
  description: string;
  salary: number;
  roleType: string;
  workMode: 'On-site' | 'Remote' | 'Hybrid';
  location: string;
  tags: string[];
  status: 'Active' | 'Closed';
  createdAt: string;
  applicants: number;
}
interface Application {
  _id: string;
  name: string;
  email: string;
  skills: string;
  readyToJoin: string;
  resumeUrl: string; 
  status: 'Pending' | 'Shortlisted' | 'Rejected';
  matchScore: number; 
} // <-- THIS WAS THE MISSING BRACE

interface Stats {
  totalJobs: number;
  totalApplicants: number;
  shortlisted: number;
  growth: string; 
} // <-- THIS WAS THE MISSING BRACE

// --- WEB3 CONFIGURATION ---
const ADMIN_WALLET_ADDRESS = '0x264B284C68F8D9b53Be29Fe64F6Fc76439F20AB5';
const PLATFORM_FEE_ETH = '0.001';

const RecruiterDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [stats, setStats] = useState<Stats>({ totalJobs: 0, totalApplicants: 0, shortlisted: 0, growth: '+0%' });
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobRoleType, setJobRoleType] = useState('Full-time');
  const [jobWorkMode, setJobWorkMode] = useState<'On-site' | 'Remote' | 'Hybrid'>('On-site');
  const [jobLocation, setJobLocation] = useState('');
  const [jobTags, setJobTags] = useState('');
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // --- DATA FETCHING ---
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('userToken');
    if (!token) { logout(); navigate('/'); return; }
    try {
      const [statsRes, jobsRes] = await Promise.all([
        fetch(`${API_URL}/api/recruiter/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/recruiter/jobs`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (jobsRes.ok) setMyJobs(await jobsRes.json());
    } catch (error) { console.error("Error fetching data:", error); } 
    finally { setLoading(false); }
  }, [logout, navigate]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // --- FORM LOGIC ---
  const resetForm = () => {
    setEditingJob(null); setJobTitle(''); setJobDescription('');
    setJobSalary(''); setJobRoleType('Full-time'); setJobWorkMode('On-site');
    setJobLocation(''); setJobTags('');
  };

  const handleShowEditForm = (job: Job) => {
    setEditingJob(job); setJobTitle(job.title); setJobDescription(job.description);
    setJobSalary(String(job.salary)); setJobRoleType(job.roleType); setJobWorkMode(job.workMode);
    setJobLocation(job.location); setJobTags(job.tags.join(', '));
    setShowJobForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken');
    // CORRECTED: Added API_URL to the fetch URL
    const url = editingJob ? `${API_URL}/api/jobs/${editingJob._id}` : `${API_URL}/api/jobs`;
    const method = editingJob ? 'PUT' : 'POST';
    const jobData = { title: jobTitle, description: jobDescription, salary: Number(jobSalary), roleType: jobRoleType, workMode: jobWorkMode, location: jobLocation, tags: jobTags };
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(jobData), });
      const responseData = await res.json();
      if (res.ok) { alert(`Job ${editingJob ? 'updated' : 'posted'} successfully!`); setShowJobForm(false); resetForm(); fetchDashboardData(); } else { alert(`Error: ${responseData.message}`); }
    } catch (error) { alert('An unexpected error occurred.'); }
  };
  
  // --- APPLICANT LOGIC ---
  const handleViewApplicants = async (job: Job) => {
    setSelectedJob(job); setShowApplicantsModal(true); setLoadingApplicants(true);
    const token = localStorage.getItem('userToken');
    try {
      // CORRECTED: Added API_URL to the fetch URL
      const res = await fetch(`${API_URL}/api/recruiter/jobs/${job._id}/applications`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setApplications(await res.json());
    } catch (error) { console.error("Failed to fetch applicants", error); } 
    finally { setLoadingApplicants(false); }
  };

  const handleUpdateStatus = async (applicationId: string, status: 'Shortlisted' | 'Rejected') => {
    const token = localStorage.getItem('userToken');
    try {
      // CORRECTED: Added API_URL to the fetch URL
      const res = await fetch(`${API_URL}/api/recruiter/applications/${applicationId}/status`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (res.ok) { setApplications(prev => prev.map(app => app._id === applicationId ? { ...app, status } : app)); fetchDashboardData(); } else { alert('Failed to update status.'); }
    } catch (error) { console.error("Failed to update status", error); }
  };

  const getStatusColor = (status: string) => {
    if (status === 'Shortlisted') return 'bg-green-100 text-green-800';
    if (status === 'Rejected') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  // --- PAYMENT LOGIC ---
  const handleShowCreateForm = async () => {
    if (typeof window.ethereum === 'undefined') { alert('MetaMask is not installed. Please install it to continue.'); return; }
    setIsProcessingPayment(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tx = { to: ADMIN_WALLET_ADDRESS, value: ethers.parseEther(PLATFORM_FEE_ETH) };
      alert(`To post a job, please approve the platform fee of ${PLATFORM_FEE_ETH} ETH in MetaMask.`);
      const transactionResponse = await signer.sendTransaction(tx);
      await transactionResponse.wait();
      alert('Payment successful! You can now post your job.');
      resetForm();
      setShowJobForm(true);
    } catch (error: any) {
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') { alert('Transaction rejected. Payment is required to post a job.'); } 
      else { alert('An error occurred during payment. Please check your MetaMask and try again.'); }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between"><div className="flex items-center space-x-3"><div className="w-11 h-11 rounded-lg flex items-center justify-center bg-[#6366F1] text-white"><Building className="w-6 h-6" /></div><div><h1 className="text-lg font-bold text-gray-900">Welcome, {user?.company}!</h1><p className="text-sm text-gray-500">Manage your hiring pipeline efficiently</p></div></div><div className="flex items-center space-x-4"><button onClick={handleShowCreateForm} disabled={isProcessingPayment} className="bg-[#6366F1] text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:opacity-90 text-sm disabled:bg-gray-400 disabled:cursor-wait">{isProcessingPayment ? <Wallet className="animate-ping w-5 h-5"/> : <Plus className="w-5 h-5" />}<span>{isProcessingPayment ? 'Processing...' : 'Post New Job'}</span></button><button onClick={() => { logout(); navigate('/'); }} className="text-gray-500 hover:text-gray-800 flex items-center space-x-2 text-sm"><LogOut className="w-5 h-5" /><span>Logout</span></button></div></div></header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* The Growth Card has been removed from here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-5 border flex justify-between items-center"><div ><p className="text-sm font-medium text-gray-600">Total Jobs</p><p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '-' : stats.totalJobs}</p></div><div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><Briefcase className="w-6 h-6"/></div></div>
            <div className="bg-white rounded-xl p-5 border flex justify-between items-center"><div ><p className="text-sm font-medium text-gray-600">Total Applicants</p><p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '-' : stats.totalApplicants}</p></div><div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center"><Users className="w-6 h-6"/></div></div>
            <div className="bg-white rounded-xl p-5 border flex justify-between items-center"><div ><p className="text-sm font-medium text-gray-600">Shortlisted</p><p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '-' : stats.shortlisted}</p></div><div className="w-12 h-12 bg-[#6366F1]/10 text-[#6366F1] rounded-lg flex items-center justify-center"><UserCheck className="w-6 h-6"/></div></div>
        </div>
        <div className="bg-white rounded-xl border p-6"><h2 className="text-xl font-semibold text-gray-900 mb-5">Active Job Postings</h2><div className="space-y-4">{loading ? (<p>Loading...</p>) : myJobs.length === 0 ? (<div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50"><p className="text-gray-500 font-medium">You haven't posted any jobs yet.</p><button onClick={handleShowCreateForm} disabled={isProcessingPayment} className="mt-4 bg-[#6366F1] text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 disabled:bg-gray-400"><Plus size={16} className="inline-block mr-1" />{isProcessingPayment ? 'Processing...' : 'Post Your First Job'}</button></div>) : (myJobs.map(job => (<div key={job._id} className="border rounded-lg p-4 flex justify-between items-center hover:border-[#6366F1] transition-colors"><div><p className="font-bold text-lg text-gray-800">{job.title}</p><p className="text-sm text-gray-500 mt-1">{job.applicants} applicant(s)</p></div><div className="flex items-center space-x-2"><button onClick={() => handleViewApplicants(job)} className="bg-[#6366F1] text-white px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-2 hover:opacity-90 text-sm"><FileSpreadsheet size={16}/><span>View Applicants</span></button><button onClick={() => handleShowEditForm(job)} className="p-2 rounded-md hover:bg-gray-200" title="Edit Job"><Edit size={16}/></button></div></div>)))}</div></div>
      </main>
      {showJobForm && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">{editingJob ? 'Edit Job' : 'Post New Job'}</h2><button onClick={() => {setShowJobForm(false); resetForm();}}><XCircle className="text-gray-500 hover:text-gray-800"/></button></div><form onSubmit={handleFormSubmit} className="space-y-4"><div><label className="text-sm font-medium">Job Title</label><input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required /></div><div><label className="text-sm font-medium">Description</label><textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} className="w-full mt-1 p-2 border rounded-md" rows={3} required></textarea></div><div className="grid grid-cols-2 gap-4"><div><label className="text-sm font-medium">Salary (₹/Annum)</label><input type="number" value={jobSalary} onChange={e => setJobSalary(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required /></div><div><label className="text-sm font-medium">Location</label><input type="text" value={jobLocation} onChange={e => setJobLocation(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required /></div></div><div><label className="text-sm font-medium">Role Type</label><select value={jobRoleType} onChange={e => setJobRoleType(e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-white"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></div><div><label className="text-sm font-medium">Required Skills (comma-separated)</label><input type="text" value={jobTags} onChange={e => setJobTags(e.target.value)} className="w-full mt-1 p-2 border rounded-md" placeholder="e.g. react, node.js, python" required /></div><div className="flex justify-end space-x-3 pt-4 mt-2 border-t"><button type="button" onClick={() => {setShowJobForm(false); resetForm();}} className="px-4 py-2 bg-gray-200 rounded-lg text-gray-800 font-semibold hover:bg-gray-300">Cancel</button><button type="submit" className="px-4 py-2 bg-[#6366F1] text-white rounded-lg font-semibold hover:opacity-90">{editingJob ? 'Update Job' : 'Post Job'}</button></div></form></div></div>)}
      {showApplicantsModal && selectedJob && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col"><div className="flex justify-between items-center mb-4 flex-shrink-0"><div><h2 className="text-2xl font-bold">Applicants for {selectedJob.title}</h2><p className="text-gray-500">{applications.length} application(s) found, sorted by best match</p></div><button onClick={() => setShowApplicantsModal(false)}><XCircle className="text-gray-500 hover:text-gray-800"/></button></div><div className="overflow-y-auto space-y-4 pr-2">{loadingApplicants ? <p>Loading applicants...</p> : applications.length === 0 ? <p className="text-center text-gray-500 py-10">No one has applied for this job yet.</p> : (applications.map(app => (<div key={app._id} className="border rounded-lg p-4 bg-gray-50"><div className="grid grid-cols-3 gap-4"><div className="col-span-2"> <p className="font-bold text-lg">{app.name}</p><p className="text-sm text-gray-500 flex items-center space-x-1.5 mt-1"><Mail size={14}/><span>{app.email}</span></p><div className="mt-3 space-y-2"><p className="text-sm flex items-center"><UserCheck2 size={14} className="mr-1.5 text-gray-500"/><strong>Ready to Join:</strong><span className="ml-2">{app.readyToJoin}</span></p><p className="text-sm flex items-start"><Award size={14} className="mr-1.5 mt-0.5 text-gray-500"/><strong>Submitted Skills:</strong><span className="ml-2 leading-relaxed">{app.skills}</span></p></div></div><div className="flex flex-col items-end space-y-3"><a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-200 text-gray-800 text-sm font-semibold px-4 py-1.5 rounded-lg flex items-center space-x-2 hover:bg-gray-300 w-full justify-center"><Download size={14}/><span>View Resume</span></a><div className="bg-white border rounded-lg p-2 w-full text-center"><p className="text-xs font-medium text-gray-500 flex items-center justify-center"><BarChart size={12} className="mr-1" /> SKILL MATCH</p><p className="text-2xl font-bold text-teal-600 mt-1">{app.matchScore}%</p><div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${app.matchScore}%` }}></div></div></div></div></div><div className="border-t mt-3 pt-3 flex justify-between items-center"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(app.status)}`}>{app.status}</span><div className="flex space-x-2"><button onClick={() => handleUpdateStatus(app._id, 'Rejected')} disabled={app.status === 'Rejected'} className="bg-red-100 text-red-700 font-semibold px-3 py-1.5 rounded-lg text-sm flex items-center space-x-2 hover:bg-red-200 disabled:opacity-50"><XCircle size={14}/><span>Reject</span></button><button onClick={() => handleUpdateStatus(app._id, 'Shortlisted')} disabled={app.status === 'Shortlisted'} className="bg-green-100 text-green-700 font-semibold px-3 py-1.5 rounded-lg text-sm flex items-center space-x-2 hover:bg-green-200 disabled:opacity-50"><CheckCircle size={14}/><span>Shortlist</span></button></div></div></div>)))}</div></div></div>)}
    </div>
  );
};

export default RecruiterDashboard;