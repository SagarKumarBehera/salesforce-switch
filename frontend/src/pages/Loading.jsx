import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Loading = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
        const { job } = response.data;
        
        setStatus(job.status);
        
        if (job.status === 'Finished') {
          navigate(`/job/${jobId}`);
        } else if (job.status === 'Error') {
          setError(job.error);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [jobId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md card text-center">
        <div className="mb-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
        
        <h2 className="text-xl font-bold mb-2">Processing Metadata</h2>
        <p className="text-gray-600 mb-4">{status}</p>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md text-sm text-left">
            <p className="font-bold">Error:</p>
            <p className="whitespace-pre-wrap">{error}</p>
            <button 
              onClick={() => navigate('/login')}
              className="mt-4 w-full btn bg-red-600 text-white hover:bg-red-700"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;
