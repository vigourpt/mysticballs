import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

// Define types for analytics data
interface AnalyticsData {
  totalSignups: number;
  totalConversions: number;
  conversionRate: number;
  avgReadingsBeforeSignup: number;
  conversionsByType: Record<string, number>;
  conversionsByDay: Record<string, number>;
  recentEvents: ConversionEvent[];
}

interface ConversionEvent {
  id: string;
  user_id: string | null;
  device_id: string;
  event_type: string;
  event_time: string;
  metadata: Record<string, any> | null;
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch total signups
      const { data: signupsData, error: signupsError } = await supabase
        .from('auth.users')
        .select('count', { count: 'exact' });

      if (signupsError) throw signupsError;

      // Fetch conversion events
      const { data: conversionsData, error: conversionsError } = await supabase
        .from('conversion_events')
        .select('*')
        .eq('event_type', 'subscription_started');

      if (conversionsError) throw conversionsError;

      // Fetch all conversion events for analysis
      const { data: allEventsData, error: allEventsError } = await supabase
        .from('conversion_events')
        .select('*')
        .order('event_time', { ascending: false });

      if (allEventsError) throw allEventsError;

      // Calculate conversion rate
      const totalSignups = signupsData?.[0]?.count || 0;
      const totalConversions = conversionsData?.length || 0;
      const conversionRate = totalSignups > 0 ? (totalConversions / totalSignups) * 100 : 0;

      // Calculate average readings before signup
      const { data: readingsData, error: readingsError } = await supabase
        .rpc('get_avg_readings_before_signup');

      if (readingsError) throw readingsError;

      const avgReadingsBeforeSignup = readingsData || 0;

      // Group conversions by type
      const conversionsByType: Record<string, number> = {};
      if (allEventsData) {
        allEventsData.forEach(event => {
          const eventType = event.event_type;
          conversionsByType[eventType] = (conversionsByType[eventType] || 0) + 1;
        });
      }

      // Group conversions by day
      const conversionsByDay: Record<string, number> = {};
      if (allEventsData) {
        allEventsData.forEach(event => {
          const date = new Date(event.event_time).toISOString().split('T')[0];
          conversionsByDay[date] = (conversionsByDay[date] || 0) + 1;
        });
      }

      // Get recent events
      const recentEvents = allEventsData?.slice(0, 10) || [];

      setAnalyticsData({
        totalSignups,
        totalConversions,
        conversionRate,
        avgReadingsBeforeSignup,
        conversionsByType,
        conversionsByDay,
        recentEvents
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const prepareConversionTypeChartData = () => {
    if (!analyticsData) return null;
    
    const labels = Object.keys(analyticsData.conversionsByType || {});
    const data = labels.map(label => {
      if (label && analyticsData.conversionsByType) {
        return analyticsData.conversionsByType[label] || 0;
      }
      return 0;
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Conversions by Type',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareConversionTimeChartData = () => {
    if (!analyticsData) return null;
    
    const sortedDates = Object.keys(analyticsData.conversionsByDay || {}).sort();
    const data = sortedDates.map(date => {
      if (date && analyticsData.conversionsByDay) {
        return analyticsData.conversionsByDay[date] || 0;
      }
      return 0;
    });
    
    return {
      labels: sortedDates,
      datasets: [
        {
          label: 'Conversions Over Time',
          data,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sign-ups
              </Typography>
              <Typography variant="h5">
                {analyticsData?.totalSignups || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Conversions
              </Typography>
              <Typography variant="h5">
                {analyticsData?.totalConversions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h5">
                {analyticsData?.conversionRate.toFixed(2) || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg. Readings Before Signup
              </Typography>
              <Typography variant="h5">
                {analyticsData?.avgReadingsBeforeSignup.toFixed(1) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Conversions by Type
            </Typography>
            {analyticsData && prepareConversionTypeChartData() && (
              <Box sx={{ height: 300 }}>
                <Pie data={prepareConversionTypeChartData()!} />
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Conversions Over Time
            </Typography>
            {analyticsData && prepareConversionTimeChartData() && (
              <Box sx={{ height: 300 }}>
                <Line data={prepareConversionTimeChartData()!} />
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Conversion Events */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Conversion Events
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Event Type</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Device ID</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData?.recentEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.event_type}</TableCell>
                      <TableCell>{event.user_id || 'Anonymous'}</TableCell>
                      <TableCell>{event.device_id.substring(0, 8)}...</TableCell>
                      <TableCell>{new Date(event.event_time).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
