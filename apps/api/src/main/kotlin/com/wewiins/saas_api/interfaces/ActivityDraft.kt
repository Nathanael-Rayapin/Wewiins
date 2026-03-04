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
    val minCapacity: Int? = null,
    val maxCapacity: Int? = null,
    val slotDurationMin: Int? = null,
    val minAge: Int? = null,
    val maxAge: Int? = null,
    val minAgeChild: Int? = null,
    val maxAgeChild: Int? = null,
    val refundPolicy: Int? = 0,
    val automaticValidation: Boolean? = null,
    val childAllowedWithAdult: Boolean? = null,
    val address: String? = null,
    val zipcode: String? = null,
    val city: String? = null,
    val accessInfo: String? = null,
    val scheduledActivities: List<ScheduledActivity>? = null,
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
    val id: String? = null,
    val dayOfWeek: List<Days>? = null,
    val openTime: LocalTime? = null,
    val closeTime: LocalTime? = null,
    val breakStart: LocalTime? = null,
    val breakEnd: LocalTime? = null,
)

// La Table "activities_infos_preset" ressence déjà tout les goodtoknow existant. Donc on ne stock pas ces champs, en soit ces champs n'ont aucun intérêt à arriver jusque là.
// Ce qu'il faudrait c'est que le frontend renvoie un enum à la place de ces champs. Ensuite on fait un select sur "activities_infos_preset" pour récupérer l'ID si l'enum === "category" (champ de la table "activity_infos_preset"
// Une fois l'ID récupérer, dans "activities_infos" on insert "activity_id" + "activity_info_preset_id" précédemment récupérer
data class GoodToKnow(
    val name: String? = null,
    val description: String? = null,
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
    val day: String? = null, // En soit on aura déjà mis le jour via dayOfWeek
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