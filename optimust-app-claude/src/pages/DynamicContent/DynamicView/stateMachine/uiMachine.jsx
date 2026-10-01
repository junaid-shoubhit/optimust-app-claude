import { useReducer, useEffect } from "react";

const STATES = {
  MENU_LOADING: "MENU_LOADING",
  DATA_LOADING: "DATA_LOADING",
  READY: "READY",
  ERROR: "ERROR",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_STATE":
      return { ...state, status: action.payload };
    case "ERROR":
      return { ...state, status: STATES.ERROR, error: action.payload };
    default:
      return state;
  }
};

export const useUIStateMachine = ({
  isMenuLoading,
  hasMenu,
  isDataLoading,
  error,
}) => {
  const [state, dispatch] = useReducer(reducer, {
    status: STATES.MENU_LOADING,
    error: null,
  });

  useEffect(() => {
    if (isMenuLoading || !hasMenu) {
      dispatch({ type: "SET_STATE", payload: STATES.MENU_LOADING });
      return;
    }

    if (isDataLoading) {
      dispatch({ type: "SET_STATE", payload: STATES.DATA_LOADING });
      return;
    }

    if (error) {
      dispatch({ type: "ERROR", payload: error });
      return;
    }

    dispatch({ type: "SET_STATE", payload: STATES.READY });
  }, [isMenuLoading, hasMenu, isDataLoading, error]);

  return state;
};