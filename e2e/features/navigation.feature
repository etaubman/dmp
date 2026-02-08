Feature: Navigation
  As a logged-in user I want to navigate the app so that I can access different sections.

  Background:
    Given the app is running at "http://localhost:4200"
    And I am logged in as "ethan.taubman@example.com" with password "password"

  Scenario: Navigate to Data Elements from sidebar
    When I click the sidebar link "Critical Data Elements"
    Then the URL should contain "/data-elements"
    And I should see content for the data elements page

  Scenario: Navigate to Applications from sidebar
    When I click the sidebar link "Applications"
    Then the URL should contain "/applications"

  @skip
  Scenario: Navigate to Home from sidebar
    When I am on the "data-elements" page
    When I click the sidebar link "Home"
    Then the URL path should be "/"

  Scenario: Navigate to Admin section
    When I click the sidebar link "Admin"
    Then the URL should contain "/admin"
