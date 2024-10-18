optionsCarbonSaving = 0;
optionsEpcRating = "E";

$(document).ready(function () {
  /* -------- GLOBAL VARIABLE -------- */
  const dummyAddresses = [
    "33, Langham Gardens, Wembley, HA0 3RG",
    "221B Baker Street, Marylebone, London NW1 6XE",
  ];

  let isAddressValid = false;
  let isAddressSelected = false;
  let isRequirementValid = false;
  let isOptionsValid = false;
  let currentPackageOption = "";

  /* -------- COMMON JS ------- */
  $("#smartwizard").smartWizard({
    selected: 0,
    theme: "arrows",
    transition: {
      animation: "fade",
    },
    disabledSteps: [1, 2, 3],
    toolbar: {
      showNextButton: false,
      showPreviousButton: false,
    },
  });

  // Update wizard state on address state
  $("#smartwizard").on(
    "showStep",
    function (e, anchorObject, stepIndex, stepDirection, stepPosition) {
      /* Enable next button if step is valid */
      setButtonState($(".sw-btn-next"), false);
      if (stepIndex == 0 && isAddressValid) {
        updateWizardState(true, 0);
      } else if (stepIndex === 1 && isRequirementValid) {
        updateWizardState(true, 1);
      } else if (stepIndex === 2 && isOptionsValid) {
        setButtonState($(".sw-btn-next"), true);
      }

      if (stepIndex === 0 && isAddressSelected) {
        setButtonState($(".sw-btn-prev"), true);
      }

      /* Options */
      if (stepIndex === 2) {
        $(".sw-btn-next").text("Submit");
      } else {
        $(".sw-btn-next").text("Next");
      }
    }
  );

  // Update wizard on click event
  $("#smartwizard").on("click", ".sw-btn-prev", function () {
    let stepInfo = $("#smartwizard").smartWizard("getStepInfo");
    // Show postcode search on previous button click
    if (stepInfo.currentStep === 0) {
      isAddressSelected = false;
      var options = {
        toolbar: {
          showNextButton: false,
          showPreviousButton: false,
        },
      };
      $("#smartwizard").smartWizard("setOptions", options);
      toggleVisibility($("#validateAddressModal"), true);
      toggleVisibility($("#saveAddress"), false);
      toggleVisibility($("#epc_verification_form"), false);
      toggleVisibility($("#search_postcode_form"), true);
      setButtonState($("#smartwizard .sw-btn-prev"), false);
      updateWizard();
    }
  });

  $("#smartwizard").on("click", ".sw-btn-next", function () {
    let stepInfo = $("#smartwizard").smartWizard("getStepInfo");
    // Open modal for submission of contact detail
    if (stepInfo.currentStep === 2) {
      $("#contactModal").modal("show");
    }
  });

  /* ---- ADDRESS STEP -----*/
  /* Dummy suggestion search input */
  // Show dummy suggestions on search input
  $("#postalCode").on("input", function () {
    const input = $(this).val();
    const suggestionsContainer = $("#suggestionsContainer");
    suggestionsContainer.empty();
    if (input) {
      suggestionsContainer.show();

      dummyAddresses.forEach((address) => {
        const suggestionItem = $('<div class="suggestion-item"></div>').text(
          address
        );
        suggestionItem.on("click", function () {
          selectAddress(address);
        });
        suggestionsContainer.append(suggestionItem);
      });
    } else {
      suggestionsContainer.hide();
    }
  });

  // Show selected address on postcode input
  function selectAddress(address) {
    $("#postalCode").val(address);
    $("#suggestionsContainer").hide();
  }

  // Hide search suggestion on postcode input
  $(document).on("click", function (event) {
    let stepInfo = $("#smartwizard").smartWizard("getStepInfo");
    if (stepInfo.currentStep === 0) {
      if (!$(event.target).closest("#postalCode").length) {
        $("#suggestionsContainer").hide();
      }
    }
  });

  // Post code search to show address form and hide postcode form
  $("#search_postcode_form").on("submit", function (e) {
    e.preventDefault();
    isAddressSelected = true;
    var options = {
      toolbar: {
        showNextButton: true,
        showPreviousButton: true,
      },
    };
    $("#smartwizard").smartWizard("setOptions", options);
    toggleVisibility($("#epc_verification_form"), true);
    toggleVisibility($("#search_postcode_form"), false);
    setButtonState($("#smartwizard .sw-btn-prev"), true);
    setButtonState($("#smartwizard .sw-btn-next"), false);
    $("#smartwizard .sw-btn-prev").prop("disabled", false);
    $("#smartwizard .sw-btn-next").prop("disabled", true);
    updateWizard();
  });

  // Validate address and enable requirement step
  $("#confirmAddressValidation").on("click", function (e) {
    e.preventDefault();
    isAddressValid = true;
    toastr.success("Property Details Confirmed Successfully");
    setButtonState($("#smartwizard .sw-btn-next"), true);
    updateWizardState(true, 0);
    toggleVisibility($("#validateAddressModal"), false);
    $("#validationModal").modal("hide");
  });

  // Enable address form and show save button
  $("#updateAddressValidation").on("click", function (e) {
    isAddressValid = true;
    $("#epc_verification_form input").prop("disabled", false);
    $("#epc_verification_form select").prop("disabled", false);
    toggleVisibility($("#validateAddressModal"), false);
    toggleVisibility($("#saveAddress"), true);
    $("#validationModal").modal("hide");
    updateWizard();
  });

  // Enable requirement step and navigate to it
  $("#saveAddress").on("click", function (e) {
    e.preventDefault();
    toastr.success("Property Details Updated Successfully.");
    setTimeout(() => {
      updateWizardState(true, 0);
      $("#smartwizard").smartWizard("next");
    }, 1500);
  });

  /* Requirement */
  // Radio button visibility for electric car and ev charger input
  $('input[name="electricCar"]').change(function () {
    if ($("#electricCarYes").is(":checked")) {
      toggleVisibility($("#evChargerSection"), true);
    } else {
      toggleVisibility($("#evChargerSection"), false);
      $('input[name="evCharger"]').prop("checked", false);
    }
    updateWizard();
  });

  // Check for input to change state of wizard stepsf
  $('#requirementForm input[type="radio"]').on("change", function () {
    checkRequirementFormCompletion();
  });

  /* Options */
  $('#options input[type="checkbox"]').on("change", function () {
    const currentForm = $(this).closest("form");
    const currentFormName = currentForm.attr("id");
    if (currentPackageOption != currentFormName) {
      currentPackageOption = currentFormName;
      $("#options form")
        .not(currentForm)
        .each(function () {
          $(this).find('input[type="checkbox"]').prop("checked", false);
        });
      $("#options").find(".card").removeClass("selected-package");

      $("#solar").prop("disabled", false);
      $("#" + currentFormName + "-card").addClass("selected-package");
    }

    // Solar and solar battery checkbox
    if (currentPackageOption == "higher-cost-form") {
      const solar = $("#solar");
      const solarBattery = $("#solarBattery");
      if (solarBattery.is(":checked")) {
        solar.prop("checked", false);
        solar.prop("disabled", true);
      } else {
        solar.prop("disabled", false);
      }
    }

    const form = $("#" + currentPackageOption);
    const allCheckboxes = form.find('input[type="checkbox"]');
    if (allCheckboxes.filter(":checked").length === 0) {
      currentPackageOption = "";
      $("#options").find(".card").removeClass("selected-package");
    }

    if (currentFormName == "low-cost-form") {
      updateTotal("low-cost-form", "lowCostTotal");
    } else if (currentFormName == "budget-friendly-form") {
      updateTotal("budget-friendly-form", "budgetFriendlyTotal");
    } else {
      updateTotal("higher-cost-form", "higherCostTotal");
    }
    if (page == "withChart") {
      // Chart
      let chartEpcRating = 0;
      let potentialColor = "";
      if (optionsCarbonSaving >= 1000) {
        chartEpcRating = 6;
        potentialColor = "#16c924";
      } else if (optionsCarbonSaving >= 500) {
        chartEpcRating = 5;
        potentialColor = "#55a849";
      } else if (optionsCarbonSaving >= 100) {
        chartEpcRating = 4;
        potentialColor = "#efff5e";
      } else if (optionsCarbonSaving > 10) {
        chartEpcRating = 3;
        potentialColor = "#ffd966";
      } else {
        chartEpcRating = 2;
        potentialColor = "#ffb75d";
      }

      // Carbon Saving Chart
      chart.updateSeries([
        {
          data: [
            {
              y: 300,
              x: "Current",
            },
            {
              y: optionsCarbonSaving + 300,
              x: "Potential",
            },
          ],
        },
      ]);
      chart.updateOptions({
        colors: ["#ffb75d", potentialColor],
      });

      epc_chart.updateSeries([
        {
          data: [
            {
              y: 2,
              x: "Current",
            },
            {
              y: chartEpcRating,
              x: "Potential",
            },
          ],
        },
      ]);
      epc_chart.updateOptions({
        colors: ["#ffb75d", potentialColor],
      });
    }
  });

  if (page == "withChart") {
    // Carbon saving chart
    /*     var carbonSavingOption = {
      series: [{ name: "Carbon Saving", data: [300, 0] }],

      chart: {
        type: "bar",
        toolbar: { show: false },
        foreColor: "#2a3547",
        fontFamily: "inherit",
        sparkline: { enabled: false },
      },

      colors: ["#ffb75d"],

      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "38%",
          borderRadius: [6],
          borderRadiusApplication: "end",
          borderRadiusWhenStacked: "all",
        },
      },
      markers: { size: 0 },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      grid: {
        show: false,
      },
      xaxis: {
        show: false,
        type: "categories",
        categories: ["Current Carbon Saving", "Potential Carbon Saving"],
        labels: {
          style: { cssClass: "red--text lighten-1--text fill-color" },
        },
      },
      yaxis: {
        show: false,
        min: 0,
        max: 1600,
        tickAmount: 4,
      },
      stroke: {
        show: false,
        width: 3,
        lineCap: "butt",
        colors: ["transparent"],
      },
      title: {
        text: "Carbon Saving",
        align: "center",
        floating: true,
      },
      responsive: [
        {
          breakpoint: 600,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 3,
              },
            },
          },
        },
      ],
    }; */
    var carbonSavingOption = {
      series: [
        {
          name: "Carbon Saving",
          data: [
            {
              y: 300,
              x: "Current",
            },
            {
              y: 300,
              x: "Potential",
            },
          ],
        },
      ],

      chart: {
        type: "bar",
        toolbar: { show: false },
        foreColor: "#2a3547",
        fontFamily: "inherit",
      },

      colors: ["#ffb75d"],

      plotOptions: {
        bar: {
          barHeight: "60%",
          distributed: true,
          horizontal: true,
          dataLabels: {
            position: "bottom",
          },
        },
      },
      markers: { size: 0 },

      dataLabels: {
        enabled: true,
        textAnchor: "start",
        style: {
          colors: ["#5A6A85"],
        },
        formatter: function (val, opt) {
          return val + " Kg/Year";
        },
        offsetX: 10,
      },
      tooltip: {
        enabled: false,
      },
      title: {
        text: "Carbon Saving",
        align: "center",
        floating: true,
      },
      legend: {
        show: true,
      },

      grid: {
        show: false,
        padding: {
          left: 20,
          right: 0,
        },
      },

      xaxis: {
        min: 0,
        max: 1600,
        tickAmount: 4,
      },

      yaxis: {
        show: true,
        type: "categories",
        categories: ["Current", "Potential"],
        labels: {
          style: {
            colors: ["#5A6A85"],
            fontSize: "12px",
          },
        },
      },

      responsive: [
        {
          breakpoint: 600,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 3,
              },
            },
          },
        },
      ],
    };
    var chart = new ApexCharts(
      document.querySelector("#carbon-saving-chart"),
      carbonSavingOption
    );
    chart.render();

    var epc_chart = {
      series: [
        {
          name: "Properties with EPC rating",
          data: [
            {
              y: 2,
              x: "Current",
            },
            {
              y: 2,
              x: "Potential",
            },
          ],
        },
      ],

      chart: {
        type: "bar",
        toolbar: { show: false },
        foreColor: "#2a3547",
        fontFamily: "inherit",
      },

      colors: ["#ffb75d"],

      plotOptions: {
        bar: {
          barHeight: "60%",
          distributed: true,
          horizontal: true,
          dataLabels: {
            position: "bottom",
          },
        },
      },
      markers: { size: 0 },

      dataLabels: {
        enabled: true,
        textAnchor: "start",
        style: {
          colors: ["#5A6A85"],
        },
        formatter: function (val, opt) {
          var epc_ratings = ["F", "E", "D", "C", "B", "A"];
          var rating_text = "";
          if (val) {
            rating_text = epc_ratings[val - 1];
          }
          return "EPC Rating:  " + rating_text;
        },
        offsetX: 10,
      },
      tooltip: {
        enabled: false,
      },
      title: {
        text: "EPC Rating of Property",
        align: "center",
        floating: true,
      },
      legend: {
        show: true,
      },

      grid: {
        show: false,
        padding: {
          left: 20,
          right: 0,
        },
      },

      xaxis: {
        min: 1,
        max: 6,
        labels: {
          formatter: function (value) {
            var epc_ratings = ["F", "E", "D", "C", "B", "A"];
            return epc_ratings[value - 1];
          },
        },
      },

      yaxis: {
        show: true,
        categories: ["Current", "Potential"],
        labels: {
          style: {
            colors: ["#5A6A85"],
            fontSize: "12px",
          },
        },
      },

      responsive: [
        {
          breakpoint: 600,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 3,
              },
            },
          },
        },
      ],
    };

    var epc_chart = new ApexCharts(
      document.querySelector("#epc-chart"),
      epc_chart
    );
    epc_chart.render();
  }

  // Contact submit
  $("#sumbitContactDetails").click(function (e) {
    e.preventDefault();
    toastr.options = {
      closeButton: false,
      progressBar: false,
      positionClass: "toast-top-right",
      preventDuplicates: false,
      showDuration: "300",
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    };
    toastr.success("Contact details shared successfully.");
    setTimeout(() => {
      location.reload();
    }, 2000);
  });
});

