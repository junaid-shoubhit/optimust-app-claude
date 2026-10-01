import React from "react";
import { useForm } from "react-hook-form";
import CustomButton from "../../components/Forms/Buttons/CustomButton";
import Field from "../../components/Forms/Field";
import Input from "../../components/Forms/Input/Input";
import { Link, useNavigate } from "react-router-dom";
import { PATH } from "../../utils/pagePath";
import { toast } from "react-toastify";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import { loginPatchUser } from "../../services/apiBinding";

const ResetPassword = () => {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      userName: "",
      password: "",
    },
    mode: "onSubmit",
  });
  const onSubmit = async (payload) => {
    try {
      payload = {
        ssid: localStorage.getItem("SSID"),
        ...payload,
      };
      await loginPatchUser(payload?.userName, ENDPOINTS.RESET_PASSWORD);
      toast.success(
        `Password has been Sent Sucessfully to ${payload?.userName} `,
      );
      navigate(PATH.LOGIN);
    } catch (error) {
      toast.error(error?.[0] || "An error occurred while logging in.");
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 w-full"
    >
      <div className="flex items-center gap-4">
        <Link to={PATH.LOGIN}>
          <i className="pi pi-arrow-left" style={{ fontSize: "1.5rem" }}></i>
        </Link>
        <h3 className="py-5 text-[var(--color-textdarkbrown)]">
          {" "}
          Reset Password{" "}
        </h3>
      </div>
      <Field
        className={"mb-3"}
        controller={{
          name: "userName",
          control: control,
          rules: {
            required: "Username is required.",
          },
          render: ({ field }) => {
            return (
              <Input
                {...field}
                type="icon"
                className="login-input"
                iconName="pi-user"
                placeholder="Username"
                invalid={errors?.userName}
              />
            );
          },
        }}
      />
      <CustomButton
        label="Forgot Password"
        loading={isSubmitting}
        className={"login-button"}
      />
      <p className="text-center font-medium mt-6 ">
        {" "}
        Need Support ? Send us an email at <b> support@Optimust.law. </b>
      </p>
    </form>
  );
};

export default ResetPassword;
