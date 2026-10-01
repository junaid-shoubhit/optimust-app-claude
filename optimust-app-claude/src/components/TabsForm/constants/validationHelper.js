// validationHelper.js

export const BUILT_IN_VALIDATIONS = {
  1: {
    name: "Email Address",
    validate: (value) => {
      if (!value) return true;

      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

      return emailRegex.test(value) || "Please enter a valid email address";
    },
  },

  2: {
    name: "Future Date",
    validate: (value) => {
      if (!value) return true;

      const date = new Date(value);
      const today = new Date();

      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      return date >= today || "Please select today or a future date.";
    },
  },

  3: {
    name: "Past Date",
    validate: (value) => {
      if (!value) return true;

      const date = new Date(value);
      const today = new Date();

      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      return date <= today || "Please select today or an earlier date.";
    },
  },

  4: {
    name: "SSN",
    validate: (value) => {
      if (!value) return true;

      // const digits = value.replace(/\D/g, "");

      return value.length === 9 || "SSN must contain exactly 9 digits";
    },
  },

  5: {
    name: "Phone Number",
    validate: (value) => {
      if (!value) return true;

      // return (
      //   /^\(\d{3}\)\s\d{3}-\d{4}$/.test(value) ||
      //   "Phone number must be in the format (123) 456-7890"
      // );
      return (
        value.length === 10 || "Phone number must contain exactly 10 digits"
      );
    },
  },
};
