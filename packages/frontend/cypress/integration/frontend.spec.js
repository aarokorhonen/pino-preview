/// <reference types="cypress" />

context("Frontend", () => {
    beforeEach(() => {
        cy.visit("http://localhost:5000");
    });

    it("loads app frame", () => {
        cy.get("[data-test-app-title]").contains("JSON Log Preview");
        cy.get("[data-test-ws-terminated]").should("not.exist");
    });

    it("shows as terminated when websocket is closed", () => {
        cy.request({
            url: "http://localhost:5000/api/test/connections",
            method: "DELETE",
        });
        cy.get("[data-test-ws-terminated]").should("exist");
    });
});
