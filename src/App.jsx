import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getJobBySlug, selectCurrentJob, selectJobLoading, selectJobError } from './redux/jobSlice';
import JobApplicationForm from './components/JobApplicationForm';
import HeroSection from './components/HeroSection';
import SuccessScreen from './components/SuccessScreen';
import { selectSubmitStatus, selectCurrentApplication, resetSubmitStatus } from './redux/applicationSlice';

function App() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const jobResponse = useSelector(selectCurrentJob);
  const loading = useSelector(selectJobLoading);
  const error = useSelector(selectJobError);
  const submitStatus = useSelector(selectSubmitStatus);
  const submittedApplication = useSelector(selectCurrentApplication);

  // State for showing form
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

  // Extract jobListing from the API response
  const jobData = jobResponse?.jobListing || jobResponse;

  useEffect(() => {
    if (slug) {
      dispatch(getJobBySlug(slug));
    }
  }, [slug, dispatch]);

  const handleApplyClick = () => {
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle success screen redirect - redirect back to form view
  useEffect(() => {
    if (submitStatus === 'succeeded') {
      // Scroll to top to show success screen
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // After 5 seconds, reset status and keep form visible
      const timer = setTimeout(() => {
        dispatch(resetSubmitStatus());
        setShowForm(true); // Keep form visible after success
        // Scroll to form after redirect
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [submitStatus, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-pink-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-pink-50 to-white">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-600 mt-4">Error Loading Job</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-6 py-3 bg-linear-to-r from-purple-700 to-orange-400 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-pink-50 to-white">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Job Not Found</h2>
          <p className="text-gray-600 mt-2">The job listing you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // Show Success Screen after successful submission (full page)
  if (submitStatus === 'succeeded' && submittedApplication) {
    return (
      <SuccessScreen
        jobTitle={jobData.jobTitle}
        applicationId={submittedApplication._id}
        submittedAt={submittedApplication.submittedAt}
        email={submittedApplication.candidate?.email || ''}
      />
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section - Always visible */}
      <HeroSection 
        jobData={jobData}
        onApplyClick={handleApplyClick} 
      />
      
      {/* Application Form - Shows below hero section after clicking Apply */}
      {showForm && (
        <div ref={formRef} className="bg-white">
          <JobApplicationForm jobData={jobData} />
        </div>
      )}
    </div>
  );
}

export default App;
