import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Forms/Input/Input";
import Field from "../../components/Forms/Field";
import CustomButton from "../../components/Forms/Buttons/CustomButton";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { apiRequestOpen } from "../../services/apiBinding";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import { PATH } from "../../utils/pagePath";
import SelectField from "../../components/Forms/Select/Select";
import { useFirmSwitch } from "./useFirmSwitch";
import { resetSession } from "../../utils/lib/sessionController";
import MicrosoftLogin from "./MicrosoftLogin";

/* =========================================================
   LOGIN FORM
========================================================= */

const LoginForm = ({ control, errors }) => (
  <>
    <Field
      controller={{
        name: "userName",
        control,
        rules: {
          required: "Username is required.",
        },
        render: ({ field }) => (
          <Input
            {...field}
            type="icon"
            iconName="pi-user"
            featureName="login-input"
            placeholder="Username"
            invalid={errors?.userName}
          />
        ),
      }}
    />

    <Field
      controller={{
        name: "password",
        control,
        rules: {
          required: "Password is required.",
        },
        render: ({ field }) => (
          <Input
            {...field}
            type="password"
            iconName="pi-lock z-90!"
            featureName="login-input"
            placeholder="Password"
            invalid={errors?.password}
          />
        ),
      }}
    />
  </>
);

/* =========================================================
   OTP FORM
========================================================= */

