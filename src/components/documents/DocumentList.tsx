
import { useState } from "react";
import {
  FileText, Download, Eye, Trash, Tag, Calendar,
  AlertCircle, MoreVertical
} from "lucide-react";
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentEntry } from "@/api/documentsApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Document {
  id: string;
  title: string;
  type: string;
  size: string;
  uploadDate: string;
  expiryDate: string | null;
}

interface DocumentListProps {
  documents: DocumentEntry[]; // ✅ Use real type
}

const DocumentList = ({ documents }: DocumentListProps) => {
  const { toast } = useToast();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-10 w-10 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText className="h-10 w-10 text-blue-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-10 w-10 text-indigo-500" />;
      default:
        return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };

  const handleView = (document: Document) => {
    setCurrentDocument(document);
    setIsViewerOpen(true);
    toast({
      title: "Viewer coming soon",
      description: `The secure viewer for ${document.title} will be available in a future update.`
    });
  };

  const handleDownload = (document: Document) => {
    toast({
      title: "Download initiated",
      description: `Downloading ${document.title}`
    });
  };

  const handleTrash = (document: Document) => {
    toast({
      title: "Moved to trash",
      description: `${document.title} has been moved to trash`
    });
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No documents found</h3>
        <p className="text-muted-foreground">
          Upload a document or try a different search term
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((document) => (
        <Card key={document.id} className="hover-card-effect">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {getFileIcon(document.type)}
                <CardTitle className="text-lg truncate" title={document.title}>
                  {document.title}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleView(document)}>
                    <Eye className="mr-2 h-4 w-4" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload(document)}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTrash(document)}>
                    <Trash className="mr-2 h-4 w-4" /> Move to Trash
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>Uploaded: {format(new Date(document.uploadDate), 'MMM d, yyyy')}</span>
              </div>
              {document.expiryDate && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  <span>Expires: {format(new Date(document.expiryDate), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-0 flex justify-between">
            <Button variant="outline" size="sm" onClick={() => handleView(document)}>
              <Eye className="h-3.5 w-3.5 mr-1" /> View
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload(document)}>
              <Download className="h-3.5 w-3.5 mr-1" /> Download
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default DocumentList;
