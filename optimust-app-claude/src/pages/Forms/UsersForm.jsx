// import { useMemo, useCallback, useEffect } from "react";
import { useMemo, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import SelectField from "../../components/Forms/Select/Select";
import Input from "../../components/Forms/Input/Input";
import CustomButton from "../../components/Forms/Buttons/CustomButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../services/apiBinding";
import DynamicFormFields from "../../components/Forms/DynamicForm/UserDynamicForm";
import CustomCheckBox from "../../components/Forms/Checkbox/CustomCheckBox";
import CustomToggle from "../../components/Forms/CustomToggle/CustomToggle";

const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});

const UsersForm = ({
  details: data,
  // setVisible,
  setStep,
  moduleId,
  setData,
  setEntityId,
  handleClose,
  queryKeys,
}) => {
  const queryClient = useQueryClient();

  const [showUserGroupsStep, setShowUserGroupsStep] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  /* ------------------ HELPERS ------------------ */
  const transformValue = (value) => {
    if (value instanceof Date) return value.toISOString();

    if (Array.isArray(value)) return value.map((v) => transformValue(v));

    if (value && typeof value === "object") {
      if (value?.value !== undefined) return value.value;

      if (value?.id !== undefined && Object.keys(value).length === 1)
        return value.id;

      const obj = {};
      Object.keys(value).forEach((k) => {
        obj[k] = transformValue(value[k]);
      });
      return obj;
    }

    return value;
  };

  const getOption = (label, value) => (value ? { label, value } : null);
  const getId = (option) => option?.value ?? null;
  const details = data?.data;
  console.log("details", details);
  /* ------------------ DEFAULT VALUES ------------------ */
  const defaultValues = useMemo(
    () => ({
      id: details?.id || 0,
      username: details?.username || "",
      email: details?.email || "",
      firstName: details?.firstName || "",
      middleName: details?.middleName || "",
      lastName: details?.lastName || "",

      ...(!details?.id && {
        password: "",
        repeatPassword: "",
      }),

      tfaType: getOption(details?.tfaType, details?.tfaTypeId),
      isActive: details?.isActive ?? true,
      isLocked: details?.isLocked ?? false,
      userGroups: details?.userGroups,
      firms: details?.firms,
    }),
    [details],
  );

  /* ------------------ FORM ------------------ */
  const {
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    mode: "onBlur",
  });

  const usergroupsPayload = useMemo(() => createPayload("usrUserGroups"), []);
  // const firmsPayload = useMemo(() => createPayload("frmFirms_Basic"), []);

  /* ------------------ GET USER GROUPS ------------------ */
  // const { data: userGroupsResponse } = useQuery({
  //   queryKey: ["user-groups", details?.id],
  //   queryFn: () =>
  //     apiRequest({
  //       apiPath: `/user/userGroups/${details?.id}`,
  //       method: "get",
  //       apiClient: "optimust",
  //     }),
  //   enabled: !!details?.id,
  // });

  // const { data: firmsResponse } = useQuery({
  //   queryKey: ["user-firms", details?.id],
  //   queryFn: () =>
  //     apiRequest({
  //       apiPath: `/user/firms/${details?.id}`,
  //       method: "get",
  //       apiClient: "optimust",
  //     }),
  //   enabled: !!details?.id,
  // });

  /* ------------------ PREFILL USER GROUPS ------------------ */
  // useEffect(() => {
  //   if (details?.id) {
  //     reset({
  //       ...defaultValues,

  //       userGroups:
  //         userGroupsResponse?.userGroups?.map((group) => ({
  //           label: group.name,
  //           value: group.id,
  //         })) || [],

  //       firms:
  //         firmsResponse?.firms?.map((firm) => ({
  //           label: firm.name,
  //           value: firm.id,
  //         })) || [],
  //     });
  //   }
  // }, [details?.id, userGroupsResponse, firmsResponse, reset, defaultValues]);

  /* ------------------ OPTIONS ------------------ */
  const tfaOptions = useMemo(
    () => [
      { label: "Email", value: 1 },
      { label: "SMS", value: 2 },
    ],
    [],
  );

  /* ------------------ MUTATION ------------------ */
  const saveUserMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/user",
        method,
        payload,
        apiClient: "optimust",
      }),
  });

  // const saveFirmsMutation = useMutation({
  //   mutationFn: (payload) =>
  //     apiRequest({
  //       apiPath: "/user/firms",
  //       method: "post",
  //       payload,
  //       apiClient: "optimust",
  //     }),
  // });

  const saveUserGroupsMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: "/user/userGroups",
        method: "post",
        payload,
        apiClient: "optimust",
      }),
  });

  /* ------------------ CLOSE ------------------ */
  const handleCancel = useCallback(() => {
    reset();
    handleClose?.();
  }, [reset, handleClose]);

  const resetPasswordMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: "/user/resetPasswordByAdmin",
        method: "patch",
        payload,
        apiClient: "optimust",
      }),
  });

  const handleResetPassword = async () => {
    try {
      console.log("details", details);
      const resetPasswordPayload = {
        username: details?.username,
        // userId: null,
        // password: null,
      };
      const resetPasswordResponse =
        await resetPasswordMutation.mutateAsync(resetPasswordPayload);

      toast.success("Reset Password Succesful");
    } catch (error) {
      toast.error(error || "Failed to Reset Password");
    }
  };

  // const handleUserGroupsContinue = async () => {
  //   const userGroups = getValues("userGroups");
  //   // const firms = getValues("firms");

  //   if (!userGroups?.length) {
  //     toast.error("Please select at least one User Group");
  //     return;
  //   }

  //   // if (!firms?.length) {
  //   //   toast.error("Please select at least one Firm");
  //   //   return;
  //   // }

  //   try {
  //     await Promise.all([
  //       saveUserGroupsMutation.mutateAsync({
  //         userId: createdUser.userId,
  //         userGroupIds: userGroups.map((group) => group.value),
  //       }),

  //       // saveFirmsMutation.mutateAsync({
  //       //   userId: createdUser.userId,
  //       //   firmIds: firms.map((firm) => firm.value),
  //       // }),
  //     ]);

  //     toast.success("User Groups and Firms saved successfully");

  //     setEntityId?.(createdUser.userId);
  //     setData?.({ data: createdUser.responseData });
  //     setStep?.(2);
  //   } catch (error) {
  //     toast.error(
  //       error?.response?.data?.message || "Failed to save User Groups/Firms",
  //     );
  //   }
  // };

  const handleUserGroupsContinue = async () => {
    const userGroups = getValues("userGroups");

    if (!userGroups?.length) {
      toast.error("Please select at least one User Group");
      return;
    }

    try {
      const userGroupsResponse = await saveUserGroupsMutation.mutateAsync({
        userId: createdUser.userId,
        userGroupIds: userGroups.map((group) => group.value),
      });

      console.log("User Groups Response:", userGroupsResponse);

      toast.success("User Groups saved successfully");

      setEntityId?.(createdUser.userId);

      setData?.({
        data: userGroupsResponse?.data,
      });

      setStep?.(2);
    } catch (error) {
      toast.error(error || "Failed to save User Groups");
    }
  };
  /* ------------------ SUBMIT ------------------ */
  const onSubmit = async (values) => {
    if (!details?.id && values.password !== values.repeatPassword) {
      toast.error("Passwords do not match");
      return;
    }

    /* REMOVE userGroups FROM USER PAYLOAD */
    // const { userGroups, ...restValues } = values;
    const { userGroups, ...restValues } = values;
    // firms,
    const payload = Object.keys(restValues).reduce((acc, key) => {
      acc[key] = transformValue(restValues[key]);
      return acc;
    }, {});

    payload.tfaTypeId = getId(values?.tfaType);
    payload.moduleId = moduleId;
    payload.createdBy = 0;
    payload.firmId = 0;
    payload.userId = 0;
    payload.isLocked = values?.isLocked;
    try {
      /* USER API */
      const response = await saveUserMutation.mutateAsync({
        payload,
        method: details?.id ? "patch" : "post",
      });

      console.log("payload", payload);

      if (!response) return;

      const userId = response?.data?.id || details?.data?.id;
      const responseData = response?.data || response;
      if (details?.id) {
        if (userGroups?.length > 0) {
          await saveUserGroupsMutation.mutateAsync({
            userId: details.id,
            userGroupIds: userGroups?.map((g) => g.value) || [],
          });
        }
        // if (values?.firms?.length > 0) {
        //   await saveFirmsMutation.mutateAsync({
        //     userId: details.id,
        //     firmIds: firms?.map((f) => f.value) || [],
        //   });
        // }

        toast.success("User updated successfully");

        setEntityId?.(userId);
        setData?.(responseData);
        // setStep?.(2);
        handleCancel();
        if (queryKeys)
          await Promise.all(
            Object?.values(queryKeys)
              .filter(Boolean)
              .map((queryKey) =>
                queryClient.invalidateQueries({
                  queryKey,
                }),
              ),
          );
        return;
      }

      /* NEW USER */
      setCreatedUser({
        userId,
        responseData,
      });

      setShowUserGroupsStep(true);
      if (queryKeys)
        await Promise.all(
          Object?.values(queryKeys)
            .filter(Boolean)
            .map((queryKey) =>
              queryClient.invalidateQueries({
                queryKey,
              }),
            ),
        );
      toast.success("User created successfully. Please assign User Groups.");
    } catch (error) {
      toast.error(
        error ||
          (details?.id ? "Failed to update user" : "Failed to create user"),
      );
    }
  };

  /* ------------------ FIELDS ------------------ */
  const formFields = useMemo(
    () => [
      {
        name: "username",
        label: "Username",
        component: Input,
        rules: { required: "Username is required" },
        props: { isRequired: true, disabled: !!details?.id },
      },
      {
        name: "email",
        label: "Email",
        component: Input,
        rules: {
          required: "Email is required",
          pattern: {
            value:
              /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@((([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9]))|([a-zA-Z0-9]+[\w-]+\.)+[a-zA-Z][a-zA-Z0-9-]{1,23})$/,
            message: "Enter a valid email address",
          },
        },
        props: { isRequired: true, disabled: !!details?.id },
      },
      {
        name: "firstName",
        label: "First Name",
        component: Input,
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
      },

      ...(!details?.id
        ? [
            {
              name: "password",
              label: "Password",
              component: Input,
              props: { type: "password" },
              rules: {
                required: "Password is required",
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "Min 8 characters, with uppercase, lowercase, number & special character.",
                },
              },
            },
            {
              name: "repeatPassword",
              label: "Repeat Password",
              component: Input,
              props: { type: "password" },
              rules: {
                required: "Repeat Password is required",
                validate: (value) =>
                  value === getValues("password") || "Passwords do not match",
              },
            },
          ]
        : []),

      {
        name: "tfaType",
        label: "Two Factor Authentication",
        component: SelectField,
        props: { defaultOptions: tfaOptions },
      },
      {
        name: "isActive",
        customRender: ({ field }) => (
          <div className="flex h-full">
            <CustomCheckBox {...field} name="isActive" label="is Active" />
          </div>
        ),
      },

      {
        name: "isLocked",
        label: "Is Locked",
        customRender: ({ field }) => (
          <div className="flex flex-col">
            <label className="block text-xs font-medium mb-1 uppercase tracking-wide text-gray-700">
              Is Locked
            </label>
            <CustomToggle {...field} checked={field.value} />
          </div>
        ),
      },
      ...(details?.id || showUserGroupsStep
        ? [
            {
              name: "userGroups",
              label: "User Groups",
              component: SelectField,
              props: {
                payload: usergroupsPayload,
                isRequired: true,
                isMulti: true,
              },
              rules: {
                required: "User Groups is required",
              },
            },
            // {
            //   name: "firms",
            //   label: "Firms",
            //   component: SelectField,
            //   props: {
            //     payload: firmsPayload,
            //     isRequired: true,
            //     isMulti: true,
            //   },
            //   rules: {
            //     required: "Firm is required",
            //   },
            // },
          ]
        : []),
    ],
    [details, getValues, showUserGroupsStep, tfaOptions, usergroupsPayload],
  );

  /* ------------------ JSX ------------------ */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-3">
      {/* Original User Form Always Visible */}
      <DynamicFormFields
        fields={formFields}
        control={control}
        errors={errors}
        gridCols="grid-cols-2"
      />

      <div className="flex justify-end gap-3 my-3">
        <CustomButton
          label="CANCEL"
          type="button"
          className="outlineBtn"
          onClick={handleCancel}
        />

        {/* <CustomButton
          label={
            saveUserMutation.isPending
              ? "SAVING..."
              : details?.id
                ? "UPDATE"
                : "SAVE"
          }
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || saveUserMutation.isPending}
        /> */}

        {details?.id && (
          <CustomButton
            label={
              resetPasswordMutation.isPending ? "SAVING..." : "Reset Password"
            }
            type="button"
            className="saveBtn"
            onClick={handleResetPassword}
            disabled={isSubmitting || saveUserMutation.isPending}
          />
        )}

        {showUserGroupsStep ? (
          <CustomButton
            label={saveUserGroupsMutation.isPending ? "SAVING..." : "CONTINUE"}
            type="button"
            className="saveBtn"
            onClick={handleUserGroupsContinue}
            disabled={
              saveUserGroupsMutation.isPending
              // || saveFirmsMutation.isPending
            }
          />
        ) : (
          <CustomButton
            label={
              saveUserMutation.isPending
                ? "SAVING..."
                : details?.id
                  ? "UPDATE"
                  : "SAVE"
            }
            type="submit"
            className="saveBtn"
            disabled={isSubmitting || saveUserMutation.isPending}
          />
        )}
      </div>
    </form>
  );
};

export default UsersForm;
