package com.wewiins.saas_api.repositories

import com.wewiins.saas_api.dto.activity.ActivityCategoryJoinDto
import com.wewiins.saas_api.dto.activity.ActivityDraftDto
import com.wewiins.saas_api.dto.activity.ActivityScoreDto
import com.wewiins.saas_api.interfaces.ActivityDraft
import com.wewiins.saas_api.dto.activity.ActivityDto
import com.wewiins.saas_api.dto.activity.ActivityInfoJoinDto
import com.wewiins.saas_api.dto.activity.ActivityProgramDto
import com.wewiins.saas_api.dto.activity.ActivitySlotPriceDto
import com.wewiins.saas_api.dto.activity.DayPricingDto
import com.wewiins.saas_api.dto.activity.GoodToKnowDto
import com.wewiins.saas_api.dto.activity.ProgramDto
import com.wewiins.saas_api.dto.activity.ScheduledActivityLoadDto
import com.wewiins.saas_api.dto.activity.SimplePricingDto
import com.wewiins.saas_api.dto.activity.StepFourLoadDto
import com.wewiins.saas_api.dto.activity.StepOneLoadDto
import com.wewiins.saas_api.dto.activity.StepThreeLoadDto
import com.wewiins.saas_api.dto.activity.StepTwoLoadDto
import com.wewiins.saas_api.dto.activity.VariablePricingDto
import com.wewiins.saas_api.enums.Categories
import com.wewiins.saas_api.enums.Days
import com.wewiins.saas_api.enums.Moment
import com.wewiins.saas_api.interfaces.StepFour
import com.wewiins.saas_api.interfaces.StepOne
import com.wewiins.saas_api.interfaces.StepThree
import com.wewiins.saas_api.interfaces.StepTwo
import com.wewiins.saas_api.repositories.CategoryRepository.CategoryConstants
import com.wewiins.saas_api.repositories.OfferRepository.OfferConstants
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Count
import io.github.jan.supabase.postgrest.query.Order
import org.springframework.stereotype.Repository
import org.slf4j.LoggerFactory
import kotlin.math.roundToInt

