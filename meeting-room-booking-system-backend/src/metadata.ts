/* eslint-disable */
export default async () => {
    const t = {
        ["./permission/entities/permission.entity"]: await import("./permission/entities/permission.entity"),
        ["./role/entities/role.entity"]: await import("./role/entities/role.entity"),
        ["./user/vo/login.vo"]: await import("./user/vo/login.vo"),
        ["./user/vo/user.vo"]: await import("./user/vo/user.vo"),
        ["./user/entities/user.entity"]: await import("./user/entities/user.entity"),
        ["./user/vo/token.vo"]: await import("./user/vo/token.vo")
    };
    return { "@nestjs/swagger": { "models": [[import("./user/dto/create-user.dto"), { "CreateUserDto": { username: { required: true, type: () => String }, password: { required: true, type: () => String, minLength: 6 }, nickName: { required: true, type: () => String, description: "\u7528\u6765\u663E\u793A\u7684" }, email: { required: true, type: () => String }, captcha: { required: true, type: () => String } }, "SendCaptchaDto": { email: { required: true, type: () => String }, subject: { required: true, type: () => String }, html: { required: true } } }], [import("./user/dto/update-user.dto"), { "UpdateUserDto": { headPic: { required: false, type: () => String }, email: { required: false, type: () => String }, nickName: { required: false, type: () => String }, captcha: { required: true, type: () => String } }, "UpdatePasswordDto": { password: { required: true, type: () => String }, email: { required: true, type: () => String }, captcha: { required: true, type: () => String } } }], [import("./permission/entities/permission.entity"), { "Permission": { id: { required: true, type: () => Number }, code: { required: true, type: () => String }, description: { required: true, type: () => String } } }], [import("./role/entities/role.entity"), { "Role": { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, permissions: { required: true, type: () => [t["./permission/entities/permission.entity"].Permission] } } }], [import("./user/entities/user.entity"), { "User": { id: { required: true, type: () => Number }, username: { required: true, type: () => String }, password: { required: true, type: () => String }, nickName: { required: true, type: () => String }, email: { required: true, type: () => String }, headPic: { required: true, type: () => String }, phoneNumber: { required: true, type: () => String }, isFrozen: { required: true, type: () => Boolean }, isAdmin: { required: true, type: () => Boolean }, createTime: { required: true, type: () => Date }, updateTime: { required: true, type: () => Date }, roles: { required: true, type: () => [t["./role/entities/role.entity"].Role] } } }], [import("./user/vo/login.vo"), { "PermissionVo": { id: { required: true, type: () => Number }, code: { required: true, type: () => String }, description: { required: true, type: () => String } }, "UserVo": { id: { required: true, type: () => Number }, nickName: { required: true, type: () => String }, username: { required: true, type: () => String }, headPic: { required: true, type: () => String }, phoneNumber: { required: true, type: () => String }, email: { required: true, type: () => String }, isFrozen: { required: true, type: () => Boolean }, isAdmin: { required: true, type: () => Boolean }, createTime: { required: true, type: () => Number }, roles: { required: true, type: () => [String] }, permissions: { required: true, type: () => [t["./user/vo/login.vo"].PermissionVo] } }, "LoginUserVo": { userInfo: { required: true, type: () => t["./user/vo/login.vo"].UserVo }, access_token: { required: true, type: () => String }, refresh_token: { required: true, type: () => String } } }], [import("./permission/dto/create-permission.dto"), { "CreatePermissionDto": {} }], [import("./permission/dto/update-permission.dto"), { "UpdatePermissionDto": {} }], [import("./user/dto/login.dto"), { "LoginDto": { username: { required: true, type: () => String }, password: { required: true, type: () => String } } }], [import("./user/vo/user.vo"), { "UserItemVo": { createTime: { required: true, type: () => Date } }, "UserListVo": { users: { required: true, type: () => [t["./user/vo/user.vo"].UserItemVo] }, total: { required: true, type: () => Number } } }], [import("./user/vo/token.vo"), { "RefreshTokenVo": { access_token: { required: true, type: () => String, description: "\u8FC7\u671F\u65F6\u95F430m" }, refresh_token: { required: true, type: () => String, description: "\u8FC7\u671F\u65F6\u95F4\uFF17d" } } }], [import("./user/dto/user-list.dto"), { "UserListDto": { pageNo: { required: true, type: () => Number }, pageSize: { required: true, type: () => Number }, email: { required: false, type: () => String }, username: { required: false, type: () => String }, nickName: { required: false, type: () => String } } }], [import("./role/dto/create-role.dto"), { "CreateRoleDto": {} }], [import("./role/dto/update-role.dto"), { "UpdateRoleDto": {} }], [import("./meetings/dto/create-meeting.dto"), { "CreateMeetingDto": {} }], [import("./meetings/dto/update-meeting.dto"), { "UpdateMeetingDto": {} }], [import("./meetings/entities/meeting.entity"), { "Meeting": {} }]], "controllers": [[import("./app.controller"), { "AppController": { "getHello": { type: String } } }], [import("./user/user.controller"), { "UserController": { "initAdmin": { summary: "\u7BA1\u7406\u5458\u8D26\u6237\u521D\u59CB\u5316", type: t["./user/entities/user.entity"].User }, "create": { summary: "\u7528\u6237\u6CE8\u518C", type: String }, "sendCaptcha": { summary: "\u7528\u6237\u6CE8\u518C\u9A8C\u8BC1\u7801", type: String }, "login": { summary: "\u7528\u6237\u767B\u5F55", type: t["./user/vo/login.vo"].LoginUserVo }, "adminLogin": { summary: "\u7BA1\u7406\u5458\u767B\u9646", type: t["./user/vo/login.vo"].LoginUserVo }, "getUserInfo": { summary: "\u83B7\u53D6\u7528\u6237\u4FE1\u606F", type: t["./user/vo/login.vo"].UserVo }, "freezeUser": { summary: "\u51BB\u7ED3\u7528\u6237", type: String }, "getList": { summary: "\u7528\u6237\u5217\u8868", type: t["./user/vo/user.vo"].UserListVo }, "updatePassword": { summary: "\u66F4\u65B0\u5BC6\u7801", type: String }, "sendUpdatePasswordCaptcha": { summary: "\u66F4\u65B0\u5BC6\u7801\u9A8C\u8BC1\u7801", type: String }, "updateUserInfo": { summary: "\u66F4\u65B0\u7528\u6237\u4FE1\u606F", type: String }, "sendUpdateCaptcha": { summary: "\u66F4\u65B0\u7528\u6237\u4FE1\u606F\u9A8C\u8BC1\u7801", type: String }, "refreshToken": { summary: "token\u7EED\u671F", type: t["./user/vo/token.vo"].RefreshTokenVo }, "avatarUpload": { summary: "\u7528\u6237\u5934\u50CF\u4E0A\u4F20", type: String } } }], [import("./meetings/meetings.controller"), { "MeetingsController": { "create": { type: String }, "findAll": { type: String }, "findOne": { type: String }, "update": { type: String }, "remove": { type: String } } }]] } };
};