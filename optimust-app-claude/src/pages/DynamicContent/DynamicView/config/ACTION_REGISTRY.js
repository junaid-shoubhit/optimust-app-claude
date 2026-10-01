// import CustomFilter from "../components/CustomFilter";
import FilterBtn from "../../../../components/Table/Filter/FilterBtn";
import MailBtn from "../components/Buttons/MailBtn";
import GoToBtn from "../components/Buttons/GoToBtn";
import ExpenseSummaryButton from "../components/Buttons/ExpenseSummaryButton";
import ChatBtn from "../components/Buttons/ChatBtn/ChatBtn";
import NotesBtn from "../components/Buttons/NotesBtn/NotesBtn";
// import ExportDropdown from "../components/ExportDropdown";

export const ACTION_REGISTRY = {
  filter: {
    type: "component", // 🔥 NEW
    Component: FilterBtn,
  },

  chats: {
    type: "component", // 🔥 NEW
    Component: ChatBtn,
  },
  notes: {
    type: "component", // 🔥 NEW
    Component: NotesBtn,
  },
  download: {
    type: "button",
    label: "Download",
    icon: "pi pi-download",
    onClick: ({ apiData }) => {
      console.log("Download", apiData);
    },
  },

  //   Summary: {
  //       type: "component",
  //   Component: ExpenseSummaryButton,
  //   // type: "button",
  //   // label: "Expense Status Summary",
  //   // icon: "pi pi-file",
  //   // onClick: ({ apiData }) => {
  //   //   console.log("Download", apiData);
  //   // },
  // },

  mail: {
    type: "component",
    Component: MailBtn,
    // onClick: ({ apiData }) => {
    //   console.log("Mail", apiData);
    // },
  },

  goto: {
    type: "component",
    Component: GoToBtn,
    // onClick: ({ apiData }) => {
    //   console.log("Go to Intakes", apiData);
    // },
  },

  // export: {
  //   type: "component",
  //   Component: ExportDropdown,
  // },
};
