package com.wewiins.saas_api.services

import com.wewiins.saas_api.dto.ActivityRevenue
import com.wewiins.saas_api.repositories.ActivityRepository
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class ActivityService(
    private val activityRepository: ActivityRepository
) {

    private val logger = LoggerFactory.getLogger(OrchestrationService::class.java)

    fun getRevenueByAccountId(
        connectedAccountId: String, startDate: Long, endDate: Long
    ): List<ActivityRevenue> {
        val query =
            "metadata['provider_connected_account_id']:'$connectedAccountId' AND created>$startDate AND created<$endDate AND status:'succeeded'"
        return runBlocking {
            activityRepository.getRevenueByAccountId(query)
        }
    }
}