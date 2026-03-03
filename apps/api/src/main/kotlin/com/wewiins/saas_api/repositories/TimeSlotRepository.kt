package com.wewiins.saas_api.repositories

import com.wewiins.saas_api.interfaces.ScheduledActivity
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository

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
        scheduledActivities: List<ScheduledActivity>,
        slotDuration: Int?
    ) {
        logger.info("Upserting time slots for activityId $activityId")

        // Deleting old slots — starting with a clean slate
        supabaseClient
            .from(TimeSlotConstants.TIME_SLOT_TABLE)
            .delete {
                filter { eq("activity_id", activityId) }
            }

        // Each ScheduledActivity can have multiple days with the same schedule.
        // We create one row per day.
        val rows = scheduledActivities.flatMap { schedule ->
            schedule.selectedDays?.map { day ->
                mapOf(
                    "activity_id" to activityId,
                    "day_of_week" to day.value,
                    "open_time" to schedule.availabilityFrom?.toString(),
                    "close_time" to schedule.availabilityTo?.toString(),
                    "break_start" to schedule.unavailabilityFrom?.toString(),
                    "break_end" to schedule.unavailabilityTo?.toString(),
                    "slot_duration_min" to slotDuration,
                )
            } ?: emptyList()
        }

        if (rows.isNotEmpty()) {
            supabaseClient
                .from(TimeSlotConstants.TIME_SLOT_TABLE)
                .insert(rows)
        }
    }
}