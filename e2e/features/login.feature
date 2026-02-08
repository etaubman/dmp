Feature: Login
  As a user I want to sign in so that I can use the Data Manager Portal.

  Scenario: Successful login with valid credentials
    Given the app is running at "http://localhost:4200"
    When I open the login page
    And I enter email "ethan.taubman@example.com" and password "password"
    And I click "Sign in"
    Then I should be on the home page
    And I should see the main layout with sidebar

  Scenario: Login page shows when not authenticated
    Given the app is running at "http://localhost:4200"
    When I open the login page
    Then I should see the login form
    And I should see "Sign in to continue"

  Scenario: Invalid credentials show error
    Given the app is running at "http://localhost:4200"
    When I open the login page
    And I enter email "wrong@example.com" and password "wrongpassword"
    And I click "Sign in"
    Then I should see an auth error message
    And I should remain on the login page
