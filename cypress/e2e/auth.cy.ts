describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('should display the login form', () => {
    cy.get('h1').should('contain', 'Login');
    cy.get('form').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should navigate to register page when register link is clicked', () => {
    cy.contains('Create an account').click();
    cy.url().should('include', '/auth/register');
  });

  it('should navigate to forgot password page when forgot password link is clicked', () => {
    cy.contains('Forgot password').click();
    cy.url().should('include', '/auth/forgot-password');
  });

  it('should display the register form when on register page', () => {
    cy.visit('/auth/register');
    cy.get('h1').should('contain', 'Register');
    cy.get('form').should('be.visible');
    cy.get('input[name="firstName"]').should('be.visible');
    cy.get('input[name="lastName"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });
});
