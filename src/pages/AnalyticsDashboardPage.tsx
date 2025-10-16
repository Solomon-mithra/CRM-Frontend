import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, CheckCircle, Activity } from 'lucide-react';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Link } from 'react-router-dom';

// Interfaces based on the PDF and reasonable assumptions for UI
interface Activity {
  id: number;
  lead_id: number;
  lead_first_name?: string; // Assuming backend provides this for context
  lead_last_name?: string;
  activity_type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  activity_date: string;
  user_name: string;
}

interface DashboardStats {
  total_leads: number;
  new_leads_this_week: number;
  closed_leads_this_month: number;
  total_activities: number;
  leads_by_status: { status: string; count: number }[];
  recent_activities: Activity[];
}

const StatCard = ({ title, value, icon: Icon }: { title: string, value: number, icon: React.ElementType }) => {
  const formattedValue = String(value).padStart(2, '0');
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold pt-1">{formattedValue}</div>
      </CardContent>
    </Card>
  );
};

const getActivityIcon = (type: Activity['activity_type']) => {
  switch (type) {
    case 'call': return '📞';
    case 'email': return '✉️';
    case 'meeting': return '🤝';
    case 'note': return '📝';
    default: return '🔔';
  }
};

function AnalyticsDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<DashboardStats>('/dashboard/statistics');
        setStats(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><p>Loading analytics...</p></div>;
  }

  if (error) {
    return <p className="text-red-500 text-center">Error: {error}</p>;
  }

  if (!stats) {
    return <p className="text-center">No statistics available.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground">An overview of your lead and activity metrics.</p>
        </div>
        <Link to="/dashboard" className="text-sm text-indigo-600 hover:underline">Back to Leads</Link>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Active Leads" value={stats.total_leads} icon={Users} />
        <StatCard title="New Leads (This Week)" value={stats.new_leads_this_week} icon={UserPlus} />
        <StatCard title="Closed Leads (This Month)" value={stats.closed_leads_this_month} icon={CheckCircle} />
        <StatCard title="Total Activities Logged" value={stats.total_activities} icon={Activity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Leads by Status Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.leads_by_status} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Number of Leads" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
            {stats.recent_activities.length > 0 ? (
              stats.recent_activities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-md">{getActivityIcon(activity.activity_type)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      For lead <Link to={`/leads/${activity.lead_id}`} className="text-indigo-600 hover:underline">{activity.lead_first_name || 'Unknown'} {activity.lead_last_name || 'Lead'}</Link> on {new Date(activity.activity_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent activities.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsDashboardPage;