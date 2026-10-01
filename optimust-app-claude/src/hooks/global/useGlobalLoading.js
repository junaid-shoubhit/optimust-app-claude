// useGlobalLoading.js
import { useIsFetching } from "@tanstack/react-query";

export const useGlobalLoading = () => {
  const isFetching = useIsFetching();
  console.log('isFetching', isFetching)
  return isFetching > 0;
};