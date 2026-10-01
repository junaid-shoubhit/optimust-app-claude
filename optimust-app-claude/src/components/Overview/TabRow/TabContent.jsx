import { memo } from "react";
import TableView from "./TabView/TableView";
import FieldGrid from "./TabView/FieldGrid";

const TabContent = ({ tabTypeId, columns, fields, loading = false }) => {
  if (tabTypeId === 2) {
    return <TableView columns={columns} fields={fields} loading={loading} />;
  }

  return <FieldGrid fields={fields} />;
};

export default memo(TabContent);
