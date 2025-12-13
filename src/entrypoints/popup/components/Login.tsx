import { useAuth } from "@/providers/AuthProvider";
import { useAntd } from "@/providers/ThemeProvider";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import { Button, Form, Input, Segmented } from "antd";
import { useNavigate } from "react-router-dom";

const { ROUTES } = useAppConfig();

export default function Login() {
  const { signIn, signUp, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("signin");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { message } = useAntd();

  useEffect(() => {
    if (user) {
      navigate(ROUTES.HOME);
    }
  }, [user, navigate]);

  const onFinishSignIn = async (values: {
    email: string;
    password: string;
  }) => {
    const result = await signIn(values.email, values.password);
    if (result.success) {
      navigate(ROUTES.HOME);
      message.success("Successfully signed in!");
    } else {
      message.error(result.error.message || "Something went wrong");
    }
  };

  const onFinishSignUp = async (values: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }
    const result = await signUp(values.email, values.password);
    if (result.success) {
      setActiveTab("signin");
    } else {
      message.error(result.error.message || "Something went wrong");
    }
  };

  return loading ? (
    <>
      <Loader />
    </>
  ) : (
    <div className="glass">
      <Segmented
        value={activeTab}
        onChange={setActiveTab}
        options={[
          { label: "Login", value: "signin", icon: <BarsOutlined /> },
          { label: "Sign Up", value: "signup", icon: <AppstoreOutlined /> },
        ]}
        block
      />
      <Form
        name={activeTab === "signin" ? "login" : "signup"}
        onFinish={activeTab === "signin" ? onFinishSignIn : onFinishSignUp}
        className="space-y-2 pt-3"
      >
        {/* Email */}
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input placeholder="Email" />
        </Form.Item>

        {/* Password */}
        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please input your password!" },
            ...(activeTab === "signup"
              ? [
                  {
                    min: 6,
                    message: "Password must be at least 6 characters!",
                  },
                ]
              : []),
          ]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>

        {/* Confirm Password (Sign Up only) */}
        {activeTab === "signup" && (
          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm Password" />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {activeTab === "signin" ? "Sign In" : "Sign Up"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
