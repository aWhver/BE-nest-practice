import { POST } from "../../../common/http";
import { UpdatePwd, UpdateUserinfo } from "./types";

export const updatePassword = (data: UpdatePwd) => POST<string>('/user/updatePassword', data);

export const updateUserinfo = (data: UpdateUserinfo) => POST<string>('/user/update', data);