import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import AdminPageLayout from '../components/AdminPageLayout';
import { AdminForm, FormGroup, FormInput } from '../components/AdminForm';
import { AdminCard, CardHeader, CardBody } from '../components/AdminCard';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    from_location: '',
    to_location: '',
    distance: '',
    estimated_time: ''
  });
  const [editingRoute, setEditingRoute] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch routes
  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/routes/list.php');
      const data = await response.json();
      if (data.success) {
        setRoutes(data.routes);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
    setLoading(false);
  };

  // Create route
  const createRoute = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/routes/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_location: formData.from_location,
          to_location: formData.to_location,
          distance: formData.distance,
          estimated_time: formData.estimated_time
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        fetchRoutes();
        setFormData({ from_location: '', to_location: '', distance: '', estimated_time: '' });
        setShowAddModal(false);
        alert('Route created successfully!');
      } else {
        alert(data.error || 'Failed to create route');
      }
    } catch (error) {
      console.error('Error creating route:', error);
      alert('Failed to create route. Please try again.');
    }
  };

  // Handle edit button click
  const handleEditClick = (route) => {
    setEditingRoute(route);
    setFormData({
      from_location: route.from_location,
      to_location: route.to_location,
      distance: route.distance,
      estimated_time: route.estimated_time
    });
    setShowEditModal(true);
  };

  // Update route function
  const updateRoute = async (e) => {
    e.preventDefault();
    if (!editingRoute) return;

    try {
      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/routes/update.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route_id: editingRoute.route_id,
          from_location: formData.from_location,
          to_location: formData.to_location,
          distance: parseFloat(formData.distance),
          estimated_time: parseInt(formData.estimated_time)
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchRoutes();
        setEditingRoute(null);
        setFormData({ from_location: '', to_location: '', distance: '', estimated_time: '' });
        setShowEditModal(false);
        alert('Route updated successfully!');
      } else {
        alert(data.error || 'Failed to update route');
      }
    } catch (error) {
      console.error('Error updating route:', error);
      alert('Failed to update route. Please try again.');
    }
  };

  // Add deleteRoute function (frontend only)
  const deleteRoute = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route? This will also cancel any associated schedules.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/routes/delete.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ route_id: routeId }),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchRoutes();
        alert('Route deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete route');
      }
    } catch (error) {
      console.error('Error deleting route:', error);
      alert('Failed to delete route. Please try again.');
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return (
    <AdminPageLayout 
      title="Route Management"
      actionButton={
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-red text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          Add Route
        </button>
      }
    >
      {/* Add Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Route</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ from_location: '', to_location: '', distance: '', estimated_time: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <AdminForm onSubmit={createRoute} submitText="Add Route">
              <FormGroup label="From Location">
                <FormInput
                  value={formData.from_location}
                  onChange={(e) => setFormData({...formData, from_location: e.target.value})}
                  required
                />
              </FormGroup>
              
              <FormGroup label="To Location">
                <FormInput
                  value={formData.to_location}
                  onChange={(e) => setFormData({...formData, to_location: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup label="Distance (km)">
                <FormInput
                  type="number"
                  step="0.01"
                  value={formData.distance}
                  onChange={(e) => setFormData({...formData, distance: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup label="Estimated Time (minutes)">
                <FormInput
                  type="number"
                  value={formData.estimated_time}
                  onChange={(e) => setFormData({...formData, estimated_time: e.target.value})}
                  required
                />
              </FormGroup>
            </AdminForm>
          </div>
        </div>
      )}

      {/* Edit Route Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Route</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRoute(null);
                  setFormData({ from_location: '', to_location: '', distance: '', estimated_time: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <AdminForm onSubmit={updateRoute} submitText="Update Route">
              <FormGroup label="From Location">
                <FormInput
                  value={formData.from_location}
                  onChange={(e) => setFormData({...formData, from_location: e.target.value})}
                  required
                />
              </FormGroup>
              
              <FormGroup label="To Location">
                <FormInput
                  value={formData.to_location}
                  onChange={(e) => setFormData({...formData, to_location: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup label="Distance (km)">
                <FormInput
                  type="number"
                  step="0.01"
                  value={formData.distance}
                  onChange={(e) => setFormData({...formData, distance: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup label="Estimated Time (minutes)">
                <FormInput
                  type="number"
                  value={formData.estimated_time}
                  onChange={(e) => setFormData({...formData, estimated_time: e.target.value})}
                  required
                />
              </FormGroup>
            </AdminForm>
          </div>
        </div>
      )}

      {/* Routes List */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <AdminCard key={route.route_id}>
              <CardHeader
                title={`${route.from_location} → ${route.to_location}`}
                action={
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClick(route)}
                      className="p-2 text-gray-600 hover:text-red rounded-lg hover:bg-gray-100"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRoute(route.route_id)}
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
                    <span className="font-medium">Distance:</span> {route.distance} km
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Estimated Time:</span> {route.estimated_time} minutes
                  </p>
                </div>
              </CardBody>
            </AdminCard>
          ))}
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default RouteManagement;