const OtpForm = ({ userName, token, setTokens }) => (
  <>
    <div className="flex flex-col mb-4">
      <p className="text-sm text-(--border-inverse)">
        We have sent an OTP to your email linked with
      </p>

      <p className="font-bold">{userName}</p>
    </div>

    <Input
      integerOnly
      featureName="otp"
      type="otp"
      length={6}
      value={token}
      onChange={(e) => setTokens(e.value)}
    />
  </>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Login = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("login");

  const [token, setTokens] = useState("");

  const [firms, setFirms] = useState([]);

  const [selectedFirm, setSelectedFirm] = useState(null);

  const [loginUserName, setLoginUserName] = useState("");

  /* -------------------- ANIMATION -------------------- */

  const [animate, setAnimate] = useState(false);

  const [direction, setDirection] = useState(1);

  const changeStep = (nextStep, dir = 1) => {
    setDirection(dir);

    setAnimate(true);

    setTimeout(() => {
      setStep(nextStep);
      setAnimate(false);
    }, 250);
  };

  /* =========================================================
     FORM
  ========================================================= */

  const {
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userName: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const userName = watch("userName");

  /* =========================================================
     MICROSOFT LOGIN CONFIRMATION
  ========================================================= */

  const microsoftConfirmationMutation = useMutation({
    mutationFn: async (code) => {
      return apiRequestOpen({
        apiPath: `User/microsoft-login-confirmation?code=${encodeURIComponent(
          code,
        )}`,
        method: "get",
      });
    },

    onSuccess: (response) => {
      console.log("Microsoft confirmation response:", response);

      const firmsData = response?.firms || [];

      /* -------------------- TOKEN -------------------- */

      if (!response?.token) {
        toast.error("Microsoft login token not received.");
        return;
      }

      /* -------------------- SAVE AUTH DATA -------------------- */

      localStorage.setItem("auth-firms", JSON.stringify(firmsData));

      const microsoftUserName = response?.userName || response?.email || "";

      setLoginUserName(microsoftUserName);

      localStorage.setItem("userName", microsoftUserName);

      localStorage.setItem("email", response?.email || "");

      /* -------------------- RESET SESSION -------------------- */

      resetSession();

      /* -------------------- REMOVE CODE FROM URL -------------------- */

      window.history.replaceState({}, document.title, window.location.pathname);

      /* =====================================================
         SINGLE FIRM
      ===================================================== */

      if (firmsData.length === 1) {
        const firm = firmsData[0];

        localStorage.setItem("token", response.token);
        localStorage.setItem("selected-firm", JSON.stringify(firm));

        toast.success("Login successful!");

        navigate("/home/dashboard");

        return;
      }

      /* =====================================================
         MULTIPLE FIRMS
      ===================================================== */

      if (firmsData.length > 1) {
        setFirms(firmsData);
        localStorage.setItem("firm-token", response.token);
        setSelectedFirm(null);

        changeStep("firm", 1);

        return;
      }

      /* =====================================================
         NO FIRM
      ===================================================== */

      toast.error("No firm assigned.");
    },

    onError: (error) => {
      console.error("Microsoft confirmation error:", error);

      toast.error(error || "Microsoft login confirmation failed.");

      /* Remove code from URL even when API fails */

      window.history.replaceState({}, document.title, window.location.pathname);
    },
  });

  /* =========================================================
     MICROSOFT CALLBACK
  ========================================================= */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const code = params.get("code");

    if (!code) {
      return;
    }

    console.log("Microsoft callback code received");

    microsoftConfirmationMutation.mutate(code);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
     NORMAL LOGIN
  ========================================================= */

  const sendOtpMutation = useMutation({
    mutationFn: async (payload) => {
      const ssid = localStorage.getItem("SSID");

      if (ssid) {
        payload = {
          ssid,
          ...payload,
        };
      }

      return apiRequestOpen({
        apiPath: ENDPOINTS.LOGIN,
        method: "post",
        payload,
      });
    },

    onSuccess: (response) => {
      localStorage.setItem("SSID", response.ssid);

      if (response.tfaRequired) {
        changeStep("otp", 1);
      }
    },

    onError: (error) => {
      toast.error(error || "Login failed.");
    },
  });

  /* =========================================================
     VERIFY OTP
  ========================================================= */

  const verifyOtpMutation = useMutation({
    mutationFn: async (payload) => {
      return apiRequestOpen({
        apiPath: ENDPOINTS.VERIFY_OTP,
        method: "post",
        payload,
      });
    },

    onSuccess: (response) => {
      const firmsData = response?.firms || [];

      /* -------------------- SAVE AUTH DATA -------------------- */

      localStorage.setItem("auth-firms", JSON.stringify(firmsData));

      setLoginUserName(response?.userName || response?.email || userName);

      localStorage.setItem("userName", response?.userName || userName);

      localStorage.setItem("email", response?.email || "");

      resetSession();

      /* =====================================================
         SINGLE FIRM
      ===================================================== */

      if (firmsData.length === 1) {
        const firm = firmsData[0];

        localStorage.setItem("token", response.token);

        localStorage.setItem("selected-firm", JSON.stringify(firm));

        toast.success("Login successful!");

        navigate("/home/dashboard");

        return;
      }

      /* =====================================================
         MULTIPLE FIRMS
      ===================================================== */

      if (firmsData.length > 1) {
        setFirms(firmsData);
        localStorage.setItem("firm-token", response.token);
        setSelectedFirm(null);

        changeStep("firm", 1);

        return;
      }

      /* =====================================================
         NO FIRM
      ===================================================== */

      toast.error("No firm assigned.");
    },

    onError: (error) => {
      console.log("error", error);

      if (error?.isGlobalErrorHandled) {
        return;
      }

      toast.error(error || "OTP verification failed.");
    },
  });

  /* =========================================================
     RESEND OTP
  ========================================================= */

  const resendOtpMutation = useMutation({
    mutationFn: async (payload) => {
      const ssid = localStorage.getItem("SSID");

      if (ssid) {
        payload = {
          ssid,
          ...payload,
        };
      }

      return apiRequestOpen({
        apiPath: ENDPOINTS.LOGIN,
        method: "post",
        payload,
      });
    },

    onSuccess: () => {
      toast.success("OTP resent successfully");
    },

    onError: (error) => {
      toast.error(error || "Failed to resend OTP.");
    },
  });

  /* =========================================================
     FIRM SWITCH
  ========================================================= */

  const firmMutation = useFirmSwitch({
    showSuccessToast: false,
    showErrorToast: false,

    onSuccess: () => {
      resetSession();

      navigate("/home/dashboard");
    },

    onError: (error) => {
      toast.error(error || "Firm selection failed.");
    },
  });

  /* =========================================================
     BACK HANDLER
  ========================================================= */

  const handleBack = () => {
    /*
      Both OTP and Firm Selection should go directly
      back to the Login screen.
    */

    if (step === "otp" || step === "firm") {
      setTokens("");

      setSelectedFirm(null);

      setValue("password", "");

      changeStep("login", -1);
    }
  };

  /* =========================================================
     SEND OTP
  ========================================================= */

  const onSendOTP = (payload) => {
    setLoginUserName(payload?.userName || "");

    sendOtpMutation.mutate(payload);
  };

  /* =========================================================
     VERIFY OTP
  ========================================================= */

  const onVerifyOTP = (payload) => {
    verifyOtpMutation.mutate({
      ...payload,

      code: token.trim(),

      ssid: localStorage.getItem("SSID"),
    });
  };

  /* =========================================================
     RESEND OTP
  ========================================================= */

  const onResendOtp = () => {
    const payload = getValues();

    resendOtpMutation.mutate(payload);
  };

  /* =========================================================
     FIRM SUBMIT
  ========================================================= */

  const handleFirmSubmit = () => {
    if (!selectedFirm) {
      toast.error("Please select a firm");

      return;
    }

    firmMutation.mutate({
      firm: selectedFirm,

      userName: loginUserName || userName,
    });
  };

  /* =========================================================
     MICROSOFT CALLBACK LOADING SCREEN
  ========================================================= */

  const isMicrosoftCallback = new URLSearchParams(window.location.search).has(
    "code",
  );

  if (isMicrosoftCallback && microsoftConfirmationMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-10">
        <i className="pi pi-spin pi-spinner text-2xl mb-3" />

        <p className="text-sm text-gray-500">
          Signing you in with Microsoft...
        </p>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="flex flex-col items-start w-full text-(--background-secondary)">
      <form
        onSubmit={handleSubmit(
          step === "login"
            ? onSendOTP
            : step === "otp"
              ? onVerifyOTP
              : handleFirmSubmit,
        )}
        className="flex flex-col gap-2 w-full"
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex items-center gap-3">
          {step !== "login" && (
            <i
              onClick={handleBack}
              className="pi pi-arrow-left cursor-pointer"
              style={{
                fontSize: "1rem",
              }}
            />
          )}

          <h3 className="text-(--foreground-dark) text-lg! py-5 transition-all duration-300">
            {step === "login" && (
              <>
                <p className="text-lg">Welcome</p>

                <p className="text-xs text-(--border-inverse)">
                  Sign in to your account to continue
                </p>
              </>
            )}

            {step === "otp" && "Enter OTP"}

            {step === "firm" && "Select Firm"}
          </h3>
        </div>

        {/* =====================================================
            STEP UI
        ===================================================== */}

        <div
          className={`
            transition-all
            duration-300
            ease-out
            ${
              animate
                ? direction === 1
                  ? "-translate-x-10 opacity-0 scale-95"
                  : "translate-x-10 opacity-0 scale-95"
                : "translate-x-0 opacity-100 scale-100"
            }
          `}
        >
          {/* ===================================================
              LOGIN
          =================================================== */}

          {step === "login" && <LoginForm control={control} errors={errors} />}

          {/* ===================================================
              OTP
          =================================================== */}

          {step === "otp" && (
            <OtpForm
              userName={userName || loginUserName}
              token={token}
              setTokens={setTokens}
            />
          )}

          {/* ===================================================
              FIRM
          =================================================== */}

          {step === "firm" && (
            <div className="flex flex-col gap-4 w-full mt-2">
              <div className="flex flex-col gap-1">
                <p className="text-lg font-semibold">Select Your Firm</p>

                <p className="text-xs text-gray-500">
                  Choose the firm you want to continue with
                </p>
              </div>

              <SelectField
                name="firm"
                placeholder="Select a firm"
                defaultOptions={firms}
                value={selectedFirm}
                onChange={(val) => setSelectedFirm(val)}
              />
            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER LINKS
        ===================================================== */}

        <p className="text-end text-sm font-medium my-3">
          {step === "otp" ? (
            <>
              Didn't receive code?{" "}
              <b className="cursor-pointer" onClick={onResendOtp}>
                Resend OTP
              </b>
            </>
          ) : step === "login" ? (
            <Link to={PATH.RESETPASSWORD}>Forgot Password?</Link>
          ) : null}
        </p>

        {/* =====================================================
            SUBMIT BUTTON
        ===================================================== */}

        <CustomButton
          label={step === "firm" ? "Continue" : "Submit"}
          loading={
            sendOtpMutation.isPending ||
            verifyOtpMutation.isPending ||
            firmMutation.isPending
          }
          className="login-button"
        />

        {/* =====================================================
            MICROSOFT LOGIN
        ===================================================== */}

        {/* {step === "login" && <MicrosoftLogin />} */}

        {/* =====================================================
            SUPPORT
        ===================================================== */}

        <p className="text-center text-[#6B7280] text-xs font-medium mt-6 mb-5">
          Need Support? Email us at{" "}
          <b className="text-(--text-secondary)">
            <a href="mailto:support@Optimust.law">support@Optimust.law</a>
          </b>
        </p>
      </form>
    </div>
  );
};

export default Login;
