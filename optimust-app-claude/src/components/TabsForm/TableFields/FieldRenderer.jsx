import Field from "../../../../../../components/Forms/Field.jsx";
import DynamicFields from "../DynamicFields";
const FieldRenderer = ({ fieldMeta, controller, caseId, isRequired , name}) => {
  return (
    <Field
      key={fieldMeta.id}
      controller={controller(name, (field) => (
        <DynamicFields
          fieldMeta={{
            ...fieldMeta,
            ...field,
            name: fieldMeta.name,
            required: isRequired,
          }}
          caseId={caseId}
        />
      ))}
    />
  );
};

export default FieldRenderer;
