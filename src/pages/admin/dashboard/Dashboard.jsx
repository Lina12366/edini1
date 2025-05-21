import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBus, FaRoute, FaTicketAlt, FaMoneyBillWave, FaEye } from 'react-icons/fa';
import { AdminCard, CardHeader, CardBody, StatusBadge } from '../components/AdminCard';

const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
  <div 
    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    vehicles: 0,
    routes: 0,
    bookings: 0,
    revenue: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch vehicles
        const vehiclesResponse = await fetch('http://localhost/ediniticketbooking/src/serveur/api/vehicles/list.php');
        const vehiclesData = await vehiclesResponse.json();
        
        // Fetch routes
        const routesResponse = await fetch('http://localhost/ediniticketbooking/src/serveur/api/routes/list.php');
        const routesData = await routesResponse.json();
        
        // Fetch bookings
        const bookingsResponse = await fetch('http://localhost/ediniticketbooking/src/serveur/api/bookings/list.php');
        const bookingsData = await bookingsResponse.json();

        if (vehiclesData.success && routesData.success && bookingsData.success) {
          // Calculate stats
          const activeVehicles = vehiclesData.vehicles.filter(v => v.status === 'active').length;
          const totalRoutes = routesData.routes.length; // Changed to total routes since there's no status field
          
          // Get today's bookings
          const today = new Date();
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
          
          const todayBookings = bookingsData.bookings.filter(booking => {
            const bookingDate = new Date(booking.booking_date);
            return bookingDate >= todayStart && bookingDate <= todayEnd;
          });
          
          // Calculate today's revenue
          const todayRevenue = todayBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);

          setStats({
            vehicles: activeVehicles,
            routes: totalRoutes,
            bookings: todayBookings.length,
            revenue: todayRevenue
          });

          // Process recent bookings
          const activities = bookingsData.bookings
            .slice(0, 5) // Get only 5 most recent bookings
            .map(booking => ({
              id: booking.booking_id,
              type: 'booking',
              title: `Booking #${booking.booking_id}`,
              time: formatTimeAgo(booking.booking_date),
              status: booking.status,
              bookingId: booking.booking_id,
              customerName: booking.customer_name,
              amount: booking.total_amount
            }));

          setRecentActivities(activities);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString();
  };

  const handleViewAll = () => {
    navigate('/admin/bookings');
  };

  const handleViewBooking = (bookingId) => {
    navigate(`/admin/bookings/${bookingId}`);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'cancelled':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-red hover:text-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Vehicles"
          value={loading ? '-' : stats.vehicles}
          icon={FaBus}
          color="bg-blue-500"
          onClick={() => navigate('/admin/vehicles')}
        />
        
        <StatCard
          title="Total Routes"
          value={loading ? '-' : stats.routes}
          icon={FaRoute}
          color="bg-green-500"
          onClick={() => navigate('/admin/routes')}
        />
        
        <StatCard
          title="Today's Bookings"
          value={loading ? '-' : stats.bookings}
          icon={FaTicketAlt}
          color="bg-purple-500"
          onClick={() => navigate('/admin/bookings')}
        />
        
        <StatCard
          title="Today's Revenue"
          value={loading ? '-' : `$${stats.revenue.toLocaleString()}`}
          icon={FaMoneyBillWave}
          color="bg-red"
          onClick={() => navigate('/admin/bookings')}
        />
      </div>
      
      {/* Recent Activity Section */}
      <AdminCard>
        <CardHeader
          title="Recent Bookings"
          action={
            <button 
              onClick={handleViewAll}
              className="text-sm text-red hover:text-red-600 transition-colors"
            >
              View All
            </button>
          }
        />
        <CardBody>
          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => handleViewBooking(activity.bookingId)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <FaTicketAlt className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{activity.customerName}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                      <span>•</span>
                      <span>${activity.amount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge 
                      status={activity.status.charAt(0).toUpperCase() + activity.status.slice(1)} 
                      type={getStatusColor(activity.status)}
                    />
                    <FaEye className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No recent bookings</p>
            )}
          </div>
        </CardBody>
      </AdminCard>
    </div>
  );
};

export default Dashboard;