import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import AdminPageLayout from '../components/AdminPageLayout';
import { AdminForm, FormGroup, FormInput, FormSelect } from '../components/AdminForm';
import { AdminCard, CardHeader, CardBody, StatusBadge } from '../components/AdminCard';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_type: 'bus',
    total_seats: ''
  });
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch vehicles
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/vehicles/list.php');
      const data = await response.json();
      if (data.success) {
        setVehicles(data.vehicles);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
    setLoading(false);
  };

  // Create vehicle
  const createVehicle = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/vehicles/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchVehicles();
        setFormData({ vehicle_number: '', vehicle_type: 'bus', total_seats: '' });
        setShowAddModal(false);
        alert('Vehicle created successfully!');
      } else {
        alert(data.error || 'Failed to create vehicle');
      }
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert('Failed to create vehicle. Please try again.');
    }
  };

  // Update vehicle
  const updateVehicle = async (e) => {
    e.preventDefault();
    if (!editingVehicle) return;

    try {
      const updateData = {
        vehicle_id: editingVehicle.vehicle_id,
        vehicle_number: formData.vehicle_number,
        vehicle_type: formData.vehicle_type,
        total_seats: parseInt(formData.total_seats)
      };

      console.log('Sending update data:', updateData); // Debug log

      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/vehicles/update.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      console.log('Update response:', data); // Debug log

      if (data.success) {
        fetchVehicles();
        setEditingVehicle(null);
        setFormData({ vehicle_number: '', vehicle_type: 'bus', total_seats: '' });
        setShowEditModal(false);
        alert('Vehicle updated successfully!');
      } else {
        alert(data.error || 'Failed to update vehicle');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Failed to update vehicle. Please try again.');
    }
  };

  // Delete vehicle
  const deleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/vehicles/delete.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vehicle_id: vehicleId }),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchVehicles();
        alert('Vehicle deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete vehicle');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Failed to delete vehicle. Please try again.');
    }
  };

  // Handle edit button click
  const handleEditClick = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicle_number: vehicle.vehicle_number,
      vehicle_type: vehicle.vehicle_type,
      total_seats: vehicle.total_seats
    });
    setShowEditModal(true);
  };

  // Update vehicle status
  const updateVehicleStatus = async (vehicleId, newStatus) => {
    try {
      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/vehicles/update.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle_id: vehicleId,
          status: newStatus
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchVehicles();
        alert('Vehicle status updated successfully!');
      } else {
        alert(data.error || 'Failed to update vehicle status');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Failed to update vehicle status. Please try again.');
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <AdminPageLayout 
      title="Vehicle Management"
      actionButton={
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-red text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          Add Vehicle
        </button>
      }
    >
      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Vehicle</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ vehicle_number: '', vehicle_type: 'bus', total_seats: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <AdminForm onSubmit={createVehicle} submitText="Add Vehicle">
              <FormGroup label="Vehicle Number">
                <FormInput
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                  required
                />
              </FormGroup>
              
              <FormGroup label="Vehicle Type">
                <FormSelect
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                >
                  <option value="bus">Bus</option>
                  <option value="taxi">Taxi</option>
                </FormSelect>
              </FormGroup>

              <FormGroup label="Total Seats">
                <FormInput
                  type="number"
                  value={formData.total_seats}
                  onChange={(e) => setFormData({...formData, total_seats: e.target.value})}
                  required
                />
              </FormGroup>
            </AdminForm>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Vehicle</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingVehicle(null);
                  setFormData({ vehicle_number: '', vehicle_type: 'bus', total_seats: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <AdminForm onSubmit={updateVehicle} submitText="Update Vehicle">
              <FormGroup label="Vehicle Number">
                <FormInput
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                  required
                />
              </FormGroup>
              
              <FormGroup label="Vehicle Type">
                <FormSelect
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                >
                  <option value="bus">Bus</option>
                  <option value="taxi">Taxi</option>
                </FormSelect>
              </FormGroup>

              <FormGroup label="Total Seats">
                <FormInput
                  type="number"
                  value={formData.total_seats}
                  onChange={(e) => setFormData({...formData, total_seats: e.target.value})}
                  required
                />
              </FormGroup>
            </AdminForm>
          </div>
        </div>
      )}

      {/* Vehicles List */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <AdminCard key={vehicle.vehicle_id}>
              <CardHeader
                title={vehicle.vehicle_number}
                subtitle={`Type: ${vehicle.vehicle_type}`}
                action={
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClick(vehicle)}
                      className="p-2 text-gray-600 hover:text-red rounded-lg hover:bg-gray-100"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteVehicle(vehicle.vehicle_id)}
                      className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                }
              />
              <CardBody>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Total Seats:</span> {vehicle.total_seats}
                  </p>
                  <div className="flex items-center justify-between">
                    <StatusBadge
                      status={vehicle.status}
                      type={vehicle.status === 'active' ? 'success' : 'error'}
                    />
                    <button
                      onClick={() => updateVehicleStatus(vehicle.vehicle_id, 
                        vehicle.status === 'active' ? 'inactive' : 'active')}
                      className="text-sm text-red hover:text-red-600"
                    >
                      Toggle Status
                    </button>
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

export default VehicleManagement;