/* ------- COMMON FUNCTION ---- */
// Update wizard height
function updateWizard() {
  $("#smartwizard").smartWizard("fixHeight");
}

// Show or hide an element
function toggleVisibility(element, show) {
  if (show) {
    element.removeClass("d-none").show();
  } else {
    element.addClass("d-none").hide();
  }
}

// Enable or disable a button
function setButtonState(button, isEnabled) {
  button.prop("disabled", !isEnabled);
  button.toggleClass("disabled", !isEnabled);
}

// Show or hide an element
function toggleVisibility(element, show) {
  if (show) {
    element.removeClass("d-none").show();
  } else {
    element.addClass("d-none").hide();
  }
}

// Update wizard state of steps based on current step
function updateWizardState(nextStatus, currentStep) {
  let stepInfo = $("#smartwizard").smartWizard("getStepInfo");
  if (nextStatus) {
    setButtonState($(".sw-btn-next"), true);
    $("#smartwizard").smartWizard("stepState", [currentStep], "done");
    $("#smartwizard").smartWizard("unsetState", [currentStep + 1], "disable");
  } else {
    setButtonState($(".sw-btn-next"), false);
    $("#smartwizard").smartWizard("unsetState", [currentStep], "done");
    $("#smartwizard").smartWizard("stepState", [currentStep + 1], "disable");
  }
}

