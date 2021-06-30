/// <reference types="cypress" />

context("Frontend", () => {
    beforeEach(() => {
        cy.visit("http://localhost:5000");
    });

    it("loads app frame", () => {
        cy.get("[data-test-app-title]").contains("JSON Log Preview");
    });

    it("shows as terminated without websocket connection", () => {
        cy.get("[data-test-ws-terminated]").should("exist");
    });
});
