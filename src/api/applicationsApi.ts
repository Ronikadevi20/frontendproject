// applicationApi.ts
import { Message } from "react-hook-form";
import api from "./client";
import { handleApiError } from "./client";
import { toast } from 'sonner';
import axios from 'axios';

export interface ApplicationAttachment {
    id: string;
    name: string;
    file: string;
    uploaded_at: string;
}
export interface ResumeData {
    id: number;
    title: string;
    job_title: string;
    job_description: string;
    skills: string;
    experience: string;
    education: string;
    created_at: string;
    generated_content?: string;

}

export interface CoverLetterData {
    id: number;
    title: string;
    job_title: string;
    job_description: string;
    company: string;
    created_at: string;
}
type StartSessionResponse = {
    session_id: number;
};
type TranscriptionResponse = {
    transcript: string;
    error?: never; // Ensure error is not present in success case
} | {
    error: string;
    transcript?: never; // Ensure transcript is not present in error case
};
interface Session {
    id: number;
    title: string;
    interview_type: string;
    created_at: string;
}

interface MessagesResponse {
    messages: Message[];
}
type Message = {
    id: number;
    sender: 'user' | 'ai';
    content: string;
    created_at: string;  // ✅ Match Django
};

// In your applicationApi.ts
export interface JobApplication {
    id: string;
    job_title: string;
    company: string;
    location?: string;
    job_description?: string;
    application_url?: string;
    status: string;
    salary?: string;
    notes?: string;
    applied_date: string;
    deadline_date?: string;  // Make sure this is string | undefined
    updated_at: string;
    attachments: ApplicationAttachment[];
    is_prepared?: boolean;
    has_follow_up_draft: boolean;
    email_follow_up_sent?: boolean;
    email_sent_at?: string | null;
}

export interface JobApplicationCreateDTO {
    job_title: string;
    company: string;
    location?: string;
    job_description?: string;
    application_url?: string;
    status?: string;
    salary?: string;
    notes?: string;
    applied_date?: string;  // Make sure this is included
    deadline_date?: string;
    is_prepared?: boolean;  // And this too
    has_follow_up_draft?: boolean;
    email_follow_up_sent?: boolean;
    email_sent_at?: string | null;
}

export interface JobApplicationUpdateDTO extends Partial<JobApplicationCreateDTO> { }

