import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import AddActivityModal from '../components/AddActivityModal';
import EditLeadModal from '../components/EditLeadModal';
import type { Lead, Activity } from '../types/lead';

function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDeleteLead = async () => {
    setIsDeleting(true);
    setError(null);
    try {
        await api.delete(`/leads/${id}`);
        navigate('/dashboard');
    } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete lead');
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
    }
  };

  const fetchLeadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [leadResponse, activitiesResponse] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/leads/${id}/activities`),
      ]);
      setLead(leadResponse.data);
      // The PDF requires reverse chronological order for the activity timeline
      setActivities(activitiesResponse.data.sort((a: Activity, b: Activity) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch lead data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLeadData();
  }, [fetchLeadData]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><p>Loading lead details...</p></div>;
  }

  if (error) {
    return <p className="text-red-500 text-center">Error: {error}</p>;
  }

  if (!lead) {
    return <p className="text-center">Lead not found.</p>;
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'negotiation': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-500 text-white';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getActivityIcon = (type: Activity['activity_type']) => {
    switch (type) {
      case 'call': return '📞';
      case 'email': return '✉️';
      case 'meeting': return '🤝';
      case 'note': return '📝';
      default: return '🔔';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {lead.first_name} {lead.last_name}
          </h1>
          <p className="text-sm text-gray-500">{lead.property_interest || 'No specific property interest'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>Edit Lead</Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>Delete Lead</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Details Card */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <a href={`mailto:${lead.email}`} className="text-sm text-indigo-600 hover:underline">{lead.email}</a>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <a href={`tel:${lead.phone}`} className="text-sm text-indigo-600 hover:underline">{lead.phone || 'N/A'}</a>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(lead.status)}`}>{lead.status}</span></p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Source</p>
              <p className="text-sm text-gray-900">{lead.source}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Budget</p>
              <p className="text-sm text-gray-900">${lead.budget_min?.toLocaleString() || '?'} - ${lead.budget_max?.toLocaleString() || '?'}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-gray-500">Created On</p>
              <p className="text-sm text-gray-900">{new Date(lead.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>A log of all interactions with this lead.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
                <Button onClick={() => setIsActivityModalOpen(true)}>Add New Activity</Button>
            </div>
            <div className="space-y-6">
              {activities.length > 0 ? (
                activities.map(activity => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xl">{getActivityIcon(activity.activity_type)}</span>
                      </div>
                    </div>
                    <div className="flex-grow border-b pb-4">
                      <div className="flex justify-between items-baseline">
                        <p className="font-semibold text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.activity_date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.notes}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Logged by {activity.user_name}
                        {activity.duration && ` (Call duration: ${activity.duration} mins)`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No activities logged yet.</p>
                  <p className="text-sm text-gray-400">Click "Add New Activity" to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddActivityModal 
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onActivityAdded={fetchLeadData}
        leadId={lead.id}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the lead as inactive (soft delete). It will not be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLead} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {lead && (
        <EditLeadModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onLeadUpdated={fetchLeadData}
          lead={lead}
        />
      )}
    </div>
  );
}

export default LeadDetailPage;