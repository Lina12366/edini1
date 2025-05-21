import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import AdminPageLayout from '../components/AdminPageLayout';
import { AdminForm, FormGroup, FormInput, FormSelect } from '../components/AdminForm';
import { AdminCard, CardHeader, CardBody, StatusBadge } from '../components/AdminCard';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    route_id: '',
    vehicle_id: '',
    departure_time: '',
    arrival_time: '',
    price: '',
    available_seats: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/schedules/list.php');
      const data = await response.json();
      
      if (data.success) {
        setSchedules(data.schedules);
      } else {
        console.error('API Error:', data.error);
        alert(data.error || 'Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      alert('Failed to fetch schedules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesResponse, vehiclesResponse] = await Promise.all([
          fetch('http://localhost/ediniticketbooking/src/serveur/api/routes/list.php'),
          fetch('http://localhost/ediniticketbooking/src/serveur/api/vehicles/list.php')
        ]);
        
        const routesData = await routesResponse.json();
        const vehiclesData = await vehiclesResponse.json();
        
        if (routesData.success) setRoutes(routesData.routes);
        if (vehiclesData.success) setVehicles(vehiclesData.vehicles);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch routes and vehicles. Please try again.');
      }
    };
    
    fetchData();
    fetchSchedules();
  }, []);

  const createSchedule = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.route_id || !formData.vehicle_id || !formData.departure_time || 
        !formData.arrival_time || !formData.price || !formData.available_seats) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const scheduleData = {
        route_id: parseInt(formData.route_id),
        vehicle_id: parseInt(formData.vehicle_id),
        departure_time: formData.departure_time.replace('T', ' '),
        arrival_time: formData.arrival_time.replace('T', ' '),
        price: parseFloat(formData.price),
        available_seats: parseInt(formData.available_seats)
      };

      console.log('Sending schedule data:', scheduleData); // Debug log

      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/schedules/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });
      
      const data = await response.json();
      console.log('Response:', data); // Debug log

      if (data.success) {
        fetchSchedules();
        setFormData({
          route_id: '',
          vehicle_id: '',
          departure_time: '',
          arrival_time: '',
          price: '',
          available_seats: ''
        });
        setShowAddModal(false);
        alert('Schedule created successfully!');
      } else {
        alert(data.error || 'Failed to create schedule');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Failed to create schedule. Please try again.');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      route_id: schedule.route_id,
      vehicle_id: schedule.vehicle_id,
      departure_time: schedule.departure_time.replace(' ', 'T'),
      arrival_time: schedule.arrival_time.replace(' ', 'T'),
      price: schedule.price,
      available_seats: schedule.available_seats
    });
    setShowEditModal(true);
  };

  const updateSchedule = async (e) => {
    e.preventDefault();
    
    if (!editingSchedule) return;

    try {
      const scheduleData = {
        schedule_id: editingSchedule.schedule_id,
        route_id: parseInt(formData.route_id),
        vehicle_id: parseInt(formData.vehicle_id),
        departure_time: formData.departure_time.replace('T', ' '),
        arrival_time: formData.arrival_time.replace('T', ' '),
        price: parseFloat(formData.price),
        available_seats: parseInt(formData.available_seats)
      };

      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/schedules/update.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });
      
      const data = await response.json();

      if (data.success) {
        fetchSchedules();
        setShowEditModal(false);
        setEditingSchedule(null);
        setFormData({
          route_id: '',
          vehicle_id: '',
          departure_time: '',
          arrival_time: '',
          price: '',
          available_seats: ''
        });
        alert('Schedule updated successfully!');
      } else {
        alert(data.error || 'Failed to update schedule');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Failed to update schedule. Please try again.');
    }
  };

  const deleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      console.log('Deleting schedule with ID:', scheduleId); // Debug log

      const response = await fetch(`http://localhost/ediniticketbooking/src/serveur/api/schedules/delete.php?schedule_id=${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status); // Debug log
      const data = await response.json();
      console.log('Delete response:', data); // Debug log

      if (data.success) {
        await fetchSchedules(); // Refresh the list
        alert('Schedule deleted successfully!');
      } else {
        console.error('Delete failed:', data.error); // Debug log
        alert(data.error || 'Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule. Please try again.');
    }
  };

  return (
    <AdminPageLayout 
      title="Schedule Management"
      actionButton={
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-red text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          Add Schedule
        </button>
      }
    >
      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Schedule</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    route_id: '',
                    vehicle_id: '',
                    departure_time: '',
                    arrival_time: '',
                    price: '',
                    available_seats: ''
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <AdminForm onSubmit={createSchedule} submitText="Add Schedule">
              <FormGroup label="Route">
                <FormSelect
                  value={formData.route_id}
                  onChange={(e) => setFormData({...formData, route_id: e.target.value})}
                  required
                >
                  <option value="">Select a route</option>
                  {routes.map((route) => (
                    <option key={route.route_id} value={route.route_id}>
                      {route.from_location} to {route.to_location}
                    </option>
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup label="Vehicle">
                <FormSelect
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                  required
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                      {vehicle.vehicle_number} ({vehicle.vehicle_type})
                    </option>
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup label="Departure Time">
                <FormInput
                  type="datetime-local"
                  value={formData.departure_time}
                  onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup label="Arrival Time">
                <FormInput
                  type="datetime-local"
                  value={formData.arrival_time}
                  onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup label="Price">
                <FormInput
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup label="Available Seats">
                <FormInput
                  type="number"
                  value={formData.available_seats}
                  onChange={(e) => setFormData({...formData, available_seats: e.target.value})}
                  required
                />
              </FormGroup>
            </AdminForm>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Schedule</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSchedule(null);
                  setFormData({
                    route_id: '',
                    vehicle_id: '',
                    departure_time: '',
                    arrival_time: '',
                    price: '',
                    available_seats: ''
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <AdminForm onSubmit={updateSchedule} submitText="Update Schedule">
              <FormGroup label="Route">
                <FormSelect
                  value={formData.route_id}
                  onChange={(e) => setFormData({...formData, route_id: e.target.value})}
                  required
                >
                  <option value="">Select a route</option>
                  {routes.map((route) => (
                    <option key={route.route_id} value={route.route_id}>
                      {route.from_location} to {route.to_location}
                    </option>
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup label="Vehicle">
                <FormSelect
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                  required
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                      {vehicle.vehicle_number} ({vehicle.vehicle_type})
                    </option>
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup label="Departure Time">
                <FormInput
                  type="datetime-local"
                  value={formData.departure_time}
                  onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup label="Arrival Time">
                <FormInput
                  type="datetime-local"
                  value={formData.arrival_time}
                  onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup label="Price">
                <FormInput
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup label="Available Seats">
                <FormInput
                  type="number"
                  value={formData.available_seats}
                  onChange={(e) => setFormData({...formData, available_seats: e.target.value})}
                  required
                />
              </FormGroup>
            </AdminForm>
          </div>
        </div>
      )}

      {/* Schedules List */}
      <div className="p-6">
        {loading ? (
          <div className="text-center">Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="text-center text-gray-500">No schedules found</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {schedules.map((schedule) => (
              <AdminCard key={schedule.schedule_id}>
                <CardHeader
                  title={`${schedule.from_location} → ${schedule.to_location}`}
                  subtitle={`Vehicle: ${schedule.vehicle_number} (${schedule.vehicle_type})`}
                  action={
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="p-2 text-gray-600 hover:text-red rounded-lg hover:bg-gray-100"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSchedule(schedule.schedule_id)}
                        className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  }
                />
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Departure:</span>{' '}
                          {new Date(schedule.departure_time).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Arrival:</span>{' '}
                          {new Date(schedule.arrival_time).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red">{schedule.price} DA</p>
                        <StatusBadge
                          status={`${schedule.available_seats} seats available`}
                          type={schedule.available_seats > 0 ? 'success' : 'error'}
                        />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </AdminCard>
            ))}
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
};

export default ScheduleManagement;