import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, MapPin, DollarSign, ArrowLeft, Building, FileText, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';


interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  salary: number;
  roleType: string;
  workMode: 'On-site' | 'Remote' | 'Hybrid';
  location: string;
  tags: string[];
}

const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  const checkApplicationStatus = useCallback(async (token: string) => {
    try {
        const res = await fetch(`${API_URL}/api/jobs/my-applications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const applications: { jobId: string }[] = await res.json();
            if (applications.some(app => app.jobId === jobId)) {
                setHasApplied(true);
            }
        }
    } catch (error) {
        console.error("Could not check application status:", error);
    }
  }, [jobId]);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) { logout(); navigate('/'); return; }

    const fetchJobDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/jobs/${jobId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setJob(await res.json());
        } else {
          navigate('/jobseeker/dashboard'); // Job not found, redirect
        }
      } catch (error) {
        console.error("Failed to fetch job details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
    checkApplicationStatus(token);
  }, [jobId, navigate, logout, checkApplicationStatus]);

  const handleApply = async () => {
    const token = localStorage.getItem('userToken');
    try {
        const res = await fetch(`${API_URL}/api/jobs/${jobId}/apply`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            setHasApplied(true); // Update UI immediately
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        alert('An error occurred while applying.');
    }
  };
  
  if (loading) {
    return <div className="text-center py-20">Loading Job Details...</div>;
  }

  if (!job) {
    return <div className="text-center py-20">Job not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
       <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/jobseeker/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Jobs</span>
          </Link>
          <div className="font-bold text-lg text-gray-800">Career Bridge</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border p-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-teal-600">{job.roleType} • {job.workMode}</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{job.title}</h1>
              <div className="flex items-center space-x-2 text-gray-600 mt-2">
                <Building size={16} />
                <span className="text-lg">{job.company}</span>
              </div>
            </div>
            <div>
              <button 
                onClick={handleApply}
                disabled={hasApplied}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {hasApplied ? <Check size={20} /> : <FileText size={20} />}
                <span>{hasApplied ? 'Applied' : 'Apply Now'}</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-b py-4">
            <div>
              <p className="text-sm text-gray-500">Salary (per year)</p>
              <p className="font-semibold text-gray-800 flex items-center space-x-1"><DollarSign size={16}/><span>₹{job.salary.toLocaleString('en-IN')}</span></p>
            </div>
             <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold text-gray-800 flex items-center space-x-1"><MapPin size={16}/><span>{job.location}</span></p>
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Job Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetails;