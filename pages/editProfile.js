// import React, { useState,useEffect } from "react";

// function EditProfile() {
//   const [user, setUser] = useState('');
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [address, setAddress] = useState('');
//   const [DOB, setDOB] = useState('');
//   const [mobileNo, setMobileNo] = useState('');
//   const [education, setEducation] = useState('');
//   const [profilePic, setProfilePic] = useState('');  // Declare the profilePic state



//   useEffect(() => {
//     if (!localStorage.getItem("token")) {
//       router.push("/login");
//     } 
//   }, []);

//   useEffect(() => {
//     // Fetch user data from localStorage
//     const user = JSON.parse(localStorage.getItem('user'));

//     if (user) {
//       setUser(user);
//     }
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     if(name =='fullName'){
//         setFullName(e.target.value)
//     }
//   };

//   const handleImageChange = (e) => {
//     setProfilePic(URL.createObjectURL(e.target.files[0]));  // Update profilePic state
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert("Profile updated!");
//   };

//   return (
//     <div className="relative  min-h-screen ">
//             <img
//                 src="/bg.gif"
//                 alt="background"
//                 className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
//             />
//     <div className="max-w-md mx-auto    p-6 rounded-lg shadow-lg">

//       <h2 className="text-2xl font-semibold text-orange-500 text-center mb-6">Edit Profile</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="flex flex-col">
//           <label htmlFor="username" className="text-sm font-medium text-white mb-1">
//             fullName 
//           </label>
//           <input
//             type="text"
//             id="fullName"
//             name="fullName"
//             value={user?.fullName}
//             onChange={handleInputChange}
//             placeholder="Edit your fullName"
//             required
//             className="w-full p-3 rounded-md bg-white bg-opacity-20 text-white text-base mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
//           />
//         </div>

//         <div className="flex flex-col">
//           <label htmlFor="email" className="text-sm font-medium text-white mb-1">
//             Email
//           </label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             value={user?.email}
//             onChange={handleInputChange}
//             placeholder="Edit your email"
//             required
//             className="w-full p-3 rounded-md bg-white bg-opacity-20 text-white text-base mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
//           />
//         </div>
//         <div className="flex flex-col">
//           <label htmlFor="DOB" className="text-sm font-medium text-white mb-1">
//             Date Of Birth
//           </label>
//           <input
//             type="text"
//             id="DOB"
//             name="DOB"
//             value={user?.DOB}
//             onChange={handleInputChange}
//             placeholder="Edit your DOB"
//             required
//             className="w-full p-3 rounded-md bg-white bg-opacity-20 text-white text-base mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
//           />
//         </div>
//         <div className="flex flex-col">
//           <label htmlFor="address" className="text-sm font-medium text-white mb-1">
//             Address
//           </label>
//           <input
//             type="text"
//             id="address"
//             name="address"
//             value={user?.address}
//             onChange={handleInputChange}
//             placeholder="Edit your address"
//             required
//             className="w-full p-3 rounded-md bg-white bg-opacity-20 text-white text-base mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
//           />
//         </div>
//         <div className="flex flex-col">
//           <label htmlFor="mobileNo" className="text-sm font-medium text-white mb-1">
//             Mobile Number
//           </label>
//           <input
//             type="text"
//             id="mobileNo"
//             name="mobileNo"
//             value={user?.mobileNo}
//             onChange={handleInputChange}
//             placeholder="Edit your mobileNo"
//             required
//             className="w-full p-3 rounded-md bg-white bg-opacity-20 text-white text-base mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
//           />
//         </div>
//         <div className="flex flex-col">
//           <label htmlFor="education" className="text-sm font-medium text-white mb-1">
//           Education
//           </label>
//           <input
//             type="text"
//             id="education"
//             name="education"
//             value={user?.education}
//             onChange={handleInputChange}
//             placeholder="Edit your education"
//             required
//             className="w-full p-3 rounded-md bg-white bg-opacity-20 text-white text-base mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
//           />
//         </div>


//         <div className="flex flex-col">
//           <label htmlFor="profilePic" className="text-sm font-medium text-white mb-1">
//             Profile Picture
//           </label>
//           <input
//             type="file"
//             id="profilePic"
//             name="profilePic"
//             onChange={handleImageChange}
//             accept="image/*"
//             className="mb-3"
//           />
//           {profilePic && (
//             <img
//               src={profilePic}
//               alt="Profile Preview"
//               className="w-24 h-24 rounded-full object-cover mx-auto"
//             />
//           )}
//         </div>

//         <button
//           type="submit"
//           className="w-full p-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           Save Changes
//         </button>
//       </form>
//     </div>
//     </div>
//   );
// }

// export default EditProfile;


import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoIosArrowBack } from "react-icons/io";

