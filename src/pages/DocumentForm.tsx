import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FileUp, X, Calendar, ArrowLeft } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { documentsApi, DocumentEntry } from "@/api/documentsApi";
import { formatISO, parseISO } from "date-fns";

const DocumentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = Boolean(id);

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState<DocumentEntry | null>(null);
  const [replaceFile, setReplaceFile] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [pendingReplaceFile, setPendingReplaceFile] = useState<File | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      const loadDocument = async () => {
        setIsLoading(true);
        try {
          const doc = await documentsApi.get(id);
          if (doc) {
            setExistingFile(doc);
            setTitle(doc.title);
            setDescription(doc.description || "");
            setExpiryDate(doc.expiry_date ?
              formatISO(parseISO(doc.expiry_date), { representation: 'date' }) : "");
          }
        } catch (error) {
          toast({
            title: "Failed to load document",
            description: "Please try again later",
            variant: "destructive"
          });
          navigate("/vault");
        } finally {
          setIsLoading(false);
        }
      };
      loadDocument();
    }
  }, [id, isEditMode, navigate, toast]);

  const handleFileSelection = (files: FileList | null) => {
    if (files && files.length > 0) {
      const selected = files[0];

      if (isEditMode) {
        // Ask before replacing
        setPendingReplaceFile(selected);
        setShowReplaceConfirm(true);
      } else {
        setFile(selected); // Create mode, no popup
      }
    }
  };


  const clearFileSelection = () => {
    setFile(null);
    if (isEditMode) {
      setReplaceFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast({
        title: "Missing information",
        description: "Please provide a title",
        variant: "destructive"
      });
      return;
    }

    if (!isEditMode && !file) {
      toast({
        title: "Missing file",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    if (expiryDate && new Date(expiryDate) < new Date()) {
      toast({
        title: "Invalid expiry date",
        description: "Expiry date cannot be in the past",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && id) {
        const updateData = {
          title,
          description: description || undefined,
          expiry_date: expiryDate || null,
          file: replaceFile ? file : undefined, // Only include file if replacement is intended
          keep_existing_file: !replaceFile
        };

        const result = await documentsApi.update(id, updateData);

        console.log("update", result)
        if (result) {
          toast({
            title: 'Document updated',
            description: replaceFile && file
              ? 'Your document and file have been updated'
              : 'Your document details have been updated'
          });
          navigate("/vault");
        }
      } else if (!isEditMode && file) {
        const result = await documentsApi.create({
          title,
          description: description || undefined,
          expiry_date: expiryDate || undefined,
          file
        });

        if (result) {
          toast({
            title: 'Document uploaded',
            description: 'Your document has been securely stored'
          });
          navigate("/vault");
        }
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
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
              <h1 className="text-2xl font-bold">
                {isEditMode ? 'Edit Document' : 'Upload New Document'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? 'Update your document details and/or replace the file'
                  : 'Securely store important files and documents'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <div className="relative">
                    <Input
                      id="expiryDate"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Current file section - only in edit mode */}
                {isEditMode && existingFile && (
                  <div className="space-y-2">
                    <Label>Current Document</Label>
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center space-x-2">
                        <FileUp className="h-6 w-6 text-primary" />
                        <div>
                          <p className="font-medium">{existingFile.file_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {existingFile.file_type} •
                            {(existingFile.file_size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          {existingFile.expiry_date && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Expires: {new Date(existingFile.expiry_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {showReplaceConfirm && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                          <h2 className="text-lg font-semibold mb-4">Confirm File Replacement</h2>
                          <p className="text-sm text-muted-foreground">
                            Are you sure you want to replace the current document with{" "}
                            <strong>{pendingReplaceFile?.name}</strong>?
                          </p>

                          <div className="flex justify-end gap-2 mt-6">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setShowReplaceConfirm(false);
                                setPendingReplaceFile(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                setFile(pendingReplaceFile);
                                setReplaceFile(true);
                                setPendingReplaceFile(null);
                                setShowReplaceConfirm(false);
                              }}
                            >
                              Yes, Replace
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}


                    {/* File replacement option */}
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="replaceFile"
                        checked={replaceFile}
                        onCheckedChange={(checked) => {
                          setReplaceFile(checked === true);
                          if (!checked) setFile(null);
                        }}
                      />
                      <Label
                        htmlFor="replaceFile"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Replace existing file
                      </Label>
                    </div>
                  </div>
                )}

                {/* File upload section - always shown in create mode, shown conditionally in edit mode */}
                {(!isEditMode || (isEditMode && replaceFile)) && (
                  <div className="space-y-2">
                    <Label htmlFor="fileUpload">
                      {isEditMode ? 'New Document File *' : 'Document File *'}
                    </Label>
                    <Input
                      id="fileUpload"
                      type="file"
                      accept="application/pdf, .docx, .xlsx"
                      onChange={(e) => handleFileSelection(e.target.files)}
                      required={!isEditMode || replaceFile}
                    />
                    {file && (
                      <div className="flex items-center gap-2 mt-2">
                        <FileUp className="h-4 w-4 text-primary" />
                        <span className="text-sm">{file.name}</span>
                        <button
                          type="button"
                          onClick={clearFileSelection}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/vault")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    (!file && !isEditMode) ||
                    (isEditMode && replaceFile && !file) ||
                    !title ||
                    isSubmitting
                  }
                >
                  {isSubmitting
                    ? `${isEditMode ? 'Updating...' : 'Uploading...'}`
                    : `${isEditMode ? 'Update Document' : 'Upload Document'}`}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default DocumentForm;