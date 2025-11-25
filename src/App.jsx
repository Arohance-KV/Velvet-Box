import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getJobBySlug, selectCurrentJob, selectJobLoading, selectJobError } from './redux/jobSlice';
import JobApplicationForm from './components/JobApplicationForm';

function App() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const jobResponse = useSelector(selectCurrentJob);
  const loading = useSelector(selectJobLoading);
  const error = useSelector(selectJobError);

  // Extract jobListing from the API response
  const jobData = jobResponse?.jobListing || jobResponse;

  useEffect(() => {
    if (slug) {
      dispatch(getJobBySlug(slug));
    }
  }, [slug, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-600 mt-4">Error Loading Job</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Job Not Found</h2>
          <p className="text-gray-600 mt-2">The job listing you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return <JobApplicationForm jobData={jobData} />;
}

export default App;
