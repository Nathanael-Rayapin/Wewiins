package com.wewiins.saas_api.repositories

import com.wewiins.saas_api.dto.activity.ActivityOfferDto
import com.wewiins.saas_api.dto.activity.OfferIdDto
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository

@Repository
class OfferRepository(
    private val supabaseClient: SupabaseClient,
) {
    private val logger = LoggerFactory.getLogger(OfferRepository::class.java)

    object OfferConstants {
        const val OFFER_TABLE = "activity_offers"
    }

    suspend fun getOfferIdByActivityId(activityId: String): String? {
        logger.info("Fetching Offer Id with activityId: $activityId")

        return supabaseClient
            .from(OfferConstants.OFFER_TABLE)
            .select(columns = Columns.list("id")) {
                filter { eq("activity_id", activityId) }
            }
            .decodeList<OfferIdDto>()
            .firstOrNull()
            ?.id
    }

    suspend fun getOfferByActivityId(activityId: String): ActivityOfferDto? {
        logger.info("Fetching Offer with activityId: $activityId")

        return supabaseClient
            .from(OfferConstants.OFFER_TABLE)
            .select {
                filter { eq("activity_id", activityId) }
            }
            .decodeList<ActivityOfferDto>()
            .firstOrNull()
    }
}