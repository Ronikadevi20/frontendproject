import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FileText, Calendar, Download, ArrowLeft } from "lucide-react";
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { documentsApi, DocumentEntry } from "@/api/documentsApi";
import { formatDistanceToNow, isValid, parseISO } from "date-fns";

const DocumentView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentDocument, setCurrentDocument] = useState<DocumentEntry | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDocument = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                const doc = await documentsApi.get(id);
                if (doc) {
                    setCurrentDocument(doc);
                } else {
                    throw new Error("Document not found");
                }
            } catch (error) {
                toast({
                    title: "Failed to load document",
                    description: "The document could not be found or loaded",
                    variant: "destructive"
                });
                navigate("/vault");
            } finally {
                setIsLoading(false);
            }
        };

        loadDocument();
    }, [id, navigate, toast]);

    const handleDownload = async () => {
        if (!currentDocument) return;

        try {
            const blob = await documentsApi.download(currentDocument.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = currentDocument.file_name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            toast({
                title: "Download failed",
                description: "Could not download the document",
                variant: "destructive"
            });
        }
    };

    // Helper function to safely format dates
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "N/A";

        const date = parseISO(dateString);
        return isValid(date)
            ? formatDistanceToNow(date, { addSuffix: true })
            : "Invalid date";
    };

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
                </div>
            </PageContainer>
        );
    }

    if (!currentDocument) return null;

    return (
        <PageContainer>
            <div className="max-w-3xl mx-auto">
                {/* Header Section */}
                <div className="px-6 py-4 border-b">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => navigate("/vault")}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Document Details</h1>
                            <p className="text-sm text-muted-foreground">
                                Viewing document information
                            </p>
                        </div>
                    </div>
                </div>

                {/* Document Info Section */}
                <div className="p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-6 w-6 text-primary" />
                                <span>{currentDocument.title}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">File Name</p>
                                    <p className="font-medium">{currentDocument.file_name}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">File Type</p>
                                    <Badge variant="outline" className="text-sm">
                                        {currentDocument.file_type}
                                    </Badge>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">File Size</p>
                                    <p className="font-medium">
                                        {(currentDocument.file_size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Uploaded</p>
                                    <p className="font-medium">
                                        {formatDate(currentDocument.created_at)}
                                    </p>
                                </div>
                            </div>

                            {currentDocument.description && (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p className="text-sm whitespace-pre-line">
                                        {currentDocument.description}
                                    </p>
                                </div>
                            )}

                            <div className="border rounded-lg p-4 bg-muted/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-10 w-10 text-primary" />
                                        <div>
                                            <p className="font-medium">{currentDocument.file_name}</p>
                                            <div className="flex gap-2 mt-1">
                                                <Badge variant="secondary">{currentDocument.file_type}</Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {(currentDocument.file_size / (1024 * 1024)).toFixed(2)} MB
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button onClick={handleDownload}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>

                            {(currentDocument.expiry_date || currentDocument.updated_at) && (
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    {currentDocument.expiry_date && (
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Expiry Date
                                            </p>
                                            <p className="font-medium">
                                                {new Date(currentDocument.expiry_date).toLocaleDateString()}
                                                {" • "}
                                                <span className={
                                                    new Date(currentDocument.expiry_date) < new Date()
                                                        ? "text-destructive"
                                                        : "text-muted-foreground"
                                                }>
                                                    {new Date(currentDocument.expiry_date) < new Date()
                                                        ? "Expired"
                                                        : "Active"}
                                                </span>
                                            </p>
                                        </div>
                                    )}

                                    {currentDocument.updated_at && (
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Last Updated</p>
                                            <p className="font-medium">
                                                {formatDate(currentDocument.updated_at)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
};

export default DocumentView;