/* ----- ADDRESS STEP ----- */

function previewImage(event, previewId) {
  const reader = new FileReader();
  const previewImg = document.getElementById(previewId);

  reader.onload = function () {
    if (reader.readyState === 2) {
      previewImg.src = reader.result;
    }
  };

  reader.readAsDataURL(event.target.files[0]);
}

/* ------- REQUIREMENT STEP --------- */
// Check if all input have been checked to update wizard status
function checkRequirementFormCompletion() {
  const electricCarSelected = $('input[name="electricCar"]:checked').length > 0;
  const evChargerSelected =
    ($("#electricCarYes").is(":checked") &&
      $('input[name="evCharger"]:checked').length > 0) ||
    $("#electricCarNo").is(":checked");
  const loftSpaceSelected = $('input[name="loftSpace"]:checked').length > 0;
  if (electricCarSelected && evChargerSelected && loftSpaceSelected) {
    isRequirementValid = true;
    updateWizardState(true, 1);
  } else {
    isRequirementValid = false;
    updateWizardState(false, 1);
  }
}

/* ----------- OPTIONS STEP ---------- */

// Update summary based on user checkbox selection
function updateTotal(formId, totalId) {
  let total = 0;
  let discountPercent = 0.1;
  let discountValue = 0;
  let finalTotal = 0;
  let billSaving = 0;
  let propertyValue = 0;
  optionsEpcRating = "E";
  optionsCarbonSaving = 0;

  $(`#${formId} input[type="checkbox"]`).each(function () {
    if ($(this).is(":checked")) {
      total += parseInt($(this).val());
      billSaving += parseInt($(this).data("bill-saving"));
      optionsCarbonSaving += parseInt($(this).data("carbon-saving"));
      propertyValue += parseInt($(this).data("value-added"));
      if (optionsCarbonSaving >= 1000) {
        optionsEpcRating = "A";
      } else if (optionsCarbonSaving >= 500) {
        optionsEpcRating = "B";
      } else if (optionsCarbonSaving >= 100) {
        optionsEpcRating = "C";
      } else if (optionsCarbonSaving > 10) {
        optionsEpcRating = "D";
      } else {
        optionsEpcRating = "E";
      }
    }
  });

  discountValue = total * discountPercent;

  finalTotal = total - discountValue;

  $("#higherCostTotal").text(0);
  $("#budgetFriendlyTotal").text(0);
  $("#lowCostTotal").text(0);

  $("#totalFromPackage").text(total);
  $("#discountAmount").text(discountValue);
  $("#finalTotal").text(finalTotal);
  $("#totalBillSaving").text(billSaving);
  $("#totalCarbonSaving").text(optionsCarbonSaving);
  $("#totalPropertyValue").text(propertyValue);
  if ((page = "withChart")) {
    $("#epcRating").removeClass();
    ratingIcon = "fa-solid h2 text-center fa-" + optionsEpcRating.toLowerCase();
    $("#epcRating").addClass(ratingIcon);
  } else {
    $("#epcRating").text(optionsEpcRating);
  }
  $(`#${totalId}`).text(total);

  if (total != 0) {
    isOptionsValid = true;
    setButtonState($("#smartwizard .sw-btn-next"), true);
  } else {
    isOptionsValid = false;
  }
}
