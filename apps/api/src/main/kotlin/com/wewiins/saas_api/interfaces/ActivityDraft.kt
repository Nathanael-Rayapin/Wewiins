package com.wewiins.saas_api.interfaces

import com.wewiins.saas_api.enums.Categories
import com.wewiins.saas_api.enums.Days
import com.wewiins.saas_api.enums.Moment
import java.time.LocalTime

data class ActivityDraft(
    val step1: StepOne? = null,
    val step2: StepTwo? = null,
    val step3: StepThree? = null,
    val step4: StepFour? = null,
)

data class StepOne(
    val name: String,
    val categories: List<Categories>? = null,
    val description: String? = null,
    val photos: List<String>? = null,
)

data class StepTwo(
    // Do not manage "minCapacity" for the moment. Prerequisite =
    // - X days before the activity
    // - send a message to users to cancel the activity due to lack of participants
    // - Wewiins will not be the only one to switch to a service provider
    val minCapacity: Int? = null,
    val maxCapacity: Int? = null, // activity_offers => capacity
    val slotDuration: Int? = null, // activity_time_slots => slot_duration_min
    val minAge: Int? = null, // activity_offers => min_age
    val maxAge: Int? = null, // activity_offers => max_age
    val maxAgeChild: Int? = null, // activity_offers => max_age_child
    val refundPolicy: Int? = null, // activity_offers => is_refund_expected
    val automaticValidation: Boolean? = null, // activity_offers => automatic_validation
    val childAllowedWithAdult: Boolean? = null, // activity_offers => child_allowed_with_adult
    val address: String? = null, // activities => address
    val zipcode: String? = null, // activities => zipcode
    val city: String? = null, // activities => city
    val accessInfo: String? = null, // activities => access_info
    val scheduledActivities: List<ScheduledActivity>? = null, // See ScheduledActivity data class
)

data class StepThree(
    val goodToKnow: List<GoodToKnow>? = null,
    val program: List<Program>? = null,
)

data class StepFour(
    val isVariablePricing: Boolean? = null, // Do not store information
    val simplePricing: SimplePricing? = null,
    val variablePricing: VariablePricingDto? = null,
)

data class ScheduledActivity(
    val id: String? = null, // Auto Generated
    val selectedDays: List<Days>? = null, // activity_time_slots => day_of_week (integer)
    val availabilityFrom: LocalTime? = null, // activity_time_slots => open_time
    val availabilityTo: LocalTime? = null, // activity_time_slots => close_time
    val unavailabilityFrom: LocalTime? = null, // activity_time_slots => break_start
    val unavailabilityTo: LocalTime? = null, // activity_time_slots => break_end
)

// La Table "activities_infos_preset" ressence déjà tout les goodtoknow existant. Donc on ne stock pas ces champs, en soit ces champs n'ont aucun intérêt à arriver jusque là.
// Ce qu'il faudrait c'est que le frontend renvoie un enum à la place de ces champs. Ensuite on fait un select sur "activities_infos_preset" pour récupérer l'ID si l'enum === "category" (champ de la table "activity_infos_preset"
// Une fois l'ID récupérer, dans "activities_infos" on insert "activity_id" + "activity_info_preset_id" précédemment récupérer
data class GoodToKnow(
    val name: String? = null,
    val description: String? = null,
    val iconName: String? = null,
)

data class Program(
    val title: String? = null,
    val description: String? = null,
    val image: String? = null,
)

data class SimplePricing(
    val singleRate: Double? = null, // Info non stocker
    val adultRate: Double? = null,
    val childRate: Double? = null,
    val studentRate: Double? = null,
    val twoPersonGroupRate: Double? = null,
)

data class DayPricing(
    val day: String? = null, // En soit on aura déjà mis le jour via selectedDays
    val selectedMoment: Moment? = null,
    val singleRate: Double? = null, // Info non stocker
    val adultRate: Double? = null,
    val childRate: Double? = null,
    val studentRate: Double? = null,
    val twoPersonGroupRate: Double? = null,
)

data class VariablePricingDto(
    val dayPricings: List<DayPricing>? = null,
)