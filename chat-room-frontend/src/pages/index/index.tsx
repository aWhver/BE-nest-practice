import { useLoginUserStore } from "@/store";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

const Index = function() {
  const { userInfo, getUserInfo} = useLoginUserStore(state => ({
    userInfo: state.userInfo,
    getUserInfo: state.getUserInfo
  }));
  // console.log('userInfo', userInfo);
  useEffect(() => {
    if (Object.keys(userInfo).length === 0) {
      getUserInfo();
    }
  }, []);
  return <div>
    <Outlet />
  </div>;
};

export default Index;
