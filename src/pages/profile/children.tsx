import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getChildren, addChild } from '@/lib/api';

const ChildrenManagement = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // New child form state
  const [newChild, setNewChild] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: '',
    allergies: '',
    special_needs: '',
    emergency_contact: '',
    program_id: '',
  });
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editChildId, setEditChildId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchChildren();
    }
  }, [user]);

  const fetchChildren = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await getChildren(user.id);
      if (error) throw error;
      
      setChildren(data || []);
    } catch (error) {
      console.error('Error fetching children:', error);
      setMessage({ type: 'error', text: 'Failed to load children data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChild(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setIsAdding(true);
    setMessage({ type: '', text: '' });
    
    try {
      const childData = {
        ...newChild,
        parent_id: user.id,
      };
      
      const { data, error } = await addChild(childData);
      if (error) throw error;
      
      // Add new child to the list
      setChildren(prev => [...prev, data]);
      
      // Reset form
      setNewChild({
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
        allergies: '',
        special_needs: '',
        emergency_contact: '',
        program_id: '',
      });
      
      setMessage({ type: 'success', text: 'Child added successfully' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding child:', error);
      setMessage({ type: 'error', text: 'Failed to add child' });
      setIsAdding(false);
    }
  };

  const handleEditChild = (child) => {
    setNewChild({
      first_name: child.first_name,
      last_name: child.last_name,
      birth_date: child.birth_date,
      gender: child.gender,
      allergies: child.allergies || '',
      special_needs: child.special_needs || '',
      emergency_contact: child.emergency_contact || '',
      program_id: child.program_id || '',
    });
    setEditChildId(child.id);
    setIsEditMode(true);
  };

  const handleUpdateChild = async (e) => {
    e.preventDefault();
    if (!user || !editChildId) return;
    
    setIsAdding(true);
    setMessage({ type: '', text: '' });
    
    try {
      const childData = {
        ...newChild,
        parent_id: user.id,
      };
      
      const { data, error } = await updateChild(editChildId, childData);
      if (error) throw error;
      
      // Update child in the list
      setChildren(prev => 
        prev.map(child => child.id === editChildId ? data : child)
      );
      
      // Reset form and edit mode
      setNewChild({
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
        allergies: '',
        special_needs: '',
        emergency_contact: '',
        program_id: '',
      });
      setIsEditMode(false);
      setEditChildId(null);
      
      setMessage({ type: 'success', text: 'Child updated successfully' });
    } catch (error) {
      console.error('Error updating child:', error);
      setMessage({ type: 'error', text: 'Failed to update child' });
    } finally {
      setIsAdding(false);
    }
  };

  const cancelEdit = () => {
    setNewChild({
      first_name: '',
      last_name: '',
      birth_date: '',
      gender: '',
      allergies: '',
      special_needs: '',
      emergency_contact: '',
      program_id: '',
    });
    setIsEditMode(false);
    setEditChildId(null);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading children data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Children Management</h1>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      {/* Children List */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">My Children</h2>
        
        {children.length === 0 ? (
          <p className="text-gray-500">No children added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map(child => (
              <div key={child.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{child.first_name} {child.last_name}</h3>
                    <p className="text-gray-600">Birth Date: {new Date(child.birth_date).toLocaleDateString()}</p>
                    <p className="text-gray-600">Gender: {child.gender}</p>
                    
                    {child.allergies && (
                      <p className="text-gray-600 mt-2">
                        <span className="font-semibold">Allergies:</span> {child.allergies}
                      </p>
                    )}
                    
                    {child.special_needs && (
                      <p className="text-gray-600">
                        <span className="font-semibold">Special Needs:</span> {child.special_needs}
                      </p>
                    )}
                    
                    {child.emergency_contact && (
                      <p className="text-gray-600">
                        <span className="font-semibold">Emergency Contact:</span> {child.emergency_contact}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleEditChild(child)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add/Edit Child Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {isEditMode ? 'Edit Child' : 'Add New Child'}
        </h2>
        
        <form onSubmit={isEditMode ? handleUpdateChild : handleAddChild}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first_name">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={newChild.first_name}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="last_name">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={newChild.last_name}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="birth_date">
                Birth Date
              </label>
              <input
                id="birth_date"
                name="birth_date"
                type="date"
                value={newChild.birth_date}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={newChild.gender}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="allergies">
              Allergies
            </label>
            <textarea
              id="allergies"
              name="allergies"
              value={newChild.allergies}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="2"
              placeholder="List any allergies or write 'None'"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="special_needs">
              Special Needs
            </label>
            <textarea
              id="special_needs"
              name="special_needs"
              value={newChild.special_needs}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="2"
              placeholder="List any special needs or write 'None'"
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="emergency_contact">
              Emergency Contact
            </label>
            <input
              id="emergency_contact"
              name="emergency_contact"
              type="text"
              value={newChild.emergency_contact}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Name and phone number"
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            {isEditMode && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isAdding}
            >
              {isAdding ? 'Saving...' : isEditMode ? 'Update Child' : 'Add Child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChildrenManagement;
