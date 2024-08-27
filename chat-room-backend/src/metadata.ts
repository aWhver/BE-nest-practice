/* eslint-disable */
export default async () => {
    const t = {};
    return { "@nestjs/swagger": { "models": [[import("./user/dto/create-user.dto"), { "CreateUserDto": {} }], [import("./user/dto/update-user.dto"), { "UpdateUserDto": {} }], [import("./user/entities/user.entity"), { "User": {} }]], "controllers": [[import("./app.controller"), { "AppController": { "getHello": { type: String } } }], [import("./user/user.controller"), { "UserController": { "create": { summary: "\u7528\u6237\u6CE8\u518C", type: String }, "findAll": { type: String }, "findOne": { type: String }, "update": { type: String }, "remove": { type: String } } }]] } };
};