/// <reference types="cypress" />

context("Frontend", () => {
    beforeEach(() => {
        cy.visit("http://localhost:5000");
    });

    it("loads app frame", () => {
        cy.get("[data-test-app-title]").contains("JSON Log Preview");
        cy.get("[data-test-ws-terminated]").should("not.exist");
    });

    it("renders a new message", () => {
        cy.request({
            url: "http://localhost:5000/api/test/messages",
            method: "POST",
            body: {
                time: new Date(1624986915208).getTime(),
                level: 40,
                msg: "[data-test-log-msg-001] Hello World",
            },
        });
        cy.contains("data-test-log-msg-001")
            .parent()
            .contains("WARN")
            .parent()
            .contains("2021-06-29 17:15:15Z");
    });

    it("shows as terminated when websocket is closed", () => {
        cy.request({
            url: "http://localhost:5000/api/test/reset",
            method: "POST",
        });
        cy.get("[data-test-ws-terminated]").should("exist");
    });
});
