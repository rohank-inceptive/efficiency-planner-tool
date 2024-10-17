# SCIS - Efficiency planner tool

## Postcode look up to enable prospect to pick their specific address

: Postcode: A full postcode, also known as a "postcode unit", identifies a group of addresses or a major delivery point. It consists of an outward code and inward code. The outward code indicates the area and district, while the inward code specifies the sector and delivery point, typically encompassing about 15 addresses.

: Chimnie.com API



## Address
- Insert postcode
  - Show property for that postcode in search suggestions
  - User selects address (search suggestion)
    - Fetch property details for that address in disabled form
      - Confirm property details (button)
        - Show modal for confirm property details
          - Confirm property details are correct (button)
            - Hide Confirm property details (button)
            - User cannot edit information after confirming details
            - Enable Next (button) of wizard to move to next step
          - Edit property details (button)
            - Enable address form
            - Replace Confirm property details (button) with Save and next (button)
    - Show Previous (to select new postcode) Next (enable if details are confirmed)
  
## Requirements
- Electric Car
  - Ask user if they have or plan to purchase an electric car
    - Radio
      - Yes? Ask user if they have an EV Charger
        - Radio
          - Yes
          - No
      - No
- Ask user if they have room in loft or roof
  - Radio
    - Yes
    - No

## Options

- Plans

- forms
  - checkbox
    - If form has checkbox checked
      - Add UI (border/shadow) to indicate selected package
      - Remove selected package indicator on any other form (deselect other packages, ensuring only one package is highlighted at a time)
    - If form has checkbox unchecked
      - If no checkboxes are checked in selected package
        - Remove selected package indicator on current form (deselect the package)
      - Else
        - Keep the package indicator, as it is still considered selected.

- Row
  - col-6
    - Low cost quick wins
      - Checkbox input
        - Window and door draft proofing
          - Dummy value
        - Low-energy light bulbs
          - Dummy value
      - Total in pound (update based on selection)
  - col-6
    - Budget-friendly energy efficiency solutions
      - Checkbox input
        - Loft insulation
          - Dummy value
        - Cavity Wall insulation
          - Dummy value
        - Ventilation
          - Dummy value
        - EV Charger
          - Dummy value
      - Total in pound (update based on selection)
- Row
- col-12
  - Higher-cost longer term
      - Checkbox input
        - Solar
          - Dummy value
        - Solar + Battery
          - Dummy value
        - Air Source or Ground Source Heat Pump
          - Dummy value
        - New double glazing
          - Dummy value
        - External wall insulation
          - Dummy value
        - Internal wall insulation
          - Dummy value
      - Total in pound (update based on selection)

- Higher-cost longer term
  - Checkbox input
    - Solar input
      - Uncheck and disable if solarBattery input is checked
      - Enable if solarBattery input is unchecked
    - solarBattery input

- Summary after package selection
  - Total from package
    - Deduct discount
      - Show final Total
  - Total bill saving
  - Total carbon saving
  - Total increase in property value
  - EPC rating
    - Nested if-else on carbon saving to calculate EPC rating
      - Show current rating and rating with package