import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Joi from "joi";
import api from "@/lib/api";
import { useStore } from "@/store/useStore";

// Joi validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Email is required",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrors({});
    setLoading(true);

    // Validate form
    const { error } = loginSchema.validate(
      { email, password },
      { abortEarly: false }
    );
    if (error) {
      const newErrors: { email?: string; password?: string } = {};
      error.details.forEach((err) => {
        newErrors[err.context!.key as keyof typeof newErrors] = err.message;
      });
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Firebase login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();

      // API login
      const res = await api.post(
        "/auth/login",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update store and localStorage
      useStore.setState({ user: res.data });
      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("firebaseToken", token);

      navigate("/");
    } catch (err) {
      const error = err as { code?: string; message?: string };
      const message =
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
          ? "Invalid email or password"
          : error.message || "Login failed";
      setErrors({ password: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen">
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              TeamFlow
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Sign in to your account
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@team.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full h-12 text-lg"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
