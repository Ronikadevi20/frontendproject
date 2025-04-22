import { Dialog } from '@headlessui/react';
import { useState } from 'react';


interface Props {
    isOpen: boolean;
    onClose: () => void;
    type: 'resume' | 'cover';
    onGenerate: (form: {
        title: string;
        job_title: string;
        job_description: string;
        company?: string;
    }) => void;
}

const ResumeModal = ({ isOpen, onClose, type, onGenerate }: Props) => {
    const [form, setForm] = useState({
        title: '',
        job_title: '',
        job_description: '',
        company: '',
        skills: '',
        education: '',
        experience: '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (
            !form.title ||
            (type === 'cover' && (!form.job_title || !form.job_description || !form.company))
        ) {
            alert('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            await onGenerate(form);
            onClose();
        } catch {
            alert('Generation failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            as="div"
            open={isOpen}
            onClose={onClose}
            className="fixed inset-0 z-50 overflow-y-auto"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="relative bg-white rounded-xl p-6 shadow-lg max-w-lg w-full mx-auto">
                    <Dialog.Title className="text-xl font-semibold mb-4">
                        {type === 'resume' ? 'Build Resume' : 'Build Cover Letter'}
                    </Dialog.Title>

                    <div className="space-y-4">
                        <input
                            name="title"
                            placeholder="Document Title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />

                        {type === 'cover' ? (
                            <>
                                <input
                                    name="job_title"
                                    placeholder="Job Title"
                                    value={form.job_title}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                <input
                                    name="company"
                                    placeholder="Company Name"
                                    value={form.company}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                <textarea
                                    name="job_description"
                                    placeholder="Paste Job Description"
                                    value={form.job_description}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded min-h-[100px]"
                                    required
                                />
                            </>
                        ) : (
                            <>
                                <input
                                    name="skills"
                                    placeholder="Skills (comma-separated)"
                                    value={form.skills}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                />
                                <textarea
                                    name="experience"
                                    placeholder="Experience (Role, Company, Dates, Description)"
                                    value={form.experience}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded min-h-[80px]"
                                />
                                <textarea
                                    name="education"
                                    placeholder="Education (Degree, University, Graduation Year)"
                                    value={form.education}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded min-h-[80px]"
                                />
                            </>
                        )}
                    </div>


                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {loading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default ResumeModal;