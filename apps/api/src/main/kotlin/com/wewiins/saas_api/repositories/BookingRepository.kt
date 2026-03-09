package com.wewiins.saas_api.repositories

import com.wewiins.saas_api.dto.activity.ActivityBookingDto
import com.wewiins.saas_api.interfaces.ActivityBooking
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Count
import io.github.jan.supabase.postgrest.rpc
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository

@Repository
class BookingRepository(
    private val supabaseClient: SupabaseClient,
) {
    private val logger = LoggerFactory.getLogger(BookingRepository::class.java)

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

    suspend fun getConfirmedBookingCountByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Int {
        logger.info(
            "Fetching confirmed bookings for connected account {} from {} to {}",
            connectedAccountId,
            startDate,
            endDate
        )

        // On filtre sur `date` (quand l'activité se déroule)
        // cohérent avec le reste des métriques du dashboard
        val startLocalDate = java.time.Instant.ofEpochSecond(startDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDate()
            .toString()

        val endLocalDate = java.time.Instant.ofEpochSecond(endDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDate()
            .toString()

        val response = supabaseClient.postgrest["activity_slot_bookings"]
            .select(
                columns = Columns.raw(
                    """
                id,
                activity_offers!inner(
                    activities!inner(
                        providers!inner(
                            stripe_connected_account_id
                        )
                    )
                )
                """.trimIndent()
                )
            ) {
                filter {
                    gte("date", startLocalDate)
                    lte("date", endLocalDate)
                    eq("activity_offers.activities.providers.stripe_connected_account_id", connectedAccountId)
                    eq("status", "COMING_SOON") // uniquement les réservations confirmées à venir
                }
                count(Count.EXACT)
            }

        return response.countOrNull()?.toInt() ?: 0
    }

    suspend fun getCancellationRateByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Double {
        logger.info(
            "Fetching cancellation rate for connected account {} from {} to {}",
            connectedAccountId,
            startDate,
            endDate
        )

        // On convertit les timestamps en date locale (format "YYYY-MM-DD")
        // car le champ `date` dans activity_slot_bookings est de type DATE
        val startLocalDate = java.time.Instant.ofEpochSecond(startDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDate()
            .toString()

        val endLocalDate = java.time.Instant.ofEpochSecond(endDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDate()
            .toString()

        // On récupère le total de toutes les réservations sur la période
        val totalResponse = supabaseClient.postgrest["activity_slot_bookings"]
            .select(
                columns = Columns.raw(
                    """
                id,
                activity_offers!inner(
                    activities!inner(
                        providers!inner(
                            stripe_connected_account_id
                        )
                    )
                )
                """.trimIndent()
                )
            ) {
                filter {
                    gte("date", startLocalDate)
                    lte("date", endLocalDate)
                    eq("activity_offers.activities.providers.stripe_connected_account_id", connectedAccountId)
                }
                count(Count.EXACT)
            }

        val totalCount = totalResponse.countOrNull()?.toInt() ?: 0

        // Si aucune réservation sur la période, le taux est 0
        // (évite une division par zéro)
        if (totalCount == 0) return 0.0

        // On récupère uniquement les réservations annulées
        val cancelledResponse = supabaseClient.postgrest["activity_slot_bookings"]
            .select(
                columns = Columns.raw(
                    """
                id,
                activity_offers!inner(
                    activities!inner(
                        providers!inner(
                            stripe_connected_account_id
                        )
                    )
                )
                """.trimIndent()
                )
            ) {
                filter {
                    gte("date", startLocalDate)
                    lte("date", endLocalDate)
                    eq("activity_offers.activities.providers.stripe_connected_account_id", connectedAccountId)
                    eq("status", "CANCEL")
                }
                count(Count.EXACT)
            }

        val cancelledCount = cancelledResponse.countOrNull()?.toInt() ?: 0

        // Calcul du taux : (annulées / total) * 100, arrondi à 2 décimales
        return (cancelledCount.toDouble() / totalCount.toDouble() * 100)
            .toBigDecimal()
            .setScale(2, java.math.RoundingMode.HALF_UP)
            .toDouble()
    }

    suspend fun getAverageParticipantsByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Double {
        logger.info(
            "Fetching average participants for connected account {} from {} to {}",
            connectedAccountId,
            startDate,
            endDate
        )

        val startLocalDate = java.time.Instant.ofEpochSecond(startDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDate()
            .toString()

        val endLocalDate = java.time.Instant.ofEpochSecond(endDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDate()
            .toString()

        // On appelle la fonction SQL via RPC
        // rpc() envoie les paramètres sous forme de JSON à la fonction PostgreSQL
        val result = supabaseClient.postgrest.rpc(
            "get_average_participants",
            mapOf(
                "p_connected_account_id" to connectedAccountId,
                "p_start_date" to startLocalDate,
                "p_end_date" to endLocalDate
            )
        )

        return result.decodeAs<Double>()
    }
}