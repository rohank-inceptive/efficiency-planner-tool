# SCIS - Efficiency planner tool

## Postcode look up to enable prospect to pick their specific address

: Postcode: A full postcode, also known as a "postcode unit", identifies a group of addresses or a major delivery point. It consists of an outward code and inward code. The outward code indicates the area and district, while the inward code specifies the sector and delivery point, typically encompassing about 15 addresses.

: Chimnie.com API



## Address
- Confirm property details
- Please confirm if the property details are correct
- Confirm property details are correct button
- Edit property details
  - Replace Confirm property details with Save and next
  
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

- Total after package selection
  - Total from package
    - Deduct discount
      - Show final Total