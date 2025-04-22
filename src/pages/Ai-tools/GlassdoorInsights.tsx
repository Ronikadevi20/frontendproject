import { useState } from 'react';
import { applicationApi, JobApplication } from '@/api/applicationsApi';
import { Button } from '@/components/ui/button';

export default function CompanyInsightPage() {
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [insight, setInsight] = useState<any | null>(null);

    const handleGenerate = async () => {
        if (!company || !role) return;
        setLoading(true);
        try {
            const result = await applicationApi.generateCompanyInsight({ company, role_title: role });
            setInsight(result);
        } catch (err) {
            console.error(err);
            alert("Failed to generate insight");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">🔍 Generate Company Insight</h1>

            <div className="grid grid-cols-1 gap-4 mb-6">
                <input
                    className="border p-2 rounded"
                    placeholder="Company name (e.g. Google)"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                />
                <input
                    className="border p-2 rounded"
                    placeholder="Role title (e.g. Software Engineer)"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                />
                <Button onClick={handleGenerate} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Insight'}
                </Button>
            </div>

            {insight && (
                <div className="bg-white border rounded-xl shadow p-6 space-y-4">
                    <h2 className="text-xl font-semibold">{insight.company} — {insight.role_title}</h2>
                    <p className="text-gray-600">💰 <strong>Salary:</strong> {insight.salary_range || "Not available"}</p>

                    <div>
                        <h3 className="font-medium text-gray-800 mb-1">🗣 Top Reviews</h3>
                        <ul className="list-disc ml-5 space-y-1">
                            {insight.top_reviews?.map((review: string, idx: number) => (
                                <li key={idx}>{review}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-800 mb-1">❓ Interview Questions</h3>
                        <ul className="list-disc ml-5 space-y-1">
                            {insight.interview_questions?.map((q: string, idx: number) => (
                                <li key={idx}>{q}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-800 mb-1">👣 Career Path</h3>
                        <ul className="list-disc ml-5 space-y-1">
                            {insight.experience_path?.map((step: string, idx: number) => (
                                <li key={idx}>{step}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}


