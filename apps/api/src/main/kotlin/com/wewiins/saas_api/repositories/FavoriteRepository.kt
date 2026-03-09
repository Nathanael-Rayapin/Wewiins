package com.wewiins.saas_api.repositories

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Count
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository

@Repository
class FavoriteRepository(
    private val supabaseClient: SupabaseClient,
) {
    private val logger = LoggerFactory.getLogger(FavoriteRepository::class.java)

    suspend fun getTotalFavoritesByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Int {
        logger.info(
            "Fetching favorites count for connected account {} from {} to {}",
            connectedAccountId,
            startDate,
            endDate
        )

        // On filtre sur created_at car activities_favorites ne stocke pas
        // de date d'activité — c'est un ajout en favori par un utilisateur
        val startDateTime = java.time.Instant.ofEpochSecond(startDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDateTime()
            .toString()

        val endDateTime = java.time.Instant.ofEpochSecond(endDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDateTime()
            .toString()

        // On remonte la chaîne de jointures :
        // activities_favorites → activities → providers
        // pour filtrer par stripe_connected_account_id
        val response = supabaseClient.postgrest["activities_favorites"]
            .select(
                columns = Columns.raw(
                    """
                    id,
                    activities!inner(
                        providers!inner(
                            stripe_connected_account_id
                        )
                    )
                    """.trimIndent()
                )
            ) {
                filter {
                    gte("created_at", startDateTime)
                    lte("created_at", endDateTime)
                    eq("activities.providers.stripe_connected_account_id", connectedAccountId)
                }
                count(Count.EXACT)
            }

        return response.countOrNull()?.toInt() ?: 0
    }
}