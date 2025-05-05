import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import applicationApi from '@/api/applicationsApi';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

export default function CoverLetterViewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [letter, setLetter] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editableContent, setEditableContent] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await applicationApi.getCoverLetterById(Number(id));
                console.log("📄 Loaded Cover Letter:", data);
                setLetter(data);
            } catch (err) {
                console.error('Error loading cover letter:', err);
                toast.error('Failed to load cover letter.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleCopy = async () => {
        if (letter?.generated_content) {
            await navigator.clipboard.writeText(letter.generated_content);
            toast.success('Copied to clipboard!');
        }
    };
    useEffect(() => {
        if (letter?.generated_content) {
            setEditableContent(letter.generated_content);
        }
    }, [letter]);

    const handleDownload = () => {
        const element = document.createElement("div");
        element.innerHTML = `
          <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; white-space: pre-wrap;">
            ${editableContent.replace(/\n/g, "<br/>")}
          </div>
        `;

        import("html2pdf.js").then((html2pdf) => {
            html2pdf.default()
                .from(element)
                .set({
                    margin: 0.5,
                    filename: `${letter.title || "resume"}.pdf`,
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
                })
                .save();
        });
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const result = await applicationApi.regenerateCoverLetter(Number(id), letter.job_description, letter.company);
            if (result) {
                setLetter(result);
                toast.success('Cover letter regenerated.');
            } else {
                toast.error('Regeneration returned no update.');
            }
        } catch (err) {
            console.error("Failed to regenerate:", err);
            toast.error("Regeneration failed.");
        } finally {
            setRegenerating(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await applicationApi.saveCoverLetter(Number(id), editableContent);
            if (updated) {
                toast.success('Cover letter saved!');
            } else {
                toast.error('Nothing to save.');
            }
        } catch (err) {
            console.error("Failed to save:", err);
            toast.error("Save failed.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!letter) return <div className="p-6">Cover letter not found.</div>;

    return (
        <PageContainer>
            <div className="py-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Cover Letter View
                </h1>
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
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 text-sm border border-gray-300 px-3 py-1.5 rounded-md mb-4 hover:bg-gray-100 transition"
                        onClick={() => navigate('/ai-tools/resume-builder')} // or wherever you're closing to
                    >
                        ✕ Close
                    </Button>
                </div>

                <h1 className="text-2xl font-bold flex items-center gap-2 mt-4">📄 {letter.title}</h1>
                <p className="text-muted-foreground text-sm">Created at: {new Date(letter.created_at).toLocaleString()}</p>

                <textarea
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                    className="w-full h-[500px] border rounded p-4 bg-white shadow resize-none"
                />

                <div className="flex gap-3 pt-4">
                    <Button className="bg-white text-black border border-gray-300" onClick={handleCopy}>Copy</Button>
                    <Button className="bg-white text-black border border-gray-300" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button className="bg-white text-black border border-gray-300" onClick={handleDownload}>Download PDF</Button>
                    <Button className="bg-black text-white" onClick={handleRegenerate} disabled={regenerating}>
                        {regenerating ? 'Regenerating...' : 'Regenerate'}
                    </Button>
                </div>
            </div>
        </PageContainer>
    );
}
