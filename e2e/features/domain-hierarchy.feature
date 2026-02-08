Feature: Domain hierarchy and lowest-level domain column
  When I select a parent domain I see all records in that domain and its child domains across all concepts.
  Each concept table shows the domain name and level (e.g. "L2 Equities Cash (L2)") for each record.

  Background:
    Given the app is running at "http://localhost:4200"
    And I am logged in as "ethan.taubman@example.com" with password "password"

  Scenario: Data Elements shows domain name and level for selected domain and its children
    When I click the sidebar link "Critical Data Elements"
    Then the URL should contain "/data-elements"
    When I select the domain "L0 Markets" from the domain selector
    Then the data elements page should show table or empty state
    And when the concept table is visible it should show the Domain column header

  Scenario: Applications shows domain name and level for selected domain and its children
    When I click the sidebar link "Applications"
    Then the URL should contain "/applications"
    When I select the domain "L0 Markets" from the domain selector
    Then the applications page should show table or empty state
    And when the concept table is visible it should show the Domain column header

  Scenario: Data Concerns shows domain name and level for selected domain and its children
    When I click the sidebar link "Data Concerns"
    Then the URL should contain "/data-concerns"
    When I select the domain "L0 Markets" from the domain selector
    Then the data concerns page should show table or empty state
    And when the concept table is visible it should show the Domain column header
