import { useEffect, useState } from "react";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Eye, EyeOff, } from "lucide-react";
import { clearAuthStatus, loginRequest } from "@/redux/actions/authActions";
import type { RootState } from "@/redux/reducers";

const SignSchema = yup.object({
  email: yup
    .string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net)$/i,
      "Enter a valid email"
    )
    .required("Email is required"),

  password: yup
    .string()
    .min(8, "Password must contain at least 8 characters")
    .required("Password is required"),
});


function Sign() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(clearAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (auth.status === "succeeded" && auth.flow === "login") {
      dispatch(clearAuthStatus());
      navigate("/dashboard");
    }
  }, [auth.flow, auth.status, dispatch, navigate]);

  const handleSignIn = async () => {
    const user = {
      email,
      password,
    };

    try {
      await SignSchema.validate(user, {
        abortEarly: false,
      });

      setErrors({});
      dispatch(loginRequest(user));
    }
    catch (err: any) {
      if (err.inner) {
        const validationErrors: Record<string, string> = {};

        err.inner.forEach((item: any) => {
          validationErrors[item.path] = item.message;
        });

        setErrors(validationErrors);
      } else {
        console.error(err);

        alert("Something went wrong");
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-blue-200">
   <div className="flex min-h-screen items-center justify-center px-4 py-4 sm:px-6">
  <Card className="w-full max-w-6xl overflow-hidden rounded-3xl border-0 shadow-2xl sm:rounded-[40px]">
    <div className="grid bg-slate-100 lg:grid-cols-2">
      

            {/* Left Section */}
            <div className="relative hidden min-h-[620px] flex-col justify-center overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 p-8 text-white lg:flex xl:p-10">
              <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
              <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-indigo-900/20" />

              <div className="relative">
                {/* <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-xl backdrop-blur">
                  {/* <Sparkles className="h-7 w-7 text-yellow-200" /> */}
              
                <h1 className="text-4xl font-black leading-tight tracking-tight xl:text-5xl">Hello,<br />Welcome!</h1>
                <p className="mt-5 max-w-sm text-lg leading-relaxed text-blue-100">
                  Sign in to continue managing your courses, assignments, attendance and results.
                </p>
                <div className="mt-8 space-y-3 text-sm font-medium text-blue-50">
                  {["Your academic dashboard in one place", "Simple and secure account access"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-300" /> {item}
                    </div>
                  ))}
                </div>
                <p className="mt-10 text-sm text-blue-100">Don't have an account?</p>
                <Link to="/create" className="mt-3 inline-flex rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur transition hover:bg-white hover:text-blue-600">
                  Create Account
                </Link>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex flex-col justify-center bg-slate-100 p-6 sm:p-8 lg:p-10">
              <div className="mb-6 text-center sm:mb-8">
                <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                  Sign In
                </h2>
              </div>

              <div className="space-y-5">

                {/* Email */}
                <div>
                  <label className="block text-10 font-semibold text-slate-700 mb-3">
                    Email
                  </label>

                 <Input
  className={`w-full h-14 rounded-xl text-base px-4 ${
    error.email
      ? "border-red-500 ring-2 ring-red-200"
      : ""
  }`}
  placeholder="Enter email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    setErrors((prev) => ({
      ...prev,
      email: "",
    }));
  }}
/>
                  
                </div>

                {/* Password */}
                <div>
                  <label className="block text-10 font-semibold text-slate-700 mb-2">
                    Password
                  </label>

                  <div className="relative">
                   <Input
  type={showPassword ? "text" : "password"}
  className={`w-full h-14 rounded-xl text-base px-4 pr-12 ${
    error.password
      ? "border-red-500 ring-2 ring-red-200"
      : ""
  }`}
  placeholder="Enter password"
  value={password}
  onChange={(e) => {
    setPassword(e.target.value);
    setErrors((prev) => ({
      ...prev,
      password: "",
    }));
  }}
/>

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
              
                </div>

                {/* Button */}
                {auth.error && (
                  <p className="text-sm font-medium text-red-600">
                    {auth.error}
                  </p>
                )}

                <Button
                  className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold"
                  disabled={auth.loading}
                  onClick={handleSignIn}
                >
                  {auth.loading ? "Signing In..." : "Sign In"}
                </Button>

                {/* Footer */}
                <div className="text-center text-sm text-slate-600">
                  New User?
                  <Link
                    to="/create"
                    className="ml-1 font-semibold text-blue-600"
                  >
                    Create Account
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </Card>
      </div>
</div>
  );
}

export default Sign;
