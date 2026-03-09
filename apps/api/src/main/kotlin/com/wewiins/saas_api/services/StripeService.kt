package com.wewiins.saas_api.services

import com.wewiins.saas_api.repositories.StripeRepository
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class StripeService(
    private val stripeRepository: StripeRepository,
) {
    private val logger = LoggerFactory.getLogger(StripeService::class.java)

    fun getTotalChargeByPeriod(
        connectedAccountId: String, startDate: Long, endDate: Long
    ): Double {
        logger.info("Get TotalChargeByPeriod")
        return runBlocking {
            stripeRepository.getTotalChargesByPeriod(connectedAccountId, startDate, endDate)
        }
    }
}