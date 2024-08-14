import { POST } from "../../../common/http";
import { UpdatePwd } from "./types";

export const updatePassword = (data: UpdatePwd) => POST<string>('/user/updatePassword', data);