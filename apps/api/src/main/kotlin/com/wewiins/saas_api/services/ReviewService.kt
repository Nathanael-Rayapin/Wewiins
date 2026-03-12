package com.wewiins.saas_api.services

import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.interfaces.Review
import com.wewiins.saas_api.repositories.ActivityRepository
import com.wewiins.saas_api.repositories.StatisticRepository
import com.wewiins.saas_api.utils.ComparisonCalculator
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class ReviewService(
    private val activityRepository: ActivityRepository,
    private val statisticRepository: StatisticRepository
) {
    private val logger = LoggerFactory.getLogger(ReviewService::class.java)

    fun initializeReview(
        verifiedAccountDto: VerifiedAccountDto,
        startDate: Long,
        endDate: Long,
        page: Int = 1,
        pageSize: Int = 10
    ): Review? {
        logger.info("Initialize review for period {} to {}", startDate, endDate)

        val filterRangeDays = ComparisonCalculator.calculateDaysBetween(startDate, endDate)
        val periodDuration = endDate - startDate
        val previousEndDate = startDate - 1
        val previousStartDate = previousEndDate - periodDuration

        return runBlocking {
            // Average Score
            val currentAverageScoreDeferred = async(Dispatchers.IO) {
                activityRepository.getAverageScoreByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val previousAverageScoreDeferred = async(Dispatchers.IO) {
                activityRepository.getAverageScoreByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val currentAverageScore = currentAverageScoreDeferred.await()
            val previousAverageScore = previousAverageScoreDeferred.await()

            val averageScoreComparison = ComparisonCalculator.calculate(
                currentAverageScore,
                previousAverageScore
            )

            // Score Distribution
            val scoreDistributionDeferred = async(Dispatchers.IO) {
                statisticRepository.getScoreDistributionByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val scoreDistribution = scoreDistributionDeferred.await()

            // Activities with their Reviews
            val activitiesDeferred = async(Dispatchers.IO) {
                activityRepository.getActivitiesWithReviewStats(
                    connectedAccountId = verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate = startDate,
                    endDate = endDate,
                    previousStartDate = previousStartDate,
                    previousEndDate = previousEndDate,
                    page = page,
                    pageSize = pageSize
                )
            }

            val activities = activitiesDeferred.await()

            Review(
                averageScore = averageScoreComparison,
                scoreDistribution = scoreDistribution,
                filterRangeDays = filterRangeDays,
                activities = activities
            )
        }
    }
}