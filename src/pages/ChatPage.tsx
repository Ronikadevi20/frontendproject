// pages/interview-practice/[jobId]/[sessionId].tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationApi } from '@/api/applicationsApi';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { toast } from 'sonner';
import { Mic, Send, Copy, RefreshCw, Save, ChevronLeft, X } from 'lucide-react';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

type Message = {
    id: number;
    sender: 'user' | 'ai';
    content: string;
    created_at: string;  // ✅ Match Django
};


type Session = {
    id: number;
    title: string;
    interview_type: string;
    created_at: string;
};

export default function InterviewPracticePage() {
    const { jobId, sessionId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [sessions, setSessions] = useState<Session[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    // Fetch sessions and messages
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const sessionsRes = await applicationApi.getInterviewSessions(Number(jobId));
                setSessions(sessionsRes as Session[]);
                if (sessionId) {
                    const messagesRes = await applicationApi.getInterviewMessages(Number(sessionId));
                    setMessages(messagesRes.messages || []);
                }
            } catch (err) {
                toast.error("Failed to load data");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [jobId, sessionId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !sessionId) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            content: input,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await applicationApi.chatWithInterviewBot({
                session_id: Number(sessionId),
                message: input,
            });

            const aiMessage: Message = {
                id: Date.now().toString(),
                sender: 'ai',
                content: res.reply,
                createdAt: new Date().toISOString(),
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            toast.error("Failed to get response");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    type TranscriptionResponse = {
        transcript: string;
    };

    const transcribeAudio = async (formData: FormData): Promise<{ transcript: string }> => {
        try {
            const response = await fetch('/api/applications/audio-transcribe/', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Provide more specific error messages based on the status code
                if (response.status === 400) {
                    throw new Error('Bad Request: Please check your audio file.');
                } else if (response.status === 500) {
                    throw new Error('Server Error: Please try again later.');
                } else {
                    throw new Error(errorData.error || 'Transcription failed');
                }
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('API request failed:', error);
            throw error; // Rethrow for further handling
        }
    };
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000
                }
            });

            let supportedMimeType = '';

            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                supportedMimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                supportedMimeType = 'audio/webm';
            } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
                supportedMimeType = 'audio/ogg;codecs=opus';
            } else {
                toast.error('Your browser does not support audio recording.');
                return;
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: supportedMimeType,
                audioBitsPerSecond: 128000,
            });


            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                try {
                    stream.getTracks().forEach(track => track.stop());

                    const audioBlob = new Blob(audioChunksRef.current, {
                        type: 'audio/webm;codecs=opus'
                    });

                    if (audioBlob.size > 10 * 1024 * 1024) {
                        toast.error("Recording too large (max 10MB)");
                        return;
                    }

                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'recording.webm');

                    // Use the API client directly
                    const response = await applicationApi.transcribeAudio(formData);

                    if (!response || typeof response !== 'object') {
                        throw new Error('Invalid response format');
                    }

                    if ('error' in response) {
                        throw new Error(response.error || 'Transcription failed');
                    }

                    if (!response.transcript) {
                        throw new Error('Empty transcription result');
                    }

                    setInput(response.transcript);

                } catch (err) {
                    console.error('Transcription error:', err);
                    toast.error(err.message || "Transcription failed. Please try again.");
                } finally {
                    setIsRecording(false);
                }
            };

            mediaRecorder.start(1000);
            setIsRecording(true);

        } catch (err) {
            console.error('Recording setup error:', err);
            if (err.name === 'NotAllowedError') {
                toast.error("Microphone access denied");
            } else {
                toast.error("Failed to start recording");
            }
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
    };



    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const regenerateResponse = async () => {
        if (messages.length === 0) return;

        const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
        if (!lastUserMessage) return;

        setIsLoading(true);
        try {
            const res = await applicationApi.chatWithInterviewBot({
                session_id: Number(sessionId),
                message: lastUserMessage.content,
            });

            const aiMessage: Message = {
                id: Date.now().toString(),
                sender: 'ai',
                content: res.reply,
                createdAt: new Date().toISOString(),
            };

            setMessages(prev => [...prev.filter(m => m.sender !== 'ai' || m.id !== messages[messages.length - 1].id), aiMessage]);
        } catch (err) {
            toast.error("Failed to regenerate response");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSession = async () => {
        if (!sessionId) return;
        try {
            await applicationApi.saveInterviewSession(Number(sessionId));
            toast.success("Session saved successfully");
        } catch (err) {
            toast.error("Failed to save session");
            console.error(err);
        }
    };

    const loadSession = async (id: number) => {
        navigate(`/interview-practice/${jobId}/${id}`);
    };

    return (
        <PageContainer>
            <div className="flex h-[calc(100vh-64px)] bg-gray-50">
                {/* Sidebar */}
                <div className="w-64 bg-white border-r p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Interview Sessions</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/ai-tools/interview-prep')}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {sessions.length > 0 ? (
                            sessions.map((session) => (
                                <button
                                    key={session.id}
                                    onClick={() => loadSession(session.id)}
                                    className={`w-full text-left p-3 rounded-md mb-2 text-sm ${Number(sessionId) === session.id
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="font-medium">{session.title}</div>
                                    <div className="text-xs text-gray-500 capitalize">{session.interview_type}</div>
                                </button>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 py-4 text-center">No sessions found</p>
                        )}
                    </div>
                </div>

                {/* Main Chat */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="bg-white border-b p-4 flex justify-between items-center">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/ai-tools')}
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to AI Tools
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={saveSession}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Session
                            </Button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-white">
                        {messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center max-w-md">
                                    <h3 className="text-lg font-medium mb-2">Start your interview practice</h3>
                                    <p className="text-gray-500 text-sm">
                                        The AI will simulate a real interview based on your selected type.
                                        Answer questions and receive feedback to improve your skills.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-3xl rounded-lg px-4 py-3 ${message.sender === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            <div className="whitespace-pre-wrap">{message.content}</div>
                                            {message.sender === 'ai' && (
                                                <div className="flex justify-end mt-2 gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 hover:bg-gray-200"
                                                        onClick={() => copyToClipboard(message.content)}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-3xl">
                                            <div className="flex space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="bg-white border-t p-4">
                        <form onSubmit={handleSubmit} className="relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={3}
                                className="w-full p-3 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                placeholder="Type your answer..."
                                disabled={isLoading}
                            />
                            <div className="absolute right-3 bottom-3 flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={isRecording ? stopRecording : startRecording}
                                    disabled={isLoading}
                                >
                                    {isRecording ? (
                                        <span className="text-green-600 font-bold text-xl">✅</span>
                                    ) : (
                                        <Mic className="h-4 w-4" />
                                    )}
                                </Button>

                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    aria-label="Send message"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </form>
                        {isRecording && (
                            <div className="text-sm text-center text-blue-600 mt-2 animate-pulse">
                                🎙️ Recording… Click ✅ to stop
                            </div>
                        )}
                        {messages.length > 0 && messages[messages.length - 1].sender === 'ai' && (
                            <div className="flex justify-center mt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={regenerateResponse}
                                    disabled={isLoading}
                                >
                                    <RefreshCw className="h-3 w-3 mr-2" />
                                    Regenerate response
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}