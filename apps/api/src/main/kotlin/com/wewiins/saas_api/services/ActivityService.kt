package com.wewiins.saas_api.services

import com.wewiins.saas_api.dto.activity.ActivityBooking
import com.wewiins.saas_api.interfaces.Revenue
import com.wewiins.saas_api.repositories.ActivityRepository
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class ActivityService(
    private val activityRepository: ActivityRepository
) {
    private val logger = LoggerFactory.getLogger(ActivityService::class.java)

    fun getTotalRevenueByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Revenue {
        logger.info("Get TotalRevenueByPeriod")
        return runBlocking {
            activityRepository.getRevenueByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getTotalBookingByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Int {
        logger.info("Get TotalBookingByPeriod")
        return runBlocking {
            activityRepository.getBookingNumberByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getTotalVisitByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Int {
        logger.info("Get TotalVisitByPeriod")
        return runBlocking {
            activityRepository.getVisitNumberByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getAverageScoreByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Double {
        logger.info("Get AverageScoreByPeriod")
        return runBlocking {
            activityRepository.getAverageScoreByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getBookingsByPeriod(
        connectedAccountId: String,
        startDate: Long,
    ): List<ActivityBooking> {
        logger.info("Get BookingsByPeriod")
        return runBlocking {
            activityRepository.getBookingsByPeriod(connectedAccountId, startDate)
        }
    }

}