export const applicationApi = {
    /**
     * Get all job applications for the current user
     */
    list: async (): Promise<JobApplication[]> => {
        try {
            const response = await api.get<JobApplication[]>("/api/applications/");
            if (response.error) {
                handleApiError(response.error, "Failed to fetch job applications");
                return [];
            }
            return response.data || [];
        } catch (error) {
            console.log(error)
            handleApiError(error, "Failed to fetch job applications");
            return [];
        }
    },

    /**
     * Create a new job application
     */
    create: async (data: JobApplicationCreateDTO): Promise<JobApplication | null> => {
        try {
            console.log('Creating application with data:', data);
            const response = await api.post<JobApplication>("/api/applications/", data);

            console.log('API Response:', response); // Debugging log

            if (response.error) {
                console.error('Error response:', response);
                // Handle different types of errors
                if (response.status === 400) {
                    // Handle validation errors
                    const errorMsg = response.validationErrors
                        ? Object.entries(response.validationErrors)
                            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                            .join('; ')
                        : response.error;
                    toast.error(`Validation error: ${errorMsg}`);
                } else {
                    toast.error(response.error || 'Failed to create application');
                }
                return response;
            }

            if (!response.data) {
                toast.error('Received empty response from server');
                return response;
            }

            return response.data;
        } catch (error) {
            console.error('Creation error:', error);
            const errorMsg = error instanceof Error ? error.message : 'Failed to create application';
            toast.error(errorMsg);
            return null;
        }
    },

    /**
     * Get a single job application by ID
     */
    get: async (id: string): Promise<JobApplication | null> => {
        try {
            const response = await api.get<JobApplication>(`/api/applications/${id}/`);
            if (response.error) {
                handleApiError(response.error, "Failed to fetch job application");
                return null;
            }
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to fetch job application");
            return null;
        }
    },

    /**
     * Full update of a job application using PUT
     */
    update: async (id: string, data: JobApplicationCreateDTO): Promise<JobApplication | null> => {
        try {
            const response = await api.put<JobApplication>(`/api/applications/${id}/`, data);
            if (response.error) {
                handleApiError(response.error, "Failed to update job application");
                return null;
            }
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to update job application");
            return null;
        }
    },

    /**
     * Partial update of a job application using PATCH
     */
    partialUpdate: async (id: string, data: JobApplicationUpdateDTO): Promise<JobApplication | null> => {
        try {
            const response = await api.patch<JobApplication>(`/api/applications/${id}/`, data);
            if (response.error) {
                handleApiError(response.error, "Failed to partially update job application");
                return null;
            }
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to partially update job application");
            return null;
        }
    },

    /**
     * Delete a job application
     */
    delete: async (id: string): Promise<boolean> => {
        try {
            const response = await api.delete(`/api/applications/${id}/`);
            if (response.error) {
                handleApiError(response.error, "Failed to delete job application");
                return false;
            }
            return true;
        } catch (error) {
            handleApiError(error, "Failed to delete job application");
            return false;
        }
    },

    /**
     * List attachments for a job application
     */
    listAttachments: async (applicationId: string): Promise<ApplicationAttachment[]> => {
        try {
            const response = await api.get<ApplicationAttachment[]>(`/api/applications/${applicationId}/attachments/`);
            if (response.error) {
                handleApiError(response.error, "Failed to fetch attachments");
                return [];
            }
            return response.data || [];
        } catch (error) {
            handleApiError(error, "Failed to fetch attachments");
            return [];
        }
    },

    /**
     * Create a new attachment for a job application
     */
    createAttachment: async (applicationId: string, fileData: { name: string; file: File }): Promise<ApplicationAttachment | null> => {
        try {
            const formData = new FormData();
            formData.append("name", fileData.name);
            formData.append("file", fileData.file);

            const response = await api.post<ApplicationAttachment>(
                `/api/applications/${applicationId}/attachments/`,
                formData
            );
            if (response.error) {
                handleApiError(response.error, "Failed to create attachment");
                return null;
            }
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to create attachment");
            return null;
        }
    },

    /**
     * Delete an attachment
     */
    deleteAttachment: async (applicationId: string, attachmentId: string): Promise<boolean> => {
        try {
            const response = await api.delete(`/api/applications/${applicationId}/attachments/${attachmentId}/`);
            if (response.error) {
                handleApiError(response.error, "Failed to delete attachment");
                return false;
            }
            return true;
        } catch (error) {
            handleApiError(error, "Failed to delete attachment");
            return false;
        }
    },
    generateFollowUp: async (
        applicationId: string,
        userInput: string
    ): Promise<{ email?: string; content?: string } | null> => {
        try {
            const response = await api.post<{ email?: string; content?: string }>(
                `/api/applications/${applicationId}/generate-followup/`,
                { user_input: userInput }
            );
            return response.data;
        } catch (error) {
            console.error("Failed to generate follow-up email", error);
            return null;
        }
    },
    markFollowUpDone: async (applicationId: string): Promise<boolean> => {
        try {
            const response = await api.post(`/api/applications/${applicationId}/mark-followup-done/`, {});
            if (response.error) {
                handleApiError(response.error, "Failed to mark follow-up as done");
                return false;
            }
            return true;
        } catch (error) {
            handleApiError(error, "Failed to mark follow-up as done");
            return false;
        }
    },
    getFollowUpDraft: async (applicationId: string): Promise<{ content: string }> => {
        const response = await api.get(`/api/applications/${applicationId}/followup-draft/`);
        return response.data;
    },
    updateFollowUpDraft: async (jobId: string, content: string) => {
        const res = await api.post(`/api/applications/${jobId}/save-followup-draft/`, { content });
        return res.data;
    },
    generateInterviewPrep: async (applicationId: string) => {
        const res = await api.post(`/api/applications/${applicationId}/generate-interview-prep/`);
        return res.data;
    },
    markPrepared: async (applicationId: number) => {
        const response = await api.post(`/api/applications/${applicationId}/mark-prepared/`);
        return response.data;
    },
    getInterviewPrepDraft: async (applicationId: number): Promise<{ prep_content: string }> => {
        const response = await api.get(`/api/applications/${applicationId}/interview-prep-draft/`);
        return response.data;
    },
    getNotes: async (id: number): Promise<{ content: string }> => {
        const response = await api.get(`/api/applications/${id}/notes/`);
        return response.data;
    },

    saveNotes: (id: number, content: string) => {
        return api.post(`/api/applications/${id}/notes/`, { content });
    },
    generateResume: async (data: { title: string; job_title: string; job_description: string }) => {
        const res = await api.post('/api/applications/generate-resume/', data);
        return res.data;
    },
    generateCoverLetter: async (data: { title: string; job_title: string; company: string; job_description: string }) => {
        const res = await api.post('/api/applications/generate-cover-letter/', data);
        return res.data;
    },
    regenerateResume: async (id: number, job_description: string): Promise<ResumeData> => {
        const res = await api.post(`/api/applications/${id}/regenerate-resume/`, { job_description });
        return res.data;
    },
    regenerateCoverLetter: async (id: number, job_description: string, company?: string) => {
        const res = await api.post(`/api/applications/${id}/regenerate-cover-letter/`, { job_description, company });
        return res.data;
    },
    saveResume: async (id: number, content: string) => {
        const res = await api.post(`/api/applications/${id}/save-resume/`, { generated_content: content });
        return res.data;
    },
    getResumeById: async (id: number): Promise<ResumeData> => {
        const res = await api.get(`/api/applications/${id}/get-resume/`);
        return res.data;
    },
    listResumes: async (): Promise<ResumeData[]> => {
        const res = await api.get('/api/applications/list-resumes/');
        return res.data;
    },
    listCover: async (): Promise<CoverLetterData[]> => {
        const res = await api.get('/api/applications/list-cover-letters/');
        return res.data;
    },
    deleteResume: async (id: number) => {
        const res = await api.delete(`/api/applications/${id}/delete-resume/`);
        return res.data;
    },

    deleteCoverLetter: async (id: number) => {
        const res = await api.delete(`/api/applications/${id}/delete-cover-letter/`);
        return res.data;
    },
    saveCoverLetter: async (id: number, content: string): Promise<any> => {
        const res = await api.post(`/api/applications/${id}/save-cover-letter/`, {
            generated_content: content,
        });
        return res.data;
    },
    getCoverLetterById: async (id: number): Promise<CoverLetterData> => {
        const res = await api.get(`/api/applications/${id}/get-cover-letter/`);
        return res.data;
    },
    generateCompanyInsight: async (data: { company: string, role_title: string }) => {
        const res = await api.post('/api/applications/generate-insight/', data);
        return res.data;
    },
    markFollowUpSent: async (jobId: string) => {
        const res = await api.post(`/api/applications/${jobId}/mark-followup-sent/`);
        return res.data;
    },
    markEmailSent: async (jobId: string) => {
        const res = await api.post(`/api/applications/${jobId}/mark-email-sent/`);
        return res.data;
    },

    // ✅ Start a new interview session
    startInterviewSession: async (
        jobId: string,
        interviewType: string
    ): Promise<StartSessionResponse> => {
        const res = await api.post('/api/applications/start-session/', {
            job_id: jobId,
            interview_type: interviewType,
        });
        return res.data;
    },
    // ✅ Get all sessions for a specific job
    getInterviewSessions: async (jobId: number) => {
        const res = await api.get(`/api/applications/get-sessions/${jobId}/`);
        return res.data;
    },

    // ✅ Get all messages for a session
    getInterviewMessages: async (sessionId: number): Promise<{ messages: Message[] }> => {
        const res = await api.get(`/api/applications/get-messages/${sessionId}/`);
        return res.data;
    },
    // ✅ Send a message to the AI bot and receive a response
    chatWithInterviewBot: async (data: { session_id: number; message: string }) => {
        const res = await api.post('/api/applications/chat/', data);
        return res.data;
    },

    // ✅ Save a session (placeholder for now)
    saveInterviewSession: async (sessionId: number) => {
        const res = await api.post(`/api/applications/${sessionId}/save/`);
        return res.data;
    },

    // In your API client (applicationsApi.ts)
    // applicationsApi.ts

    transcribeAudio: async (formData: FormData) => {
        try {
            const token = sessionStorage.getItem("auth_token");
            if (!token) {
                throw new Error("Authentication token missing.");
            }

            const response = await axios.post(
                '/api/applications/audio-transcribe/',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 30000,  // optional: set a timeout for slow uploads
                }
            );

            if (!response.data?.transcript) {
                throw new Error("Empty or invalid transcription response.");
            }

            return response.data;
        } catch (error: any) {
            console.error("Transcription error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.error || error.message || "Transcription failed");
        }
    },
};
export default applicationApi;