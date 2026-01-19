package com.wewiins.saas_api.repositories

import com.stripe.StripeClient
import com.wewiins.saas_api.dto.ActivityRevenue
import io.github.jan.supabase.SupabaseClient
import org.springframework.stereotype.Repository
import org.slf4j.LoggerFactory
import java.util.UUID


@Repository
class ActivityRepository(
    private val supabaseClient: SupabaseClient,
    private val stripeClient: StripeClient
) {

    private val logger = LoggerFactory.getLogger(ActivityRepository::class.java)

    suspend fun getRevenueByAccountId(query: String): List<ActivityRevenue> {
        logger.info("🔎 Stripe payment intent search query = {}", query)

        val params = com.stripe.param.PaymentIntentSearchParams.builder()
            .setQuery(query)
            .setLimit(100)
            .build()

        val result = stripeClient
            .v1()
            .paymentIntents()
            .search(params)

        return result.data
            .mapNotNull { paymentIntent ->
                val metadata = paymentIntent.metadata
                val id = metadata["activity_offer_id"] ?: return@mapNotNull null
                val title = metadata["activity_title"] ?: return@mapNotNull null
                val amount = paymentIntent.amount?.toDouble()?.div(100.0) ?: 0.0

                Triple(id, title.lowercase().trim(), amount)
                // it.first = id
                // it.second = title
                // it.third = amount
            }
            .groupBy({ it.first })
            .map { (id, triples) ->
                val title = triples.first().second
                ActivityRevenue(
                    activity_offer_id = UUID.fromString(id),
                    activity_title = title
                        .split(" ")
                        .joinToString(" ") { it.replaceFirstChar { char -> char.uppercase() } },
                    total_price = triples.sumOf { it.third }
                )
            }
            .sortedByDescending { it.total_price }
            .take(3)
    }

}