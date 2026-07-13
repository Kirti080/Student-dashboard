import { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft, BookOpen, Camera, CheckCircle2, Eye, EyeOff,
  GraduationCap, Hash, Mail, Phone, User,
} from "lucide-react";
import {
  clearAuthStatus,
  registerRequest,
} from "@/redux/actions/authActions";
import type { RootState } from "@/redux/reducers";

const CreateSchema = yup.object({
  name: yup.string().required("Name is required"),

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

  confirm: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),

  phone: yup.string().required("Phone number is required"),
  program: yup.string().required("Program is required"),
  semester: yup.string().required("Semester is required"),
  rollNo: yup.string().required("Roll number is required"),
});

function Create() {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<Record<string, string>>({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  useEffect(() => () => {
    if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
  }, [profileImagePreview]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError((current) => ({ ...current, profileImage: "Choose a JPG, PNG or WebP image" }));
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError((current) => ({ ...current, profileImage: "Profile image must be smaller than 5 MB" }));
      event.target.value = "";
      return;
    }

    if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
    setError((current) => ({ ...current, profileImage: "" }));
  };

  useEffect(() => {
    dispatch(clearAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (auth.status === "succeeded" && auth.flow === "register") {
      dispatch(clearAuthStatus());
      navigate("/");
    }
  }, [auth.flow, auth.status, dispatch, navigate]);

  const handleSignup = async () => {
  const user = {
    name: username,
    email,
    phone,
    program,
    semester,
    rollNo,
    password,
    confirm: ConfirmPassword,
  };

  try {
    setError({});

    await CreateSchema.validate(user, {
      abortEarly: false,
    });

    dispatch(
      registerRequest({
        name: username,
        email,
        phone,
        program,
        semester,
        rollNo,
        password,
        profileImage: profileImageFile,
      })
    );

  } catch (err: any) {

    if (err.inner) {
      const errors: Record<string, string> = {};

      err.inner.forEach((item: any) => {
        errors[item.path] = item.message;
      });

      setError(errors);
    } else {
      console.error(err);

      // alert("Something went wrong");
    }
  }
};

  const fieldClass = (field: string) =>
    `h-11 rounded-xl border-slate-200 bg-white pl-11 text-sm shadow-sm transition focus-visible:border-blue-500 focus-visible:ring-blue-100 ${
      error[field] ? "border-red-500 ring-2 ring-red-100" : ""
    }`;

  const validationMessage = (field: string) =>
    error[field] ? <p className="mt-1.5 text-xs font-medium text-red-600">{error[field]}</p> : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-200 px-4 py-4 sm:px-6 lg:h-screen lg:overflow-hidden">
      <Card className="mx-auto w-full max-w-7xl overflow-hidden rounded-[36px] border-0 bg-white shadow-2xl shadow-blue-900/15 lg:h-full">
        <div className="grid h-full lg:grid-cols-[0.72fr_1.28fr]">
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
            <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-indigo-900/20" />

            <Link to="/" className="relative inline-flex w-fit items-center gap-2 text-sm font-semibold text-blue-50 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>

            <div className="relative">
              {/* <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-xl backdrop-blur">
                <Sparkles className="h-7 w-7 text-yellow-200" />
              </div> */}
              <h1 className="text-5xl font-black leading-tight tracking-tight">Join your<br />Student Portal</h1>
              <p className="mt-5 max-w-sm text-lg leading-relaxed text-blue-100">
                Create your academic profile and keep courses, assignments, attendance and results together.
              </p>
              <div className="mt-9 space-y-3 text-sm font-medium text-blue-50">
                {["One profile for your academic details", "Quick access to your dashboard", "Secure account and password controls"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-300" /> {item}
                  </div>
                ))}
              </div>
            </div>

            <p className="relative text-sm text-blue-100">
              Already registered? <Link to="/" className="font-bold text-white underline-offset-4 hover:underline">Sign in</Link>
            </p>
          </section>

          <section className="flex flex-col justify-center bg-slate-50/80 p-5 sm:p-7 lg:p-8 xl:p-10">
            <div className="mx-auto w-full max-w-3xl">
              <div className="mb-4 text-center lg:text-left">
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Student Portal</p>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">Create Account</h2>
                <p className="mt-1 text-sm text-slate-500">Add your details to set up your academic profile.</p>
              </div>

              <div className="mb-4 flex flex-col items-center gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:flex-row">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg ring-4 ring-white">
                  {profileImagePreview ? <img src={profileImagePreview} alt="Profile preview" className="h-full w-full object-cover" /> : <User className="h-7 w-7" />}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-slate-900">Profile photo</h3>
                  <p className="mt-0.5 text-xs text-slate-500">Choose a clear JPG or PNG image for your profile.</p>
                  <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} className="hidden" />
                  <button type="button" onClick={() => imageInputRef.current?.click()} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-600 hover:text-white">
                    <Camera className="h-4 w-4" /> {profileImagePreview ? "Change photo" : "Add photo"}
                  </button>
                  {error.profileImage && <p className="mt-1.5 text-xs font-medium text-red-600">{error.profileImage}</p>}
                </div>
              </div>

              <form onSubmit={(event) => { event.preventDefault(); handleSignup(); }} className="space-y-3">
                <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
                  {[
                    { label: "Full Name", field: "name", value: username, setter: setUsername, placeholder: "Enter full name", icon: User },
                    { label: "Email Address", field: "email", value: email, setter: setEmail, placeholder: "Enter email", icon: Mail },
                    { label: "Phone Number", field: "phone", value: phone, setter: setPhone, placeholder: "Enter phone number", icon: Phone },
                    { label: "Program", field: "program", value: program, setter: setProgram, placeholder: "e.g. B.Tech CSE", icon: BookOpen },
                    { label: "Semester", field: "semester", value: semester, setter: setSemester, placeholder: "e.g. 6th Semester", icon: GraduationCap },
                    { label: "Roll Number", field: "rollNo", value: rollNo, setter: setRollNo, placeholder: "Enter roll number", icon: Hash },
                  ].map(({ label, field, value, setter, placeholder, icon: Icon }) => (
                    <div key={field}>
                      <label className="mb-1 block text-sm font-bold text-slate-700">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
                        <Input className={fieldClass(field)} placeholder={placeholder} value={value} onChange={(event) => { setter(event.target.value); setError((current) => ({ ...current, [field]: "" })); }} />
                      </div>
                      {validationMessage(field)}
                    </div>
                  ))}
                </div>

                <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
                  {[
                    { label: "Password", field: "password", value: password, setter: setPassword, visible: showPassword, toggle: setShowPassword },
                    { label: "Confirm Password", field: "confirm", value: ConfirmPassword, setter: setConfirmPassword, visible: showConfirmPassword, toggle: setShowConfirmPassword },
                  ].map(({ label, field, value, setter, visible, toggle }) => (
                    <div key={field}>
                      <label className="mb-1 block text-sm font-bold text-slate-700">{label}</label>
                      <div className="relative">
                        <Input type={visible ? "text" : "password"} className={`${fieldClass(field)} pl-4 pr-11`} placeholder={field === "password" ? "Minimum 8 characters" : "Repeat your password"} value={value} onChange={(event) => { setter(event.target.value); setError((current) => ({ ...current, [field]: "" })); }} />
                        <button type="button" onClick={() => toggle(!visible)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600" aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
                          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {validationMessage(field)}
                    </div>
                  ))}
                </div>

                {auth.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 ring-1 ring-red-100">{auth.error}</p>}

                <Button type="submit" className="h-13 w-full rounded-xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-[0.99]" disabled={auth.loading}>
                  {auth.loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-600 lg:hidden">
                Already have an account? <Link to="/" className="font-bold text-blue-600">Sign In</Link>
              </p>
            </div>
          </section>
        </div>
      </Card>
    </main>
  );
}

export default Create;
