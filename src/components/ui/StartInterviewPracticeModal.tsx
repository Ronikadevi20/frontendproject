// components/ui/StartInterviewPracticeModal.tsx
import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { applicationApi } from '@/api/applicationsApi';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { toast } from 'sonner';

type InterviewType = 'phone' | 'video' | 'formal' | 'informal' | 'technical' | 'behavioral';

export default function StartInterviewPracticeModal({
    isOpen,
    onClose,
    jobId,
}: {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
}) {
    const [interviewType, setInterviewType] = useState<InterviewType | ''>('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const interviewTypes: InterviewType[] = [
        'phone',
        'video',
        'formal',
        'informal',
        'technical',
        'behavioral'
    ];

    const getTypeLabel = (type: InterviewType) => {
        const labels: Record<InterviewType, string> = {
            phone: 'Phone Interview',
            video: 'Video Interview',
            formal: 'Formal Interview',
            informal: 'Informal Chat',
            technical: 'Technical Interview',
            behavioral: 'Behavioral Interview'
        };
        return labels[type];
    };

    const startSession = async () => {
        if (!interviewType) return;
        setLoading(true);
        try {
            const res = await applicationApi.startInterviewSession(jobId, interviewType); // ✅ API Call

            if (!res?.session_id) throw new Error('Invalid server response'); // ✅ Validates response

            navigate(`/interview-practice/${jobId}/${res.session_id}`); // ✅ Navigates to session chat
            onClose(); // ✅ Closes the modal
        } catch (err) {
            console.error(err);
            toast.error("Failed to start interview session");
        } finally {
            setLoading(false); // ✅ Reset loading spinner
        }
    };


    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
                <Dialog.Panel className="bg-white rounded-lg max-w-md w-full p-6">
                    <Dialog.Title className="text-xl font-bold mb-4">
                        Start New Interview Practice
                    </Dialog.Title>

                    <div className="space-y-2 mb-6">
                        <p className="text-sm text-gray-600 mb-4">
                            Select the type of interview you want to practice:
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                            {interviewTypes.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setInterviewType(type)}
                                    className={`p-3 rounded-md border text-sm text-left transition-colors ${interviewType === type
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {getTypeLabel(type)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={startSession}
                            disabled={loading || !interviewType}
                        >
                            {loading ? 'Starting...' : 'Start Practice'}
                        </Button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}