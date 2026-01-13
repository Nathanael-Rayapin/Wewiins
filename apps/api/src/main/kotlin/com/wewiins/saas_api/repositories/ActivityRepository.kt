package com.wewiins.saas_api.repositories

import com.stripe.StripeClient
import com.wewiins.saas_api.dto.ActivityRevenue
import io.github.jan.supabase.SupabaseClient
import org.springframework.stereotype.Repository
import org.slf4j.LoggerFactory


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
            .build()

        val result = stripeClient
            .v1()
            .paymentIntents()
            .search(params)

        return result.data
            .mapNotNull { paymentIntent ->
                val metadata = paymentIntent.metadata
                val title = metadata["activity_title"] ?: return@mapNotNull null
                val amount = paymentIntent.amount?.toDouble()?.div(100.0) ?: 0.0

                title to amount
            }
            .groupBy({ it.first }, { it.second })
            .map { (title, amounts) ->
                ActivityRevenue(
                    activity_title = title,
                    total_price = amounts.sum()
                )
            }
    }

}