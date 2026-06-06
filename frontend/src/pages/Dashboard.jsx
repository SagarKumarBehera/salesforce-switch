import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Check, X, AlertCircle, Info, ChevronRight, ChevronDown, 
  LogOut, RefreshCw, Search, Filter, Settings, 
  ToggleLeft, ToggleRight, Database, Code, GitMerge, FileCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Dashboard = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('validation_rule');
  const [selectedComponents, setSelectedComponents] = useState({});
  const [isDeploying, setIsDeploying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        alert('Error fetching data: ' + err.message);
      }
    };
    fetchData();
  }, [jobId]);

  const handleToggle = (componentId, currentStatus) => {
    setSelectedComponents(prev => ({
      ...prev,
      [componentId]: prev[componentId] === undefined ? !currentStatus : !prev[componentId]
    }));
  };

  const handleUpdate = async () => {
    const componentsToUpdate = Object.entries(selectedComponents).map(([id, enable]) => ({
      component_id: id,
      enable
    }));

    if (componentsToUpdate.length === 0) return;

    setIsDeploying(true);
    try {
      await axios.post(`http://localhost:5000/api/jobs/${jobId}/deploy`, {
        metadata_type: activeTab,
        components: componentsToUpdate
      });
      alert('Deployment started! Check your Salesforce org for changes.');
      setSelectedComponents({});
    } catch (err) {
      alert('Deployment failed: ' + err.message);
    } finally {
      setIsDeploying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse text-sm uppercase tracking-widest">Retrieving Metadata...</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'validation_rule', label: 'Validation Rules', count: data.data.validationRules.length, icon: FileCheck },
    { id: 'workflow_rule', label: 'Workflow Rules', count: data.data.workflowRules.length, icon: GitMerge },
    { id: 'trigger', label: 'Apex Triggers', count: data.data.triggers.length, icon: Code },
    { id: 'flow', label: 'Flows', count: data.data.flows.length, icon: RefreshCw },
  ];

  const getCurrentData = () => {
    let rawData = [];
    switch (activeTab) {
      case 'validation_rule': rawData = data.data.validationRules; break;
      case 'workflow_rule': rawData = data.data.workflowRules; break;
      case 'trigger': rawData = data.data.triggers; break;
      case 'flow': rawData = data.data.flows; break;
      default: rawData = [];
    }

    if (!searchQuery) return rawData;
    return rawData.filter(item => 
      (item.name || item.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.object_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const pendingChangesCount = Object.keys(selectedComponents).length;

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
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Org</span>
            <span className="text-xs font-bold text-slate-700 leading-none">{data.job.org_name}</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <button className="btn-donate">Donate</button>
          <a href="#" className="header-link">Source Code</a>
          <LogOut className="h-5 w-5 text-slate-800 cursor-pointer hover:text-error transition-colors" onClick={() => navigate('/login')} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Tabs */}
        <aside className="w-64 bg-[#fcfcfc] border-r border-slate-200 flex flex-col p-4 gap-1 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Metadata types</p>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedComponents({}); setSearchQuery(''); }}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-sm transition-all text-sm font-bold",
                activeTab === tab.id 
                  ? "bg-brand text-white shadow-sm" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              )}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </div>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 items-end justify-between border-b border-slate-100 pb-8">
              <div className="flex flex-col gap-4 w-full md:w-auto">
                <h2 className="text-2xl text-brand font-medium">
                  {tabs.find(t => t.id === activeTab).label}
                </h2>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search..."
                    className="input-field pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {pendingChangesCount > 0 && (
                  <span className="text-xs font-bold text-brand uppercase tracking-widest animate-pulse">
                    {pendingChangesCount} changes pending
                  </span>
                )}
                <button 
                  onClick={handleUpdate}
                  disabled={isDeploying || pendingChangesCount === 0}
                  className="btn btn-primary px-8 h-9"
                >
                  {isDeploying ? 'Deploying...' : 'Deploy Changes'}
                </button>
              </div>
            </div>

            {/* Content Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                    {activeTab !== 'trigger' && activeTab !== 'flow' && (
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Object</th>
                    )}
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {getCurrentData().map((item) => {
                    const isSelected = selectedComponents[item._id] !== undefined;
                    const nextStatus = isSelected ? selectedComponents[item._id] : item.active;
                    const isChanged = isSelected && selectedComponents[item._id] !== item.active;
                    
                    return (
                      <tr key={item._id} className={cn(
                        "transition-colors",
                        isChanged ? "bg-brand/5" : "hover:bg-slate-50"
                      )}>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">
                              {item.name || item.fullName}
                            </span>
                            {item.description && (
                              <span className="text-xs text-slate-400 line-clamp-1 italic max-w-md">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </td>
                        {activeTab !== 'trigger' && activeTab !== 'flow' && (
                          <td className="px-4 py-4">
                            <span className="text-xs text-slate-500 font-medium">{item.object_name}</span>
                          </td>
                        )}
                        <td className="px-4 py-4">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm",
                            item.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>
                            {item.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => handleToggle(item._id, item.active)}
                            className={cn(
                              "relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                              nextStatus ? "bg-brand" : "bg-slate-200"
                            )}
                          >
                            <span
                              className={cn(
                                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                                nextStatus ? "translate-x-5" : "translate-x-0"
                              )}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {getCurrentData().length === 0 && (
                <div className="p-20 text-center">
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">No components found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
