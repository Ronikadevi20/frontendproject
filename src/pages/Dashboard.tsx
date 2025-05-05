import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Briefcase, Key, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { authApi } from '@/api/authApi';
import { applicationApi, JobApplication } from '@/api/applicationsApi';
import passwordsApi, { PasswordEntry as ApiPasswordEntry } from '@/api/passwordApi';
import UpcomingBillsSection from '@/components/vault/UpcomingBillingTable';
import billsApi from '@/api/billsApi';
import documentsApi from '@/api/documentsApi';
import SmartReminders from '@/components/ui/SmartReminders';


interface LocalApplication {
  id: string;
  companyName: string;
  position: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  date: string;
}

interface LocalPasswordEntry {
  id: string;
  website: string;
  username: string;
  password: string;
}

interface BillEntry {
  id: string;
  name: string;
  amount: string;
  due_date: string;
  is_paid: boolean;
  payment_date?: string;
  category: string;
  notes?: string;
  website_url?: string;
  username?: string;
  password_value?: string;
}

interface JobApplicationWithDeadline extends JobApplication {
  deadline_date?: string;

}

// Decoy data for security purposes
const decoyApplications: any[] = [
  {
    id: 'decoy-1',
    company: 'Tech Innovations Inc.',
    job_title: 'Frontend Developer',
    status: 'applied',
    applied_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    deadline_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    description: 'Applied through company website',
    contact_email: 'hr@techinnovations.example',
    contact_name: 'Jane Smith'
  },
  {
    id: 'decoy-2',
    company: 'Digital Solutions Group',
    job_title: 'UX Designer',
    status: 'interviewing',
    applied_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    deadline_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (overdue)
    description: 'Phone screen scheduled for next week',
    contact_email: 'recruiting@digitalsolutions.example',
    contact_name: 'Michael Johnson'
  },
  {
    id: 'decoy-3',
    company: 'CreativeTech LLC',
    job_title: 'Product Manager',
    status: 'rejected',
    applied_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
    deadline_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    description: 'Position was filled internally',
    contact_email: 'jobs@creativetech.example',
    contact_name: 'Robert Williams'
  }
];

const decoyPasswords: any[] = [
  {
    id: 'decoy-pwd-1',
    name: 'Personal Email',
    username: 'user@example.com',
    password_value: '••••••••••••',
    website_url: 'https://mail.example.com',
    category: 'Email',
    notes: 'Personal email account'
  },
  {
    id: 'decoy-pwd-2',
    name: 'Shopping Account',
    username: 'shopper123',
    password_value: '••••••••••',
    website_url: 'https://shopping.example.com',
    category: 'Shopping',
    notes: 'Online shopping account'
  },
  {
    id: 'decoy-pwd-3',
    name: 'Social Media',
    username: 'socialuser',
    password_value: '•••••••••••',
    website_url: 'https://social.example.com',
    category: 'Social',
    notes: 'Social media login'
  }
];

