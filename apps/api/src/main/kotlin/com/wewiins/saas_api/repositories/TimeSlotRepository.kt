package com.wewiins.saas_api.repositories

import com.wewiins.saas_api.dto.activity.ActivityTimeSlotDto
import com.wewiins.saas_api.interfaces.ScheduledActivity
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.rpc
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository
import java.time.Instant
import java.time.ZoneOffset

@Repository
class TimeSlotRepository(
    private val supabaseClient: SupabaseClient
) {
    private val logger = LoggerFactory.getLogger(TimeSlotRepository::class.java)

    object TimeSlotConstants {
        const val TIME_SLOT_TABLE = "activity_time_slots"
    }

    suspend fun upsertTimeSlots(
        activityId: String,
        offerId: String,
        scheduledActivities: List<ScheduledActivity>,
        slotDurationMin: Int?
    ) {
        logger.info("Upserting time slots for activityId $activityId")

        // Deleting old slots — starting with a clean slate
        supabaseClient
            .from(TimeSlotConstants.TIME_SLOT_TABLE)
            .delete {
                filter { eq("activity_offer_id", offerId) }
            }

        // Each ScheduledActivity can have multiple days with the same schedule.
        // We create one row per day.
        val rows = scheduledActivities.flatMap { schedule ->
            schedule.dayOfWeek?.map { day ->
                mapOf(
                    "activity_offer_id" to offerId,
                    "day_of_week" to day.value,
                    "open_time" to schedule.openTime?.toString(),
                    "close_time" to schedule.closeTime?.toString(),
                    "break_start" to schedule.breakStart?.toString(),
                    "break_end" to schedule.breakEnd?.toString(),
                    "slot_duration_min" to slotDurationMin,
                )
            } ?: emptyList()
        }

        if (rows.isNotEmpty()) {
            supabaseClient
                .from(TimeSlotConstants.TIME_SLOT_TABLE)
                .insert(rows)
        }
    }

    suspend fun getTimeSlotsByOfferId(offerId: String): List<ActivityTimeSlotDto> {
        logger.info("Fetching time slots for offerId $offerId")

        return supabaseClient
            .from(TimeSlotConstants.TIME_SLOT_TABLE)
            .select {
                filter { eq("activity_offer_id", offerId) }
            }
            .decodeList<ActivityTimeSlotDto>()
    }

    suspend fun getTotalSlotsByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Int {
        val startLocalDate = Instant.ofEpochSecond(startDate).atZone(ZoneOffset.UTC).toLocalDate().toString()
        val endLocalDate = Instant.ofEpochSecond(endDate).atZone(ZoneOffset.UTC).toLocalDate().toString()

        return supabaseClient.postgrest.rpc(
            "get_total_slots",
            mapOf(
                "p_connected_account_id" to connectedAccountId,
                "p_start_date" to startLocalDate,
                "p_end_date" to endLocalDate
            )
        ).decodeAs<Int>()
    }
}