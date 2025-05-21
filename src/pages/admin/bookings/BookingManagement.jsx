import React, { useState, useEffect } from 'react';
import { FaFilter } from 'react-icons/fa';
import AdminPageLayout from '../components/AdminPageLayout';
import { AdminForm, FormGroup, FormSelect } from '../components/AdminForm';
import { AdminCard, CardHeader, CardBody, StatusBadge } from '../components/AdminCard';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/bookings/list.php');
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
    setLoading(false);
  };

  // Update booking status
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/bookings/update.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          status: newStatus
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchBookings();
        alert('Booking status updated successfully!');
      } else {
        alert(data.error || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status. Please try again.');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => 
    filterStatus === 'all' ? true : booking.status === filterStatus
  );

  return (
    <AdminPageLayout 
      title="Booking Management"
      actionButton={
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-red focus:ring-red"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      }
    >
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <AdminCard key={booking.booking_id}>
              <CardHeader
                title={`Booking #${booking.booking_id}`}
                subtitle={`${booking.first_name} ${booking.last_name}`}
                action={
                  <StatusBadge
                    status={booking.status}
                    type={
                      booking.status === 'confirmed' ? 'success' :
                      booking.status === 'pending' ? 'warning' :
                      booking.status === 'cancelled' ? 'error' :
                      'info'
                    }
                  />
                }
              />
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Route:</span>{' '}
                        {booking.departure_location} → {booking.arrival_location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Departure:</span>{' '}
                        {new Date(booking.departure_time).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Seats:</span>{' '}
                        {booking.seat_numbers}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red">
                        ${booking.total_amount}
                      </p>
                      <StatusBadge
                        status={booking.payment_status}
                        type={
                          booking.payment_status === 'paid' ? 'success' :
                          booking.payment_status === 'refunded' ? 'warning' :
                          'error'
                        }
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <FormGroup label="Update Status" fullWidth>
                      <FormSelect
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking.booking_id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </FormSelect>
                    </FormGroup>
                  </div>
                </div>
              </CardBody>
            </AdminCard>
          ))}
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default BookingManagement;