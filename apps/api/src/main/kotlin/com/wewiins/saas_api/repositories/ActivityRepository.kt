package com.wewiins.saas_api.repositories

import com.wewiins.saas_api.dto.activity.ActivityCategoryJoinDto
import com.wewiins.saas_api.dto.activity.ActivityDraftDto
import com.wewiins.saas_api.dto.activity.AverageScore
import com.wewiins.saas_api.interfaces.ActivityDraft
import com.wewiins.saas_api.dto.activity.ActivityDto
import com.wewiins.saas_api.dto.activity.ScheduledActivityLoadDto
import com.wewiins.saas_api.dto.activity.StepOneLoadDto
import com.wewiins.saas_api.dto.activity.StepTwoLoadDto
import com.wewiins.saas_api.enums.Categories
import com.wewiins.saas_api.enums.Days
import com.wewiins.saas_api.interfaces.StepOne
import com.wewiins.saas_api.interfaces.StepTwo
import com.wewiins.saas_api.repositories.CategoryRepository.CategoryConstants
import com.wewiins.saas_api.repositories.OfferRepository.OfferConstants
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Count
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

        val scores = response.decodeList<AverageScore>()
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
            name        = activity.title,
            description = activity.description,
            categories  = categories,
            photos      = activity.galleryUrls,
        )

        // --- Step 2 ---
        val offer = offerRepository.getOfferByActivityId(activityId)

        val stepTwoLoadDto = offer?.let {
            val timeSlots = timeSlotRepository.getTimeSlotsByOfferId(it.id)

            val scheduledActivities = timeSlots
                .groupBy { slot -> Triple(slot.openTime, slot.closeTime, slot.breakStart) }
                .map { (_, slots) ->
                    ScheduledActivityLoadDto(
                        id                 = null,
                        dayOfWeek       = slots.mapNotNull { slot ->
                            Days.entries.firstOrNull { d -> d.value == slot.dayOfWeek }?.name
                        },
                        openTime   = slots.first().openTime?.toString(),
                        closeTime     = slots.first().closeTime?.toString(),
                        breakStart = slots.first().breakStart?.toString(),
                        breakEnd   = slots.first().breakEnd?.toString(),
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

        return ActivityDraftDto(
            activityId = activityId,
            step1 = stepOneLoadDto,
            step2 = stepTwoLoadDto,
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