import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, RefreshCw, ArrowUpDown, Search, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import trashApi, { TrashItem } from '@/api/trashApi';

const TrashPage = () => {
  const navigate = useNavigate();
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'deleted_at' | 'type'>('deleted_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedItem, setSelectedItem] = useState<{ id: number, type: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEmptyTrashDialogOpen, setIsEmptyTrashDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchTrashItems();
  }, [navigate]);

  const fetchTrashItems = async () => {
    setIsLoading(true);
    try {
      const items = await trashApi.list();
      console.log(items);
      if (items.length > 0) {
        toast.success('Trash items loaded successfully');
        setTrashItems(items);
      }
    } catch (error) {
      console.error('Error loading trash items:', error);
      toast.error('Failed to load trash items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: 'name' | 'deleted_at' | 'type') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDelete = (id: number, type: string) => {
    setSelectedItem({ id, type });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      const success = await trashApi.permanentDelete(selectedItem.id, selectedItem.type);
      if (success) {
        setTrashItems(items => items.filter(item =>
          !(item.id === selectedItem.id && item.type === selectedItem.type)
        ));
        toast.success(`Item permanently deleted.`);
      } else {
        toast.error('Failed to delete item');
      }
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleRestore = async (id: number, type: string) => {
    try {
      const success = await trashApi.restore(id, type);
      if (success) {
        setTrashItems(items => items.filter(item =>
          !(item.id === id && item.type === type)
        ));
        toast.success(`Item restored successfully.`);
      } else {
        toast.error('Failed to restore item');
      }
    } catch (error) {
      toast.error('Failed to restore item');
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const success = await trashApi.emptyTrash();
      if (success) {
        setTrashItems([]);
        toast.success('Trash emptied successfully');
      } else {
        toast.error('Failed to empty trash');
      }
    } catch (error) {
      toast.error('Failed to empty trash');
    } finally {
      setIsEmptyTrashDialogOpen(false);
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-2"></div>;
      case 'bill':
        return <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>;
      case 'application':
        return <div className="h-2.5 w-2.5 rounded-full bg-purple-500 mr-2"></div>;
      case 'password':
        return <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-2"></div>;
      default:
        return <div className="h-2.5 w-2.5 rounded-full bg-gray-500 mr-2"></div>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return 'Invalid date';
    }
  };

  const getItemDetails = (item: TrashItem) => {
    switch (item.type) {
      case 'document':
        return item.details?.file_type ? `File type: ${item.details.file_type}` : null;
      case 'bill':
        return item.details?.amount ? `Amount: $${item.details.amount}` : null;
      case 'application':
        return item.details?.company ? `${item.details.company} - ${item.details.job_title || 'Job'}` : null;
      case 'password':
        return item.details?.category ? `Category: ${item.details.category}` : null;
      default:
        return null;
    }
  };

  const filteredItems = trashItems
    .filter(item => {
      if (activeTab !== 'all' && item.type !== activeTab) return false;

      const itemName = item.name?.toLowerCase() || '';
      const itemType = item.type?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      return itemName.includes(query) || itemType.includes(query);
    })
    .sort((a, b) => {
      if (sortField === 'deleted_at') {
        const aValue = new Date(a.deleted_at).getTime();
        const bValue = new Date(b.deleted_at).getTime();
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        const aValue = (a[sortField] || '').toString().toLowerCase();
        const bValue = (b[sortField] || '').toString().toLowerCase();
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });

  const getTabCount = (type: string) => {
    return trashItems.filter(item => type === 'all' || item.type === type).length;
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
      <div className="app-container py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => navigate('/vault')}
          >
            <ChevronLeft size={18} className="mr-1" />
            Back to Vaults
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-3xl font-bold text-gray-900">Trash</h1>

          {trashItems.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setIsEmptyTrashDialogOpen(true)}
            >
              <Trash2 size={16} className="mr-2" />
              Empty Trash
            </Button>
          )}
        </div>

        <div className="glass-card p-4 mb-6 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search trash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({getTabCount('all')})</TabsTrigger>
            <TabsTrigger value="document">Documents ({getTabCount('document')})</TabsTrigger>
            <TabsTrigger value="bill">Bills ({getTabCount('bill')})</TabsTrigger>
            <TabsTrigger value="application">Applications ({getTabCount('application')})</TabsTrigger>
            <TabsTrigger value="password">Passwords ({getTabCount('password')})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <TrashTable
              items={filteredItems}
              handleSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              handleRestore={handleRestore}
              handleDelete={handleDelete}
              getItemTypeIcon={getItemTypeIcon}
              getItemDetails={getItemDetails}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="document" className="mt-4">
            <TrashTable
              items={filteredItems}
              handleSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              handleRestore={handleRestore}
              handleDelete={handleDelete}
              getItemTypeIcon={getItemTypeIcon}
              getItemDetails={getItemDetails}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="bill" className="mt-4">
            <TrashTable
              items={filteredItems}
              handleSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              handleRestore={handleRestore}
              handleDelete={handleDelete}
              getItemTypeIcon={getItemTypeIcon}
              getItemDetails={getItemDetails}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="application" className="mt-4">
            <TrashTable
              items={filteredItems}
              handleSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              handleRestore={handleRestore}
              handleDelete={handleDelete}
              getItemTypeIcon={getItemTypeIcon}
              getItemDetails={getItemDetails}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="password" className="mt-4">
            <TrashTable
              items={filteredItems}
              handleSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              handleRestore={handleRestore}
              handleDelete={handleDelete}
              getItemTypeIcon={getItemTypeIcon}
              getItemDetails={getItemDetails}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>

        {/* Empty state when there are no items */}
        {trashItems.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <p className="mt-4 text-lg text-gray-600">Your trash is empty</p>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Permanently Delete Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to permanently delete this item?
            </p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty Trash Dialog */}
      <Dialog open={isEmptyTrashDialogOpen} onOpenChange={setIsEmptyTrashDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Empty Trash</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to permanently delete all items in trash?
            </p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone and will delete {trashItems.length} items.</p>
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleEmptyTrash}
            >
              Empty Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

// Extracted table component for better readability
const TrashTable = ({
  items,
  handleSort,
  sortField,
  sortDirection,
  handleRestore,
  handleDelete,
  getItemTypeIcon,
  getItemDetails,
  formatDate
}: {
  items: TrashItem[];
  handleSort: (field: 'name' | 'deleted_at' | 'type') => void;
  sortField: string;
  sortDirection: string;
  handleRestore: (id: number, type: string) => void;
  handleDelete: (id: number, type: string) => void;
  getItemTypeIcon: (type: string) => JSX.Element;
  getItemDetails: (item: TrashItem) => string | null;
  formatDate: (dateString?: string) => string;
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No items found in this category</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto glass-card animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                onClick={() => handleSort('name')}
                className="flex items-center space-x-1 focus:outline-none"
              >
                <span>Name</span>
                {sortField === 'name' && (
                  <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
                )}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('type')}
                className="flex items-center space-x-1 focus:outline-none"
              >
                <span>Type</span>
                {sortField === 'type' && (
                  <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
                )}
              </button>
            </TableHead>
            <TableHead>Details</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('deleted_at')}
                className="flex items-center space-x-1 focus:outline-none"
              >
                <span>Deleted</span>
                {sortField === 'deleted_at' && (
                  <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
                )}
              </button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {getItemTypeIcon(item.type)}
                  <span className="capitalize">{item.type}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {getItemDetails(item) || 'No details available'}
                </span>
              </TableCell>
              <TableCell>{formatDate(item.deleted_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestore(item.id, item.type)}
                    className="text-green-600 hover:text-green-800 hover:bg-green-50"
                  >
                    <RefreshCw size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id, item.type)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TrashPage;