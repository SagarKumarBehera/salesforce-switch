import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Info, ToggleLeft, LogOut } from "lucide-react";
import axios from "axios";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = {
      access_token: searchParams.get("access_token"),
      instance_url: searchParams.get("instance_url"),
      org_id: searchParams.get("org_id"),
      org_name: searchParams.get("org_name"),
      username: searchParams.get("username"),
      environment: searchParams.get("environment"),
    };

    if (userData.access_token) {
      login(userData);
    } else if (!user) {
      navigate("/login?error=Authentication failed");
    }
  }, [searchParams, login, navigate, user]);

  const handleGetMetadata = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/jobs/metadata",
        user
      );
      navigate(`/loading/${response.data.jobId}`);
    } catch (err) {
      alert("Error starting job: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sf_user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header Bar */}
      <header className="app-header">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 font-bold text-slate-800 tracking-tighter text-xs cursor-pointer" onClick={() => navigate('/login')}>
            <ToggleLeft className="h-4 w-4 text-brand" />
            <div className="flex flex-col leading-none">
              <span>CONFIG</span>
              <span>SWITCH</span>
            </div>
          </div>
          <span className="text-slate-400 font-medium">Salesforce Toolkit</span>
        </div>

        <div className="flex items-center gap-6">
          <button className="btn-donate">Donate</button>
          <a href="#" className="header-link">
            Source Code
          </a>
          <a href="#" className="header-link">
            {user.username}
          </a>
          <Info className="h-5 w-5 text-slate-800 cursor-pointer" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-20 px-4">
        <div className="max-w-3xl w-full animate-fade-in">
          <h1 className="text-3xl text-brand mb-4 font-medium">
            Salesforce Switch
          </h1>

          <p className="text-slate-500 mb-2 leading-relaxed text-sm">
            This tool provides an interface to easily enable and disable
            components in your Salesforce Org - Workflows, Triggers and
            Validation Rules. Very useful when doing data migrations and needing
            to disable certain automation.
          </p>

          <p className="text-slate-500 mb-12 leading-relaxed text-sm">
            None of your organisation information or data is captured or kept
            from running this tool.
          </p>

          <div className="flex flex-col gap-1 mb-8">
            <h2 className="text-xl text-brand font-medium mb-2 italic">
              Logged in as:
            </h2>
            <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
              <span className="font-bold text-slate-600">Username:</span>
              <span className="text-slate-500">{user.username}</span>
              <span className="font-bold text-slate-600">Organisation:</span>
              <span className="text-slate-500">{user.org_name}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleLogout} className="btn btn-primary px-6">
              LOGOUT
            </button>
            <button onClick={handleGetMetadata} className="btn btn-primary px-6">
              GET METADATA
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OAuthCallback;
