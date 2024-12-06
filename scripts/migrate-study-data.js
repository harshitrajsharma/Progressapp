"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function migrateStudyData() {
    return __awaiter(this, void 0, void 0, function () {
        var users, _loop_1, _i, users_1, user, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, 7, 9]);
                    console.log('Starting study data migration...');
                    return [4 /*yield*/, prisma.user.findMany({
                            include: {
                                subjects: {
                                    include: {
                                        chapters: {
                                            include: {
                                                topics: true
                                            }
                                        }
                                    }
                                },
                                studyStreak: true,
                                dailyActivities: true
                            }
                        })];
                case 1:
                    users = _a.sent();
                    console.log("Found ".concat(users.length, " users to migrate"));
                    _loop_1 = function (user) {
                        var topics, progressEntries, config;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    console.log("Migrating data for user: ".concat(user.email));
                                    topics = user.subjects.flatMap(function (subject) {
                                        return subject.chapters.flatMap(function (chapter) {
                                            return chapter.topics.map(function (topic) { return ({
                                                id: topic.id,
                                                name: topic.name,
                                                subject: subject.name,
                                                priority: topic.important ? 'HIGH' : 'MEDIUM',
                                                estimatedHours: calculateEstimatedHours(topic, subject),
                                                track: determineTrack(chapter, subject),
                                                completedHours: calculateCompletedHours(topic),
                                                lastStudied: topic.lastRevised
                                            }); });
                                        });
                                    });
                                    progressEntries = topics.map(function (topic) { return ({
                                        userId: user.id,
                                        topicId: topic.id,
                                        completedHours: topic.completedHours || 0,
                                        lastStudied: topic.lastStudied || new Date(),
                                        confidence: calculateConfidence(topic.id, user.subjects)
                                    }); });
                                    config = {
                                        examDate: user.examDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                                        dailyAvailableHours: {
                                            MORNING: 4,
                                            AFTERNOON: 4,
                                            EVENING: 4
                                        },
                                        preferredTrackOrder: ['CORE', 'MATHEMATICAL', 'REVISION'],
                                        topicPriorityWeights: {
                                            HIGH: 1.5,
                                            MEDIUM: 1.0,
                                            LOW: 0.5
                                        }
                                    };
                                    // Create initial study plan
                                    return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                            var dailyPlans, studyPlan;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: 
                                                    // Create study progress entries
                                                    return [4 /*yield*/, tx.studyProgress.createMany({
                                                            data: progressEntries,
                                                            skipDuplicates: true
                                                        })];
                                                    case 1:
                                                        // Create study progress entries
                                                        _a.sent();
                                                        dailyPlans = generateInitialDailyPlans(topics, config);
                                                        return [4 /*yield*/, tx.studyPlan.create({
                                                                data: {
                                                                    userId: user.id,
                                                                    startDate: new Date(),
                                                                    endDate: config.examDate,
                                                                    config: config, // JSON type in Prisma
                                                                    dailyPlans: {
                                                                        create: dailyPlans.map(function (plan) { return ({
                                                                            date: plan.date,
                                                                            slots: plan.slots, // JSON type in Prisma
                                                                            totalHours: plan.totalHours
                                                                        }); })
                                                                    }
                                                                }
                                                            })];
                                                    case 2:
                                                        studyPlan = _a.sent();
                                                        console.log("Created study plan ".concat(studyPlan.id, " for user ").concat(user.email));
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); })];
                                case 1:
                                    // Create initial study plan
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, users_1 = users;
                    _a.label = 2;
                case 2:
                    if (!(_i < users_1.length)) return [3 /*break*/, 5];
                    user = users_1[_i];
                    return [5 /*yield**/, _loop_1(user)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('Study data migration completed successfully');
                    return [3 /*break*/, 9];
                case 6:
                    error_1 = _a.sent();
                    console.error('Error during migration:', error_1);
                    throw error_1;
                case 7: return [4 /*yield*/, prisma.$disconnect()];
                case 8:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Helper functions
function calculateEstimatedHours(topic, subject) {
    // Base hours based on subject weightage
    var baseHours = subject.weightage * 2;
    // Adjust based on topic importance
    var importanceMultiplier = topic.important ? 1.5 : 1;
    return Math.round(baseHours * importanceMultiplier);
}
function determineTrack(chapter, subject) {
    // Determine track based on subject and chapter characteristics
    if (subject.name.toLowerCase().includes('math') ||
        subject.name.toLowerCase().includes('algorithm')) {
        return 'MATHEMATICAL';
    }
    if (chapter.important) {
        return 'CORE';
    }
    return 'REVISION';
}
function calculateCompletedHours(topic) {
    // Calculate completed hours based on existing progress
    var completedHours = 0;
    if (topic.learningStatus)
        completedHours += 2;
    completedHours += topic.revisionCount * 1;
    completedHours += topic.practiceCount * 1.5;
    completedHours += topic.testCount * 0.5;
    return completedHours;
}
function calculateConfidence(topicId, subjects) {
    // Find the topic in subjects
    for (var _i = 0, subjects_1 = subjects; _i < subjects_1.length; _i++) {
        var subject = subjects_1[_i];
        for (var _a = 0, _b = subject.chapters; _a < _b.length; _a++) {
            var chapter = _b[_a];
            var topic = chapter.topics.find(function (t) { return t.id === topicId; });
            if (topic) {
                // Calculate confidence based on various factors
                var confidence = 0;
                if (topic.learningStatus)
                    confidence += 40;
                confidence += topic.revisionCount * 10;
                confidence += topic.practiceCount * 15;
                confidence += topic.testCount * 5;
                // Cap at 100
                return Math.min(confidence, 100);
            }
        }
    }
    return 0;
}
function generateInitialDailyPlans(topics, config) {
    var plans = [];
    var daysUntilExam = Math.ceil((config.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    // Generate first week of plans
    for (var day = 0; day < Math.min(7, daysUntilExam); day++) {
        var date = new Date();
        date.setDate(date.getDate() + day);
        var slots = generateDailySlots(topics, config.dailyAvailableHours);
        var totalHours = Object.values(config.dailyAvailableHours).reduce(function (a, b) { return a + b; }, 0);
        plans.push({
            date: date,
            slots: slots,
            totalHours: totalHours
        });
    }
    return plans;
}
function generateDailySlots(topics, dailyHours) {
    var slots = [];
    var blocks = ['MORNING', 'AFTERNOON', 'EVENING'];
    blocks.forEach(function (block, index) {
        var hours = dailyHours[block];
        var track = ['CORE', 'MATHEMATICAL', 'REVISION'][index % 3];
        // Find a suitable topic for this slot
        var availableTopics = topics.filter(function (t) { return t.track === track; });
        if (availableTopics.length > 0) {
            var topic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
            slots.push({
                block: block,
                duration: hours,
                topic: topic,
                isCompleted: false
            });
        }
    });
    return slots;
}
// Run migration
migrateStudyData()
    .then(function () {
    console.log('Migration completed successfully');
    process.exit(0);
})
    .catch(function (error) {
    console.error('Migration failed:', error);
    process.exit(1);
});
