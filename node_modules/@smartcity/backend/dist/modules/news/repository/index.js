"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsRepository = void 0;
const repository_1 = require("../../../core/database/repository");
const nowMs = Date.now();
const daysAgo = (d) => new Date(nowMs - d * 86_400_000).toISOString();
const hoursAgo = (h) => new Date(nowMs - h * 3_600_000).toISOString();
const seedNews = [
    {
        id: "nws_seed_001",
        slug: "city-opens-new-central-park-pavilion",
        title: "City Opens New Central Park Pavilion",
        summary: "A new community pavilion opens in Central Park with seating for 200.",
        content: "The city unveiled a new multi-purpose pavilion in Central Park today. Built with sustainable materials, the pavilion hosts farmers markets and community events year-round.",
        category: "GENERAL",
        authorId: "usr_seed_admin",
        authorName: "System Admin",
        published: true,
        publishedAt: daysAgo(2),
        createdAt: daysAgo(3),
        updatedAt: daysAgo(2),
    },
    {
        id: "nws_seed_002",
        slug: "winter-utility-maintenance-schedule",
        title: "Winter Utility Maintenance Schedule Announced",
        summary: "Planned maintenance on water and electricity networks over the coming weeks.",
        content: "Residents are advised of scheduled maintenance windows for water pumps and transformer stations. Work is planned during off-peak hours to minimise disruption.",
        category: "UTILITIES",
        authorId: "usr_seed_admin",
        authorName: "System Admin",
        published: true,
        publishedAt: daysAgo(5),
        createdAt: daysAgo(6),
        updatedAt: daysAgo(3),
    },
    {
        id: "nws_seed_003",
        slug: "citizen-app-v2-beta",
        title: "Citizen App v2 — Beta Signups Open",
        summary: "The refreshed citizen app is now accepting beta testers.",
        content: "Sign up to test the new Citizen App featuring live complaint tracking, push notifications and digital payment. Feedback will shape the public launch.",
        category: "PRODUCT",
        authorId: "usr_seed_admin",
        authorName: "System Admin",
        published: false,
        publishedAt: null,
        createdAt: hoursAgo(8),
        updatedAt: hoursAgo(8),
    },
    {
        id: "nws_seed_004",
        slug: "smart-streetlight-rollout-finishes",
        title: "Smart Streetlight Rollout Completes",
        summary: "All 12 districts now feature energy-efficient smart streetlighting.",
        content: "The final phase of the smart streetlight project has been completed, covering all twelve residential districts. Sensors reduce energy use by 30% and detect faults automatically.",
        category: "INFRASTRUCTURE",
        authorId: "usr_head-pw",
        authorName: "Ayesha Khan",
        published: true,
        publishedAt: daysAgo(9),
        createdAt: daysAgo(10),
        updatedAt: daysAgo(9),
    },
    {
        id: "nws_seed_005",
        slug: "draft-q3-budget-consultation",
        title: "Q3 Budget Consultation — Public Feedback Window",
        summary: "Draft departmental budgets are open for public review (draft).",
        content: "The draft Q3 budgets for all departments are published for a 14-day public consultation window before the council vote.",
        category: "GOVERNANCE",
        authorId: "usr_head-pw",
        authorName: "Ayesha Khan",
        published: false,
        publishedAt: null,
        createdAt: daysAgo(1),
        updatedAt: hoursAgo(2),
    },
];
exports.newsRepository = {
    articles: (0, repository_1.collection)("news_articles"),
    findBySlug(slug) {
        return this.articles.all().find((a) => a.slug === slug);
    },
    reset() {
        this.articles.seed(seedNews);
    },
};
exports.default = exports.newsRepository;
//# sourceMappingURL=index.js.map