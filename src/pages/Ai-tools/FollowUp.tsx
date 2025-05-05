// ✅ Cleaned up and corrected FollowUp.tsx
import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { applicationApi, JobApplication } from '@/api/applicationsApi';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FollowUpModal from '@/components/ui/FollowUpModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface JobApplicationWithDeadline extends JobApplication {
    deadline_date?: string;
    follow_up_marked_done_at?: string | null;
    generated_email?: string | null;
    marked_done?: boolean;
    marked_sent?: boolean;
}

const FollowUp = () => {
    const [followUpJobs, setFollowUpJobs] = useState<JobApplicationWithDeadline[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'sent'>('pending');
    const [generatingMap, setGeneratingMap] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // const fetchFollowUpJobs = async () => {
    //     const apps = await applicationApi.list();
    //     setFollowUpJobs(apps);
    // };
    const fetchFollowUpJobs = async () => {
        setIsLoading(true);
        try {
            const apps = await applicationApi.list();
            setFollowUpJobs(apps);
        } catch (error) {
            toast.error("Failed to load follow-up jobs");
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchFollowUpJobs();
    }, []);

    const pendingJobs = followUpJobs.filter(job =>
        job.status === 'applied' && !job.email_follow_up_sent && !job.follow_up_marked_done_at
    );
    const sentJobs = followUpJobs.filter(job =>
        job.status === 'applied' && (job.email_follow_up_sent || job.follow_up_marked_done_at)
    );

    const handleMarkDone = async (jobId: string) => {
        const res = await applicationApi.markFollowUpDone(jobId);
        if (res) {
            toast.success("Marked as done!");
            fetchFollowUpJobs();
        }
    };

    const handleMarkEmailSent = async (jobId: string) => {
        const res = await applicationApi.markEmailSent(jobId);
        if (res) {
            toast.success("Marked as sent!");
            fetchFollowUpJobs();
        }
    };

    const handleOpenDraft = async (job: JobApplicationWithDeadline) => {
        setSelectedJobId(job.id);
        setGeneratedEmail('');
        setIsModalOpen(true);
        setIsGenerating(true);
        setGeneratingMap(prev => ({ ...prev, [job.id]: true }));

        try {
            const draft = await applicationApi.getFollowUpDraft(job.id);
            if (draft?.content) {
                setGeneratedEmail(draft.content);
            } else {
                const prompt = `Please write a polite follow-up email for the role of ${job.job_title} at ${job.company}`;
                await handleGenerateEmail(job.id, prompt);
            }
        } catch {
            const prompt = `Please write a polite follow-up email for the role of ${job.job_title} at ${job.company}`;
            await handleGenerateEmail(job.id, prompt);
        } finally {
            setIsGenerating(false);
            setGeneratingMap(prev => ({ ...prev, [job.id]: false }));
        }
    };

    const handleOpenAndGenerate = async (job: JobApplicationWithDeadline) => {
        setSelectedJobId(job.id);
        setGeneratedEmail('');
        setIsModalOpen(true);
        setIsGenerating(true);
        setGeneratingMap(prev => ({ ...prev, [job.id]: true }));

        setTimeout(() => {
            const prompt = `Please write a polite follow-up email for the role of ${job.job_title} at ${job.company}`;
            handleGenerateEmail(job.id, prompt);
        }, 0);
    };
    const handleGenerateEmail = async (jobId: string, input: string) => {
        try {
            setIsGenerating(true);
            setGeneratingMap(prev => ({ ...prev, [jobId]: true }));

            const result = await applicationApi.generateFollowUp(jobId, input);
            const content = result?.email || result?.content;

            if (content) {
                setGeneratedEmail(content);
            } else {
                toast.error('No email returned.');
            }
        } catch (e) {
            console.error("❌ Error generating follow-up:", e);
            toast.error('Something went wrong while generating the email.');
        } finally {
            setIsGenerating(false);
            setGeneratingMap(prev => ({ ...prev, [jobId]: false }));
        }
    };
    const selectedJob = followUpJobs.find(job => job.id === selectedJobId);

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
                    <p className="ml-4 text-gray-600">Loading Follow-Up Applications</p>
                </div>
            </PageContainer>
        );
    }
    return (
        <PageContainer>
            <div className="py-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Follow-Up Applications
                </h1>
                <p className="mt-2 text-lg text-gray-600 max-w-2xl">
                    Still waiting to hear back? Let AI help you send the perfect follow-up and stay on top of your job hunt.
                </p>
            </div>
            <div className="py-8 px-4">
                <button
                    onClick={() => navigate('/ai-tools')}
                    className="flex items-center gap-2 text-sm border border-gray-300 px-3 py-1.5 rounded-md mb-4 hover:bg-gray-100 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to AI Tools
                </button>

                <Tabs defaultValue="pending" value={activeTab} onValueChange={(val) => setActiveTab(val as 'pending' | 'sent')}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="pending">Pending Follow-Ups</TabsTrigger>
                        <TabsTrigger value="sent">Sent Follow-Ups</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending">
                        {pendingJobs.length > 0 ? (
                            pendingJobs.map((job) => (
                                <div key={job.id} className="p-4 mb-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                                    <div className="flex justify-between mb-1">
                                        <h3 className="font-medium">{job.job_title}</h3>
                                        <span className="text-base text-gray-600 font-medium">{job.company}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">Applied on: {new Date(job.applied_date).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-600">Status: {job.status}</p>

                                    {job.has_follow_up_draft ? (
                                        <Button variant="default" className="px-4 py-2 text-sm" onClick={() => handleOpenDraft(job)}>
                                            View Draft
                                        </Button>
                                    ) : (
                                        <Button onClick={() => handleOpenAndGenerate(job)} disabled={!!generatingMap[job.id]}>
                                            {generatingMap[job.id] ? 'Generating...' : 'Generate Email'}
                                        </Button>
                                    )}

                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <Button variant="outline" className="px-4 py-2 text-sm" onClick={() => handleMarkDone(job.id)}>
                                            ✓ Done
                                        </Button>
                                        <Button variant="outline" className="px-4 py-2 text-sm" onClick={() => handleMarkEmailSent(job.id)}>
                                            Mark Email Sent
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 mt-12">
                                <p className="text-lg font-medium">No applications currently require follow-up.</p>
                                <p className="text-sm mt-2">
                                    Apply to jobs to see them here on your Follow-Up Applications dashboard.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="sent">
                        {sentJobs.length > 0 ? (
                            sentJobs.map((job) => (
                                <div key={job.id} className="p-4 mb-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                                    <div className="flex justify-between mb-1">
                                        <h3 className="font-medium">{job.job_title}</h3>
                                        <span className="text-base text-gray-600 font-medium">{job.company}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Email Sent
                                    </p>

                                    <Button variant="default" className="px-4 py-2 text-sm mt-2" onClick={() => handleOpenDraft(job)}>
                                        View Draft
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-4">No follow-up emails have been sent yet.</p>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {selectedJobId && (
                <FollowUpModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    content={generatedEmail}
                    isLoading={isGenerating}
                    onGenerate={handleGenerateEmail}
                    jobTitle={selectedJob?.job_title || ''}
                    company={selectedJob?.company || ''}
                    jobId={selectedJob?.id || ''}
                />
            )}
        </PageContainer>
    );
};

export default FollowUp;
