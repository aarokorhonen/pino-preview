/// <reference types="cypress" />

context("Frontend", () => {
    beforeEach(() => {
        cy.request({
            url: "http://localhost:5000/api/test/reset",
            method: "POST",
        });
        cy.visit("http://localhost:5000");
    });

    it("loads app frame", () => {
        cy.get("[data-test-app-title]").contains("JSON Log Preview");
        cy.get("[data-test-ws-terminated]").should("not.exist");
        cy.get("[data-test-modal]").should("not.exist");
    });

    it("renders a new message", () => {
        cy.request({
            url: "http://localhost:5000/api/test/messages",
            method: "POST",
            body: {
                messages: [
                    {
                        time: new Date(1624986915208).getTime(),
                        level: 40,
                        msg: "[data-test-log-msg-001] Hello World",
                    },
                ],
            },
        });
        cy.contains("data-test-log-msg-001")
            .parent()
            .contains("WARN")
            .parent()
            .contains("2021-06-29 17:15:15Z");
    });

    it.only("renders 100 messages", () => {
        const messages = [];
        for (let i = 0; i < 100; i++) {
            messages.push({
                time: new Date(1624986915208 + i * 1000).getTime(),
                level: 40,
                msg: `[data-test-log-msg-${String(i).padStart(
                    3,
                    "0",
                )}] Hello World`,
            });
        }
        cy.request({
            url: "http://localhost:5000/api/test/messages",
            method: "POST",
            body: {
                messages,
            },
        });
        cy.contains("data-test-log-msg-098");
        cy.get("svelte-virtual-list-viewport").scrollTo(0);
        cy.contains("data-test-log-msg-000");
        cy.get("[data-test-scroll-to-bottom]").click();
        cy.contains("data-test-log-msg-099");
    });

    it("opens and closes dialog", () => {
        cy.request({
            url: "http://localhost:5000/api/test/messages",
            method: "POST",
            body: {
                messages: [
                    {
                        time: new Date(1624986915208).getTime(),
                        level: 40,
                        msg: "[data-test-log-msg-001] Hello World",
                    },
                ],
            },
        });
        cy.contains("data-test-log-msg-001").click();
        cy.get("[data-test-modal]").contains(
            `"msg": "[data-test-log-msg-001] Hello World"`,
        );
        cy.get("[data-test-modal-close]").click();
        cy.get("[data-test-modal]").should("not.exist");
    });

    it("shows as terminated when websocket is closed", () => {
        cy.request({
            url: "http://localhost:5000/api/test/reset",
            method: "POST",
        });
        cy.get("[data-test-ws-terminated]").should("exist");
    });
});
