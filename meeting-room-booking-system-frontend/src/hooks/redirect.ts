import { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

export function useRedirect() {
  const navigate = useNavigate();
  const { isRedirect } = useOutletContext<{ isRedirect: boolean }>();
  // console.log('isRedirect', isRedirect);

  useEffect(() => {
    if (isRedirect) {
      navigate(-1);
    }
  }, []);
  return isRedirect;
}