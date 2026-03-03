package com.wewiins.saas_api.repositories

import com.wewiins.saas_api.dto.VisitsCountDto
import com.wewiins.saas_api.dto.user.ProviderIdDto
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository

@Repository
class StatisticRepository(
    private val supabaseClient: SupabaseClient
) {
    private val logger = LoggerFactory.getLogger(StatisticRepository::class.java)

    object StatisticConstants {
        const val VISIT_TABLE = "activity_visit_stats"
    }

    suspend fun getVisitNumberByPeriod(
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
}