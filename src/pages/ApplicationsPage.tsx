import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Trash2, Edit, ArrowUpDown, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import applicationApi, { JobApplication } from '@/api/applicationsApi';

type Status = 'applied' | 'interviewing' | 'rejected' | 'offered' | 'accepted' | 'declined';

interface Application extends JobApplication {
  status: Status;
}

// Dummy data for decoy mode
const dummyApplications: Application[] = [
  {
    id: 'd1',
    company: 'TechCorp Inc.',
    job_title: 'Senior Frontend Developer',
    status: 'interviewing',
    applied_date: '2025-03-15',
    job_description: 'Leading frontend development team',
    job_url: 'https://example.com/job1',
    notes: 'Second interview scheduled',
    salary: '$120,000 - $140,000',
    location: 'San Francisco, CA',
    contact_name: 'Jane Smith',
    contact_email: 'jane.smith@techcorp.com',
  },
  {
    id: 'd2',
    company: 'StartupHub',
    job_title: 'Full Stack Engineer',
    status: 'applied',
    applied_date: '2025-04-01',
    job_description: 'Building new features for growing startup',
    job_url: 'https://example.com/job2',
    notes: 'Applied through referral',
    salary: '$100,000 - $130,000',
    location: 'Remote',
    contact_name: 'Alex Johnson',
    contact_email: 'alex@startuphub.com',
  },
  {
    id: 'd3',
    company: 'Enterprise Solutions',
    job_title: 'React Developer',
    status: 'rejected',
    applied_date: '2025-03-20',
    job_description: 'Maintaining large-scale React applications',
    job_url: 'https://example.com/job3',
    notes: 'Received rejection email',
    salary: '$95,000 - $115,000',
    location: 'Chicago, IL',
    contact_name: 'Michael Brown',
    contact_email: 'mbrown@enterprise.com',
  },
  {
    id: 'd4',
    company: 'InnovateTech',
    job_title: 'UI/UX Developer',
    status: 'offered',
    applied_date: '2025-03-05',
    job_description: 'Creating delightful user experiences',
    job_url: 'https://example.com/job4',
    notes: 'Verbal offer made, waiting for written offer',
    salary: '$110,000 - $125,000',
    location: 'Austin, TX',
    contact_name: 'Sarah Davis',
    contact_email: 'sarah@innovatetech.com',
  }
];

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'company' | 'job_title' | 'status' | 'applied_date'>('applied_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDecoyMode, setIsDecoyMode] = useState(false);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check for decoy mode
    const isDecoyLogin = sessionStorage.getItem('is_decoy_login') === 'true';
    setIsDecoyMode(isDecoyLogin);

    const loadApplications = async () => {
      if (isDecoyLogin) {
        // Load dummy data in decoy mode
        setApplications(dummyApplications);
      } else {
        // Load real data in regular mode
        const data = await applicationApi.list();
        setApplications(data as Application[]);
      }
    };

    loadApplications();
  }, [navigate]);

  const handleSort = (field: 'company' | 'job_title' | 'status' | 'applied_date') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDelete = (app: Application) => {
    setSelectedApp(app);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedApp) return;

    try {
      if (isDecoyMode) {
        // Handle delete in decoy mode (just update the UI)
        setApplications(applications.filter(app => app.id !== selectedApp.id));
        toast.success('Application moved to trash.');
      } else {
        // Handle delete in regular mode
        const success = await applicationApi.delete(selectedApp.id);
        if (success) {
          const updatedApplications = await applicationApi.list();
          setApplications(updatedApplications as Application[]);
          toast.success('Application moved to trash.');
        }
      }
    } catch (error) {
      toast.error('Failed to delete application');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'applied': return 'bg-blue-500';
      case 'interviewing': return 'bg-yellow-500';
      case 'offered': return 'bg-green-500';
      case 'accepted': return 'bg-green-600';
      case 'rejected': return 'bg-red-500';
      case 'declined': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredAndSortedApplications = applications
    .filter(app =>
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'applied_date') {
        return sortDirection === 'asc'
          ? new Date(a.applied_date).getTime() - new Date(b.applied_date).getTime()
          : new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime();
      } else {
        const aValue = a[sortField].toString().toLowerCase();
        const bValue = b[sortField].toString().toLowerCase();

        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });

  // Handle navigation to maintain decoy mode
  const handleAddApplication = () => {
    if (sessionStorage.getItem('decoy_mode') === 'true') return
    navigate('/applications/new');
  };

  const handleViewApplication = (appId: string) => {
    navigate(`/applications/view/${appId}`);
  };

  const handleEditApplication = (appId: string) => {
    navigate(`/applications/edit/${appId}`);
  };

  return (
    <PageContainer>
      <div className="app-container py-8">
        {/* Header Section with Add Application Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
            <p className="text-gray-600 mt-1">Track and manage your job applications</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search applications..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => { sessionStorage.getItem('decoy_mode') !== 'true' && setSearchQuery(e.target.value) }}
              />
            </div>
            <div className="flex items-center space-x-4">
              {/* trash button */}
              <Button variant="outline" onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate('/trash') }}>
                <Trash2 className="mr-2 h-4 w-4" />
                Trash
              </Button>

              <Button onClick={handleAddApplication} className="whitespace-nowrap">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Job Application
              </Button>
            </div>
          </div>
        </div>

        {/* Applications table */}
        <div className="overflow-x-auto glass-card animate-slide-in">
          {applications.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('company')}
                      className="flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Company</span>
                      {sortField === 'company' && (
                        <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('job_title')}
                      className="flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Position</span>
                      {sortField === 'job_title' && (
                        <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Status</span>
                      {sortField === 'status' && (
                        <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('applied_date')}
                      className="flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Date</span>
                      {sortField === 'applied_date' && (
                        <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{app.company}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{app.job_title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(app.status)} mr-2`}></div>
                        <span className="capitalize">{app.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">{formatDate(app.applied_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && handleViewApplication(app.id) }}
                        >
                          <Eye size={16} color='blue' />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && handleEditApplication(app.id) }}
                        >
                          <Edit size={16} />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && handleDelete(app) }}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="mt-4 text-lg text-gray-600">No applications found</p>
              <p className="text-gray-500 mb-4">Start tracking your job applications</p>
              <Button onClick={handleAddApplication}>
                Add Your First Job Application
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move to Trash</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to move the application for{' '}
              <span className="font-medium">{selectedApp?.job_title}</span> at{' '}
              <span className="font-medium">{selectedApp?.company}</span> to trash?
            </p>
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Move to Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default ApplicationsPage;