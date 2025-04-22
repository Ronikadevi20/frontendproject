import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import DocumentList from "@/components/documents/DocumentList";
import { useToast } from "@/hooks/use-toast";
import documentsApi, { DocumentEntry, ExpiryStatus } from "@/api/documentsApi";

const DocumentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expiryFilter, setExpiryFilter] = useState<ExpiryStatus | "all">("all");
  const { toast } = useToast();

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await documentsApi.list(
          expiryFilter === "all" ? undefined : expiryFilter
        );
        setDocuments(docs);
      } catch (error) {
        toast({
          title: "Failed to load documents",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [expiryFilter, toast]);

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Secure Documents</h1>
          <Link to="/documents/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Upload Document
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <div className="flex gap-2 items-center">
              <label className="text-sm text-muted-foreground">Filter by expiry:</label>
              <select
                value={expiryFilter}
                onChange={(e) => setExpiryFilter(e.target.value as ExpiryStatus | "all")}
                className="rounded-md border p-2 text-sm"
              >
                <option value="all">All Documents</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="expiring_soon">Expiring Soon</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          </div>
        ) : (

          <DocumentList
            documents={filteredDocuments.map(doc => ({
              id: String(doc.id),
              title: doc.title,
              type: doc.file_type,
              size: `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB`,
              uploadDate: doc.created_at,
              expiryDate: doc.expiry_date || null,
            }))}
          />

        )}
      </div>
    </PageContainer>
  );
};

export default DocumentsPage;