function EditProfile() {
  const [user, setUser] = useState({});
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [DOB, setDOB] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [education, setEducation] = useState('');
  const [profileImg, setProfileImg] = useState('');
  const [profileImgFile, setProfileImgFile] = useState(null); // New: store actual file

  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      setFullName(userData.fullName || '');
      setEmail(userData.email || '');
      setAddress(userData.address || '');
      setDOB(userData.DOB || '');
      setMobileNo(userData.mobileNo || '');
      setEducation(userData.education || '');
      setProfileImg(userData.profileImg || '');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'fullName': setFullName(value); break;
      case 'email': setEmail(value); break;
      case 'address': setAddress(value); break;
      case 'DOB': setDOB(value); break;
      case 'mobileNo': setMobileNo(value); break;
      case 'education': setEducation(value); break;
      default: break;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file", { position: "top-center" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image too large. Max 10MB", { position: "top-center" });
        return;
      }
      setProfileImg(URL.createObjectURL(file)); // Preview
      setProfileImgFile(file); // Save for API upload
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("address", address);
      formData.append("DOB", DOB);
      formData.append("mobileNo", mobileNo);
      formData.append("education", education);
      if (profileImgFile) formData.append("profileImg", profileImgFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/signup`, {
        method: 'PUT',
        body: formData // Multer + Cloudinary will handle it
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully!");
        localStorage.setItem('user', JSON.stringify(data.user || {
          fullName, email, address, DOB, mobileNo, education, profileImg
        }));
        router.push("/profile");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const goBack = () => router.back();

  return (
    <div className="relative min-h-screen bg-black">
      <div className='absolute top-5 left-3 text-4xl text-white' onClick={goBack}><IoIosArrowBack /></div>
      <ToastContainer
        position="top-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* <img
        src="/bg.gif"
        alt="background"
        className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
      /> */}
      <div className=" md:p-8">
        <div className="m-8 bg-[#D2E9FA] rounded-lg shadow-lg ">
          <img
            src="/edittheme.jpg"
            alt="background"
            className="w-full h-24 rounded-lg "
          />

          <form onSubmit={handleSubmit} className="space-y-4 p-4 none md:flex">

            <div className="flex flex-col items-center  md:w-1/2">
              {profileImg && (
                <img
                  src={profileImg}
                  alt="Profile Preview"
                  className="w-36 h-36 rounded-full object-cover -mt-[4rem]"
                />
              )}
              <label htmlFor="profileImg" className="text-sm font-medium  mb-1">
                Profile Picture
              </label>
              <input
                type="file"
                id="profileImg"
                name="profileImg"
                onChange={handleImageChange}
                accept="image/*"
                className="mb-3"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl font-semibold text-black text-center mb-6">Edit Profile</h2>
              {/* Remaining fields (Full Name, Email, DOB, Address, MobileNo, Education) remain unchanged */}
              <div className="flex gap-4 p-2">
                <div className="flex flex-col w-1/2">
                  <label htmlFor="fullName" className="text-sm font-medium text-black mb-1">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={fullName}
                    onChange={handleInputChange}
                    placeholder="Edit your fullName"
                    required
                    className="w-full p-3 rounded-lg bg-white text-base mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>

                <div className="flex flex-col w-1/2">
                  <label htmlFor="email" className="text-sm font-medium  mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleInputChange}
                    placeholder="Edit your email"
                    required
                    className="w-full p-3 rounded-md bg-white text-base mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4 p-2">
                <div className="flex flex-col w-1/2">
                  <label htmlFor="mobileNo" className="text-sm font-medium mb-1">Mobile Number</label>
                  <input
                    type="text"
                    id="mobileNo"
                    name="mobileNo"
                    value={mobileNo}
                    onChange={handleInputChange}
                    placeholder="Edit your mobileNo"
                    required
                    className="w-full p-3 rounded-md bg-white text-base mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div className="flex flex-col w-1/2">
                  <label htmlFor="DOB" className="text-sm font-medium  mb-1">Date of Birth</label>
                  <input
                    type="text"
                    id="DOB"
                    name="DOB"
                    value={DOB}
                    onChange={handleInputChange}
                    placeholder="Edit your DOB"
                    required
                    className="w-full p-3 rounded-md bg-white  text-base mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex flex-col p-2">
                <label htmlFor="address" className="text-sm font-medium  mb-1">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={address}
                  onChange={handleInputChange}
                  placeholder="Edit your address"
                  required
                  className="w-full p-3 rounded-md bg-white  text-base mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>



              <div className="flex flex-col p-2">
                <label htmlFor="education" className="text-sm font-medium mb-1">Education</label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  value={education}
                  onChange={handleInputChange}
                  placeholder="Edit your education"
                  required
                  className="w-full p-3 rounded-md bg-white text-base mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Save Changes
              </button>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
