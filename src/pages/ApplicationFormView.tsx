import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';
import applicationApi from '@/api/applicationsApi';
import { formatISO, parseISO } from 'date-fns';

const ApplicationView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isFetching, setIsFetching] = useState(false);
    const [applicationData, setApplicationData] = useState({
        job_title: '',
        company: '',
        status: 'applied',
        applied_date: formatISO(new Date(), { representation: 'date' }),
        deadline_date: '',
        notes: '',
        application_url: '',
        location: '',
        salary: '',
        job_description: '',
    });

    useEffect(() => {
        const checkAuth = () => {
            if (sessionStorage.getItem('isAuthenticated') !== 'true') {
                navigate('/login');
                return false;
            }
            return true;
        };

        const loadApplication = async () => {
            if (!id || !checkAuth()) return;

            setIsFetching(true);
            try {
                const application = await applicationApi.get(id);
                if (application) {
                    setApplicationData({
                        job_title: application.job_title,
                        company: application.company,
                        status: application.status,
                        applied_date: formatISO(parseISO(application.applied_date), { representation: 'date' }),
                        deadline_date: application.deadline_date ? formatISO(parseISO(application.deadline_date), { representation: 'date' }) : '',
                        notes: application.notes || '',
                        application_url: application.application_url || '',
                        location: application.location || '',
                        salary: application.salary || '',
                        job_description: application.job_description || '',
                    });
                }
            } catch (error) {
                toast.error('Failed to load application');
                navigate('/applications', { replace: true });
            } finally {
                setIsFetching(false);
            }
        };

        loadApplication();
    }, [id, navigate]);

    if (isFetching) {
        return (
            <PageContainer>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-EncryptEase-600"></div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="app-container py-8">
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Job Application Details
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Viewing details of your job application
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/applications')}
                        >
                            ← Back to Applications
                        </Button>
                    </div>
                </div>


                <div className="glass-card p-6 md:p-8 animate-fade-in">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Company Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Name
                                </label>
                                <div className="form-input-disabled">
                                    {applicationData.company}
                                </div>
                            </div>

                            {/* Job Title Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Position Title
                                </label>
                                <div className="form-input-disabled">
                                    {applicationData.job_title}
                                </div>
                            </div>

                            {/* Status Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Application Status
                                </label>
                                <div className="form-input-disabled capitalize">
                                    {applicationData.status}
                                </div>
                            </div>

                            {/* Application Date Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Application Date
                                </label>
                                <div className="form-input-disabled">
                                    {applicationData.applied_date}
                                </div>
                            </div>

                            {/* Deadline Date Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Deadline Date
                                </label>
                                <div className="form-input-disabled">
                                    {applicationData.deadline_date || 'N/A'}
                                </div>
                            </div>

                            {/* Application URL Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Job Posting URL
                                </label>
                                <div className="form-input-disabled break-all">
                                    {applicationData.application_url || 'N/A'}
                                </div>
                            </div>

                            {/* Location Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                <div className="form-input-disabled">
                                    {applicationData.location || 'N/A'}
                                </div>
                            </div>

                            {/* Salary Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Salary
                                </label>
                                <div className="form-input-disabled">
                                    {applicationData.salary || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Job Description Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Job Description
                            </label>
                            <div className="form-input-disabled whitespace-pre-wrap min-h-[100px]">
                                {applicationData.job_description || 'No description provided'}
                            </div>
                        </div>

                        {/* Notes Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <div className="form-input-disabled whitespace-pre-wrap min-h-[100px]">
                                {applicationData.notes || 'No notes available'}
                            </div>
                        </div>

                        {/* Back Button */}
                        <div className="flex justify-end pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/applications')}
                            >
                                Back to Applications
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default ApplicationView;