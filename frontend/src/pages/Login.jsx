import { useState } from "react";
import { Info, ExternalLink, ToggleLeft, X } from "lucide-react";

const Login = () => {
  const [environment, setEnvironment] = useState("Production");
  const [showNotice, setShowNotice] = useState(true);
  const [showNote, setShowNote] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    window.location.href = `http://localhost:5000/api/auth/login?environment=${environment}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header Bar */}
      <header className="app-header">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 font-bold text-slate-800 tracking-tighter text-xs">
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
            sagarkumarjob1997@
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

          <p className="text-slate-500 mb-8 leading-relaxed text-sm">
            None of your organisation information or data is captured or kept
            from running this tool.
          </p>

          {isLoggingIn ? (
            <div className="mt-12 flex items-center gap-8 animate-fade-in">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-8 border-slate-100"></div>
                <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-8 border-t-brand border-r-brand/50 border-b-brand/10 border-l-transparent animate-spin"></div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl text-brand font-medium">
                  Accessing Salesforce...
                </h2>
                <p className="text-slate-500 text-sm">
                  Logging in with OAuth 2.0
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Yellow Notice Box */}
              {showNotice && (
                <div className="notice-box notice-yellow border-[#faebcc] rounded-sm flex flex-col items-center py-6">
                  <button
                    onClick={() => setShowNotice(false)}
                    className="close-btn"
                  >
                    ×
                  </button>
                  <p className="font-bold mb-4 text-center">
                    Help keep{" "}
                    <span className="text-[#8a6d3b]">Salesforce Switch</span>{" "}
                    free! Please donate to support development and Heroku
                    running costs. Any value is appreciated!
                  </p>
                  <button className="btn-donate shadow-sm">Donate</button>
                </div>
              )}

              {/* Blue Note Box */}
              {showNote && (
                <div className="notice-box notice-blue border-[#bce8f1] rounded-sm pr-10">
                  <button
                    onClick={() => setShowNote(false)}
                    className="close-btn"
                  >
                    ×
                  </button>
                  <p className="leading-relaxed">
                    <span className="font-bold">Note:</span> This application
                    uses multiple API calls to your Salesforce Org to retrieve
                    metadata and execute the logic it needs to run. Each
                    Salesforce Org has a 24 hour limit of API calls it can make,
                    and may break other integrations if you exceed this limit.
                  </p>
                </div>
              )}

              {/* Environment Selection */}
              <div className="mt-8 flex items-center gap-4">
                <label className="text-slate-400 font-medium text-sm">
                  Environment
                </label>
                <form
                  onSubmit={handleLogin}
                  className="flex items-center gap-2"
                >
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="input-field w-32"
                  >
                    <option value="Production">Production</option>
                    <option value="Sandbox">Sandbox</option>
                  </select>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 py-1.5 rounded-sm"
                  >
                    Login
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Login;
