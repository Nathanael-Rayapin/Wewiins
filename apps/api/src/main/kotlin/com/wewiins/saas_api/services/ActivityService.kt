package com.wewiins.saas_api.services

import com.wewiins.saas_api.models.ActivityRevenue
import com.wewiins.saas_api.repositories.ActivityRepository
import kotlinx.coroutines.runBlocking
import org.springframework.stereotype.Service

@Service
class ActivityService(
    private val activityRepository: ActivityRepository
) {

    fun getPaymentIntentsByQuery(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): List<ActivityRevenue> {
        val query = "metadata['provider_connected_account_id']:'$connectedAccountId' AND created>$startDate AND created<$endDate"
        return runBlocking {
            activityRepository.getPaymentIntentsByQuery(query)
        }
    }
}