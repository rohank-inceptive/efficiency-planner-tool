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
    updateWizardState(true, 0);
    $("#smartwizard").smartWizard("next");
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
  });
  // Carbon saving chart

  var chart = {
    series: [{ name: "Saving", data: [809, 2000, 3268, 6255] }],

    chart: {
      type: "bar",
      toolbar: { show: false },
      foreColor: "#2a3547",
      fontFamily: "inherit",
      sparkline: { enabled: false },
    },

    colors: ["#13deb9"],

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
      categories: ["2023", "2024", "2025", "2026"],
      labels: {
        style: { cssClass: "red--text lighten-1--text fill-color" },
      },
    },
    yaxis: {
      show: false,
      min: 0,
      max: 7000,
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
  };

  var chart = new ApexCharts(
    document.querySelector("#carbon-saving-chart"),
    chart
  );
  chart.render();

  var epc_chart = {
    series: [
      {
        name: "Properties with EPC rating",
        data: [800, 8000, 1200],
      },
    ],

    chart: {
      type: "bar",
      toolbar: { show: false },
      foreColor: "#2a3547",
      fontFamily: "inherit",
    },

    colors: ["#13deb9", "#ffae1f", "#fa896b"],

    plotOptions: {
      bar: {
        barHeight: "70%",
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
        return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
      },
      offsetX: 0,
    },
    title: {
      text: "EPC Rating of Properties",
      align: "center",
      floating: true,
    },
    legend: {
      show: true,
    },

    grid: {
      show: false,
    },

    xaxis: {
      categories: ["A-D", "E", "F"],
    },

    yaxis: {
      show: false,
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
    console.log(stepInfo);
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
  let carbonSaving = 0;
  let propertyValue = 0;
  let epcRating = "E";

  $(`#${formId} input[type="checkbox"]`).each(function () {
    if ($(this).is(":checked")) {
      total += parseInt($(this).val());
      billSaving += parseInt($(this).data("bill-saving"));
      carbonSaving += parseInt($(this).data("carbon-saving"));
      propertyValue += parseInt($(this).data("value-added"));
      if (carbonSaving >= 1000) {
        epcRating = "A";
      } else if (carbonSaving >= 500) {
        epcRating = "B";
      } else if (carbonSaving >= 100) {
        epcRating = "C";
      } else if (carbonSaving > 10) {
        epcRating = "D";
      } else {
        epcRating = "E";
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
  $("#totalCarbonSaving").text(carbonSaving);
  $("#totalPropertyValue").text(propertyValue);
  $("#epcRating").text(epcRating);
  $(`#${totalId}`).text(total);

  if (total != 0) {
    isOptionsValid = true;
    setButtonState($("#smartwizard .sw-btn-next"), true);
  } else {
    isOptionsValid = false;
  }
}
