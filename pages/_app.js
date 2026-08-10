

// import "@/styles/globals.css";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import AdminNav from "@/components/adminNav";
// import Navbar from "@/components/navbar";

// export default function App({ Component, pageProps }) {
//   const [user, setUser] = useState({ value: null });
//   const router = useRouter();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const userData = localStorage.getItem("user");

//     if (token && userData) {
//       try {
//         setUser({ value: token, ...JSON.parse(userData) });
//       } catch (err) {
//         console.error("Failed to parse user data", err);
//         setUser({ value: null });
//       }
//     } else {
//       setUser({ value: null });
//     }
//   }, [router.pathname]);

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setUser({ value: null });
//     router.push("/");
//   };

//   const isAdminRoute = router.pathname.startsWith("/admin");
//   const isHomeRoute = router.pathname === "/";

//   return (
//     <>
//       {isAdminRoute ? (
//         <div className="flex min-h-screen bg-cover" style={{ backgroundImage: "url('/bg.jpg')" }}>
//           <AdminNav />
//           <Component {...pageProps} user={user} Logout={logout} />
//         </div>
//       ) : (
//         <>

//         {isHomeRoute && <Navbar user={user} Logout={logout} />}

//           <Component {...pageProps} user={user} Logout={logout} />
//         </>
//       )}
//     </>
//   );
// }


import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminNav from "@/components/adminNav";
import Navbar from "@/components/navbar";
import Script from "next/script";
export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(undefined); // 👈 important
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser({ value: token, ...JSON.parse(userData) });
      } catch (err) {
        setUser(null); // 👈 invalid data
      }
    } else {
      setUser(null); // 👈 not logged in
    }
  }, [router.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser({ value: null });
    router.push("/");
  };

  const isAdminRoute = router.pathname.startsWith("/admin");
  const isHomeRoute = router.pathname === "/";

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-NW60GQ9NYE"
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-NW60GQ9NYE');
      `}
      </Script>
      {isAdminRoute ? (
        <div className="flex min-h-screen bg-cover" style={{ backgroundImage: "url('/bg.jpg')" }}>
          <AdminNav />
          <Component {...pageProps} user={user} Logout={logout} />
        </div>
      ) : (
        <>

          {isHomeRoute && <Navbar user={user} Logout={logout} />}

          <Component {...pageProps} user={user} Logout={logout} />
        </>
      )}
    </>
  );
}