const decoyBills: BillEntry[] = [
  {
    id: 'decoy-bill-1',
    name: 'Electricity Bill',
    amount: '$78.45',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    is_paid: false,
    category: 'Utilities',
    notes: 'Monthly electricity bill',
    website_url: 'https://utility.example.com',
    username: 'billpayer',
    password_value: '••••••••'
  },
  {
    id: 'decoy-bill-2',
    name: 'Internet Service',
    amount: '$65.99',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    is_paid: false,
    category: 'Utilities',
    notes: 'Monthly internet service',
    website_url: 'https://internet.example.com',
    username: 'internetuser',
    password_value: '•••••••••'
  },
  {
    id: 'decoy-bill-3',
    name: 'Credit Card Payment',
    amount: '$210.50',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    is_paid: false,
    category: 'Finance',
    notes: 'Monthly credit card minimum payment',
    website_url: 'https://bank.example.com',
    username: 'credituser',
    password_value: '••••••••••'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentApplications, setRecentApplications] = useState<JobApplicationWithDeadline[]>([]);
  const [recentPasswords, setRecentPasswords] = useState<ApiPasswordEntry[]>([]);
  const [userName, setUserName] = useState('User');
  const [isLoading, setIsLoading] = useState(true);
  const [bills, setBills] = useState<BillEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDecoyMode, setIsDecoyMode] = useState(false);
  const [weakPasswords, setWeakPasswords] = useState<ApiPasswordEntry[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [dismissedFollowUps, setDismissedFollowUps] = useState<string[]>([]);


  const isPasswordWeak = (password: string): boolean => {
    if (password.length < 8) return true;
    if (!/[A-Z]/.test(password)) return true;
    if (!/[a-z]/.test(password)) return true;
    if (!/[0-9]/.test(password)) return true;
    if (!/[^A-Za-z0-9]/.test(password)) return true;
    return false;
  };

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      if (!authApi.isAuthenticated()) {
        navigate('/login');
        return;
      }

      const storedUser = authApi.getStoredUser();
      console.log(storedUser);
      if (storedUser) {
        setUserName(storedUser.username || 'User');
      }

      // Check if this is a decoy login - directly get the value instead of using state
      const isDecoyLogin = sessionStorage.getItem("is_decoy_login") === "true";
      console.log(isDecoyLogin)
      setIsDecoyMode(isDecoyLogin);

      // If in decoy mode, load fake data and return early
      if (isDecoyLogin) {
        setRecentApplications(decoyApplications);
        setRecentPasswords(decoyPasswords);
        setBills(decoyBills);
        setIsLoading(false);
        setWeakPasswords(decoyPasswords);
        return;
      }

      try {
        // Load real data for normal mode
        const [applicationsResponse, passwordsResponse, billsRes, docsRes] = await Promise.all([
          applicationApi.list(),
          passwordsApi.list(),
          billsApi.list(),
          documentsApi.list()
        ]);

        console.log("docsResponse", docsRes)
        setRecentApplications(applicationsResponse.slice(0, 3));
        setRecentPasswords(passwordsResponse.slice(0, 3));
        setBills(billsRes as BillEntry[]);
        const weak = passwordsResponse.filter(pwd => isPasswordWeak(pwd.password_value));
        setWeakPasswords(weak.slice(0, 3));
        setDocuments(docsRes)
      } catch (error) {
        toast.error('Failed to load dashboard data');

        // If API calls fail, fall back to decoy data for additional security
        setRecentApplications(decoyApplications);
        setRecentPasswords(decoyPasswords);
        setBills(decoyBills);

      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'bg-blue-500';
      case 'interview':
      case 'interviewing': return 'bg-yellow-500';
      case 'offer': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const upcomingBills = bills.filter(bill => {
    if (bill.is_paid) return false;

    const dueDate = new Date(bill.due_date);
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    return dueDate >= today && dueDate <= sevenDaysLater;
  }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const getDueApplications = () => {
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    return recentApplications.filter(app => {
      // ⛔ Ignore irrelevant statuses
      if (!['applied', 'interview', 'interviewing'].includes(app.status.toLowerCase())) {
        return false;
      }

      // return recentApplications.filter(app => {
      //   if (!app.deadline_date) return false;
      if (!app.deadline_date) return false;

      const deadline = new Date(app.deadline_date);
      return deadline <= sevenDaysLater;
    }).sort((a, b) => {
      const dateA = new Date(a.deadline_date || '').getTime();
      const dateB = new Date(b.deadline_date || '').getTime();
      return dateA - dateB;
    });
  };

  const dueApplications = getDueApplications();
  console.log(dueApplications)

  const getExpiringDocuments = () => {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    return documents.filter(doc => {
      if (!doc.expiry_date) return false;
      const expiryDate = new Date(doc.expiry_date);
      return expiryDate >= today && expiryDate <= threeDaysLater;
    });
  };

  const expiringDocuments = getExpiringDocuments();

  // Handle secure password copy - in decoy mode, show a success message but don't actually copy
  const handlePasswordCopy = (password: string) => {
    if (isDecoyMode) {
      toast.success('Password copied to clipboard!');
      // In decoy mode, we don't actually copy anything to clipboard
    } else {
      toast.success('Password copied to clipboard!');
      navigator.clipboard.writeText(password);
    }
  };

  if (isLoading) {
    return (
        <PageContainer>
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
                <p className="ml-4 text-gray-600">Loading Dashbaord Details</p>
            </div>
        </PageContainer>
    );
}

  return (
    <PageContainer>
      <div className="app-container py-8">
        {/* Welcome Section */}
        <section className="glass-card p-8 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName}!</h1>
              <p className="text-gray-600">Track your job applications and manage your passwords securely.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate('/applications/new') }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Job Application
              </Button>
            </div>
          </div>
        </section>
        <SmartReminders
          dueApplications={dueApplications}
          expiringDocuments={expiringDocuments}
          weakPasswords={weakPasswords}
          upcomingBills={upcomingBills}
          dismissedFollowUps={dismissedFollowUps}
          onDismissFollowUp={(id) => setDismissedFollowUps(prev => [...prev, id])}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="glass-card p-6 animate-slide-in">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Job Applications</h3>
            <p className="text-3xl font-bold text-EncryptEase-600">{recentApplications.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total job applications</p>
          </div>

          <div className="glass-card p-6 animate-slide-in">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Job Interviews</h3>
            <p className="text-3xl font-bold text-EncryptEase-600">
              {recentApplications.filter(app =>
                app.status.toLowerCase() === 'interviewing' ||
                app.status.toLowerCase() === 'interview'
              ).length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Pending interviews</p>
          </div>

          <div className="glass-card p-6 animate-slide-in">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Saved Passwords</h3>
            <p className="text-3xl font-bold text-EncryptEase-600">{recentPasswords.length}</p>
            <p className="text-sm text-gray-500 mt-1">Secure credentials</p>
          </div>

          <div className="glass-card p-6 animate-slide-in">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Bills</h3>
            <p className="text-3xl font-bold text-EncryptEase-600">{bills.length}</p>
            <p className="text-sm text-gray-500 mt-1">Available Bills</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications Summary */}
          <section className="glass-card p-6 animate-slide-in col-span-1 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-EncryptEase-600" />
                Recent Applications
              </h2>
              <Button variant="ghost" onClick={() => { navigate('/applications'); sessionStorage.setItem('vaultActiveTab', 'passwords') }}>
                View All
              </Button>
            </div>

            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate(`/applications/view/${app.id}`) }}
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(app.status)} mr-4`}></div>
                      <div>
                        <h3 className="font-medium">{app.job_title}</h3>
                        <p className="text-sm text-gray-600">{app.company}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{formatDate(app.applied_date)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">You haven't added any job applications yet.</p>
                <Button onClick={() => navigate('/applications/new')}>
                  Add Your First Job Application
                </Button>
              </div>
            )}
          </section>

          {/* Password Manager Summary */}
          <section className="glass-card p-6 animate-slide-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Key className="mr-2 h-5 w-5 text-EncryptEase-600" />
                Stored Passwords
              </h2>
              <Button variant="ghost" onClick={() => { navigate('/vault'); sessionStorage.setItem('vaultActiveTab', 'passwords') }}>
                View All
              </Button>
            </div>

            {recentPasswords.length > 0 ? (
              <div className="space-y-4">
                {recentPasswords.map((pwd) => (
                  <div key={pwd.id} className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium">{pwd.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate(`/passwords/view/${pwd.id}`) }}
                      >
                        view
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">{pwd.username || 'No username'}</p>
                    {pwd.website_url && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{pwd.website_url}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">You haven't saved any passwords yet.</p>
                <Button onClick={() => navigate('/passwords/new')}>
                  Add Your First Password
                </Button>
              </div>
            )}
          </section>
        </div>

        {/* Quick Actions */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-6 justify-start hover:bg-EncryptEase-50"
              onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate('/applications/new') }}
            >
              <div className="flex flex-col items-start">
                <Briefcase className="h-6 w-6 text-EncryptEase-600 mb-2" />
                <span className="text-base font-medium">Add Job Application</span>
                <span className="text-xs text-gray-500 mt-1">Track a new job opportunity</span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 justify-start hover:bg-EncryptEase-50"
              onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate('/passwords/new') }}
            >
              <div className="flex flex-col items-start">
                <Key className="h-6 w-6 text-EncryptEase-600 mb-2" />
                <span className="text-base font-medium">Store Password</span>
                <span className="text-xs text-gray-500 mt-1">Securely save a new password</span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 justify-start hover:bg-EncryptEase-50"
              onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate('/applications') }}
            >
              <div className="flex flex-col items-start">
                <FileText className="h-6 w-6 text-EncryptEase-600 mb-2" />
                <span className="text-base font-medium">View All Applications</span>
                <span className="text-xs text-gray-500 mt-1">View saved Job Applications</span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 justify-start hover:bg-EncryptEase-50"
              onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate('/settings') }}
            >
              <div className="flex flex-col items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-EncryptEase-600 mb-2"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span className="text-base font-medium">Account Settings</span>
                <span className="text-xs text-gray-500 mt-1">Update your profile</span>
              </div>
            </Button>
          </div>
        </section>
      </div>
    </PageContainer>
  );
};

export default Dashboard;