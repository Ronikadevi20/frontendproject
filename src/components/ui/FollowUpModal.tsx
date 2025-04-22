import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "./button";
import { toast } from "sonner";
import { applicationApi } from "@/api/applicationsApi"; // Make sure this is imported

interface FollowUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
    isLoading: boolean;
    onGenerate: (input: string) => void;
    jobTitle: string;
    company: string;
    jobId: string;
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({
    isOpen,
    onClose,
    content,
    isLoading,
    onGenerate,
    jobTitle,
    company,
    jobId,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableContent, setEditableContent] = useState(content);

    useEffect(() => {

        if (isOpen) {
            setEditableContent(content);
            setIsEditing(false);
        }
    }, [isOpen, content]);

    const handleSave = async () => {
        try {
            await applicationApi.updateFollowUpDraft(jobId, editableContent);
            toast.success("Changes saved!");
        } catch (error) {
            toast.error("Failed to save changes.");
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-30">
                <Dialog.Panel className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
                    <Dialog.Title className="text-xl font-semibold mb-4">Follow-Up Email</Dialog.Title>

                    {isLoading ? (
                        <p className="text-gray-500 text-sm">Generating...</p>
                    ) : (
                        <>
                            <div className="bg-gray-100 p-4 rounded text-sm max-h-[50vh] overflow-y-auto border border-gray-300 whitespace-pre-wrap">
                                {isEditing ? (
                                    <textarea
                                        value={editableContent}
                                        onChange={(e) => setEditableContent(e.target.value)}
                                        className="w-full h-[30vh] p-2 rounded resize-none text-sm bg-white border border-gray-300"
                                    />
                                ) : (
                                    <div>{editableContent}</div> // ✅ shows updated email
                                )}
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                💡 Tip: Don’t forget to include your phone number or portfolio link if it’s not already mentioned.
                            </p>

                            <div className="flex flex-wrap justify-between items-center mt-3 gap-2">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            navigator.clipboard.writeText(editableContent);
                                            toast.success("Copied to clipboard!");
                                        }}
                                    >
                                        Copy
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const subject = `Follow-up on ${jobTitle} Position Application at ${company}`;
                                            const body = encodeURIComponent(editableContent);
                                            const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(subject)}&body=${body}`;

                                            // This one can use window.open for Gmail-specific flow
                                            window.open(gmailURL, '_blank');
                                        }}
                                    >
                                        Send via Gmail
                                    </Button>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const prompt = `Please write a polite follow-up email for the role of ${jobTitle} at ${company}`;
                                        onGenerate(prompt);
                                    }}
                                >
                                    Regenerate
                                </Button>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (isEditing) {
                                            handleSave();
                                        }
                                        setIsEditing(!isEditing);
                                    }}
                                >
                                    {isEditing ? "Save Changes" : "Edit"}
                                </Button>
                                <Button className="bg-black text-white" onClick={onClose}>
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default FollowUpModal;
