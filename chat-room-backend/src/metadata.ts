/* eslint-disable */
export default async () => {
    const t = {
        ["./user/vo/login-user.vo"]: await import("./user/vo/login-user.vo"),
        ["./friendship/vo/friendship.vo"]: await import("./friendship/vo/friendship.vo"),
        ["./favorite/vo/favorite.vo"]: await import("./favorite/vo/favorite.vo")
    };
    return { "@nestjs/swagger": { "models": [[import("./user/dto/update-user.dto"), { "UpdateUserDto": { headPic: { required: false, type: () => String }, id: { required: true, type: () => Number }, email: { required: true, type: () => String }, captcha: { required: true, type: () => String, description: "\u9A8C\u8BC1\u7801" }, nickName: { required: false, type: () => String } }, "UpdateUserPasswordDto": { password: { required: true, type: () => String, minLength: 6 }, email: { required: true, type: () => String }, captcha: { required: true, type: () => String }, username: { required: true, type: () => String } } }], [import("./user/dto/create-user.dto"), { "CreateUserDto": { username: { required: true, type: () => String }, password: { required: true, type: () => String, minLength: 6 }, email: { required: true, type: () => String }, captcha: { required: true, type: () => String, description: "\u9A8C\u8BC1\u7801" }, nickName: { required: false, type: () => String, description: "\u6635\u79F0" } }, "SendCaptchaDto": { email: { required: true, type: () => String }, subject: { required: true, type: () => String }, html: { required: true } } }], [import("./user/dto/login-user.dto"), { "LoginUserDto": { username: { required: true, type: () => String }, password: { required: true, type: () => String } } }], [import("./user/vo/login-user.vo"), { "UserVo": { id: { required: true, type: () => Number }, username: { required: true, type: () => String }, nickName: { required: true, type: () => String }, email: { required: true, type: () => String }, headPic: { required: true, type: () => String }, createTime: { required: true, type: () => Date }, updateTime: { required: true, type: () => Date } }, "LoginUserVo": { user: { required: true, type: () => t["./user/vo/login-user.vo"].UserVo }, token: { required: true, type: () => String } } }], [import("./friendship/dto/create-friendship.dto"), { "CreateFriendshipDto": { toUsername: { required: true, type: () => String, description: "\u5F85\u6DFB\u52A0\u65B9" }, reason: { required: false, type: () => String, description: "\u6DFB\u52A0\u7406\u7531" } } }], [import("./friendship/vo/friendship.vo"), { "FriendshipRequestItemVo": { id: { required: true, type: () => Number }, fromUserId: { required: true, type: () => Number }, toUserId: { required: true, type: () => Number }, status: { required: true, type: () => Object, description: "\"appending\" | \"approved\" | \"rejected\"" }, reason: { required: true, type: () => String }, cerateTime: { required: true, type: () => Date, description: "UTC \u683C\u5F0F" } }, "ToMeVo": { nickName: { required: true, type: () => String }, headPic: { required: true, type: () => String } }, "FromMeVo": { nickName: { required: true, type: () => String }, headPic: { required: true, type: () => String } }, "FriendshipRequestVo": { toMe: { required: true, type: () => [t["./friendship/vo/friendship.vo"].ToMeVo] }, fromMe: { required: true, type: () => [t["./friendship/vo/friendship.vo"].FromMeVo] } } }], [import("./chat/dto/create-chat.dto"), { "CreateChatDto": {} }], [import("./chat/dto/update-chat.dto"), { "UpdateChatDto": { id: { required: true, type: () => Number } } }], [import("./friendship/dto/update-friendship.dto"), { "UpdateFriendshipDto": {} }], [import("./favorite/dto/favorite.dto"), { "AddFavoriteDto": { type: { required: true, type: () => Object, description: "\"chatHistory\" | \"text\" | \"image\" | \"file\"" }, content: { required: false, type: () => String }, chatHistoryIds: { required: false, type: () => [Number] } } }], [import("./favorite/vo/favorite.vo"), { "FavoriteItemVo": { id: { required: true, type: () => Number }, type: { required: true, type: () => Object, description: "\"chatHistory\" | \"text\" | \"image\" | \"file\"" }, createTime: { required: true, type: () => Date }, content: { required: false, type: () => String }, chatHistories: { required: false, type: () => [t["./favorite/vo/favorite.vo"].ChatHistoryItemVo] } }, "ChatHistoryItemVo": { id: { required: true, type: () => Number }, sendUserId: { required: true, type: () => Number }, content: { required: true, type: () => String }, type: { required: true, type: () => Object, description: "\"text\" | \"image\" | \"file\"" }, createTime: { required: true, type: () => Date } }, "ChatRecordItemVo": { headPic: { required: true, type: () => String }, nickName: { required: true, type: () => String } } }]], "controllers": [[import("./app.controller"), { "AppController": { "getHello": { type: String } } }], [import("./user/user.controller"), { "UserController": { "create": { summary: "\u7528\u6237\u6CE8\u518C" }, "login": { summary: "\u767B\u5F55", type: t["./user/vo/login-user.vo"].LoginUserVo }, "getUserInfo": { summary: "\u7528\u6237\u4FE1\u606F", type: t["./user/vo/login-user.vo"].UserVo }, "update": { summary: "\u66F4\u65B0\u7528\u6237\u4FE1\u606F", type: String }, "updatePassword": { summary: "\u66F4\u65B0\u5BC6\u7801", type: String }, "updateCaptcha": { summary: "\u66F4\u65B0\u7528\u6237\u4FE1\u606F\u9A8C\u8BC1\u7801", type: String }, "updatePasswordCaptcha": { summary: "\u66F4\u65B0\u7528\u6237\u5BC6\u7801\u9A8C\u8BC1\u7801", type: String }, "registerCaptcha": { summary: "\u6CE8\u518C\u9A8C\u8BC1\u7801", type: String }, "uploadHeadPic": { summary: "\u83B7\u53D6\u4E0A\u4F20\u7684\u9884\u7B7E\u540D url", type: String } } }], [import("./friendship/friendship.controller"), { "FriendshipController": { "create": { summary: "\u6DFB\u52A0\u597D\u53CB", type: String }, "approved": { summary: "\u540C\u610F\u6DFB\u52A0\u597D\u53CB", type: String }, "rejected": { summary: "\u62D2\u7EDD\u6DFB\u52A0\u597D\u53CB", type: String }, "delete": { summary: "\u5220\u9664\u597D\u53CB", type: String }, "requestList": { summary: "\u4E2A\u4EBA\u7684\u6536\u5230/\u53D1\u51FA\u7684\u8BF7\u6C42\u5217\u8868", type: t["./friendship/vo/friendship.vo"].FriendshipRequestVo }, "friendshipList": { summary: "\u83B7\u53D6\u597D\u53CB\u5217\u8868" } } }], [import("./chatroom/chatroom.controller"), { "ChatroomController": { "create": { summary: "\u521B\u5EFA\u4E00\u5BF9\u4E00\u804A\u5929", type: Number }, "createGroup": { summary: "\u521B\u5EFA\u7FA4\u804A" }, "getChatRooms": { summary: "\u83B7\u53D6\u5F53\u524D\u7528\u6237\u6240\u6709\u7684\u804A\u5929\u5BA4" }, "getMembers": { summary: "\u67E5\u627E\u804A\u5929\u5BA4\u6210\u5458" }, "getChatroomInfo": { summary: "\u83B7\u53D6\u804A\u5929\u5BA4\u4FE1\u606F" }, "joinGroup": { summary: "\u52A0\u5165\u7FA4\u804A", type: String }, "quitGroup": { summary: "\u9000\u51FA/\u8E22\u51FA\u7FA4\u804A", type: String }, "disbandGroup": { summary: "\u89E3\u6563\u7FA4\u804A", type: String } } }], [import("./chat-history/chat-history.controller"), { "ChatHistoryController": { "addRecord": { summary: "\u83B7\u53D6\u804A\u5929\u5BA4\u4FE1\u606F" }, "getList": { summary: "\u83B7\u53D6\u804A\u5929\u5BA4\u4FE1\u606F" } } }], [import("./favorite/favorite.controller"), { "FavoriteController": { "getList": { summary: "\u6536\u85CF\u5217\u8868", type: [t["./favorite/vo/favorite.vo"].FavoriteItemVo] }, "addFavorite": { summary: "\u6DFB\u52A0\u6536\u85CF", type: String }, "delFavorite": { summary: "\u5220\u9664\u6536\u85CF", type: String }, "getFavoriteDetail": { summary: "\u83B7\u53D6\u5355\u4E2A\u6536\u85CF\u7684\u804A\u5929\u8BB0\u5F55", type: [t["./favorite/vo/favorite.vo"].ChatRecordItemVo] } } }]] } };
};