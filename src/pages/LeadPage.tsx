import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import AddLeadModal from '../components/AddLeadModal'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import type { Lead } from '../types/lead';

function LeadPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const leadsPerPage = 10; // As per assignment requirements

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        skip: (currentPage - 1) * leadsPerPage,
        limit: leadsPerPage,
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
        ...(filterStatus !== 'All' && { status: filterStatus }),
      };
      const response = await api.get<Lead[]>('/leads', { params });
      setLeads(response.data);
      // Assuming the API returns total count in headers or a separate endpoint
      // For now, we'll just assume total pages based on current data
      // In a real app, you'd get total count from API to calculate totalPages accurately
      setTotalPages(Math.ceil(response.data.length / leadsPerPage) || 1); // Placeholder calculation
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchQuery, filterStatus, leadsPerPage]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchLeads();
  }, [isAuthenticated, navigate, fetchLeads]);



  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1); // Reset to first page on new filter
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLeadAdded = () => {
    fetchLeads(); // Refresh leads after a new one is added
  };

  const leadStatuses = ['All', 'new', 'contacted', 'qualified', 'negotiation', 'closed', 'lost'];

  if (loading) {
    return <p>Loading leads...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          LeadsDashboard
        </h1>
        <div className="flex items-center">
          
          <Button
            onClick={() => setIsModalOpen(true)}
            className="mr-4"
          >
            Add New Lead
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-grow"
        />
        <Select onValueChange={handleFilterChange} value={filterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            {leadStatuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {leads.length === 0 ? (
        <p>No leads found. Create one!</p>
      ) : (
        <div className="rounded-md border px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <Link to={`/leads/${lead.id}`} className="text-indigo-600 hover:text-indigo-900">
                      {lead.first_name} {lead.last_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{lead.email}</div>
                    <div className="text-sm text-gray-500">{lead.phone}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.status === 'new' ? 'bg-blue-100 text-blue-800' : lead.status === 'contacted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell>${lead.budget_min || 0} - ${lead.budget_max || 0}</TableCell>
                  <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/leads/${lead.id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6">
          <Pagination className="mx-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    if (currentPage > 1) {
                      handlePageChange(currentPage - 1);
                    }
                  }}
                  // Remove 'disabled' prop, as PaginationPrevious does not support it
                />
              </PaginationItem>
              {/* You might want to render page numbers here */}
              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    if (currentPage < totalPages) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeadAdded={handleLeadAdded}
      />
    </div>
  );
}

export default LeadPage;