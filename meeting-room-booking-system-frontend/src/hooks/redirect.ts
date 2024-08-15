import { message } from "antd";
import { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

export function useRedirect() {
  const navigate = useNavigate();
  const { isRedirect } = useOutletContext<{ isRedirect: boolean }>();
  // console.log('isRedirect', isRedirect);

  useEffect(() => {
    if (isRedirect) {
      message.warning('您无该页面权限！');
      navigate(-1);
    }
  }, []);
  return isRedirect;
}