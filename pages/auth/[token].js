import { useRouter } from "next/router";
import { useEffect } from "react";

export default function AuthTokenPage() {
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    if (!token) return;

    const validate = async () => {
      try {
        const res = await fetch("/api/auth/validateToken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (!data.success) {
          alert(data.message || "Invalid link");
          router.push("/"); // back home
          return;
        }

        // store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // redirect based on profile status
        if (data.isProfileFilled) {
          router.push("/dashboard");
        } else {
          router.push("/fill-profile");
        }
      } catch (err) {
        console.error("Validation error:", err);
      }
    };

    validate();
  }, [token]);

  return <p>Loading...</p>;
}