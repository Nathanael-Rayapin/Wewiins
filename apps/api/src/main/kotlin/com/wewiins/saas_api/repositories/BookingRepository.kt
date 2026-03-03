package com.wewiins.saas_api.repositories

import com.wewiins.saas_api.dto.activity.ActivityBookingDto
import com.wewiins.saas_api.interfaces.ActivityBooking
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Count
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository

@Repository
class BookingRepository(
    private val supabaseClient: SupabaseClient,
) {
    private val logger = LoggerFactory.getLogger(BookingRepository::class.java)

    suspend fun getBookingNumberByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Int {
        logger.info(
            "Fetching Bookings for connected account {} from {} to {}",
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

        val response = supabaseClient.postgrest["activity_slot_bookings"]
            .select(
                columns = Columns.raw(
                    """
                id,
                activity_offers!inner(
                    id,
                    activities!inner(
                        id,
                        providers!inner(
                            stripe_connected_account_id
                        )
                    )
                )
            """.trimIndent()
                )
            ) {
                filter {
                    gte("created_at", startDateTime)
                    lte("created_at", endDateTime)
                    eq("activity_offers.activities.providers.stripe_connected_account_id", connectedAccountId)
                }
                count(Count.EXACT)
            }

        return response.countOrNull()?.toInt() ?: 0
    }

    suspend fun getBookingsByPeriod(
        connectedAccountId: String,
        startDate: Long
    ): List<ActivityBooking> {
        logger.info(
            "Fetching Bookings list for connected account {} from {}",
            connectedAccountId,
            startDate,
        )

        // Convertir les timestamps Unix (secondes) en format ISO pour Supabase
        val startDateTime = java.time.Instant.ofEpochSecond(startDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDateTime()
            .toString()

        val response = supabaseClient.postgrest["activity_slot_bookings"]
            .select(
                columns = Columns.raw(
                    """
                id,
                reference,
                date,
                start_time,
                end_time,
                participants,
                total_price,
                status,
                users!inner(
                    firstname,
                    lastname
                ),
                activity_offers!inner(
                    activities!inner(
                        title,
                        providers!inner(
                            stripe_connected_account_id
                        )
                    )
                )
            """.trimIndent()
                )
            ) {
                filter {
                    gte("date", startDateTime.split("T")[0])
                    eq("activity_offers.activities.providers.stripe_connected_account_id", connectedAccountId)
                    isIn("status", listOf("COMING_SOON", "CANCEL", "PENDING", "PAYMENT_FAILED"))
                }
                limit(2)
            }


        val bookingsData = response.decodeList<ActivityBookingDto>()

        logger.info("Total bookings found: {}", bookingsData.size)

        val bookings = bookingsData.map { raw ->
            ActivityBooking(
                id = raw.id,
                reference = raw.reference,
                name = "${raw.users.firstname} ${raw.users.lastname}",
                date = raw.date,
                startTime = raw.startTime,
                endTime = raw.endTime,
                participants = raw.participants,
                title = raw.activityOffers.activities.title,
                totalPrice = raw.totalPrice,
                status = raw.status
            )
        }

        return bookings
    }
}