@Repository
class ActivityRepository(
    private val supabaseClient: SupabaseClient,
    private val categoryRepository: CategoryRepository,
    private val timeSlotRepository: TimeSlotRepository,
    private val offerRepository: OfferRepository,
) {

    private val logger = LoggerFactory.getLogger(ActivityRepository::class.java)

    object ActivityConstants {
        const val ACTIVITY_TABLE = "activities"
        const val INFO_TABLE = "activities_infos"
        const val PROGRAM_TABLE = "activities_programs"
        const val INFO_PRESET_TABLE = "activities_infos_presets"
    }

    suspend fun getAverageScoreByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Double {
        logger.info(
            "Fetching Average Score for connected account {} from {} to {}",
            connectedAccountId,
            startDate,
            endDate
        )

        // Convertir les timestamps Unix (secondes) en format ISO pour Supabase
        val startDateTime = java.time.Instant.ofEpochSecond(startDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDateTime()
            .toString()

        val endDateTime = java.time.Instant.ofEpochSecond(endDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDateTime()
            .toString()

        val response = supabaseClient.postgrest["activities"]
            .select(
                columns = Columns.raw(
                    """
                average_score,
                providers!inner(
                    stripe_connected_account_id
                )
            """.trimIndent()
                )
            ) {
                filter {
                    gte("created_at", startDateTime)
                    lte("created_at", endDateTime)
                    eq("providers.stripe_connected_account_id", connectedAccountId)
                }
                count(Count.EXACT)
            }

        val scores = response.decodeList<ActivityScoreDto>()
            .mapNotNull { it.averageScore }

        if (scores.isEmpty()) {
            return 0.0
        }

        return scores.average()
            .coerceIn(0.0, 5.0)
            .let { (it * 10).roundToInt() / 10.0 }
    }

    suspend fun saveDraft(
        existingActivityId: String?,
        providerId: String,
        activityDraft: ActivityDraft,
        previewUrls: List<String>?,
        programUrls: List<String>?
    ): String {
        val existingActivity = existingActivity(
            existingActivityId,
            activityDraft.step1?.name,
            providerId
        ) ?: throw IllegalArgumentException(
            "Activité introuvable — fournir un existingActivityId ou un nom valide"
        )

        val activityId = existingActivity.id

        activityDraft.step1?.let { step1 ->
            saveStep1(providerId, existingActivity, step1, previewUrls)
        }

        activityDraft.step2?.let { step2 ->
            val offerId = offerRepository.getOfferIdByActivityId(activityId)
            saveStep2(activityId, offerId, step2)
        }

        activityDraft.step3?.let { step3 ->
            saveStep3(activityId, step3, programUrls)
        }

        activityDraft.step4?.let { step4 ->
            val offerId = offerRepository.getOfferIdByActivityId(activityId)
                ?: throw IllegalArgumentException("Offre introuvable pour l'activité $activityId — la step 2 doit être sauvegardée avant la step 4")
            saveStep4(activityId, offerId, step4)
        }

        return activityId
    }

    private suspend fun saveStep1(
        providerId: String,
        existingActivity: ActivityDto?,
        currentStep: StepOne,
        previewUrls: List<String>?
    ): String {
        val activityId: String

        if (existingActivity != null) {
            activityId = existingActivity.id

            supabaseClient.from(ActivityConstants.ACTIVITY_TABLE).update(
                mapOf(
                    "title" to currentStep.name,
                    "description" to (currentStep.description ?: existingActivity.description),
                    "main_photo_url" to (previewUrls?.firstOrNull() ?: existingActivity.mainPhotoUrl),
                    "gallery_urls" to (previewUrls ?: existingActivity.galleryUrls),
                )
            ) {
                filter {
                    eq("id", activityId)
                }
            }
        } else {
            val inserted = supabaseClient.from(ActivityConstants.ACTIVITY_TABLE).insert(
                mapOf(
                    "title" to currentStep.name,
                    "description" to currentStep.description,
                    "provider_id" to providerId,
                    "main_photo_url" to previewUrls?.firstOrNull(),
                    "gallery_urls" to previewUrls,
                )
            ) {
                select()
            }.decodeList<Map<String, Any>>().first()

            activityId = inserted["id"] as String
        }

        currentStep.categories?.let { categories ->
            categoryRepository.upsertCategories(activityId, categories)
        }

        return activityId
    }

    private suspend fun saveStep2(
        activityId: String,
        offerId: String?,
        currentStep: StepTwo
    ) {
        supabaseClient
            .from(ActivityConstants.ACTIVITY_TABLE)
            .update(
                mapOf(
                    "address" to currentStep.address,
                    "zipcode" to currentStep.zipcode,
                    "city" to currentStep.city,
                    "access_info" to currentStep.accessInfo,
                )
            ) {
                filter { eq("id", activityId) }
            }

        val resolvedOfferId: String

        if (offerId != null) {
            supabaseClient
                .from(OfferConstants.OFFER_TABLE)
                .update(
                    mapOf(
                        "min_capacity" to currentStep.minCapacity,
                        "max_capacity" to currentStep.maxCapacity,
                        "min_age" to currentStep.minAge,
                        "max_age" to currentStep.maxAge,
                        "min_age_child" to currentStep.minAgeChild,
                        "max_age_child" to currentStep.maxAgeChild,
                        "refund_policy" to currentStep.refundPolicy,
                        "automatic_validation" to currentStep.automaticValidation,
                        "child_allowed_with_adult" to currentStep.childAllowedWithAdult,
                    )
                ) {
                    filter { eq("id", offerId) }
                }
            resolvedOfferId = offerId
        } else {
            val inserted = supabaseClient
                .from(OfferConstants.OFFER_TABLE)
                .insert(
                    mapOf(
                        "activity_id" to activityId,
                        "min_capacity" to currentStep.minCapacity,
                        "max_capacity" to currentStep.maxCapacity,
                        "min_age" to currentStep.minAge,
                        "max_age" to currentStep.maxAge,
                        "min_age_child" to currentStep.minAgeChild,
                        "max_age_child" to currentStep.maxAgeChild,
                        "refund_policy" to currentStep.refundPolicy,
                        "automatic_validation" to currentStep.automaticValidation,
                        "child_allowed_with_adult" to currentStep.childAllowedWithAdult,
                    )
                ) {
                    select()
                }
                .decodeList<Map<String, Any>>()
                .first()

            resolvedOfferId = inserted["id"] as String
        }

        currentStep.scheduledActivities?.let {
            timeSlotRepository.upsertTimeSlots(activityId, resolvedOfferId, it, currentStep.slotDurationMin)
        }
    }

    private suspend fun saveStep3(
        activityId: String,
        currentStep: StepThree,
        programUrls: List<String>?
    ) {
        // --- Good To Know ---
        currentStep.goodToKnow?.let { goodToKnowList ->
            // Delete + re-insert
            supabaseClient
                .from(ActivityConstants.INFO_TABLE)
                .delete {
                    filter { eq("activity_id", activityId) }
                }

            if (goodToKnowList.isNotEmpty()) {
                val presetIds = supabaseClient
                    .from(ActivityConstants.INFO_PRESET_TABLE)
                    .select(columns = Columns.list("id", "title")) {
                        filter { isIn("title", goodToKnowList.mapNotNull { it.name }) }
                    }
                    .decodeList<Map<String, Any>>()
                    .mapNotNull { it["id"] as? String }

                if (presetIds.isNotEmpty()) {
                    supabaseClient
                        .from("activities_infos")
                        .insert(presetIds.map { presetId ->
                            mapOf(
                                "activity_id" to activityId,
                                "activity_info_preset_id" to presetId
                            )
                        })
                }
            }
        }

        // --- Programs ---
        currentStep.program?.let { programs ->
            // Delete + re-insert avec position
            supabaseClient
                .from(ActivityConstants.PROGRAM_TABLE)
                .delete {
                    filter { eq("activity_id", activityId) }
                }

            if (programs.isNotEmpty()) {
                supabaseClient
                    .from(ActivityConstants.PROGRAM_TABLE)
                    .insert(programs.mapIndexed { index, program ->
                        mapOf(
                            "activity_id" to activityId,
                            "title" to program.title,
                            "description" to program.description,
                            "photo_url" to programUrls?.getOrNull(index),
                            "position" to index
                        )
                    })
            }
        }
    }

    private suspend fun saveStep4(
        activityId: String,
        offerId: String,
        currentStep: StepFour
    ) {
        // --- Récupération de tous les time slots de l'offre ---
        val timeSlots = timeSlotRepository.getTimeSlotsByOfferId(offerId)

        if (timeSlots.isEmpty()) return

        // --- Suppression des anciens prix — gestion du changement de mode ---
        val timeSlotIds = timeSlots.map { it.id }
        supabaseClient
            .from("activity_slot_prices")
            .delete {
                filter { isIn("activity_time_slot_id", timeSlotIds) }
            }

        if (currentStep.isVariablePricing == true) {
            val dayPricings = currentStep.variablePricing?.dayPricings ?: return

            val rows = dayPricings.mapNotNull { dayPricing ->
                val day = Days.entries.firstOrNull {
                    it.name.lowercase() == dayPricing.day?.lowercase()
                } ?: return@mapNotNull null

                val timeSlot = timeSlots.firstOrNull { it.dayOfWeek == day.value }
                    ?: return@mapNotNull null

                mapOf<String, Any?>(
                    "activity_time_slot_id" to timeSlot.id,
                    "moment"                to dayPricing.selectedMoment?.name,
                    "single_rate"           to dayPricing.singleRate,
                    "price_adult"           to dayPricing.adultRate,
                    "price_child"           to dayPricing.childRate,
                    "price_student"         to dayPricing.studentRate,
                    "price_group_2"         to dayPricing.twoPersonGroupRate,
                    "is_adult_enabled"      to dayPricing.isAdultEnabled,
                    "is_child_enabled"      to dayPricing.isChildEnabled,
                    "is_student_enabled"    to dayPricing.isStudentEnabled,
                    "is_group2_enabled"     to dayPricing.isGroup2Enabled,
                )
            }

            if (rows.isNotEmpty()) {
                supabaseClient.from("activity_slot_prices").insert(rows)
            }

        } else {
            val simplePricing = currentStep.simplePricing ?: return

            val rows = timeSlots.map { timeSlot ->
                mapOf<String, Any?>(
                    "activity_time_slot_id" to timeSlot.id,
                    "moment"                to Moment.ANYTIME.name,
                    "single_rate"           to simplePricing.singleRate,
                    "price_adult"           to simplePricing.adultRate,
                    "price_child"           to simplePricing.childRate,
                    "price_student"         to simplePricing.studentRate,
                    "price_group_2"         to simplePricing.twoPersonGroupRate,
                    "is_adult_enabled"      to simplePricing.isAdultEnabled,
                    "is_child_enabled"      to simplePricing.isChildEnabled,
                    "is_student_enabled"    to simplePricing.isStudentEnabled,
                    "is_group2_enabled"     to simplePricing.isGroup2Enabled,
                )
            }

            supabaseClient.from("activity_slot_prices").insert(rows)
        }
    }

    suspend fun existingActivity(
        existingActivityId: String?,
        existingActivityName: String?,
        providerId: String
    ): ActivityDto? {
        return supabaseClient.from(ActivityConstants.ACTIVITY_TABLE)
            .select {
                filter {
                    if (!existingActivityId.isNullOrBlank()) {
                        eq("id", existingActivityId)
                    } else if (!existingActivityName.isNullOrBlank()) {
                        eq("title", existingActivityName)
                        eq("provider_id", providerId)
                    }
                }
            }
            .decodeSingleOrNull<ActivityDto>()
    }

    suspend fun loadDraft(
        providerId: String,
        existingActivityId: String?,
        existingActivityName: String?
    ): ActivityDraftDto {

        val activity = existingActivity(existingActivityId, existingActivityName, providerId)
            ?: throw IllegalArgumentException("Activité introuvable")

        val activityId = activity.id

        // --- Step 1 ---
        val categories = supabaseClient
            .from(CategoryConstants.ACTIVITY_TO_CATEGORY_TABLE)
            .select(columns = Columns.raw("activities_categories(name)")) {
                filter { eq("activity_id", activityId) }
            }
            .decodeList<ActivityCategoryJoinDto>()
            .mapNotNull { it.activityCategory?.name }
            .mapNotNull { supabaseName ->
                Categories.entries.firstOrNull { it.supabaseValue == supabaseName }?.name
            }

        val stepOneLoadDto = StepOneLoadDto(
            name = activity.title,
            description = activity.description,
            categories = categories,
            photos = activity.galleryUrls,
        )

        // --- Step 2 ---
        val offer = offerRepository.getOfferByActivityId(activityId)

        val stepTwoLoadDto = offer?.let {
            val timeSlots = timeSlotRepository.getTimeSlotsByOfferId(it.id)

            val scheduledActivities = timeSlots
                .groupBy { slot -> Triple(slot.openTime, slot.closeTime, slot.breakStart) }
                .map { (_, slots) ->
                    ScheduledActivityLoadDto(
                        id = null,
                        dayOfWeek = slots.mapNotNull { slot ->
                            Days.entries.firstOrNull { d -> d.value == slot.dayOfWeek }?.name
                        },
                        openTime = slots.first().openTime?.toString(),
                        closeTime = slots.first().closeTime?.toString(),
                        breakStart = slots.first().breakStart?.toString(),
                        breakEnd = slots.first().breakEnd?.toString(),
                    )
                }

            StepTwoLoadDto(
                minCapacity = it.minCapacity,
                maxCapacity = it.maxCapacity,
                slotDurationMin = timeSlots.firstOrNull()?.slotDurationMin,
                minAge = it.minAge,
                maxAge = it.maxAge,
                minAgeChild = it.minAgeChild,
                maxAgeChild = it.maxAgeChild,
                refundPolicy = it.refundPolicy,
                automaticValidation = it.automaticValidation,
                childAllowedWithAdult = it.childAllowedWithAdult,
                address = activity.address,
                zipcode = activity.zipcode,
                city = activity.city,
                accessInfo = activity.accessInfo,
                scheduledActivities = scheduledActivities,
            )
        }

        // --- Step 3 ---
        val goodToKnow = supabaseClient
            .from(ActivityConstants.INFO_TABLE)
            .select(columns = Columns.raw("activities_infos_presets(id, title, description)")) {
                filter { eq("activity_id", activityId) }
            }
            .decodeList<ActivityInfoJoinDto>()
            .mapNotNull { it.preset }
            .map { preset ->
                GoodToKnowDto(
                    name = preset.title,
                    description = preset.description,
                )
            }

        val programs = supabaseClient
            .from(ActivityConstants.PROGRAM_TABLE)
            .select {
                filter { eq("activity_id", activityId) }
                order("position", Order.ASCENDING)
            }
            .decodeList<ActivityProgramDto>()
            .map { program ->
                ProgramDto(
                    title = program.title,
                    description = program.description,
                    image = program.photoUrl,
                )
            }

        val stepThreeLoadDto = if (goodToKnow.isEmpty() && programs.isEmpty()) null else StepThreeLoadDto(
            goodToKnow = goodToKnow.ifEmpty { null },
            program = programs.ifEmpty { null },
        )

        // --- Step 4 ---
        val stepFourLoadDto = offer?.let {
            val timeSlots = timeSlotRepository.getTimeSlotsByOfferId(it.id)

            if (timeSlots.isEmpty()) return@let null

            val timeSlotIds = timeSlots.map { slot -> slot.id }

            val slotPrices = supabaseClient
                .from("activity_slot_prices")
                .select {
                    filter { isIn("activity_time_slot_id", timeSlotIds) }
                }
                .decodeList<ActivitySlotPriceDto>()

            if (slotPrices.isEmpty()) return@let null

            // --- Déduction du mode : si tous les moments sont ANYTIME = simplePricing ---
            val isVariablePricing = slotPrices.any { price ->
                price.moment != Moment.ANYTIME
            }

            if (isVariablePricing) {
                val dayPricings = slotPrices.mapNotNull { price ->
                    val timeSlot = timeSlots.firstOrNull { it.id == price.activityTimeSlotId }
                        ?: return@mapNotNull null

                    val day = Days.entries.firstOrNull { d -> d.value == timeSlot.dayOfWeek }
                        ?: return@mapNotNull null

                    DayPricingDto(
                        day = day.name.lowercase().replaceFirstChar { it.uppercase() },
                        selectedMoment = price.moment,
                        singleRate = price.singleRate,
                        adultRate = price.priceAdult,
                        childRate = price.priceChild,
                        studentRate = price.priceStudent,
                        twoPersonGroupRate = price.priceGroup2,
                        isAdultEnabled = price.isAdultEnabled,
                        isChildEnabled = price.isChildEnabled,
                        isStudentEnabled = price.isStudentEnabled,
                        isGroup2Enabled = price.isGroup2Enabled,
                    )
                }

                StepFourLoadDto(
                    isVariablePricing = true,
                    simplePricing = null,
                    variablePricing = VariablePricingDto(dayPricings = dayPricings),
                )

            } else {
                val first = slotPrices.first()

                logger.info("ADULT RATE IS : $first")

                val stepFourLoadDto = StepFourLoadDto(
                    isVariablePricing = false,
                    simplePricing = SimplePricingDto(
                        singleRate = first.singleRate,
                        adultRate = first.priceAdult,
                        childRate = first.priceChild,
                        studentRate = first.priceStudent,
                        twoPersonGroupRate = first.priceGroup2,
                        isAdultEnabled = first.isAdultEnabled,
                        isChildEnabled = first.isChildEnabled,
                        isStudentEnabled = first.isStudentEnabled,
                        isGroup2Enabled = first.isGroup2Enabled,
                    ),
                    variablePricing = null,
                )
                stepFourLoadDto
            }
        }

        return ActivityDraftDto(
            activityId = activityId,
            step1 = stepOneLoadDto,
            step2 = stepTwoLoadDto,
            step3 = stepThreeLoadDto,
            step4 = stepFourLoadDto
        )
    }

    suspend fun getActivityNameById(activityId: String): String {
        return supabaseClient
            .from(ActivityConstants.ACTIVITY_TABLE)
            .select(columns = Columns.list("title")) {
                filter { eq("id", activityId) }
            }
            .decodeList<Map<String, Any>>()
            .firstOrNull()
            ?.get("title") as String?
            ?: throw IllegalArgumentException("Activité introuvable pour l'id : $activityId")
    }
}