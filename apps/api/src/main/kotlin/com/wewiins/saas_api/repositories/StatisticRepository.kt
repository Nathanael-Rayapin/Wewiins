package com.wewiins.saas_api.repositories

import com.wewiins.saas_api.dto.VisitsCountDto
import com.wewiins.saas_api.dto.activity.ActivityScoreDistributionDto
import com.wewiins.saas_api.dto.activity.ActivityVisitDto
import com.wewiins.saas_api.dto.user.ProviderIdDto
import com.wewiins.saas_api.interfaces.ScoreDistribution
import com.wewiins.saas_api.interfaces.VisitDataPoint
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.rpc
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.time.ZoneId

@Repository
class StatisticRepository(
    private val supabaseClient: SupabaseClient
) {
    private val logger = LoggerFactory.getLogger(StatisticRepository::class.java)

    object StatisticConstants {
        const val VISIT_TABLE = "activity_visit_stats"
    }

    suspend fun getTotalVisitByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Int {
        logger.info(
            "Fetching Visits for connected account {} from {} to {}",
            connectedAccountId,
            startDate,
            endDate
        )

        // Convert timestamps to LocalDate (format YYYY-MM-DD)
        val startLocalDate = java.time.Instant.ofEpochSecond(startDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDate()

        val endLocalDate = java.time.Instant.ofEpochSecond(endDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDate()

        logger.debug("Période convertie : {} à {}", startLocalDate, endLocalDate)

        // Retrieve the provider_id from stripe_connected_account_id
        val providerId = supabaseClient
            .from(ProviderRepository.ProviderConstants.PROVIDER_TABLE)
            .select(columns = Columns.list("id")) {
                filter {
                    eq("stripe_connected_account_id", connectedAccountId)
                }
            }
            .decodeList<ProviderIdDto>()
            .firstOrNull()
            ?.id
            ?: run {
                logger.warn("Aucun provider trouvé pour connected_account_id: {}", connectedAccountId)
                return 0
            }

        logger.debug("Provider trouvé : {}", providerId)

        // Retrieve the total number of visits for this provider over the period
        val stats = supabaseClient
            .from(StatisticConstants.VISIT_TABLE)
            .select(columns = Columns.list("visit_count")) {
                filter {
                    eq("provider_id", providerId)
                    gte("visit_date", startLocalDate.toString())
                    lte("visit_date", endLocalDate.toString())
                }
            }
            .decodeList<VisitsCountDto>()

        // Calculate the total number of visits
        val totalVisits = stats.sumOf { it.visitCount }

        logger.info("Total des visites pour le provider {} : {}", connectedAccountId, totalVisits)

        return totalVisits
    }

    suspend fun getVisitDataPointsByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): List<VisitDataPoint> {
        logger.info(
            "Fetching visit data points for connected account {} from {} to {}",
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

        val result = supabaseClient.postgrest.rpc(
            "get_visit_data_points_by_period",
            mapOf(
                "p_connected_account_id" to connectedAccountId,
                "p_start_date" to startLocalDate,
                "p_end_date" to endLocalDate
            )
        )

        val rows = result.decodeList<ActivityVisitDto>()

        // Conversion date SQL (String "YYYY-MM-DD") → timestamp Unix en secondes
        // car le frontend envoie et attend des secondes
        return rows.map { row ->
            VisitDataPoint(
                date = LocalDate.parse(row.visitDate)
                    .atStartOfDay(ZoneId.systemDefault())
                    .toInstant()
                    .epochSecond,
                count = row.visitCount
            )
        }
    }

    suspend fun getScoreDistributionByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): List<ScoreDistribution> {
        logger.info(
            "Fetching score distribution for connected account {} from {} to {}",
            connectedAccountId,
            startDate,
            endDate
        )

        // created_at est un timestamptz → on garde le datetime complet
        val startLocalDate = java.time.Instant.ofEpochSecond(startDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDate()
            .toString()

        val endLocalDate = java.time.Instant.ofEpochSecond(endDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDate()
            .toString()

        val result = supabaseClient.postgrest.rpc(
            "get_score_distribution_by_period",
            mapOf(
                "p_connected_account_id" to connectedAccountId,
                "p_start_date" to startLocalDate,
                "p_end_date" to endLocalDate
            )
        )

        val rows = result.decodeList<ActivityScoreDistributionDto>()

        // On s'assure d'avoir les 5 étoiles même si count = 0
        // car le frontend attend toujours 5 entrées pour afficher les barres
        val distributionMap = rows.associate { it.star to it.count }

        return (5 downTo 1).map { star ->
            ScoreDistribution(
                star = star,
                count = distributionMap[star] ?: 0
            )
        }
    }
}