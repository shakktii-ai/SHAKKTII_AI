import React, { useState } from 'react';

const EditPopup = ({ 
  user, 
  isOpen, 
  setIsOpen, 
  updateUserProfile, 
  setNewFullName, 
  setNewDOB, 
  setNewEmail, 
  setNewEducation, 
  setNewAddress, 
  setNewMobileNo, 
  newFullName, 
  newDOB, 
  newEmail, 
  newEducation, 
  newAddress, 
  newMobileNo  
}) => {
  if (!isOpen) return null; // Don't render the modal if it's closed

  // Optional state for error message (e.g. validation)
  const [errorMessage, setErrorMessage] = useState('');

  // Function to handle closing the modal when clicking outside
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  // Optional validation before saving the profile
  const handleSave = () => {
    if (!newFullName || !newDOB|| !newEmail || !newEducation || !newAddress || !newMobileNo) {
      setErrorMessage('All fields are required.');
      return;
    }

    // Clear error message if all fields are filled
    setErrorMessage('');
    updateUserProfile(); // Proceed with updating the profile
    setIsOpen(false); // Close modal after saving
  };

  return (
    <div 
      className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50"
      onClick={handleOutsideClick} // Close modal if clicked outside
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-1/2" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        
        {errorMessage && (
          <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Mobile No</label>
            <input
              type="text"
              value={newMobileNo}
              onChange={(e) => setNewMobileNo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Date Of Birth</label>
            <input
              type="text"
              value={newDOB}
              onChange={(e) => setNewDOB(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Education</label>
            <input
              type="text"
              value={newEducation}
              onChange={(e) => setNewEducation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
            />
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => setIsOpen(false)} // Close the modal
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!newFullName || !newDOB || !newEmail || !newEducation || !newAddress || !newMobileNo} // Disable button if fields are empty
            className={`px-4 py-2 text-white rounded-lg ${!newFullName || !newDOB || !newEmail || !newEducation || !newAddress || !newMobileNo ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#c3baf7] hover:bg-purple-600'}`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPopup;

