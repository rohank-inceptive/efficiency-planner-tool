$(document).ready(function () {
  /* -------- GLOBAL VARIABLE -------- */
  const dummyAddresses = [
    "33, Langham Gardens, Wembley, HA0 3RG",
    "221B Baker Street, Marylebone, London NW1 6XE",
  ];

  let isAddressValid = false;
  let isAddressSelected = false;
  let currentPackageOption = "";

  /* -------- COMMON FUNCTION ------- */
  $("#smartwizard").smartWizard({
    selected: 0,
    theme: "arrows",
    transition: {
      animation: "fade",
    },
    disabledSteps: [1, 2],
    toolbar: {
      showNextButton: false,
      showPreviousButton: false,
    },
  });

  /* ---- ADDRESS STEP -----*/
  // Update wizard state on address state
  $("#smartwizard").on(
    "showStep",
    function (e, anchorObject, stepIndex, stepDirection, stepPosition) {
      if (stepIndex == 0 && isAddressValid) {
        updateWizardState(true, 0);
      } else {
        $(".sw-btn-next").prop("disabled", true);
      }
      if (stepIndex === 0 && isAddressSelected) {
        $(".sw-btn-prev").removeClass("disabled").removeAttr("disabled");
      }
    }
  );

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

    $("#epc_verification_form").toggleClass("d-none");
    $("#search_postcode_form").toggleClass("d-none");
    $("#smartwizard .sw-btn-prev").prop("disabled", false);
    $("#smartwizard .sw-btn-next").prop("disabled", true);
    updateWizard();
  });

  // Show postcode search on previous button click
  $("#smartwizard").on("click", ".sw-btn-prev", function () {
    let stepInfo = $("#smartwizard").smartWizard("getStepInfo");
    if (stepInfo.currentStep === 0) {
      isAddressSelected = false;
      $("#epc_verification_form").toggleClass("d-none");
      $("#search_postcode_form").toggleClass("d-none");
      $(".sw-btn-prev").addClass("disabled").attr("disabled", true);
      updateWizard();
    }
  });

  // Validate address and enable requirement step
  $("#confirmAddressValidation").on("click", function (e) {
    e.preventDefault();
    isAddressValid = true;
    $(".sw-btn-next").prop("disabled", false);
    $("#smartwizard").smartWizard("stepState", [0], "done");
    $("#smartwizard").smartWizard("unsetState", [1], "disable");
    $("#validateAddressModal").toggle("d-none");
    $("#validationModal").modal("hide");
  });

  // Enable address form and show save button
  $("#updateAddressValidation").on("click", function (e) {
    isAddressValid = true;
    $("#epc_verification_form input").prop("disabled", false);
    $("#epc_verification_form select").prop("disabled", false);
    $("#validateAddressModal").toggle("d-none");
    $("#saveAddress").toggle("d-none");
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
  $('input[name="electricCar"]').change(function () {
    if ($("#electricCarYes").is(":checked")) {
      $("#evChargerSection").removeClass("d-none");
    } else {
      $("#evChargerSection").addClass("d-none");
      $('input[name="evCharger"]').prop("checked", false);
    }
    updateWizard();
  });
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
      // $("#options").find(".card").css("border", "");
      $("#options").find(".card").removeClass("selected-package");
      $("#solar").prop("disabled", false);
      // $("#" + currentFormName + "-card").css("border", "2px solid red");
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
      // $("#options").find(".card").css("border", "");
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
});

function updateWizard() {
  $("#smartwizard").smartWizard("fixHeight");
}

function checkRequirementFormCompletion() {
  const electricCarSelected = $('input[name="electricCar"]:checked').length > 0;
  const evChargerSelected =
    ($("#electricCarYes").is(":checked") &&
      $('input[name="evCharger"]:checked').length > 0) ||
    $("#electricCarNo").is(":checked");
  const loftSpaceSelected = $('input[name="loftSpace"]:checked').length > 0;
  if (electricCarSelected && evChargerSelected && loftSpaceSelected) {
    updateWizardState(true, 1);
  } else {
    updateWizardState(false, 1);
  }
}

function updateWizardState(nextStatus, currentStep) {
  if (nextStatus) {
    $(".sw-btn-next").prop("disabled", false);
    $(".sw-btn-next").removeClass("disabled");
    $("#smartwizard").smartWizard("stepState", [currentStep], "done");
    $("#smartwizard").smartWizard("unsetState", [currentStep + 1], "disable");
  } else {
    $(".sw-btn-next").prop("disabled", true);
    $("#smartwizard").smartWizard("unsetState", [currentStep], "done");
    $("#smartwizard").smartWizard("stepState", [currentStep + 1], "disable");
  }
}

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
}
