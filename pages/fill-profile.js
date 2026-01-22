// import ProfileForm from "../components/ProfileForm";

// export default function FillProfile() {
//   return <ProfileForm mode="fill" />;
// }


// // /pages/fill-profile.js
// import { useEffect } from "react";
// import { useRouter } from "next/router";
// import ProfileForm from "../components/ProfileForm";

// export default function FillProfilePage() {
//   const router = useRouter();

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       const user = JSON.parse(storedUser);

//       // ✅ Check if profile already completed
//       if (user.fullName && user.mobileNo) {
//         router.push("/dashboard"); // redirect automatically
//       }
//     }
//   }, [router]);

//   return <ProfileForm mode="fill" />;
// }

// // /pages/fill-profile.js
// import { useEffect } from "react";
// import { useRouter } from "next/router";
// import ProfileForm from "../components/ProfileForm";

// export default function FillProfilePage() {
//   const router = useRouter();

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       const user = JSON.parse(storedUser);
//       if (user.fullName && user.mobileNo && user.address) {
//         router.push("/dashboard");
//       }
//     }
//   }, [router]);

//   return <ProfileForm mode="fill" />;
// }


// /pages/fill-profile.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import ProfileForm from "../components/ProfileForm";

export default function FillProfilePage() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.fullName && user.mobileNo && user.address) {
        router.push("/dashboard");
      }
    }
  }, [router]);

  return <ProfileForm mode="fill" />;
}
