package com.wewiins.saas_api.repositories

import com.stripe.StripeClient
import com.stripe.param.ChargeSearchParams
import com.wewiins.saas_api.models.ActivityRevenue
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import org.springframework.stereotype.Repository
import org.slf4j.LoggerFactory


@Repository
class ActivityRepository(
    private val supabaseClient: SupabaseClient,
    private val stripeClient: StripeClient
) {

    private val logger = LoggerFactory.getLogger(ActivityRepository::class.java)

    suspend fun getRevenueByProviderId(providerId: String): List<ActivityRevenue> {
        val rawList = supabaseClient
            .from("activity_slot_bookings")
            .select(
                Columns.raw(
                    """
            total_price,
            activity_offers!inner(
                activities!inner(
                    title,
                    provider_id
                )
            )
        """
                )
            )
            .decodeList<Map<String, Any>>()

        val revenues = rawList.map { raw ->
            val activityOffers = raw["activity_offers"] as Map<*, *>
            val activities = activityOffers["activities"] as Map<*, *>

            val totalPrice = raw["total_price"]?.let {
                if (it is Number) it.toDouble()
                else 0.0
            } ?: 0.0

            ActivityRevenue(
                activity_title = activities["title"] as String,
                total_price = totalPrice
            )
        }

        return revenues.groupBy { it.activity_title }
            .map { (title, list) ->
                ActivityRevenue(
                    activity_title = title,
                    total_price = list.sumOf { it.total_price }
                )
            }

    }

//    suspend fun getChargesByQuery(query: String): List<ActivityRevenue> {
//        val params: ChargeSearchParams = ChargeSearchParams.builder()
//            .setQuery(query)
//            .build();
//
//        return stripeClient.v1().charges().search(params)
//            .data
//            .map { charge ->
//                val metadata = charge.metadata
//                val title = metadata["activity_title"] as String
//                val amount = charge.amount?.toDouble()?.div(100.0) ?: 0.0
//
//                ActivityRevenue(
//                    activity_title = title,
//                    total_price = amount
//                )
//            }
//    }

    suspend fun getPaymentIntentsByQuery(query: String): List<ActivityRevenue> {
        logger.info("🔎 Stripe payment intent search query = {}", query)

        val params = com.stripe.param.PaymentIntentSearchParams.builder()
            .setQuery(query)
            .build()

        val result = stripeClient
            .v1()
            .paymentIntents()
            .search(params)  // Sans RequestOptions

        logger.info("📦 Stripe payment intents found = {}", result.data.size)

        return result.data.map { paymentIntent ->
            val metadata = paymentIntent.metadata
            val title = metadata["activity_title"] ?: "UNKNOWN"
            val amount = paymentIntent.amount?.toDouble()?.div(100.0) ?: 0.0

            ActivityRevenue(
                activity_title = title,
                total_price = amount
            )
        }
    }

}