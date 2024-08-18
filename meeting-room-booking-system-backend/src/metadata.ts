/* eslint-disable */
export default async () => {
    const t = {
        ["./permission/entities/permission.entity"]: await import("./permission/entities/permission.entity"),
        ["./role/entities/role.entity"]: await import("./role/entities/role.entity"),
        ["./user/vo/login.vo"]: await import("./user/vo/login.vo"),
        ["./user/vo/user.vo"]: await import("./user/vo/user.vo"),
        ["./booking/entities/booking.entity"]: await import("./booking/entities/booking.entity"),
        ["./user/entities/user.entity"]: await import("./user/entities/user.entity"),
        ["./meeting-rooms/entities/meeting-room.entity"]: await import("./meeting-rooms/entities/meeting-room.entity"),
        ["./meeting-rooms/vo/meeting-room-list.vo"]: await import("./meeting-rooms/vo/meeting-room-list.vo"),
        ["./booking/vo/booking-list.vo"]: await import("./booking/vo/booking-list.vo"),
        ["./user/vo/token.vo"]: await import("./user/vo/token.vo"),
        ["./statistic/vo/statistic.vo"]: await import("./statistic/vo/statistic.vo")
    };
    return { "@nestjs/swagger": { "models": [[import("./user/dto/create-user.dto"), { "CreateUserDto": { username: { required: true, type: () => String }, password: { required: true, type: () => String, minLength: 6 }, nickName: { required: true, type: () => String, description: "\u7528\u6765\u663E\u793A\u7684" }, email: { required: true, type: () => String }, captcha: { required: true, type: () => String } }, "SendCaptchaDto": { email: { required: true, type: () => String }, subject: { required: true, type: () => String }, html: { required: true } } }], [import("./user/dto/update-user.dto"), { "UpdateUserDto": { headPic: { required: false, type: () => String }, email: { required: false, type: () => String }, nickName: { required: false, type: () => String }, captcha: { required: true, type: () => String } }, "UpdatePasswordDto": { password: { required: true, type: () => String }, email: { required: true, type: () => String }, captcha: { required: true, type: () => String } } }], [import("./permission/entities/permission.entity"), { "Permission": { id: { required: true, type: () => Number }, code: { required: true, type: () => String }, description: { required: true, type: () => String } } }], [import("./role/entities/role.entity"), { "Role": { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, permissions: { required: true, type: () => [t["./permission/entities/permission.entity"].Permission] } } }], [import("./user/entities/user.entity"), { "User": { id: { required: true, type: () => Number }, username: { required: true, type: () => String }, password: { required: true, type: () => String }, nickName: { required: true, type: () => String }, email: { required: true, type: () => String }, headPic: { required: true, type: () => String }, phoneNumber: { required: true, type: () => String }, isFrozen: { required: true, type: () => Boolean }, isAdmin: { required: true, type: () => Boolean }, createTime: { required: true, type: () => Date }, updateTime: { required: true, type: () => Date }, roles: { required: true, type: () => [t["./role/entities/role.entity"].Role] } } }], [import("./user/vo/login.vo"), { "PermissionVo": { id: { required: true, type: () => Number }, code: { required: true, type: () => String }, description: { required: true, type: () => String } }, "UserVo": { id: { required: true, type: () => Number }, nickName: { required: true, type: () => String }, username: { required: true, type: () => String }, headPic: { required: true, type: () => String }, phoneNumber: { required: true, type: () => String }, email: { required: true, type: () => String }, isFrozen: { required: true, type: () => Boolean }, isAdmin: { required: true, type: () => Boolean }, createTime: { required: true, type: () => Number }, roles: { required: true, type: () => [String] }, permissions: { required: true, type: () => [t["./user/vo/login.vo"].PermissionVo] } }, "LoginUserVo": { userInfo: { required: true, type: () => t["./user/vo/login.vo"].UserVo }, access_token: { required: true, type: () => String }, refresh_token: { required: true, type: () => String } } }], [import("./permission/dto/create-permission.dto"), { "CreatePermissionDto": {} }], [import("./permission/dto/update-permission.dto"), { "UpdatePermissionDto": {} }], [import("./user/dto/login.dto"), { "LoginDto": { username: { required: true, type: () => String }, password: { required: true, type: () => String } } }], [import("./user/vo/user.vo"), { "UserItemVo": { createTime: { required: true, type: () => Date } }, "UserListVo": { users: { required: true, type: () => [t["./user/vo/user.vo"].UserItemVo] }, total: { required: true, type: () => Number } } }], [import("./user/vo/token.vo"), { "RefreshTokenVo": { access_token: { required: true, type: () => String, description: "\u8FC7\u671F\u65F6\u95F430m" }, refresh_token: { required: true, type: () => String, description: "\u8FC7\u671F\u65F6\u95F4\uFF17d" } } }], [import("./user/dto/user-list.dto"), { "UserListDto": { pageNo: { required: true, type: () => Number }, pageSize: { required: true, type: () => Number }, email: { required: false, type: () => String }, username: { required: false, type: () => String }, nickName: { required: false, type: () => String } } }], [import("./role/dto/create-role.dto"), { "CreateRoleDto": {} }], [import("./role/dto/update-role.dto"), { "UpdateRoleDto": {} }], [import("./meeting-rooms/dto/create-meeting-room.dto"), { "CreateMeetingRoomDto": { name: { required: true, type: () => String }, capacity: { required: true, type: () => Number }, equipment: { required: true, type: () => String }, location: { required: true, type: () => String }, description: { required: true, type: () => String } } }], [import("./meeting-rooms/dto/update-meeting-room.dto"), { "UpdateMeetingRoomDto": {} }], [import("./booking/entities/booking.entity"), { "Booking": { id: { required: true, type: () => Number }, startTime: { required: true, type: () => Date }, endTime: { required: true, type: () => Date }, status: { required: true, enum: t["./booking/entities/booking.entity"].Status }, note: { required: true, type: () => String }, createTime: { required: true, type: () => Date }, updateTime: { required: true, type: () => Date }, user: { required: true, type: () => t["./user/entities/user.entity"].User }, meetingRoom: { required: true, type: () => t["./meeting-rooms/entities/meeting-room.entity"].MeetingRoom } } }], [import("./meeting-rooms/entities/meeting-room.entity"), { "MeetingRoom": { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, capacity: { required: true, type: () => Number }, location: { required: true, type: () => String }, equipment: { required: true, type: () => String }, description: { required: true, type: () => String }, isBooked: { required: true, type: () => Boolean }, createTime: { required: true, type: () => Date }, updateTime: { required: true, type: () => Date } } }], [import("./meeting-rooms/dto/meeting-room-list.dto"), { "MeetingRoomListDto": { pageNo: { required: false, type: () => Number }, pageSize: { required: false, type: () => Number }, name: { required: false, type: () => String, description: "\u4F1A\u8BAE\u5BA4\u540D\u79F0" }, capacity: { required: false, type: () => Number, description: "\u5BB9\u7EB3\u4EBA\u6570" }, equipment: { required: false, type: () => String, description: "\u5305\u542B\u7684\u8BBE\u5907" }, location: { required: false, type: () => String, description: "\u4F1A\u8BAE\u5BA4\u4F4D\u7F6E" } } }], [import("./meeting-rooms/vo/meeting-room-list.vo"), { "MeetingRoomItemVo": { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, capacity: { required: true, type: () => Number, description: "\u5BB9\u7EB3\u4EBA\u6570" }, location: { required: true, type: () => String, description: "\u4F1A\u8BAE\u5BA4\u4F4D\u7F6E" }, description: { required: true, type: () => String }, equipment: { required: true, type: () => String, description: "\u5305\u542B\u7684\u8BBE\u5907" }, isBooked: { required: true, type: () => Boolean }, createTime: { required: true, type: () => Date } }, "MeetingRoomListVo": { meetingRooms: { required: true, type: () => [t["./meeting-rooms/vo/meeting-room-list.vo"].MeetingRoomItemVo] }, total: { required: true, type: () => Number } } }], [import("./booking/dto/create-booking.dto"), { "CreateBookingDto": { startTime: { required: true, type: () => Number, description: "\u65F6\u95F4\u6233" }, endTime: { required: true, type: () => Number }, meetingRoomId: { required: true, type: () => Number }, note: { required: false, type: () => String } }, "UrgeDto": { id: { required: true, type: () => Number }, meetingRoomName: { required: true, type: () => String }, bookingTimeRangeTxt: { required: true, type: () => String } } }], [import("./booking/dto/update-booking.dto"), { "UpdateBookingDto": {} }], [import("./booking/dto/booking-list.dto"), { "BookingListDto": { pageNo: { required: false, type: () => Number }, pageSize: { required: true, type: () => Number }, startTime: { required: false, type: () => Number, description: "\u65F6\u95F4\u6233" }, endTime: { required: false, type: () => Number }, bookingPerson: { required: false, type: () => String }, meetingRoomLocation: { required: false, type: () => String }, meetingRoomName: { required: false, type: () => String }, status: { required: false, enum: t["./booking/entities/booking.entity"].Status } } }], [import("./booking/vo/booking-list.vo"), { "BookingItemVo": { id: { required: true, type: () => Number }, userId: { required: true, type: () => Number }, status: { required: true, description: "0:\u7533\u8BF7\u4E2D;1:\u901A\u8FC7;2:\u9A73\u56DE;3\u53D6\u6D88", enum: t["./booking/entities/booking.entity"].Status }, meetingRoomId: { required: true, type: () => Number }, meetingRoomName: { required: true, type: () => String }, meetingRoomLocation: { required: true, type: () => String }, bookingNickName: { required: true, type: () => String }, startTime: { required: true, type: () => Date }, endTime: { required: true, type: () => Date }, note: { required: true, type: () => String }, createTime: { required: true, type: () => Date } }, "BookingListVo": { bookingList: { required: true, type: () => [t["./booking/vo/booking-list.vo"].BookingItemVo] }, total: { required: true, type: () => Number } } }], [import("./statistic/dto/statistic.dto"), { "UserBookingCountDto": { startTime: { required: true, type: () => String, description: "\u4F20\u65F6\u95F4\u6233" }, endTime: { required: true, type: () => String } } }], [import("./statistic/vo/statistic.vo"), { "UserBookingCountVo": { userId: { required: true, type: () => Number }, nickName: { required: true, type: () => String }, bookingCount: { required: true, type: () => Number } }, "MeetingRoomUsageFreqVo": { meetingRoomId: { required: true, type: () => Number }, meetingRoomName: { required: true, type: () => String }, usageCount: { required: true, type: () => Number } } }]], "controllers": [[import("./app.controller"), { "AppController": { "getHello": { type: String } } }], [import("./user/user.controller"), { "UserController": { "initAdmin": { summary: "\u7BA1\u7406\u5458\u8D26\u6237\u521D\u59CB\u5316", type: t["./user/entities/user.entity"].User }, "create": { summary: "\u7528\u6237\u6CE8\u518C", type: String }, "sendCaptcha": { summary: "\u7528\u6237\u6CE8\u518C\u9A8C\u8BC1\u7801", type: String }, "login": { summary: "\u7528\u6237\u767B\u5F55", type: t["./user/vo/login.vo"].LoginUserVo }, "adminLogin": { summary: "\u7BA1\u7406\u5458\u767B\u5F55", type: t["./user/vo/login.vo"].LoginUserVo }, "getUserInfo": { summary: "\u83B7\u53D6\u7528\u6237\u4FE1\u606F", type: t["./user/vo/login.vo"].UserVo }, "avatarUpload": { summary: "\u7528\u6237\u5934\u50CF\u4E0A\u4F20", type: String }, "freezeUser": { summary: "\u51BB\u7ED3/\u89E3\u51BB\u7528\u6237", type: String }, "getList": { summary: "\u7528\u6237\u5217\u8868", type: t["./user/vo/user.vo"].UserListVo }, "updatePassword": { summary: "\u66F4\u65B0\u5BC6\u7801", type: String }, "sendUpdatePasswordCaptcha": { summary: "\u66F4\u65B0\u5BC6\u7801\u9A8C\u8BC1\u7801", type: String }, "updateUserInfo": { summary: "\u66F4\u65B0\u7528\u6237\u4FE1\u606F", type: String }, "sendUpdateCaptcha": { summary: "\u66F4\u65B0\u7528\u6237\u4FE1\u606F\u9A8C\u8BC1\u7801", type: String }, "refreshToken": { summary: "token\u7EED\u671F", type: t["./user/vo/token.vo"].RefreshTokenVo } } }], [import("./meeting-rooms/meeting-rooms.controller"), { "MeetingRoomsController": { "create": { summary: "\u4F1A\u8BAE\u5BA4\u521B\u5EFA", type: String }, "getList": { summary: "\u4F1A\u8BAE\u5BA4\u5217\u8868", type: t["./meeting-rooms/vo/meeting-room-list.vo"].MeetingRoomListVo }, "findOne": { summary: "\u83B7\u53D6\u4F1A\u8BAE\u5BA4\u4FE1\u606F", type: t["./meeting-rooms/entities/meeting-room.entity"].MeetingRoom }, "update": { summary: "\u66F4\u65B0\u4F1A\u8BAE\u5BA4\u4FE1\u606F", type: String }, "remove": { summary: "\u5220\u9664\u4F1A\u8BAE\u5BA4", type: String } } }], [import("./booking/booking.controller"), { "BookingController": { "create": { summary: "\u521B\u5EFA\u9884\u5B9A", type: String }, "getBookingList": { summary: "\u83B7\u53D6\u9884\u5B9A\u5217\u8868", type: t["./booking/vo/booking-list.vo"].BookingListVo }, "approve": { summary: "\u5BA1\u6838\u901A\u8FC7", type: String }, "reject": { summary: "\u9A73\u56DE\u7533\u8BF7", type: String }, "cancel": { summary: "\u53D6\u6D88\u9884\u5B9A", type: String }, "urge": { summary: "\u50AC\u529E", type: String } } }], [import("./statistic/statistic.controller"), { "StatisticController": { "userBookingCount": { summary: "\u7EDF\u8BA1\u7528\u6237\u9884\u5B9A\u6570", type: [t["./statistic/vo/statistic.vo"].UserBookingCountVo] }, "meetingRoomUsageFreq": { summary: "\u4F1A\u8BAE\u5BA4\u4F7F\u7528\u9891\u7387", type: [t["./statistic/vo/statistic.vo"].MeetingRoomUsageFreqVo] } } }]] } };
};