import { useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../../services/apiBinding";

import Input from "../../../../components/Forms/Input/Input";
import SelectField from "../../../../components/Forms/Select/Select";
import CustomButton from "../../../../components/Forms/Buttons/CustomButton";
import DynamicFormFields from "../../../../components/Forms/DynamicForm/UserDynamicForm";
import { getId } from "../../../../utils/constants/formConstants";

/* ------------------ CREATE STATIC PAYLOAD ------------------ */
const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});

const ContactsForm = ({
  details,
  setVisible,
  setData,
  mode,
  entityId,
  entityCodeId,
}) => {
  const queryClient = useQueryClient();

  /* ------------------ DROPDOWN PAYLOADS ------------------ */
  const statePayload = useMemo(() => createPayload("cntStates"), []);

  const contactTypePayload = useMemo(
    () => createPayload("cntContactTypes"),
    [],
  );

  const countyPayload = useMemo(() => createPayload("cntCounties"), []);

  /* ------------------ DEFAULT VALUES ------------------ */
  const defaultValues = useMemo(() => {
    const data = details || {};

    return {
      ...data,

      stateId: data.stateId
        ? {
            value: data.stateId,
            label: data.stateName,
          }
        : null,

      contactTypeId: data.contactTypeId
        ? {
            value: data.contactTypeId,
            label: data.contactTypeName,
          }
        : null,
      countyId: data.countyId
        ? {
            value: data.countyId,
            label: data.county,
          }
        : null,
    };
  }, [details]);

  /* ------------------ FORM ------------------ */
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
  });

  /* ------------------ MUTATION ------------------ */
  const saveContactMutation = useMutation({
    mutationFn: ({ payload, method }) =>
      apiRequest({
        apiPath: "/Contact",
        method,
        payload,
      }),

    onSuccess: (response) => {
      const contact = response?.data;

      if (!contact) return;

      const contactId = contact.id;

      queryClient.setQueryData(["contact-details", contactId], response);

      queryClient.setQueryData(["contacts", entityId], (old) => {
        if (!old) {
          return {
            success: true,
            statusCode: 200,
            message: "Contacts retrieved successfully.",
            data: [contact],
          };
        }

        const contacts = Array.isArray(old?.data) ? old.data : [];

        const exists = contacts.some((item) => item.id === contactId);

        console.log("Contact exists:", exists);

        return {
          ...old,
          data: exists
            ? contacts.map((item) => (item.id === contactId ? contact : item))
            : [contact, ...contacts],
        };
      });
    },
  });

  /* ------------------ CLOSE ------------------ */
  const handleClose = useCallback(() => {
    reset();
    setData(null);
    setVisible(false);
  }, [reset, setVisible, setData]);

  /* ------------------ SUBMIT ------------------ */
  const onSubmit = async (values) => {
    const payload = {
      id: details?.id || null,

      name: values.name || "",
      address: values.address || "",
      city: values.city || "",
      country: values.country || "",

      stateId: getId(values.stateId),

      zip: values.zip || "",
      phone: values.phone || "",
      mobile: values.mobile || "",
      whatsappId: values.whatsappId || "",
      pagerNo: values.pagerNo || "",
      fax: values.fax || "",

      contactTypeId: getId(values.contactTypeId),
      countyId: getId(values.countyId),

      email: values.email || "",

      extension: values.extension || "",

      disableEmailEdit: false,

      // pass these if available from props/context
      // createdBy: 11103,
      createdBy: null,
      entityId: entityId,
      entityCodeId: entityCodeId,

      created: new Date().toISOString(),
    };

    try {
      await saveContactMutation.mutateAsync({
        payload,
        method: details?.id ? "patch" : "post",
      });

      toast.success(
        details?.id
          ? "Contact updated successfully"
          : "Contact created successfully",
      );

      setVisible(false);

      reset();
    } catch (error) {
      console.error("Error saving contact:", error);

      toast.error(
        error?.response?.data?.message ||
          (details?.id
            ? "Failed to update contact"
            : "Failed to create contact"),
      );
    }
  };

  /* ------------------ FIELDS ------------------ */
  const formFields = useMemo(
    () => [
      {
        name: "name",
        label: "Name",
        component: Input,
        props: {
          type: "text",
          // isRequired: true,
        },
        // rules: {
        //   required: "Required",
        // },
      },
      {
        name: "email",
        label: "Email",
        component: Input,
        // props: { isRequired: true },
        rules: {
          // required: "Required",
          pattern: {
            value:
              /^(([\w-]+\.)+[\w-]+|([a-zA-Z]{1}|[\w-]{2,}))@((([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9]))|([a-zA-Z0-9]+[\w-]+\.)+[a-zA-Z][a-zA-Z0-9-]{1,23})$/,
            message: "Enter a valid email address",
          },
        },
      },
      {
        name: "phone",
        label: "Phone",
        component: Input,
        props: {
          type: "number",
        },
        rules: {
          // required: "Phone number is required",
          pattern: {
            value: /^\d{10}$/,
            message: "Phone number must be exactly 10 digits",
          },
        },
      },
      {
        name: "extension",
        label: "Ext.",
        component: Input,
        props: {
          type: "text",
        },
      },
      {
        name: "mobile",
        label: "Mobile",
        component: Input,
        props: {
          type: "number",
        },
        rules: {
          // required: "Mobile number is required",
          pattern: {
            value: /^\d{10}$/,
            message: "Phone number must be exactly 10 digits",
          },
        },
      },
      {
        name: "whatsappId",
        label: "WhatsApp ID",
        component: Input,
        props: {
          type: "number",
        },
        rules: {
          // required: "WhatsApp ID is required",
          pattern: {
            value: /^\d{10}$/,
            message: "WhatsApp ID must be exactly 10 digits",
          },
        },
      },
      {
        name: "pagerNo",
        label: "Pager No",
        component: Input,
        props: {
          type: "number",
        },
      },
      {
        name: "fax",
        label: "Fax",
        component: Input,
        props: {
          type: "number",
        },
        rules: {
          // required: "Fax is required",
          pattern: {
            value: /^\d{10}$/,
            message: "Fax must be exactly 10 digits",
          },
        },
      },
      {
        name: "address",
        label: "Address",
        component: Input,
        props: {
          type: "text",
        },
      },
      {
        name: "city",
        label: "City",
        component: Input,
        props: {
          type: "text",
        },
      },
      {
        name: "countyId",
        label: "County",
        component: SelectField,
        props: {
          payload: countyPayload,
        },
      },
      {
        name: "stateId",
        label: "State",
        component: SelectField,
        props: {
          payload: statePayload,
        },
      },
      {
        name: "country",
        label: "country",
        component: Input,
        props: {
          type: "text",
        },
      },
      {
        name: "zip",
        label: "Zip",
        component: Input,
        props: {
          type: "text",
        },
      },
      {
        name: "contactTypeId",
        label: "Contact Type",
        component: SelectField,
        props: {
          payload: contactTypePayload,
          isRequired: true,
        },
        rules: {
          required: "Contact Type is required",
        },
      },
    ],
    [statePayload, contactTypePayload, countyPayload],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-3">
      <DynamicFormFields
        fields={formFields}
        control={control}
        errors={errors}
        gridCols="grid-cols-3"
      />

      <div className="flex justify-end gap-3 mt-6">
        <CustomButton
          label="CANCEL"
          type="button"
          className="outlineBtn"
          onClick={handleClose}
        />

        <CustomButton
          label={
            saveContactMutation.isPending
              ? "SAVING..."
              : mode === "edit"
                ? "UPDATE"
                : "SAVE"
          }
          type="submit"
          className="saveBtn"
          disabled={isSubmitting || saveContactMutation.isPending}
        />
      </div>
    </form>
  );
};

export default ContactsForm;
