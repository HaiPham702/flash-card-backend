'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var User = require("@models/User");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var errorCode = require('@constants/errorCode');

var resolvers = {
    Query: {
        users: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                _context.next = 3;
                                return User.find();

                            case 3:
                                return _context.abrupt('return', _context.sent);

                            case 6:
                                _context.prev = 6;
                                _context.t0 = _context['catch'](0);

                                console.error("Lỗi getUsers:", _context.t0.message); // ✅ In lỗi ra console
                                throw new Error("Lỗi server!");

                            case 10:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, undefined, [[0, 6]]);
            }));

            return function users() {
                return _ref.apply(this, arguments);
            };
        }(),
        user: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_, _ref3) {
                var id = _ref3.id;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return User.findById(id);

                            case 2:
                                return _context2.abrupt('return', _context2.sent);

                            case 3:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, undefined);
            }));

            return function user(_x, _x2) {
                return _ref2.apply(this, arguments);
            };
        }()
    },

    Mutation: {
        addUser: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_, _ref5) {
                var name = _ref5.name,
                    email = _ref5.email,
                    age = _ref5.age,
                    phoneNumber = _ref5.phoneNumber,
                    password = _ref5.password;
                var user;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                user = new User({ name: name, email: email, age: age, phoneNumber: phoneNumber, password: password });
                                _context3.next = 3;
                                return user.save();

                            case 3:
                                return _context3.abrupt('return', user);

                            case 4:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, undefined);
            }));

            return function addUser(_x3, _x4) {
                return _ref4.apply(this, arguments);
            };
        }(),

        updateUser: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_, _ref7) {
                var id = _ref7.id,
                    name = _ref7.name,
                    email = _ref7.email,
                    age = _ref7.age;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return User.findByIdAndUpdate(id, { name: name, email: email, age: age }, { new: true });

                            case 2:
                                return _context4.abrupt('return', _context4.sent);

                            case 3:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, undefined);
            }));

            return function updateUser(_x5, _x6) {
                return _ref6.apply(this, arguments);
            };
        }(),

        deleteUser: function () {
            var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(_, _ref9) {
                var id = _ref9.id;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return User.findByIdAndDelete(id);

                            case 2:
                                return _context5.abrupt('return', "User deleted!");

                            case 3:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, undefined);
            }));

            return function deleteUser(_x7, _x8) {
                return _ref8.apply(this, arguments);
            };
        }(),

        register: function () {
            var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(_, _ref11) {
                var username = _ref11.username,
                    password = _ref11.password;
                var hashedPassword, user;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.prev = 0;
                                _context6.next = 3;
                                return bcrypt.hash(password, 10);

                            case 3:
                                hashedPassword = _context6.sent;
                                user = new User({ username: username, password: hashedPassword });
                                _context6.next = 7;
                                return user.save();

                            case 7:
                                return _context6.abrupt('return', user);

                            case 10:
                                _context6.prev = 10;
                                _context6.t0 = _context6['catch'](0);
                                _context6.t1 = _context6.t0.code;
                                _context6.next = _context6.t1 === errorCode.Duplicate ? 15 : 16;
                                break;

                            case 15:
                                throw new Error('Tên đăng nhập đã tồn tại');

                            case 16:
                                throw new Error("Lỗi server!");

                            case 17:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, undefined, [[0, 10]]);
            }));

            return function register(_x9, _x10) {
                return _ref10.apply(this, arguments);
            };
        }(),

        login: function () {
            var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(_, _ref13) {
                var username = _ref13.username,
                    password = _ref13.password;
                var user, isMatch, token;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return User.findOne({
                                    $or: [{ username: username }]
                                });

                            case 2:
                                user = _context7.sent;

                                if (user) {
                                    _context7.next = 5;
                                    break;
                                }

                                throw new Error('User not found');

                            case 5:
                                _context7.next = 7;
                                return bcrypt.compare(password, user.password);

                            case 7:
                                isMatch = _context7.sent;

                                if (isMatch) {
                                    _context7.next = 10;
                                    break;
                                }

                                throw new Error('Incorrect password');

                            case 10:

                                // Tạo token JWT
                                token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.EXPIRES_IN });
                                return _context7.abrupt('return', { id: user.id, username: user.username, email: user.email, token: token });

                            case 12:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, undefined);
            }));

            return function login(_x11, _x12) {
                return _ref12.apply(this, arguments);
            };
        }(),

        /**
         * @description: Reset password
         * @param {*} _ 
         * @param {*} param1 
         * @returns 
         */
        resetPassword: function () {
            var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(_, _ref15) {
                var username = _ref15.username,
                    newpassword = _ref15.newpassword;
                var user, hashedPassword;
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.prev = 0;
                                _context8.next = 3;
                                return User.findOne({ username: username });

                            case 3:
                                user = _context8.sent;

                                if (!user) {
                                    _context8.next = 13;
                                    break;
                                }

                                _context8.next = 7;
                                return bcrypt.hash(newpassword, 10);

                            case 7:
                                hashedPassword = _context8.sent;
                                _context8.next = 10;
                                return User.findOneAndUpdate({ _id: user.id }, { password: hashedPassword }, { new: true });

                            case 10:
                                return _context8.abrupt('return', _context8.sent);

                            case 13:
                                throw new Error('User not found');

                            case 14:
                                _context8.next = 20;
                                break;

                            case 16:
                                _context8.prev = 16;
                                _context8.t0 = _context8['catch'](0);

                                console.error("Lỗi resetPassword:", _context8.t0.message); // ✅ In lỗi ra console
                                throw new Error("Lỗi server!");

                            case 20:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, undefined, [[0, 16]]);
            }));

            return function resetPassword(_x13, _x14) {
                return _ref14.apply(this, arguments);
            };
        }()
    }
};

var typeDefs = '\n  type User {\n    id: ID!\n    name: String\n    email: String\n    age: Int\n    phoneNumber: String\n    token: String\n    username: String!\n  }\n\n  type Query {\n    users: [User]\n    user(id: ID!): User\n  }\n\n  type Mutation {\n    addUser(name: String!, email: String!, age: Int!, phoneNumber: String!, password: String!): User\n    updateUser(id: ID!, name: String, email: String, age: Int, phoneNumber: String): User\n    deleteUser(id: ID!): String\n    register(username: String!, email: String!, password: String!): User!\n    login(username: String!, password: String!): User!  # \u2705 Th\xEAm login\n    resetPassword(username: String!, newpassword: String!): User\n  }\n';

module.exports = { resolvers: resolvers, typeDefs: typeDefs };