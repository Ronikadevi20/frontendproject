import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardFooter } from '@/components/ui/card';
import ResumeModal from '@/components/ui/ResumeModal';
import { useNavigate } from 'react-router-dom';
import applicationApi from '@/api/applicationsApi';
import { ArrowLeft, Link, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ResumeData {
    id: number;
    title: string;
    job_title: string;
    job_description: string;
    skills: string;
    experience: string;
    education: string;
    created_at: string;
    generated_content?: string; // optional if not always needed on list view

}
interface CoverLetterData {
    id: number;
    title: string;
    job_title: string;
    job_description: string;
    company: string;
    created_at: string;
}

const ResumeBuilder = () => {
    const [resumes, setResumes] = useState<ResumeData[]>([]);
    const [coverLetters, setCoverLetters] = useState<CoverLetterData[]>([]);
    const [activeTab, setActiveTab] = useState<'resume' | 'cover'>('resume');
    const [showModal, setShowModal] = useState(false);
    const [generationType, setGenerationType] = useState<'resume' | 'cover'>('resume');
    const navigate = useNavigate();

    const handleBuildClick = (type: 'resume' | 'cover') => {
        setGenerationType(type);
        setShowModal(true);
    };

    const handleGenerate = async (form: {
        title: string;
        job_title: string;
        job_description: string;
        company?: string;
    }) => {
        try {
            if (generationType === 'resume') {
                const result = await applicationApi.generateResume({
                    title: form.title,
                    job_title: form.job_title,
                    job_description: form.job_description,
                });
                navigate(`/ai-tools/resume-builder/view/resume/${result.id}`);
            } else {
                const result = await applicationApi.generateCoverLetter({
                    title: form.title,
                    job_title: form.job_title,
                    job_description: form.job_description,
                    company: form.company || 'Unknown Company',
                });
                navigate(`/ai-tools/resume-builder/view/cover/${result.id}`);
            }
        } catch (error) {
            console.error("Generation failed:", error);
        } finally {
            setShowModal(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this resume?");
        if (!confirmDelete) return;

        try {
            await applicationApi.deleteResume(id);
            setResumes((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Failed to delete resume:", error);
        }
    };
    const handleDeleteCoverLetter = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this cover letter?")) return;
        try {
            await applicationApi.deleteCoverLetter(id);
            setCoverLetters((prev) => prev.filter((item) => item.id !== id));
            toast.success("Cover letter deleted.");
        } catch (err) {
            toast.error("Failed to delete cover letter.");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = await applicationApi.listResumes();
            const coverData = await applicationApi.listCover();
            setResumes(data);
            setCoverLetters(coverData);
        };
        fetchData();
    }, []);

    return (
        <PageContainer>
            <div className="py-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Resume and Cover Letter builder
                </h1>
                <p className="mt-2 text-lg text-gray-600 max-w-2xl">
                    Instantly craft tailored resumes and cover letters based on job roles and descriptions to stand out in applications.                </p>
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

                <Tabs defaultValue="resume" value={activeTab} onValueChange={(val) => setActiveTab(val as 'resume' | 'cover')}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="resume">Resumes</TabsTrigger>
                        <TabsTrigger value="cover">Cover Letters</TabsTrigger>
                    </TabsList>

                    <TabsContent value="resume">
                        <Button className="mb-4" onClick={() => handleBuildClick('resume')}>
                            + Build Resume
                        </Button>

                        {resumes.length === 0 ? (
                            <div className="text-center text-gray-500 mt-12">
                                <p className="text-lg font-medium">You currently have no saved Resumes.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto border rounded-lg shadow-sm">
                                <table className="min-w-full table-auto text-sm text-left">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 font-medium text-gray-700">Title</th>
                                            <th className="px-4 py-2 font-medium text-gray-700">Created</th>
                                            <th className="px-4 py-2 font-medium text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resumes.map((item) => (
                                            <tr key={item.id} className="border-t hover:bg-gray-50">
                                                <td className="px-4 py-3">{item.title}</td>
                                                <td className="px-4 py-3">{new Date(item.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/ai-tools/resume-builder/view/resume/${item.id}`)}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="text-red-500"
                                                        size="sm"
                                                        onClick={async () => {
                                                            if (window.confirm('Are you sure you want to delete this resume?')) {
                                                                await applicationApi.deleteResume(item.id);
                                                                setResumes(resumes.filter((r) => r.id !== item.id));
                                                                toast.success('Deleted!');
                                                            }
                                                        }}
                                                    >
                                                        Trash
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="cover">
                        <Button className="mb-4" onClick={() => handleBuildClick('cover')}>
                            + Build Cover Letter
                        </Button>

                        {coverLetters.length === 0 ? (
                            <div className="text-center text-gray-500 mt-12">
                                <p className="text-lg font-medium">You currently have no saved Cover Letters.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto border rounded-lg shadow-sm">
                                <table className="min-w-full table-auto text-sm text-left">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 font-medium text-gray-700">Title</th>
                                            <th className="px-4 py-2 font-medium text-gray-700">Created</th>
                                            <th className="px-4 py-2 font-medium text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coverLetters.map((item) => (
                                            <tr key={item.id} className="border-t hover:bg-gray-50">
                                                <td className="px-4 py-3">{item.title}</td>
                                                <td className="px-4 py-3">{new Date(item.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/ai-tools/resume-builder/view/cover/${item.id}`)}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="text-red-500"
                                                        size="sm"
                                                        onClick={() => handleDeleteCoverLetter(item.id)}
                                                    >
                                                        Trash
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </TabsContent>

                </Tabs>

                <ResumeModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onGenerate={handleGenerate}
                    type={generationType}
                />
            </div>
        </PageContainer>
    );
};

export default ResumeBuilder;

