describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the hero section', () => {
    cy.get('h1').should('be.visible');
    cy.contains('Ninio Kindergarten').should('be.visible');
  });

  it('should navigate to login page when login button is clicked', () => {
    cy.contains('Log in').click();
    cy.url().should('include', '/auth/login');
  });

  it('should display the programs section', () => {
    cy.contains('Our Programs').should('be.visible');
    cy.get('[data-testid="program-card"]').should('have.length.at.least', 1);
  });

  it('should display the philosophy section', () => {
    cy.contains('Our Philosophy').should('be.visible');
  });

  it('should display the facilities section', () => {
    cy.contains('Our Facilities').should('be.visible');
  });

  it('should open the assistant when the assistant button is clicked', () => {
    cy.contains('Ask Ninio Assistant').click();
    cy.get('[data-testid="ninio-assistant-dialog"]').should('be.visible');
  });
});
