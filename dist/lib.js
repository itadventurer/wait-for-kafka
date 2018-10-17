"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug = require('debug')('showcase:ensure-kafka-topics:debug');
var error = require('debug')('showcase:ensure-kafka-topics:error');
function doesTopicsExists(client, topics) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, client.topicExistsAsync(topics)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, true];
                case 2:
                    e_1 = _a.sent();
                    if (e_1.constructor.name == 'TopicsNotExistError') {
                        return [2 /*return*/, false];
                    }
                    else {
                        throw e_1;
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function wait_for_topics(client, topics, abort_after_tries, wait_between_tries_s) {
    return __awaiter(this, void 0, void 0, function () {
        var tries, exists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tries = 0;
                    _a.label = 1;
                case 1:
                    if (!(tries < abort_after_tries)) return [3 /*break*/, 4];
                    return [4 /*yield*/, doesTopicsExists(client, topics)];
                case 2:
                    exists = _a.sent();
                    if (exists === true) {
                        return [2 /*return*/, true];
                    }
                    else {
                        debug("One of the topics still does not exist:", topics);
                    }
                    tries++;
                    return [4 /*yield*/, sleep(wait_between_tries_s * 1000)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, false];
            }
        });
    });
}
exports.wait_for_topics = wait_for_topics;
function ensure_topics(client, topics) {
    return __awaiter(this, void 0, void 0, function () {
        var topics_to_create, _a, _b, _i, i, topic, exists, results, i, result;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    topics_to_create = new Array();
                    _a = [];
                    for (_b in topics)
                        _a.push(_b);
                    _i = 0;
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    i = _a[_i];
                    topic = topics[i];
                    return [4 /*yield*/, doesTopicsExists(client, [topic['topic']])];
                case 2:
                    exists = _c.sent();
                    if (!exists) {
                        topics_to_create.push(topic);
                    }
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, client.createTopicsAsync(topics_to_create)];
                case 5:
                    results = _c.sent();
                    for (i in results) {
                        result = results[i];
                        if (result['error']) {
                            error('Error creating topic', result);
                            return [2 /*return*/, false];
                        }
                    }
                    console.log("return");
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.ensure_topics = ensure_topics;
