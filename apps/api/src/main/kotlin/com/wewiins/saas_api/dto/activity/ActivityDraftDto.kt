package com.wewiins.saas_api.dto.activity

import com.wewiins.saas_api.enums.Categories
import com.wewiins.saas_api.enums.Days
import com.wewiins.saas_api.enums.Moment
import java.time.LocalTime

data class ActivityDraftDto(
    val step1: StepOneDto? = null,
    val step2: StepTwoDto? = null,
    val step3: StepThreeDto? = null,
    val step4: StepFourDto? = null,
)

data class StepOneDto(
    val name: String? = null,
    val categories: List<Categories>? = null,
    val description: String? = null,
    val photos: List<String>? = null,
)

data class StepTwoDto(
    val minCapacity: Int? = null, // (Do not manage for the moment. Prerequisite = X days before the activity, send a message to users to cancel the activity due to lack of participants, so this is a major feature and, moreover, Wewiins will not be the only one to switch to a service provider, so this scenario is unlikely.)
    val maxCapacity: Int? = null,
    val slotDuration: Int? = null,
    val minAge: Int? = null,
    val maxAge: Int? = null,
    val maxAgeChild: Int? = null,
    val refundPolicy: Int? = null,
    val automaticValidation: Boolean? = null,
    val childAllowedWithAdult: Boolean? = null,
    val address: String? = null,
    val zipcode: String? = null,
    val city: String? = null,
    val accessInfo: String? = null,
    val scheduledActivities: List<ScheduledActivityDto>? = null,
)

data class StepThreeDto(
    val goodToKnow: List<GoodToKnowDto>? = null,
    val program: List<ProgramDto>? = null,
)

data class StepFourDto(
    val isVariablePricing: Boolean? = null, // Do not store information
    val simplePricing: SimplePricingDto? = null,
    val variablePricing: VariablePricingDto? = null,
)

data class ScheduledActivityDto(
    val id: String? = null, // Auto Generated
    val selectedDays: List<Days>? = null,
    val availabilityFrom: LocalTime? = null,
    val availabilityTo: LocalTime? = null,
    val unavailabilityFrom: LocalTime? = null,
    val unavailabilityTo: LocalTime? = null,
)

// La Table "activities_infos_preset" ressence déjà tout les goodtoknow existant. Donc on ne stock pas ces champs, en soit ces champs n'ont aucun intérêt à arriver jusque là.
// Ce qu'il faudrait c'est que le frontend renvoie un enum à la place de ces champs. Ensuite on fait un select sur "activities_infos_preset" pour récupérer l'ID si l'enum === "category" (champ de la table "activity_infos_preset"
// Une fois l'ID récupérer, dans "activities_infos" on insert "activity_id" + "activity_info_preset_id" précédemment récupérer
data class GoodToKnowDto(
    val name: String? = null,
    val description: String? = null,
    val iconName: String? = null,
)

data class ProgramDto(
    val title: String? = null,
    val description: String? = null,
    val image: String? = null,
)

data class SimplePricingDto(
    val singleRate: Double? = null, // Info non stocker
    val adultRate: Double? = null,
    val childRate: Double? = null,
    val studentRate: Double? = null,
    val twoPersonGroupRate: Double? = null,
)

data class DayPricingDto(
    val day: String? = null, // En soit on aura déjà mis le jour via selectedDays
    val selectedMoment: Moment? = null,
    val singleRate: Double? = null, // Info non stocker
    val adultRate: Double? = null,
    val childRate: Double? = null,
    val studentRate: Double? = null,
    val twoPersonGroupRate: Double? = null,
)

data class VariablePricingDto(
    val dayPricings: List<DayPricingDto>? = null,
)