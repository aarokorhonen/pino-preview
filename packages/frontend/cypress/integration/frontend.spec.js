/// <reference types="cypress" />

context("Waiting", () => {
    beforeEach(() => {
        cy.visit("http://localhost:5000");
    });
    // BE CAREFUL of adding unnecessary wait times.
    // https://on.cypress.io/best-practices#Unnecessary-Waiting

    // https://on.cypress.io/wait
    it("cy.wait() - wait for a specific amount of time", () => {
        cy.get("[data-test-app-title]").contains("JSON Log Preview");
    });
});
