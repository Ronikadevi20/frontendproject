import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { applicationApi, JobApplication } from '@/api/applicationsApi';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StartInterviewPracticeModal from '@/components/ui/StartInterviewPracticeModal';


const InterviewPrep = () => {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [selected, setSelected] = useState<JobApplication | null>(null);
    const [prepContent, setPrepContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [prepCache, setPrepCache] = useState<Record<number, string>>({});
    const [practiceModalOpen, setPracticeModalOpen] = useState(false);
    const [practiceJobId, setPracticeJobId] = useState<number | null>(null);
    const [isFetching, setIsFetching] = useState(true);

    interface InterviewPrepResponse {
        prep_content: string;
        status: 'interviewing' | 'assessment';
    }
    // useEffect(() => {
    //     const fetchApps = async () => {
    //         const all = await applicationApi.list();
    //         const filtered = all.filter(app =>
    //             ['interviewing', 'assessment'].includes(app.status.toLowerCase())
    //         );
    //         setApplications(filtered);
    //     };
    //     fetchApps();
    // }, []);
    useEffect(() => {
        const fetchApps = async () => {
            setIsFetching(true);
            try {
                const all = await applicationApi.list();
                const filtered = all.filter(app =>
                    ['interviewing', 'assessment'].includes(app.status.toLowerCase())
                );
                setApplications(filtered);
            } catch (err) {
                toast.error("Failed to load applications.");
            } finally {
                setIsFetching(false);
            }
        };
        fetchApps();
    }, []);

    const [preparedIds, setPreparedIds] = useState<number[]>([]);

    const [prepStatus, setPrepStatus] = useState<'interviewing' | 'assessment' | null>(null);
    const navigate = useNavigate();
    const [userNotes, setUserNotes] = useState('');
    const saveNotes = async () => {
        if (!selected) return;

        try {
            await applicationApi.saveNotes(Number(selected.id), userNotes);
            toast.success("Notes saved!");
        } catch (error) {
            toast.error("Failed to save notes.");
            console.error(error);
        }
    };
    useEffect(() => {
        if (selected) {
            applicationApi.getNotes(Number(selected.id)).then((res: { content: string }) => {
                setUserNotes(res.content || '');
            });
        }
    }, [selected]);

    const handleGeneratePrep = async (app: JobApplication) => {
        setSelected(app);
        setPrepContent('');

        setIsLoading(true);
        try {
            const response = await applicationApi.generateInterviewPrep(app.id) as { prep_content: string; status: 'interviewing' | 'assessment' };
            setPrepContent(response.prep_content);
            setPrepStatus(response.status);
            setActiveTab(response.status === 'assessment' ? 'tips' : 'questions'); // ✅ THIS IS THE FIX
            setPrepCache(prev => ({
                ...prev,
                [app.id]: response.prep_content
            }));
        } catch (err) {
            toast.error("Failed to generate interview prep.");
        } finally {
            setIsLoading(false);
        }
    };
    const handleMarkAsPrepared = async () => {
        if (!selected) return;

        try {
            await applicationApi.markPrepared(selected.id);
            toast.success("Marked as prepared!");

            // Optional: store locally for instant UX (but not enough alone)
            setPrepCache(prev => ({ ...prev, [selected.id]: prepContent }));

            // 🔁 Refresh from backend so is_prepared becomes true
            setApplications(prev =>
                prev.map(app =>
                    app.id === selected.id
                        ? { ...app, is_prepared: true }
                        : app
                )
            );

            setSelected(null);
            setPrepContent('');
            setPrepStatus(null);
        } catch (err) {
            toast.error("Failed to mark as prepared");
        }
    };


    const sections = {
        questions: [],
        answers: [],
        tips: []
    };

    if (prepContent) {
        const lines = prepContent.split('\n').map(l => l.trim());
        let current = 'questions';
        for (const line of lines) {
            const lower = line.toLowerCase();
            if (lower.includes('suggested answer')) current = 'answers';
            else if (lower.includes('assessment tip') || lower.includes('interview tip') || lower.includes('tip')) current = 'tips';
            else sections[current].push(line);
        }
    }
    const [activeTab, setActiveTab] = useState<'questions' | 'answers' | 'tips' | 'notes'>('questions');
    if (isFetching) {
        return (
            <PageContainer>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-EncryptEase-600" />
                    <p className="ml-4 text-gray-600">Loading Interview And Assessment Preparation data</p>
                </div>
            </PageContainer>
        );
    }
    return (
        <PageContainer>
            <div className="py-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Interview And Assessment Preparation
                </h1>
                <p className="mt-2 text-lg text-gray-600 max-w-2xl">
                    Your personalized AI coach for acing Interviews and Assessments. </p>
            </div>
            <div className="py-8 px-4 space-y-4">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate('/ai-tools')}
                        className="flex items-center gap-2 text-sm border border-gray-300 px-3 py-1.5 rounded-md mb-4 hover:bg-gray-100 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to AI Tools
                    </button>
                </div>

                {!selected ? (
                    applications.length === 0 ? (
                        <div className="text-center text-gray-500 mt-12">
                            <p className="text-lg font-medium">No Interview or Assessment Applications Yet</p>
                            <p className="text-sm mt-2">
                                You haven’t saved any applications under these stages. Add some from your job portal to start prepping with AI!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map(app => {
                                const isPrepared = app.is_prepared;

                                return (
                                    <div key={app.id} className="p-4 border rounded-lg bg-white shadow-sm space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-semibold">{app.job_title}</h3>
                                            <span className="text-base text-gray-500 font-medium">{app.company}</span>
                                        </div>
                                        {app.deadline_date && (
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium capitalize">{app.status} Deadline:</span>{' '}
                                                {new Date(app.deadline_date).toLocaleDateString()}
                                            </p>
                                        )}
                                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                                            {app.is_prepared ? (
                                                <Button variant="outline" onClick={async () => {
                                                    setSelected(app);
                                                    setPrepContent(prepCache?.[app.id] || '');
                                                    setPrepStatus(app.status.toLowerCase() === 'assessment' ? 'assessment' : 'interviewing');
                                                    setActiveTab(app.status.toLowerCase() === 'assessment' ? 'tips' : 'questions');
                                                    const saved = await applicationApi.getInterviewPrepDraft(Number(app.id));
                                                    setPrepContent(saved.prep_content);
                                                }}>
                                                    Revisit Prep
                                                </Button>

                                            ) : (
                                                <Button onClick={() => handleGeneratePrep(app)}>
                                                    Prepare Now
                                                </Button>
                                            )}
                                            <Button
                                                className="bg-black text-white hover:bg-black w-full sm:w-auto"
                                                onClick={() => {
                                                    setPracticeJobId(app.id);
                                                    setPracticeModalOpen(true);
                                                }}
                                            >
                                                Practice with AI
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    <div className="py-8 px-4">
                        <div className="flex justify-between items-center mb-4">
                            <Button
                                variant="outline"
                                className="text-sm text-gray-500 hover:text-black"
                                onClick={() => {
                                    setSelected(null);
                                    setPrepContent('');
                                    setPrepStatus(null);
                                }}
                            >
                                ✕ Close
                            </Button>
                        </div>

                        <h2 className="text-xl font-semibold mb-4">
                            {prepStatus === 'assessment' ? 'Assessment Preparation' : 'Interview Preparation'} for {selected.job_title} @ {selected.company}
                        </h2>


                        {isLoading ? (
                            <p className="text-gray-500">Generating preparation content</p>
                        ) : (
                            <Tabs
                                defaultValue={prepStatus === 'assessment' ? 'tips' : 'questions'}
                                value={activeTab}
                                onValueChange={(value: string) => setActiveTab(value as 'questions' | 'answers' | 'tips' | 'notes')}
                                className="w-full mt-4"
                            >
                                {prepStatus === 'assessment' ? (
                                    <>
                                        <TabsList>
                                            <TabsTrigger value="tips">Assessment Tips</TabsTrigger>
                                            <TabsTrigger value="notes">My Notes</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="tips">
                                            {sections.tips.length > 0 ? (
                                                sections.tips.map((t, i) => (
                                                    <p key={i} className="text-sm mb-2">🔍 {t}</p>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm">No assessment tips available.</p>
                                            )}
                                        </TabsContent>
                                        <TabsContent value="notes">
                                            <textarea
                                                value={userNotes}
                                                onChange={(e) => setUserNotes(e.target.value)}
                                                placeholder="Add your custom thoughts, ideas, or prep points here..."
                                                className="w-full h-64 p-4 border rounded-md text-sm resize-y"
                                            />
                                            <Button onClick={saveNotes} className="mt-3 bg-black text-white">
                                                Save Notes
                                            </Button>
                                        </TabsContent>
                                    </>

                                ) : (
                                    <>
                                        <TabsList>
                                            <TabsTrigger value="questions">Interview Questions</TabsTrigger>
                                            <TabsTrigger value="answers">Suggested Answers</TabsTrigger>
                                            <TabsTrigger value="tips">Interview Tips</TabsTrigger>
                                            <TabsTrigger value="notes">My Notes</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="questions">
                                            {sections.questions.map((q, i) => (
                                                <p key={i} className="text-sm mb-2">• {q}</p>
                                            ))}
                                        </TabsContent>
                                        <TabsContent value="answers">
                                            {sections.answers.map((a, i) => (
                                                <p key={i} className="text-sm mb-2">💬 {a}</p>
                                            ))}
                                        </TabsContent>
                                        <TabsContent value="tips">
                                            {sections.tips.map((t, i) => (
                                                <p key={i} className="text-sm mb-2">🧠 {t}</p>
                                            ))}
                                        </TabsContent>
                                        <TabsContent value="notes">
                                            <textarea
                                                value={userNotes}
                                                onChange={(e) => setUserNotes(e.target.value)}
                                                placeholder="Add your custom thoughts, ideas, or prep points here..."
                                                className="w-full h-64 p-4 border rounded-md text-sm resize-y"
                                            />
                                            <Button onClick={saveNotes} className="mt-3 bg-black text-white">
                                                Save Notes
                                            </Button>
                                        </TabsContent>
                                    </>
                                )}
                                {activeTab !== 'notes' && (
                                    <div className="mt-4 flex gap-3">
                                        <Button
                                            onClick={() => {
                                                navigator.clipboard.writeText(prepContent);
                                                toast.success('Copied to clipboard!');
                                            }}
                                            variant="outline"
                                        >
                                            Copy All
                                        </Button>
                                        <Button
                                            onClick={() => handleGeneratePrep(selected)}
                                            variant="outline"
                                        >
                                            Regenerate
                                        </Button>
                                        <Button
                                            onClick={handleMarkAsPrepared}
                                            className="bg-black text-white"
                                        >
                                            Mark as Prepared
                                        </Button>
                                    </div>
                                )}
                            </Tabs>
                        )}
                    </div>
                )}
            </div>
            {
                practiceJobId && (
                    <StartInterviewPracticeModal
                        isOpen={practiceModalOpen}
                        onClose={() => setPracticeModalOpen(false)}
                        jobId={String(practiceJobId)}
                    />
                )
            }
        </PageContainer >
    );
};

export default InterviewPrep;
