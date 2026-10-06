import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import Input from "../../components/Forms/Input/Input";
import SelectField from "../../components/Forms/Select/Select";
import CustomButton from "../../components/Forms/Buttons/CustomButton";
import CustomToggle from "../../components/Forms/CustomToggle/CustomToggle";
import DynamicFormFields from "../../components/Forms/DynamicForm/UserDynamicForm";

import { apiRequest } from "../../services/apiBinding";
import Contacts from "../CaseParties/Contacts/Contacts";
import { getId } from "../../utils/constants/formConstants";
import { useAppNavigation } from "../../navigation/NavigationContext";
const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const UserProfile = ({ currentModule }) => {
  const queryClient = useQueryClient();
  const { activeModule } = useAppNavigation();
  console.log("activeModule", activeModule);
  /* ------------------ GET PROFILE ------------------ */

  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () =>
      apiRequest({
        apiPath: "/User/GetProfile",
        method: "GET",
      }),
    select: (res) => res?.data,
  });

  /* ------------------ DEFAULT VALUES ------------------ */

  const defaultValues = useMemo(
    () => ({
      firstName: user?.firstName || "",
      middleName: user?.middleName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      email: user?.email || "",

      tfaTypeId: user?.tfaTypeId
        ? {
            value: user?.tfaTypeId,
            label: user?.tfaType,
          }
        : null,

      tfaOnEveryLogin: user?.tfaOnEveryLogin || false,
    }),
    [user],
  );

  /* ------------------ PROFILE FORM ------------------ */

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
  });

  const tfaPayload = useMemo(
    () => createPayload("ctusrTwoFactorAuthenticationTypes"),
    [],
  );

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  /* ------------------ PASSWORD FORM ------------------ */

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm({
    defaultValues: {
      password: "",
      passwordCheck: "",
    },
  });

  const password = watch("password");
  const passwordCheck = watch("passwordCheck");

  const isPasswordValid = PASSWORD_REGEX.test(password || "");
  const passwordsMatch =
    password && passwordCheck && password === passwordCheck;

  /* ------------------ UPDATE PROFILE ------------------ */

  const updateMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: "/user",
        method: "PATCH",
        payload,
      }),

    onSuccess: () => {
      toast.success("Profile updated successfully");

      queryClient.invalidateQueries({
        queryKey: ["userProfile"],
      });
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });

  /* ------------------ RESET PASSWORD ------------------ */

  const passwordMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: "/user",
        method: "PATCH",
        payload,
      }),

    onSuccess: () => {
      toast.success("Password reset successfully");
      resetPasswordForm();
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to reset password");
    },
  });

  /* ------------------ PROFILE FIELDS ------------------ */

  const profileFields = useMemo(
    () => [
      {
        name: "firstName",
        label: "First Name",
        component: Input,
        props: {
          isRequired: true,
        },
        rules: {
          required: "First Name is required",
        },
      },
      {
        name: "middleName",
        label: "Middle Name",
        component: Input,
      },
      {
        name: "lastName",
        label: "Last Name",
        component: Input,
        props: {
          isRequired: true,
        },
        rules: {
          required: "Last Name is required",
        },
      },
      {
        name: "username",
        label: "Username",
        component: Input,
        props: {
          disabled: true,
        },
      },
      {
        name: "email",
        label: "Email",
        component: Input,
        props: {
          disabled: true,
        },
      },
      {
        name: "tfaTypeId",
        label: "Two Factor Authentication Type",
        component: SelectField,
        props: {
          payload: tfaPayload,
          isRequired: false,
        },
      },

      {
        name: "tfaOnEveryLogin",
        label: "Two Factor Authentication On Every Login",
        customRender: ({ field }) => (
          <div className="flex flex-col">
            <label className="block text-xs font-medium mb-1 uppercase tracking-wide text-gray-700">
              Two Factor Authentication On Every Login
            </label>

            <CustomToggle {...field} checked={field.value} />
          </div>
        ),
      },
    ],
    [tfaPayload],
  );

  /* ------------------ PASSWORD FIELDS ------------------ */

  const passwordFields = useMemo(
    () => [
      {
        name: "password",
        label: "New Password",
        component: Input,
        props: {
          type: "password",
        },
      },
      {
        name: "passwordCheck",
        label: "Confirm Password",
        component: Input,
        props: {
          type: "password",
        },
      },
    ],
    [],
  );

  /* ------------------ SUBMIT PROFILE ------------------ */

  const onProfileSubmit = async (values) => {
    try {
      await updateMutation.mutateAsync({
        id: user?.id,
        firstName: values.firstName,
        middleName: values.middleName,
        lastName: values.lastName,
        tfaTypeId: getId(values.tfaTypeId),
        username: values.username,
        tfaOnEveryLogin: values.tfaOnEveryLogin,
        moduleId: activeModule?.id,
      });
    } catch (error) {
      console.error(error);
    }
  };

  /* ------------------ SUBMIT PASSWORD ------------------ */

  const onPasswordSubmit = async (values) => {
    if (!isPasswordValid || !passwordsMatch) {
      return;
    }

    try {
      await passwordMutation.mutateAsync({
        id: user?.id,
        password: values.password,
        moduleId: activeModule?.id,
      });
    } catch (error) {
      console.error(error);
    }
  };

  /* ------------------ MICROSOFT LOGIN ------------------ */

  const handleOffice365SignIn = async () => {
    try {
      const response = await apiRequest({
        apiPath: "/user/redirect-uri",
        method: "GET",
      });

      window.open(response, "_blank");
    } catch {
      toast.error("Failed to connect to Microsoft 365");
    }
  };

  /* ------------------ LOADING ------------------ */

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">Loading...</div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6  mt-4 ">
      {/* PROFILE */}

      <div className="col-span-9 rounded-3xl bg-white p-6 shadow-md">
        <div className="flex gap-2">
          <p className="text-sm font-bold uppercase text-(--color-fontFour)">
            User Profile
          </p>
        </div>

        <form onSubmit={handleSubmit(onProfileSubmit)}>
          <DynamicFormFields
            fields={profileFields}
            control={control}
            errors={errors}
            gridCols="grid-cols-3"
          />

          <div className="flex justify-end mt-6">
            <CustomButton
              label={
                updateMutation.isPending ? "SAVING..." : "SAVE USER PROFILE"
              }
              type="submit"
              className="saveBtn"
              disabled={isSubmitting || updateMutation.isPending}
            />
          </div>
        </form>
      </div>

      {/* RIGHT PANEL */}

      <div className="col-span-3 flex flex-col gap-6">
        {/* PASSWORD */}

        <div className="rounded-3xl bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Reset Password</h3>

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
            <DynamicFormFields
              fields={passwordFields}
              control={passwordControl}
              errors={passwordErrors}
              gridCols="grid-cols-1"
            />

            {password && passwordCheck && !passwordsMatch && (
              <p className="text-red-500 text-sm mt-2">
                Passwords do not match
              </p>
            )}

            <div className="mt-6">
              <CustomButton
                label={
                  passwordMutation.isPending ? "RESETTING..." : "RESET PASSWORD"
                }
                type="submit"
                className="saveBtn"
                disabled={
                  isPasswordSubmitting ||
                  passwordMutation.isPending ||
                  !isPasswordValid ||
                  !passwordsMatch
                }
              />
            </div>
          </form>
        </div>

        {/* MICROSOFT 365 */}

        <div className="rounded-3xl bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-2">Microsoft 365</h3>

          <p className="text-sm text-gray-500 mb-5">
            Sign in to enable sending emails from the system.
          </p>

          <CustomButton
            label="SIGN IN WITH MICROSOFT 365"
            type="button"
            className="outlineBtn"
            onClick={handleOffice365SignIn}
          />
        </div>
      </div>

      {/* CONTACTS */}
      {/* <div className="col-span-9 rounded-3xl bg-white p-6 shadow-md">
        <div className="mt-4 mb-4">
          <Contacts />
        </div>
      </div> */}
    </div>
  );
};

export default UserProfile;
