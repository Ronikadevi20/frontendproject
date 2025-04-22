import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, FileText, Users, ClipboardCheck, Glasses } from 'lucide-react';

const AITools: React.FC = () => {
    return (
        <PageContainer title="AI Tools for Job Applications">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 p-4 py-10 px-2">
                {/* Follow-Up Applications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="text-blue-500" /> Follow-Up Applications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">Generate AI-powered follow-up emails for your pending job applications.</p>
                        <Link
                            to="/ai-tools/follow-up"
                            className="inline-block bg-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:brightness-110"
                        >
                            Follow Up Now
                        </Link>
                    </CardContent>
                </Card>

                {/* Resume and Cover Letter Builder */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="text-green-500" /> Resume & Cover Letter Builder
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">Instantly create tailored resumes and cover letters based on job descriptions.</p>
                        <Link
                            to="/ai-tools/resume-builder"
                            className="inline-block bg-green-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:brightness-110"
                        >
                            Build Now
                        </Link>
                    </CardContent>
                </Card>

                {/* Recruiter Outreach Assistant */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="text-purple-500" /> Recruiter Outreach Assistant
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">Connect directly with recruiters and generate personalized outreach messages.</p>
                        <Link
                            to="/ai-tools/recruiter-outreach"
                            className="inline-block bg-purple-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:brightness-110"
                        >
                            Connect Now
                        </Link>
                    </CardContent>
                </Card>

                {/* Interview & Assessment Prep */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck className="text-orange-500" /> Interview & Assessment Prep
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">Prepare effectively for interviews and assessments with AI guidance.</p>
                        <Link
                            to="/ai-tools/interview-prep"
                            className="inline-block bg-orange-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:brightness-110"
                        >
                            Prepare Now
                        </Link>
                    </CardContent>
                </Card>

                {/* Glassdoor Insights */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Glasses className="text-teal-500" /> Glassdoor Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">View salary data, company reviews, and interview questions from Glassdoor.</p>
                        <Link
                            to="/ai-tools/glassdoor-insights"
                            className="inline-block bg-teal-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:brightness-110"
                        >
                            View Insights
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
};

export default AITools;
